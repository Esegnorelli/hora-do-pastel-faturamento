import clsx from "clsx";
import Link from "next/link";
import { fmtMoney } from "@/lib/format";
import { Sparkline } from "./Sparkline";
import type { LojaTendencia } from "@/lib/data";

export function StoreTrendCard({
  tendencia,
  rank,
}: {
  tendencia: LojaTendencia;
  rank?: number;
}) {
  const positive =
    tendencia.variacao_pct === null
      ? null
      : tendencia.variacao_pct >= 0;

  return (
    <Link
      href={`/vendas?loja=${encodeURIComponent(tendencia.loja)}&ano=${tendencia.ultimo_data.slice(0, 4)}`}
      className="group rounded-2xl bg-surface border border-border p-4 shadow-sm hover:border-brand/40 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {rank != null && (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-stone-100 text-stone-600 text-[11px] font-bold">
              {rank}
            </span>
          )}
          <p className="font-semibold text-sm tracking-tight truncate">
            {tendencia.loja}
          </p>
        </div>
        <Sparkline values={tendencia.serie} positive={positive} />
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-xl font-bold tabular-nums">
          {fmtMoney(tendencia.ultimo)}
        </p>
        <span
          className={clsx(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            positive === null
              ? "bg-stone-100 text-stone-500"
              : positive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700",
          )}
        >
          {tendencia.variacao_pct === null
            ? "—"
            : `${tendencia.variacao_pct >= 0 ? "+" : ""}${tendencia.variacao_pct.toFixed(1)}%`}
        </span>
      </div>
    </Link>
  );
}
