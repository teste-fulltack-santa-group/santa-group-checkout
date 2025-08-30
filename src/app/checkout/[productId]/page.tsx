import { api } from "@/lib/api";
import PixForm from "./PixForm";
import CardForm from "./CardForm";
import Tabs from "./Tabs";

type Product = { id: string; name: string; priceCents: number; seller: string };

export default async function CheckoutPage({ params }: { params: { productId: string } }) {
  const product = await api<Product>(`/products/${params.productId}`);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="text-xl font-semibold">{product.name}</h2>
        <p className="text-slate-400 mt-1">Vendedor: {product.seller}</p>
        <p className="mt-4 text-3xl font-bold">R$ {(product.priceCents / 100).toFixed(2)}</p>
      </div>

      <div className="card p-6">
        <Tabs
          tabs={[
            { id: "pix",   label: "PIX",     content: <PixForm product={product} /> },
            { id: "card",  label: "Cartão",  content: <CardForm product={product} /> },
          ]}
        />
      </div>
    </div>
  );
}
