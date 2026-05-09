"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtMoney, fmtMoneyCompact, monthYearLabel } from "@/lib/format";

type Point = {
  data: string;
  faturamento: number;
  pedidos: number;
};

export function RevenueAreaChart({ points }: { points: Point[] }) {
  const formatted = points.map((p) => ({
    ...p,
    label: monthYearLabel(p.data),
  }));
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <AreaChart
          data={formatted}
          margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c1272d" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#c1272d" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e7e5e4"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#78716c" }}
            tickLine={false}
            axisLine={{ stroke: "#e7e5e4" }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#78716c" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtMoneyCompact(Number(v))}
            width={70}
          />
          <Tooltip
            cursor={{ stroke: "#c1272d", strokeWidth: 1, strokeDasharray: 4 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e7e5e4",
              fontSize: 12,
            }}
            formatter={(value, name) => {
              if (name === "faturamento")
                return [fmtMoney(Number(value)), "Faturamento"];
              return [String(value), String(name)];
            }}
            labelFormatter={(l) => `Mês ${l}`}
          />
          <Area
            type="monotone"
            dataKey="faturamento"
            stroke="#c1272d"
            strokeWidth={2.5}
            fill="url(#revFill)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
