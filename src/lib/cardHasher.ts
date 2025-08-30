export async function createCardToken(input: { pan: string; exp: string; holder: string; }) {
    const pan = input.pan.replace(/\s+/g, '');
    const last4 = pan.slice(-4);
    const brand = detectBrand(pan);
    const jti = crypto.randomUUID();
    const iat = Date.now();
    const expAt = iat + 2 * 60 * 1000;

    const encoder = new TextEncoder();
    const data = encoder.encode(`${pan}|${input.exp}|${input.holder}|${jti}|${iat}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const token = toB64Url(new Uint8Array(digest).slice(0, 24));

    return { token, last4, brand, exp: input.exp, holder: input.holder, jti, iat, expAt };
}

function detectBrand(pan: string) {
  if (/^4\d{12,18}$/.test(pan)) return 'visa';
  if (/^(5[1-5]|2[2-7])\d{14}$/.test(pan)) return 'mastercard';
  if (/^3[47]\d{13}$/.test(pan)) return 'amex';
  return 'unknown';
}

function toB64Url(bytes: Uint8Array) {
  let s = btoa(String.fromCharCode(...bytes));
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}