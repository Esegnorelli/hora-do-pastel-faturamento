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
import {
  fmtMoney,
  fmtMoneyCompact,
  monthShortName,
} from "@/lib/format";

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
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
          <XAxis
            dataKey="mes"
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
            cursor={{ fill: "rgba(193,39,45,0.04)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e7e5e4",
              fontSize: 12,
            }}
            formatter={(value, name) =>
              value == null
                ? ["—", String(name)]
                : [fmtMoney(Number(value)), String(name)]
            }
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
            iconType="circle"
          />
          <Bar
            dataKey={`${anoAtual - 1}`}
            fill="#d6d3d1"
            radius={[6, 6, 0, 0]}
            maxBarSize={34}
          />
          <Bar
            dataKey={`${anoAtual}`}
            fill="#c1272d"
            radius={[6, 6, 0, 0]}
            maxBarSize={34}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
