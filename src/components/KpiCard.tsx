import clsx from "clsx";
import type { ReactNode } from "react";
import { Sparkline } from "./Sparkline";

export function KpiCard({
  label,
  value,
  hint,
  trend,
  icon,
  spark,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: number | null;
  icon?: ReactNode;
  spark?: number[];
}) {
  const showTrend = trend !== undefined && trend !== null && !isNaN(trend);
  const positive = (trend ?? 0) >= 0;
  return (
    <div className="rounded-2xl bg-surface border border-border p-5 glow-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            {label}
          </p>
          {icon && (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
              {icon}
            </span>
          )}
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums text-foreground">
          {value}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {showTrend && (
              <span
                className={clsx(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold",
                  positive
                    ? "bg-positive-bg text-positive"
                    : "bg-negative-bg text-negative",
                )}
                style={
                  positive
                    ? { color: "#7fc46a" }
                    : { color: "#ff5566" }
                }
              >
                {positive ? "▲" : "▼"} {Math.abs(trend!).toFixed(1)}%
              </span>
            )}
            {hint && <span className="text-muted truncate">{hint}</span>}
          </div>
          {spark && spark.length > 1 && (
            <Sparkline values={spark} positive={positive} width={70} height={24} />
          )}
        </div>
      </div>
    </div>
  );
}
