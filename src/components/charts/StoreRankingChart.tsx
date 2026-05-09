"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { fmtMoney, fmtMoneyCompact } from "@/lib/format";

type Item = {
  loja: string;
  faturamento: number;
  pedidos: number;
};

export function StoreRankingChart({ items }: { items: Item[] }) {
  const sorted = [...items].sort((a, b) => b.faturamento - a.faturamento);
  const max = sorted[0]?.faturamento ?? 1;
  return (
    <div className="h-[520px] w-full">
      <ResponsiveContainer>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 32, bottom: 0, left: 8 }}
        >
          <defs>
            <linearGradient id="rankBar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#700009" />
              <stop offset="100%" stopColor="#b00012" />
            </linearGradient>
            <linearGradient id="rankBarHi" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#91000e" />
              <stop offset="100%" stopColor="#ffb500" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#8a8a99" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtMoneyCompact(Number(v))}
          />
          <YAxis
            type="category"
            dataKey="loja"
            tick={{ fontSize: 12, fill: "#dfe0ee" }}
            tickLine={false}
            axisLine={false}
            width={170}
          />
          <Tooltip
            cursor={{ fill: "rgba(176, 0, 18, 0.10)" }}
            contentStyle={{
              background: "rgba(13,13,26,0.96)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: 12,
              color: "#f5f5f7",
            }}
            formatter={(value) => [fmtMoney(Number(value)), "Faturamento"]}
          />
          <Bar dataKey="faturamento" radius={[0, 6, 6, 0]}>
            {sorted.map((row, i) => (
              <Cell
                key={row.loja}
                fill={i === 0 ? "url(#rankBarHi)" : "url(#rankBar)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
