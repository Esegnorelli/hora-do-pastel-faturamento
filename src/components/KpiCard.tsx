import clsx from "clsx";
import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  hint,
  trend,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: number | null;
  icon?: ReactNode;
}) {
  const showTrend = trend !== undefined && trend !== null && !isNaN(trend);
  const positive = (trend ?? 0) >= 0;
  return (
    <div className="rounded-2xl bg-surface border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
          {label}
        </p>
        {icon && (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {showTrend && (
          <span
            className={clsx(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold",
              positive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700",
            )}
          >
            {positive ? "▲" : "▼"} {Math.abs(trend!).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-muted">{hint}</span>}
      </div>
    </div>
  );
}
