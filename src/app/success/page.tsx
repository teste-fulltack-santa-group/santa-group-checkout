import { api } from "@/lib/api";

type Order = {
  id: string; status: string; amountCents: number; method: "PIX"|"CARD";
  product: { id: string; name: string; priceCents: number; seller: string };
  payments: Array<{ id:string; method:string; status:string; last4?:string|null; brand?:string|null; txid?:string|null }>;
};

export default async function SuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const orderId = searchParams.orderId;
  if (!orderId) return <div className="card p-6">Faltou <code>orderId</code> na URL.</div>;

  const order = await api<Order>(`/orders/${orderId}`);

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold">Pedido aprovado ✅</h2>
      <p className="text-slate-400 mt-1">Status: {order.status}</p>

      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm text-slate-300">Produto</p>
          <p className="mt-1 font-medium">{order.product.name}</p>
          <p className="text-slate-400">R$ {(order.amountCents/100).toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm text-slate-300">Método</p>
          <p className="mt-1 font-medium">{order.method}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-slate-300">Pagamento(s)</p>
        <ul className="mt-2 space-y-2">
          {order.payments.map(p => (
            <li key={p.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
              {p.method} • {p.status}
              {p.last4 ? ` • **** ${p.last4}` : ""} {p.txid ? ` • txid: ${p.txid}` : ""}
            </li>
          ))}
        </ul>
      </div>

      <a href={`/checkout/${order.product.id}`} className="btn mt-6">Fazer outro pagamento</a>
    </div>
  );
}
