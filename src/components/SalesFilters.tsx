"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function SalesFilters({
  lojas,
  anos,
  loja,
  ano,
}: {
  lojas: string[];
  anos: number[];
  loja: string;
  ano: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, start] = useTransition();

  const update = (key: "loja" | "ano", value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === "" || value === "todas") sp.delete(key);
    else sp.set(key, value);
    start(() => {
      router.push(`/vendas?${sp.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-[11px] uppercase tracking-[0.14em] text-muted font-semibold">
          Loja
        </label>
        <select
          value={loja || "todas"}
          onChange={(e) => update("loja", e.target.value)}
          disabled={pending}
          className="h-10 min-w-[220px] rounded-xl border border-border bg-surface px-3 pr-8 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="todas">Todas as lojas</option>
          {lojas.map((nome) => (
            <option key={nome} value={nome}>
              {nome}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] uppercase tracking-[0.14em] text-muted font-semibold">
          Ano
        </label>
        <select
          value={ano}
          onChange={(e) => update("ano", e.target.value)}
          disabled={pending}
          className="h-10 min-w-[130px] rounded-xl border border-border bg-surface px-3 pr-8 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          {anos.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      {pending && (
        <span className="text-xs text-muted self-end pb-2">atualizando…</span>
      )}
    </div>
  );
}
