import Link from "next/link";
import { api } from "@/lib/api";

type Product = { id: string; name: string; priceCents: number; seller: string };

export default async function Home() {
  const products = await api<Product[]>("/products");

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <div key={p.id} className="card p-5 flex flex-col">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="text-slate-400 mt-1">{p.seller}</p>
            <p className="mt-4 text-2xl font-bold">R$ {(p.priceCents / 100).toFixed(2)}</p>
          </div>
          <Link href={`/checkout/${p.id}`} className="btn btn-primary mt-6 text-center">Ir para checkout</Link>
        </div>
      ))}
    </div>
  );
}
