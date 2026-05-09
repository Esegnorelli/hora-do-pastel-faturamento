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
};

export function RedeArea({
  points,
  height = 280,
}: {
  points: Point[];
  height?: number;
}) {
  const data = points.map((p) => ({ ...p, label: monthYearLabel(p.data) }));
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="redeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#810001" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#810001" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e0d4c0" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6b5b4d" }}
            tickLine={false}
            axisLine={{ stroke: "#e0d4c0" }}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b5b4d" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtMoneyCompact(Number(v))}
            width={70}
          />
          <Tooltip
            cursor={{ stroke: "#810001", strokeWidth: 1, strokeDasharray: 4 }}
            formatter={(value) => [fmtMoney(Number(value)), "Faturamento"]}
            labelFormatter={(l) => `Mês ${l}`}
          />
          <Area
            type="monotone"
            dataKey="faturamento"
            stroke="#810001"
            strokeWidth={2}
            fill="url(#redeFill)"
            dot={false}
            activeDot={{ r: 4, fill: "#dde022", stroke: "#810001", strokeWidth: 1.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
