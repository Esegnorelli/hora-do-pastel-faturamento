import { fmtMoneyCompact, monthShortName } from "@/lib/format";

type Cell = { faturamento: number; pedidos: number; ticket_medio: number };
type Row = { loja: string; meses: Map<number, Cell>; total: number };

export function MatrixTable({
  rows,
  ano,
}: {
  rows: Row[];
  ano: number;
}) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const max = Math.max(
    ...rows.flatMap((r) =>
      [...r.meses.values()].map((c) => c.faturamento),
    ),
    1,
  );

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.12em] text-muted">
            <th className="text-left font-semibold py-2 pr-3 sticky left-0 bg-surface">
              Loja
            </th>
            {months.map((m) => (
              <th key={m} className="text-right font-semibold py-2 px-2">
                {monthShortName(m)}
              </th>
            ))}
            <th className="text-right font-semibold py-2 pl-2">Total {ano}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.loja}
              className="border-t border-border hover:bg-white/[0.02]"
            >
              <td className="py-2 pr-3 font-semibold sticky left-0 bg-surface text-foreground">
                {r.loja}
              </td>
              {months.map((m) => {
                const cell = r.meses.get(m);
                if (!cell) {
                  return (
                    <td
                      key={m}
                      className="text-right py-2 px-2 text-white/20 tabular-nums"
                    >
                      —
                    </td>
                  );
                }
                const intensity = Math.min(
                  1,
                  0.08 + 0.92 * (cell.faturamento / max),
                );
                return (
                  <td
                    key={m}
                    className="text-right py-2 px-2 tabular-nums text-foreground"
                    style={{
                      backgroundColor: `rgba(176, 0, 18, ${(intensity * 0.32).toFixed(3)})`,
                    }}
                    title={`${cell.pedidos} pedidos · ticket R$ ${cell.ticket_medio.toFixed(2)}`}
                  >
                    {fmtMoneyCompact(cell.faturamento)}
                  </td>
                );
              })}
              <td className="text-right py-2 pl-2 font-bold tabular-nums text-foreground">
                {fmtMoneyCompact(r.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
