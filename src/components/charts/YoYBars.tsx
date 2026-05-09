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

export function YoYBars({
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
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          barCategoryGap="22%"
        >
          <CartesianGrid
            stroke="#e0d4c0"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: "#6b5b4d" }}
            tickLine={false}
            axisLine={{ stroke: "#e0d4c0" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b5b4d" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtMoneyCompact(Number(v))}
            width={70}
          />
          <Tooltip
            cursor={{ fill: "rgba(129,0,1,0.04)" }}
            formatter={(value, name) =>
              value == null
                ? ["—", String(name)]
                : [fmtMoney(Number(value)), String(name)]
            }
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 4, color: "#3d3026" }}
            iconType="square"
          />
          <Bar
            dataKey={`${anoAtual - 1}`}
            fill="#b78247"
            fillOpacity={0.45}
            radius={[3, 3, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey={`${anoAtual}`}
            fill="#810001"
            radius={[3, 3, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
