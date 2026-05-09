"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { fmtInt, fmtMoney, fmtMoneyCompact, fmtIntCompact } from "@/lib/format";

type Item = {
  loja: string;
  pedidos: number;
  ticket_medio: number;
  faturamento: number;
};

export function TicketScatter({ items }: { items: Item[] }) {
  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 12, right: 16, bottom: 8, left: 4 }}>
          <CartesianGrid stroke="#e7e5e4" />
          <XAxis
            type="number"
            dataKey="pedidos"
            name="Pedidos"
            tick={{ fontSize: 11, fill: "#78716c" }}
            tickLine={false}
            axisLine={{ stroke: "#e7e5e4" }}
            tickFormatter={(v) => fmtIntCompact(Number(v))}
          />
          <YAxis
            type="number"
            dataKey="ticket_medio"
            name="Ticket"
            tick={{ fontSize: 11, fill: "#78716c" }}
            tickLine={false}
            axisLine={{ stroke: "#e7e5e4" }}
            tickFormatter={(v) => `R$ ${Number(v).toFixed(0)}`}
            domain={["dataMin - 5", "dataMax + 5"]}
          />
          <ZAxis type="number" dataKey="faturamento" range={[80, 600]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e7e5e4",
              fontSize: 12,
            }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as Item;
              return (
                <div className="rounded-xl border border-border bg-white px-3 py-2 shadow-sm text-xs">
                  <p className="font-semibold mb-1">{d.loja}</p>
                  <p>Pedidos: {fmtInt(d.pedidos)}</p>
                  <p>Ticket médio: R$ {d.ticket_medio.toFixed(2)}</p>
                  <p>Faturamento: {fmtMoneyCompact(d.faturamento)}</p>
                </div>
              );
            }}
          />
          <Scatter
            data={items}
            fill="#c1272d"
            fillOpacity={0.75}
            stroke="#9d1f24"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
