export async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const base = process.env.NEXT_PUBLIC_API_URL!;
    const res = await fetch(`${base}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
        cache: 'no-store',
    });
    if(!res.ok) {
        const msg = await res.text();
        throw new Error(msg || res.statusText);
    }
    return res.json() as Promise<T>;
}