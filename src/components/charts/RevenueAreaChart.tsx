"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
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

export function RevenueAreaChart({
  points,
  projection,
}: {
  points: Point[];
  projection?: number | null;
}) {
  const formatted = points.map((p) => ({
    ...p,
    label: monthYearLabel(p.data),
  }));
  // Append projection point if provided
  const data =
    projection != null && formatted.length
      ? [...formatted, { data: "proj", label: "Proj.", faturamento: projection, pedidos: 0, projection }]
      : formatted;

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
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
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8a8a99" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtMoneyCompact(Number(v))}
            width={70}
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
              if (name === "faturamento")
                return [fmtMoney(Number(value)), "Faturamento"];
              if (name === "projection")
                return [fmtMoney(Number(value)), "Projeção"];
              return [String(value), String(name)];
            }}
            labelFormatter={(l) => `Mês ${l}`}
          />
          <Area
            type="monotone"
            dataKey="faturamento"
            stroke="#b00012"
            strokeWidth={2.5}
            fill="url(#revFill)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#ffb500" }}
          />
          {projection != null && (
            <Line
              type="monotone"
              dataKey="projection"
              stroke="#ffb500"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "#ffb500", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
