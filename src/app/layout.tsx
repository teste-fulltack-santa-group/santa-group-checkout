import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = { title: "Santa Checkout", description: "Checkout PIX e Cartão" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <header className="border-b border-white/10">
          <div className="container-page py-6">
            <h1 className="text-xl font-semibold">Checkout</h1>
          </div>
        </header>
        <main className="container-page">{children}</main>
      </body>
    </html>
  );
}
