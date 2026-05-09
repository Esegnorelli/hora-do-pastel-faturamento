import clsx from "clsx";
import Link from "next/link";
import { fmtMoney } from "@/lib/format";
import { Sparkline } from "./Sparkline";
import type { LojaTendencia } from "@/lib/data";

const podiumStyles = [
  {
    border: "border-[#ffb500]/70",
    chip: "bg-[#ffb500]/15 text-[#ffb500]",
    glow: "shadow-[0_0_28px_rgba(255,181,0,0.18)]",
  },
  {
    border: "border-[#c0c0d0]/55",
    chip: "bg-[#c0c0d0]/15 text-[#dfe0ee]",
    glow: "shadow-[0_0_22px_rgba(192,192,208,0.14)]",
  },
  {
    border: "border-[#cd7f32]/55",
    chip: "bg-[#cd7f32]/15 text-[#e8a86a]",
    glow: "shadow-[0_0_22px_rgba(205,127,50,0.14)]",
  },
];

export function StoreTrendCard({
  tendencia,
  rank,
}: {
  tendencia: LojaTendencia;
  rank?: number;
}) {
  const positive =
    tendencia.variacao_pct === null ? null : tendencia.variacao_pct >= 0;
  const podium = rank && rank >= 1 && rank <= 3 ? podiumStyles[rank - 1] : null;

  return (
    <Link
      href={`/vendas?loja=${encodeURIComponent(tendencia.loja)}&ano=${tendencia.ultimo_data.slice(0, 4)}`}
      className={clsx(
        "group relative rounded-2xl bg-surface border p-4 glow-card-static hover:glow-card overflow-hidden transition-all",
        podium ? `${podium.border} ${podium.glow}` : "border-border",
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {rank != null && (
              <span
                className={clsx(
                  "inline-flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold",
                  podium
                    ? podium.chip
                    : "bg-white/5 text-muted-strong",
                )}
              >
                {rank}
              </span>
            )}
            <p className="font-semibold text-sm tracking-tight truncate text-foreground">
              {tendencia.loja}
            </p>
          </div>
          <Sparkline values={tendencia.serie} positive={positive} />
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="text-xl font-bold tabular-nums text-foreground">
            {fmtMoney(tendencia.ultimo)}
          </p>
          <span
            className={clsx(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              positive === null
                ? "bg-white/5 text-muted"
                : positive
                  ? "bg-positive-bg"
                  : "bg-negative-bg",
            )}
            style={{
              color:
                positive === null
                  ? undefined
                  : positive
                    ? "#7fc46a"
                    : "#ff5566",
            }}
          >
            {tendencia.variacao_pct === null
              ? "—"
              : `${tendencia.variacao_pct >= 0 ? "+" : ""}${tendencia.variacao_pct.toFixed(1)}%`}
          </span>
        </div>
      </div>
    </Link>
  );
}
