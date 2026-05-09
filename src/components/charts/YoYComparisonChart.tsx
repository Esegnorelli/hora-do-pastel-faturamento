"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtMoney, fmtMoneyCompact, monthShortName } from "@/lib/format";

type Row = {
  mes: number;
  atual: number | null;
  anterior: number | null;
};

export function YoYComparisonChart({
  rows,
  anoAtual,
}: {
  rows: Row[];
  anoAtual: number;
}) {
  const data = rows.map((r) => ({
    mes: monthShortName(r.mes),
    [`${anoAtual - 1}`]: r.anterior,
    [`${anoAtual}`]: r.atual,
  }));
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
          barCategoryGap="22%"
        >
          <defs>
            <linearGradient id="yoyCur" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b00012" />
              <stop offset="100%" stopColor="#700009" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="mes"
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
            cursor={{ fill: "rgba(176,0,18,0.06)" }}
            contentStyle={{
              background: "rgba(13,13,26,0.96)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: 12,
              color: "#f5f5f7",
            }}
            formatter={(value, name) =>
              value == null
                ? ["—", String(name)]
                : [fmtMoney(Number(value)), String(name)]
            }
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 4, color: "#dfe0ee" }}
            iconType="circle"
          />
          <Bar
            dataKey={`${anoAtual - 1}`}
            fill="rgba(255,255,255,0.18)"
            radius={[6, 6, 0, 0]}
            maxBarSize={34}
          />
          <Bar
            dataKey={`${anoAtual}`}
            fill="url(#yoyCur)"
            radius={[6, 6, 0, 0]}
            maxBarSize={34}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
