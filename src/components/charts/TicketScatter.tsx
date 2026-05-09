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
import {
  fmtInt,
  fmtMoney,
  fmtMoneyCompact,
  fmtIntCompact,
} from "@/lib/format";

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
          <CartesianGrid stroke="rgba(255,255,255,0.06)" />
          <XAxis
            type="number"
            dataKey="pedidos"
            name="Pedidos"
            tick={{ fontSize: 11, fill: "#8a8a99" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickFormatter={(v) => fmtIntCompact(Number(v))}
          />
          <YAxis
            type="number"
            dataKey="ticket_medio"
            name="Ticket"
            tick={{ fontSize: 11, fill: "#8a8a99" }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickFormatter={(v) => `R$ ${Number(v).toFixed(0)}`}
            domain={["dataMin - 5", "dataMax + 5"]}
          />
          <ZAxis type="number" dataKey="faturamento" range={[80, 600]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as Item;
              return (
                <div className="rounded-xl border border-border-strong bg-surface px-3 py-2 shadow-lg text-xs text-foreground">
                  <p className="font-semibold mb-1">{d.loja}</p>
                  <p className="text-muted-strong">
                    Pedidos: {fmtInt(d.pedidos)}
                  </p>
                  <p className="text-muted-strong">
                    Ticket médio: R$ {d.ticket_medio.toFixed(2)}
                  </p>
                  <p className="text-muted-strong">
                    Faturamento: {fmtMoneyCompact(d.faturamento)}
                  </p>
                </div>
              );
            }}
          />
          <Scatter
            data={items}
            fill="#b00012"
            fillOpacity={0.78}
            stroke="#ffb500"
            strokeWidth={1}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
