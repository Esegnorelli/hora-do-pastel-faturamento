import clsx from "clsx";
import {
  fmtInt,
  fmtMoney,
  fmtPercent,
  monthName,
} from "@/lib/format";

type Row = {
  mes: number;
  faturamento: number;
  pedidos: number;
  ticket_medio: number;
  mom_percent: number | null;
  yoy_percent: number | null;
};

export function StoreMonthlyTable({ rows }: { rows: Row[] }) {
  const total = rows.reduce((s, r) => s + r.faturamento, 0);
  const totalPedidos = rows.reduce((s, r) => s + r.pedidos, 0);
  const ticket = totalPedidos > 0 ? total / totalPedidos : 0;

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.12em] text-muted">
            <th className="text-left font-semibold py-2 pr-3">Mês</th>
            <th className="text-right font-semibold py-2 px-2">Faturamento</th>
            <th className="text-right font-semibold py-2 px-2">Pedidos</th>
            <th className="text-right font-semibold py-2 px-2">Ticket</th>
            <th className="text-right font-semibold py-2 px-2">MoM</th>
            <th className="text-right font-semibold py-2 pl-2">YoY</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.mes}
              className="border-t border-border hover:bg-stone-50/50"
            >
              <td className="py-2 pr-3 font-semibold">{monthName(r.mes)}</td>
              <td className="text-right py-2 px-2 tabular-nums font-semibold">
                {fmtMoney(r.faturamento)}
              </td>
              <td className="text-right py-2 px-2 tabular-nums">
                {fmtInt(r.pedidos)}
              </td>
              <td className="text-right py-2 px-2 tabular-nums">
                R$ {r.ticket_medio.toFixed(2)}
              </td>
              <td
                className={clsx(
                  "text-right py-2 px-2 tabular-nums font-semibold",
                  r.mom_percent === null
                    ? "text-muted"
                    : r.mom_percent >= 0
                      ? "text-emerald-700"
                      : "text-red-700",
                )}
              >
                {r.mom_percent === null
                  ? "—"
                  : `${r.mom_percent >= 0 ? "+" : ""}${fmtPercent(r.mom_percent)}`}
              </td>
              <td
                className={clsx(
                  "text-right py-2 pl-2 tabular-nums font-semibold",
                  r.yoy_percent === null
                    ? "text-muted"
                    : r.yoy_percent >= 0
                      ? "text-emerald-700"
                      : "text-red-700",
                )}
              >
                {r.yoy_percent === null
                  ? "—"
                  : `${r.yoy_percent >= 0 ? "+" : ""}${fmtPercent(r.yoy_percent)}`}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-stone-300 bg-stone-50/60">
            <td className="py-2 pr-3 font-bold">Total</td>
            <td className="text-right py-2 px-2 tabular-nums font-bold">
              {fmtMoney(total)}
            </td>
            <td className="text-right py-2 px-2 tabular-nums font-bold">
              {fmtInt(totalPedidos)}
            </td>
            <td className="text-right py-2 px-2 tabular-nums font-bold">
              R$ {ticket.toFixed(2)}
            </td>
            <td className="text-right py-2 px-2 text-muted">—</td>
            <td className="text-right py-2 pl-2 text-muted">—</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
