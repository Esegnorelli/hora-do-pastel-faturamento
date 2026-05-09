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
          <CartesianGrid stroke="#e7e5e4" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#78716c" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtMoneyCompact(Number(v))}
          />
          <YAxis
            type="category"
            dataKey="loja"
            tick={{ fontSize: 12, fill: "#1c1917" }}
            tickLine={false}
            axisLine={false}
            width={170}
          />
          <Tooltip
            cursor={{ fill: "rgba(193,39,45,0.06)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e7e5e4",
              fontSize: 12,
            }}
            formatter={(value) => [fmtMoney(Number(value)), "Faturamento"]}
          />
          <Bar dataKey="faturamento" radius={[0, 6, 6, 0]}>
            {sorted.map((row, i) => {
              const intensity = 0.45 + 0.55 * (row.faturamento / max);
              return (
                <Cell
                  key={row.loja}
                  fill={`rgba(193, 39, 45, ${intensity.toFixed(2)})`}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
