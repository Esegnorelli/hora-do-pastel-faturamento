"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtInt, fmtMoney, fmtMoneyCompact, monthYearLabel } from "@/lib/format";

type Point = {
  data: string;
  faturamento: number;
  lojas_count: number;
};

export function NetworkBreathingChart({ points }: { points: Point[] }) {
  const data = points.map((p) => ({
    ...p,
    label: monthYearLabel(p.data),
  }));
  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="netFat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c1272d" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#c1272d" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#78716c" }}
            tickLine={false}
            axisLine={{ stroke: "#e7e5e4" }}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            yAxisId="fat"
            tick={{ fontSize: 11, fill: "#78716c" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtMoneyCompact(Number(v))}
            width={68}
          />
          <YAxis
            yAxisId="lojas"
            orientation="right"
            tick={{ fontSize: 11, fill: "#a8a29e" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
            width={36}
            domain={[0, "dataMax + 4"]}
          />
          <Tooltip
            cursor={{ stroke: "#c1272d", strokeWidth: 1, strokeDasharray: 4 }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e7e5e4",
              fontSize: 12,
            }}
            formatter={(value, name) => {
              if (name === "Faturamento")
                return [fmtMoney(Number(value)), "Faturamento"];
              if (name === "Lojas operando")
                return [fmtInt(Number(value)), "Lojas operando"];
              return [String(value), String(name)];
            }}
            labelFormatter={(l) => `Mês ${l}`}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 4 }} iconType="circle" />
          <Bar
            yAxisId="lojas"
            dataKey="lojas_count"
            name="Lojas operando"
            fill="rgba(193, 39, 45, 0.16)"
            radius={[3, 3, 0, 0]}
            barSize={10}
          />
          <Area
            yAxisId="fat"
            type="monotone"
            dataKey="faturamento"
            name="Faturamento"
            stroke="#c1272d"
            strokeWidth={2.5}
            fill="url(#netFat)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
