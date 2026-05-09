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
  "#c1272d",
  "#f59e0b",
  "#0ea5e9",
  "#16a34a",
  "#7c3aed",
  "#ec4899",
  "#22c55e",
  "#0891b2",
  "#ea580c",
  "#6366f1",
  "#14b8a6",
  "#a855f7",
  "#f43f5e",
  "#84cc16",
  "#eab308",
  "#10b981",
  "#3b82f6",
  "#d946ef",
  "#f97316",
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
                  ? "text-white border-transparent"
                  : "text-stone-500 border-border bg-stone-50 hover:bg-stone-100"
              }`}
              style={on ? { backgroundColor: color } : undefined}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                style={{ backgroundColor: on ? "white" : color }}
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            <XAxis
              dataKey="mesLabel"
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickLine={false}
              axisLine={{ stroke: "#e7e5e4" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => fmtMoneyCompact(Number(v))}
              width={70}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e7e5e4",
                fontSize: 12,
              }}
              formatter={(value) => fmtMoney(Number(value))}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
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
