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
              <stop offset="0%" stopColor="#b00012" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#b00012" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#8a8a99" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            yAxisId="fat"
            tick={{ fontSize: 11, fill: "#8a8a99" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtMoneyCompact(Number(v))}
            width={68}
          />
          <YAxis
            yAxisId="lojas"
            orientation="right"
            tick={{ fontSize: 11, fill: "#ffb500" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
            width={36}
            domain={[0, "dataMax + 4"]}
          />
          <Tooltip
            cursor={{
              stroke: "#b00012",
              strokeWidth: 1,
              strokeDasharray: 4,
            }}
            contentStyle={{
              background: "rgba(13,13,26,0.96)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: 12,
              color: "#f5f5f7",
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
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 4, color: "#dfe0ee" }}
            iconType="circle"
          />
          <Bar
            yAxisId="lojas"
            dataKey="lojas_count"
            name="Lojas operando"
            fill="rgba(255, 181, 0, 0.35)"
            radius={[3, 3, 0, 0]}
            barSize={10}
          />
          <Area
            yAxisId="fat"
            type="monotone"
            dataKey="faturamento"
            name="Faturamento"
            stroke="#b00012"
            strokeWidth={2.5}
            fill="url(#netFat)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#ffb500" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
