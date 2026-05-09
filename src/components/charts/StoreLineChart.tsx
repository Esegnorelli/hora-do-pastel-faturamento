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
              <stop offset="0%" stopColor="#b00012" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#700009" stopOpacity={0.65} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="mesLabel"
            tick={{ fontSize: 11, fill: "#8a8a99" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          />
          <YAxis
            yAxisId="fat"
            tick={{ fontSize: 11, fill: "#8a8a99" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => fmtMoneyCompact(Number(v))}
            width={70}
          />
          <YAxis
            yAxisId="ticket"
            orientation="right"
            tick={{ fontSize: 11, fill: "#ffb500" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `R$${Number(v).toFixed(0)}`}
            width={56}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(13,13,26,0.96)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: 12,
              color: "#f5f5f7",
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
            stroke="#ffb500"
            strokeWidth={2.4}
            dot={{ r: 3, fill: "#ffb500" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
