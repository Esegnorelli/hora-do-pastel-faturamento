import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hora do Pastel — Faturamento",
  description:
    "Dashboard de faturamento da rede Hora do Pastel: visão geral, evolução mensal e desempenho por loja.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TopNav />
        <main className="flex-1 mx-auto w-full max-w-[1400px] px-6 py-8">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-[1400px] px-6 py-6 text-xs text-muted">
          Hora do Pastel · Painel de faturamento · dados Supabase
        </footer>
      </body>
    </html>
  );
}
