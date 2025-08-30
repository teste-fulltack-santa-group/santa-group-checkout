# Santa Group Checkout • Frontend (Next.js + Tailwind)

Interface web para o **checkout** (PIX e Cartão) consumindo a Santa Group Checkout API.  
Projeto com **Next.js (App Router)** + **TypeScript**, **TailwindCSS**, **React Hook Form** e **Zod**.

---

## 🚀 Stack

- **Next.js 15** (App Router) + **React 18** + **TypeScript**
- **TailwindCSS 3** (estilização)
- **React Hook Form** + **@hookform/resolvers** + **Zod** (formularização/validação)
- Fetch nativo (`fetch`) com helper `lib/api.ts`

---

## 🧭 Estrutura do projeto

```
src/
  app/
    page.tsx                      # Home: lista de produtos
    checkout/
      [productId]/
        page.tsx                  # Checkout do produto
        PixForm.tsx               # Form + fluxo de PIX (client)
        CardForm.tsx              # Form de Cartão (client)
        Tabs.tsx                  # Abas simples (client)
    success/
      page.tsx                    # Tela de sucesso (?orderId=...)
  lib/
    api.ts                        # helper de chamadas à API
    cardHasher.ts                 # tokenização client-side do cartão (mock)
    validation.ts                 # esquemas Zod para os formulários
app/
  layout.tsx                      # layout base + import do globals.css
  globals.css                     # estilos utilitários (Tailwind)
tailwind.config.ts                # config Tailwind
postcss.config.mjs                # PostCSS
next.config.ts                    # Turbopack root (evita conflitos)
tsconfig.json                     # paths @/*
.env.local                        # NEXT_PUBLIC_API_URL (não versionar)
```

---

## 🔧 Requisitos

- **Node.js** 18+ (ou 20+)
- **API** rodando em `http://localhost:4000` (ou outro host)
- `.env.local` configurado

---

## 🔐 Variáveis de ambiente

Crie um arquivo **`.env.local`** na raiz do projeto (não versione):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> Em produção, aponte para a URL pública da API.

---

## ▶️ Rodando localmente

```bash
# instalar deps (na raiz do projeto)
npm install

# desenvolvimento (Turbopack)
npm run dev

# (opcional) sem Turbopack se necessário:
# npm run dev -- --no-turbo
```

Build e start:
```bash
npm run build
npm start
```

---

## 🧪 Como testar (fim-a-fim)

### 1) Home
- Abra `http://localhost:3000/`.
- Deve listar os produtos fornecidos pela API (`GET /products`).

### 2) Checkout – PIX
1. Entre em `http://localhost:3000/checkout/p1` (ou outro `productId`).
2. Clique **Gerar PIX** → aparece QR + “copia e cola”.
3. Aprove o pagamento via webhook da API:
   ```bash
   curl -X POST http://localhost:4000/webhooks/pix/simulate \
     -H "Content-Type: application/json" \
     -d '{"txid":"<TXID_RETORNADO>","status":"APPROVED"}'
   ```
4. O front faz **polling** em `/orders/:id/status` e redireciona para **`/success?orderId=...`** ao aprovar.

### 3) Checkout – Cartão (mock)
1. Preencha o formulário (valores mock já sugeridos).
2. O front **tokeniza** no cliente com `cardHasher.ts` e envia somente:
   `token`, `last4`, `brand`, `exp`, `holder`, `jti`, `iat`, `expAt`.
3. Resposta esperada da API: `APPROVED`/`DECLINED` (depende das regras do mock).

> **CORS**: no backend, configure `WEB_ORIGIN=http://localhost:3000`.

---

## 📡 Integração com a API

Todas as chamadas usam o helper `api.ts`:
```ts
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
```

Endpoints consumidos:
- `GET /products` e `GET /products/:id`
- `POST /payments/pix`
- `POST /webhooks/pix/simulate` (para testes)
- `POST /payments/card`
- `GET /orders/:id` e `GET /orders/:id/status`

---

## 🧱 UI/UX

- **Tailwind** com utilitários e classes auxiliares em `globals.css`  
  (`.card`, `.btn`, `.btn-primary`, `.input`, etc.)
- **Tabs** simples para alternar PIX/Cartão (componente `Tabs.tsx`)
- **PIX**
  - Gera QR (base64) e “copia e cola”
  - Botão **Copiar código** (clipboard)
  - Polling a cada 3s até `APPROVED`
- **Cartão**
  - Formulário com **React Hook Form + Zod**
  - **Tokenização client-side** (mock) em `cardHasher.ts` — o PAN **não** vai para o backend
  - Feedback de loading/erros

---

## 🧰 Scripts do `package.json`

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 🧩 Dicas / Personalização

- **Proxy no Next (evita CORS no dev)** — opcional em `next.config.ts`:
  ```ts
  export default {
    async rewrites() {
      return [{ source: "/api/:path*", destination: "http://localhost:4000/:path*" }];
    },
    turbopack: { root: __dirname },
  };
  ```
  E então use `fetch("/api/...")` no helper `api.ts` durante o dev.

- **Estilos**: troque o gradiente/cores no `tailwind.config.ts` (`theme.extend.colors`) ou use o palette padrão do Tailwind.

- **Máscaras de input**: adicione `react-input-mask` para CPF/telefone/número do cartão (client-side).

---

## 🐞 Troubleshooting

- **Sem estilos / classes desconhecidas (ex.: `from-bg`)**  
  → Tailwind não está lendo a config. Confirme:
  - `tailwind.config.ts` com `content` apontando para `./src/**`
  - `postcss.config.mjs` com `tailwindcss` e `autoprefixer`
  - `src/app/layout.tsx` importa `./globals.css`
  - Limpe cache: apague `.next/` e rode `npm run dev`

- **Erro do Turbopack** em monorepo / múltiplos lockfiles  
  → Fixe o root no `next.config.ts`:
  ```ts
  export default { turbopack: { root: __dirname } }
  ```
  ou rode sem Turbo temporariamente: `npm run dev -- --no-turbo`.

- **`token_expired` no cartão**  
  → Gera `iat/expAt` no momento da requisição (o `cardHasher.ts` já faz).

- **404 em `/checkout/[id]`**  
  → Verifique o nome da pasta dinâmica: **`src/app/checkout/[productId]`** (sem espaços).

---

## 📄 Licença

MIT (ou a da empresa/desafio).
