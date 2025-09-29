"use client";
import { useEffect, useState } from "react";
import { useIdempotentPost } from "@/hooks/idempotency";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Product = { id: string; priceCents: number };
type PixCreateResp = {
  orderId: string;
  paymentId: string; 
  txid: string; 
  qrBase64: string; 
  copyPaste: string; 
  status: "PENDING";
};

export default function PixForm({ product }: { product: Product }) {
  const [resp, setResp] = useState<PixCreateResp | null>(null);
  const [status, setStatus] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const { run: createPix, loading } = useIdempotentPost<PixCreateResp>("/payments/pix", "PIX");

  async function onCreate() {
    try {
      const body = {
        productId: product.id,
        customer: { name: "Tester", email: "t@e.com", cpf: "12345678901", phone: "51999999999" }
      };
      const r = await createPix(body);
      setResp(r);
      setStatus("PENDING");
    } catch (e: any) {
      alert("Erro ao criar PIX: " + (e?.message ?? e));
    }
  }

  useEffect(() => {
    if (!resp?.orderId) return;
    const it = setInterval(async () => {
      try {
        const s = await api<{ status: string }>(`/orders/${resp.orderId}/status`);
        setStatus(s.status);
        if (s.status === "APPROVED") {
          clearInterval(it);
          router.push(`/success?orderId=${resp.orderId}`);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(it);
  }, [resp?.orderId, router]);

  return (
    <div className="space-y-4">
      <button onClick={onCreate} disabled={loading} className="btn btn-primary">
        {loading ? "Gerando..." : "Gerar PIX"}
      </button>

      {resp && (
        <>
          <div>
            <p className="label mb-1">Copia e Cola</p>
            <textarea readOnly value={resp.copyPaste} className="input h-28" />
            <div className="mt-2 flex items-center gap-2">
              <button
                className="btn"
                onClick={async () => { await navigator.clipboard.writeText(resp.copyPaste); setCopied(true); setTimeout(()=>setCopied(false), 1500); }}
              >
                Copiar código
              </button>
              {copied && <span className="text-xs text-emerald-400">copiado!</span>}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <img src={resp.qrBase64} alt="QR Code PIX" className="rounded-lg border border-white/10 w-44 h-44" />
            <div className="text-sm text-slate-400">
              <p>Status atual:</p>
              <p className={`mt-1 inline-flex px-2 py-1 rounded ${status === "APPROVED" ? "bg-emerald-600/30 text-emerald-200" : "bg-white/10"}`}>
                {status || "PENDING"}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
