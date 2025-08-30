"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardFormSchema, type CardFormValues } from "@/lib/validation";
import { api } from "@/lib/api";
import { createCardToken } from "@/lib/cardHasher";

type Product = { id: string; priceCents: number };

export default function CardForm({ product }: { product: Product }) {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CardFormValues>({
    resolver: zodResolver(CardFormSchema),
    defaultValues: {
      name: "Tester",
      email: "t@e.com",
      cpf: "12345678901",
      phone: "51999999999",
      cardNumber: "4242 4242 4242 4242",
      exp: "12/30",
      holder: "Tester",
    }
  });

  const onSubmit = async (form: CardFormValues) => {
    setLoading(true);
    try {
      const tokenized = await createCardToken({ pan: form.cardNumber, exp: form.exp, holder: form.holder });
      const r = await api("/payments/card", {
        method: "POST",
        body: JSON.stringify({
          productId: product.id,
          customer: { name: form.name, email: form.email, cpf: form.cpf, phone: form.phone },
          ...tokenized
        }),
      });
      setResult(r);
    } catch (e: any) { alert("Erro no pagamento: " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="label">Nome</label>
        <input className="input mt-1" placeholder="Nome completo" {...register("name")} />
        {errors.name && <p className="error">{errors.name.message}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Email</label>
          <input className="input mt-1" placeholder="email@dominio.com" {...register("email")} />
          {errors.email && <p className="error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">CPF</label>
          <input className="input mt-1" placeholder="Somente números" {...register("cpf")} />
          {errors.cpf && <p className="error">{errors.cpf.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Telefone</label>
        <input className="input mt-1" placeholder="(00) 00000-0000" {...register("phone")} />
      </div>

      <hr className="hr" />

      <div>
        <label className="label">Número do cartão</label>
        <input className="input mt-1" placeholder="0000 0000 0000 0000" {...register("cardNumber")} />
        {errors.cardNumber && <p className="error">{errors.cardNumber.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Validade (MM/YY)</label>
          <input className="input mt-1" placeholder="12/30" {...register("exp")} />
          {errors.exp && <p className="error">{errors.exp.message}</p>}
        </div>
        <div>
          <label className="label">Titular</label>
          <input className="input mt-1" placeholder="Como no cartão" {...register("holder")} />
          {errors.holder && <p className="error">{errors.holder.message}</p>}
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary mt-2">
        {loading ? "Processando..." : "Pagar com Cartão"}
      </button>

      {result && (
        <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm text-slate-300">Resposta</p>
          <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}
