"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtInt, fmtMoney, fmtMoneyCompact, monthShortName } from "@/lib/format";

type Row = {
  mes: number;
  faturamento: number;
  pedidos: number;
  ticket_medio: number;
};

export function StoreLineChart({ rows }: { rows: Row[] }) {
  const data = rows.map((r) => ({
    ...r,
    mesLabel: monthShortName(r.mes),
  }));
  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="storeBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c1272d" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#c1272d" stopOpacity={0.45} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
          <XAxis
            dataKey="mesLabel"
            tick={{ fontSize: 11, fill: "#78716c" }}
            tickLine={false}
            axisLine={{ stroke: "#e7e5e4" }}
          />
          <YAxis
            yAxisId="fat"
            tick={{ fontSize: 11, fill: "#78716c" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtMoneyCompact(Number(v))}
            width={70}
          />
          <YAxis
            yAxisId="ticket"
            orientation="right"
            tick={{ fontSize: 11, fill: "#78716c" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `R$${Number(v).toFixed(0)}`}
            width={56}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e7e5e4",
              fontSize: 12,
            }}
            formatter={(value, name) => {
              const v = Number(value);
              if (name === "faturamento")
                return [fmtMoney(v), "Faturamento"];
              if (name === "pedidos") return [fmtInt(v), "Pedidos"];
              if (name === "ticket_medio")
                return [`R$ ${v.toFixed(2)}`, "Ticket"];
              return [String(value), String(name)];
            }}
          />
          <Bar
            yAxisId="fat"
            dataKey="faturamento"
            fill="url(#storeBar)"
            radius={[6, 6, 0, 0]}
            barSize={28}
          />
          <Line
            yAxisId="ticket"
            type="monotone"
            dataKey="ticket_medio"
            stroke="#0a0a0a"
            strokeWidth={2}
            dot={{ r: 3, fill: "#0a0a0a" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
