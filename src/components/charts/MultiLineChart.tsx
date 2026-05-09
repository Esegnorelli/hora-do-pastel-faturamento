"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtMoney, fmtMoneyCompact, monthShortName } from "@/lib/format";

type Serie = {
  loja: string;
  pontos: { mes: number; faturamento: number }[];
};

const palette = [
  "#b00012",
  "#ffb500",
  "#7fc46a",
  "#ff7a8c",
  "#a07cff",
  "#ffc533",
  "#ff5566",
  "#4a7a3e",
  "#ec4899",
  "#0ea5e9",
  "#f97316",
  "#22c55e",
  "#6366f1",
  "#14b8a6",
  "#eab308",
  "#7c3aed",
  "#3b82f6",
  "#d946ef",
  "#10b981",
  "#06b6d4",
];

type Row = { mes: number; mesLabel: string; [loja: string]: number | string };

export function MultiLineChart({ series }: { series: Serie[] }) {
  const sortedSeries = useMemo(
    () =>
      [...series].sort(
        (a, b) =>
          b.pontos.reduce((s, p) => s + p.faturamento, 0) -
          a.pontos.reduce((s, p) => s + p.faturamento, 0),
      ),
    [series],
  );

  const [active, setActive] = useState<Set<string>>(
    () => new Set(sortedSeries.slice(0, 6).map((s) => s.loja)),
  );

  const rows: Row[] = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((mes) => {
      const r: Row = { mes, mesLabel: monthShortName(mes) };
      for (const s of sortedSeries) {
        const p = s.pontos.find((x) => x.mes === mes);
        if (p) r[s.loja] = p.faturamento;
      }
      return r;
    });
  }, [sortedSeries]);

  const toggle = (loja: string) => {
    const next = new Set(active);
    if (next.has(loja)) next.delete(loja);
    else next.add(loja);
    setActive(next);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {sortedSeries.map((s, i) => {
          const color = palette[i % palette.length];
          const on = active.has(s.loja);
          return (
            <button
              key={s.loja}
              type="button"
              onClick={() => toggle(s.loja)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                on
                  ? "text-black border-transparent font-semibold"
                  : "text-muted-strong border-border bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
              style={on ? { backgroundColor: color } : undefined}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                style={{ backgroundColor: on ? "rgba(0,0,0,0.4)" : color }}
              />
              {s.loja}
            </button>
          );
        })}
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer>
          <LineChart
            data={rows}
            margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="mesLabel"
              tick={{ fontSize: 11, fill: "#8a8a99" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8a8a99" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmtMoneyCompact(Number(v))}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(13,13,26,0.96)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                fontSize: 12,
                color: "#f5f5f7",
              }}
              formatter={(value) => fmtMoney(Number(value))}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "#dfe0ee" }} />
            {sortedSeries.map((s, i) => (
              <Line
                key={s.loja}
                type="monotone"
                dataKey={s.loja}
                stroke={palette[i % palette.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                hide={!active.has(s.loja)}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
