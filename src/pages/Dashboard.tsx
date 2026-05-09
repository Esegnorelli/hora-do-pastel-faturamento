import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { Loading } from "@/components/Loading";
import { Spark } from "@/components/Spark";
import { NumberBadge } from "@/components/NumberBadge";
import { RedeArea } from "@/components/charts/RedeArea";
import { YoYBars } from "@/components/charts/YoYBars";
import { useFaturamentoAll } from "@/hooks/useFaturamento";
import {
  aggregateRedeMensal,
  buildInsights,
  rowsByLoja,
  rowsForMonth,
} from "@/lib/insights";
import {
  fmtInt,
  fmtMoney,
  fmtMoneyNoSym,
  fullMonthYearLabel,
  monthName,
} from "@/lib/format";

export function Dashboard() {
  const { data, isLoading, error } = useFaturamentoAll();

  const computed = useMemo(() => {
    if (!data || data.length === 0) return null;
    const rede = aggregateRedeMensal(data);
    const lastData = rede[rede.length - 1].data;
    const prevData = rede.length >= 2 ? rede[rede.length - 2].data : null;
    const lastRede = rede[rede.length - 1];
    const prevRede = rede.length >= 2 ? rede[rede.length - 2] : null;
    const momRede =
      prevRede && prevRede.faturamento > 0
        ? ((lastRede.faturamento - prevRede.faturamento) /
            prevRede.faturamento) *
          100
        : null;
    const ano = Number(lastData.slice(0, 4));
    const yoyData = `${ano - 1}-${lastData.slice(5)}`;
    const yoyRede = rede.find((r) => r.data === yoyData);
    const yoyPercent =
      yoyRede && yoyRede.faturamento > 0
        ? ((lastRede.faturamento - yoyRede.faturamento) / yoyRede.faturamento) *
          100
        : null;
    const lastMonthRows = rowsForMonth(data, lastData);
    const lojaRows = rowsByLoja(data);
    const insights = buildInsights(data, 5);

    // YTD (year-to-date) + comparison
    const lastMonthNumber = Number(lastData.slice(5, 7));
    const ytdAtual = data
      .filter((r) => r.data.slice(0, 4) === String(ano))
      .reduce((s, r) => s + Number(r.faturamento), 0);
    const ytdAnterior = data
      .filter(
        (r) =>
          r.data.slice(0, 4) === String(ano - 1) &&
          Number(r.data.slice(5, 7)) <= lastMonthNumber,
      )
      .reduce((s, r) => s + Number(r.faturamento), 0);
    const ytdYoy =
      ytdAnterior > 0 ? ((ytdAtual - ytdAnterior) / ytdAnterior) * 100 : null;

    // YoY comparison rows for chart
    const compRows = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const cur = `${ano}-${String(m).padStart(2, "0")}-01`;
      const prev = `${ano - 1}-${String(m).padStart(2, "0")}-01`;
      const findSum = (date: string) =>
        data
          .filter((r) => r.data === date)
          .reduce((s, r) => s + Number(r.faturamento), 0);
      const atual = findSum(cur);
      const anterior = findSum(prev);
      return {
        mes: m,
        atual: atual > 0 ? atual : null,
        anterior: anterior > 0 ? anterior : null,
      };
    });

    return {
      rede,
      lastData,
      prevData,
      lastRede,
      momRede,
      yoyPercent,
      lastMonthRows,
      lojaRows,
      insights,
      ano,
      ytdAtual,
      ytdAnterior,
      ytdYoy,
      compRows,
    };
  }, [data]);

  if (isLoading) return <Loading message="lendo o caixa da rede" />;
  if (error)
    return (
      <p className="prose-rich text-negative">
        Erro ao carregar dados: {(error as Error).message}
      </p>
    );
  if (!computed) return <p className="prose-rich">Sem lançamentos ainda.</p>;

  const {
    rede,
    lastData,
    lastRede,
    momRede,
    yoyPercent,
    lastMonthRows,
    lojaRows,
    insights,
    ano,
    ytdAtual,
    ytdAnterior,
    ytdYoy,
    compRows,
  } = computed;

  const lastMonth = monthName(Number(lastData.slice(5, 7)));
  const last36 = rede.slice(-36);

  // Sort store rows by faturamento descending for the table
  const sorted = [...lastMonthRows].sort(
    (a, b) => Number(b.faturamento) - Number(a.faturamento),
  );

  return (
    <div className="space-y-14">
      {/* HERO — editorial */}
      <section>
        <p className="eyebrow">Mês mais recente · {fullMonthYearLabel(lastData)}</p>
        <div className="mt-3 flex flex-wrap items-end gap-x-10 gap-y-4">
          <div>
            <p className="display text-[clamp(72px,12vw,160px)]">
              {fmtMoneyNoSym(lastRede.faturamento)}
              <span className="text-bordo font-mono text-[0.32em] ml-3 align-baseline">
                R$
              </span>
            </p>
            <p className="prose-rich mt-2 max-w-2xl">
              Faturamento consolidado da rede em {lastMonth}.{" "}
              {momRede !== null && (
                <>
                  {momRede >= 0 ? "Acima" : "Abaixo"} do mês anterior por{" "}
                  <span className="font-bold text-ink">
                    {Math.abs(momRede).toFixed(1)}%
                  </span>
                  .
                </>
              )}{" "}
              {yoyPercent !== null && (
                <>
                  Ante o mesmo mês de {ano - 1},{" "}
                  <span
                    className={clsx(
                      "font-bold",
                      yoyPercent >= 0 ? "text-positive" : "text-negative",
                    )}
                  >
                    {yoyPercent >= 0 ? "+" : ""}
                    {yoyPercent.toFixed(1)}%
                  </span>
                  .
                </>
              )}
            </p>
          </div>
          <div className="flex items-end gap-8 pb-2">
            <Stat label="Pedidos" value={fmtInt(lastRede.pedidos)} />
            <Stat
              label="Ticket médio"
              value={fmtMoney(lastRede.ticket_medio)}
            />
            <Stat
              label="Lojas operando"
              value={String(lastRede.lojas_count)}
            />
          </div>
        </div>
      </section>

      {/* INSIGHTS — editorial sentences */}
      {insights.length > 0 && (
        <section>
          <p className="eyebrow mb-4">O que importa em {lastMonth}</p>
          <ul className="grid gap-4 md:grid-cols-2">
            {insights.map((ins, i) => (
              <li
                key={ins.id}
                className={clsx(
                  "relative pl-5 pr-2 py-2 prose-rich text-ink-2",
                  i === 0 &&
                    "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-chartreuse",
                  i !== 0 &&
                    "before:absolute before:left-0 before:top-1 before:bottom-1 before:w-px before:bg-rule",
                )}
              >
                <span
                  className={clsx(
                    "font-bold",
                    ins.kind === "drop" && "text-negative",
                    ins.kind === "rise" && "text-positive",
                    (ins.kind === "record" || ins.kind === "milestone") &&
                      "text-bordo",
                  )}
                >
                  {ins.text.split(".")[0]}.
                </span>
                {ins.text.split(".").slice(1).join(".").trim() && (
                  <span> {ins.text.split(".").slice(1).join(".").trim()}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* YTD STRIP */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6 py-8 border-y border-rule">
        <div>
          <p className="eyebrow">Acumulado {ano}</p>
          <p className="number-hero text-[42px] mt-2 text-bordo-deep">
            {fmtMoney(ytdAtual)}
          </p>
          <p className="prose-rich text-sm mt-2">
            de janeiro a {lastMonth}. No mesmo período de {ano - 1}: {fmtMoney(ytdAnterior)}.
          </p>
        </div>
        <div>
          <p className="eyebrow">Variação YoY no acumulado</p>
          <p
            className={clsx(
              "number-hero text-[42px] mt-2",
              ytdYoy === null
                ? "text-ink-3"
                : ytdYoy >= 0
                  ? "text-positive"
                  : "text-negative",
            )}
          >
            {ytdYoy === null
              ? "—"
              : `${ytdYoy >= 0 ? "+" : ""}${ytdYoy.toFixed(1)}%`}
          </p>
          <p className="prose-rich text-sm mt-2">
            {ytdYoy !== null && ytdYoy >= 0
              ? "rede crescendo no acumulado anual."
              : "rede ainda atrás do ritmo do ano passado."}
          </p>
        </div>
        <div>
          <p className="eyebrow">Lojas operando hoje</p>
          <p className="number-hero text-[42px] mt-2 text-ink">
            {lastRede.lojas_count}
          </p>
          <p className="prose-rich text-sm mt-2">
            unidades reportando faturamento em {lastMonth}.
          </p>
        </div>
      </section>

      {/* NETWORK CURVE */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="eyebrow">Curva da rede</p>
            <h2 className="font-display font-black text-2xl tracking-tight text-ink mt-1">
              Faturamento mensal nos últimos 36 meses
            </h2>
          </div>
        </div>
        <RedeArea
          points={last36.map((r) => ({
            data: r.data,
            faturamento: r.faturamento,
          }))}
          height={300}
        />
      </section>

      {/* YoY BARS */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="eyebrow">Comparativo anual</p>
            <h2 className="font-display font-black text-2xl tracking-tight text-ink mt-1">
              {ano} contra {ano - 1}, mês a mês
            </h2>
          </div>
        </div>
        <YoYBars rows={compRows} anoAtual={ano} />
      </section>

      {/* STORE TABLE — editorial dense */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="eyebrow">Desempenho por loja</p>
            <h2 className="font-display font-black text-2xl tracking-tight text-ink mt-1">
              {lastMonth} de {ano}, ordenado por faturamento
            </h2>
          </div>
          <Link
            to="/lancamentos"
            className="text-sm font-semibold text-bordo hover:text-bordo-deep inline-flex items-center gap-1"
          >
            ver todos os lançamentos
            <ArrowUpRight size={14} strokeWidth={2.5} />
          </Link>
        </div>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-ink-3 eyebrow border-b border-rule">
                <th className="text-left font-bold py-3 pl-2">#</th>
                <th className="text-left font-bold py-3">Loja</th>
                <th className="text-right font-bold py-3 px-3">Faturamento</th>
                <th className="text-right font-bold py-3 px-3">Pedidos</th>
                <th className="text-right font-bold py-3 px-3">Ticket</th>
                <th className="text-right font-bold py-3 px-3">MoM</th>
                <th className="text-right font-bold py-3 px-3">YoY</th>
                <th className="text-right font-bold py-3 pr-2">12 meses</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const serie = (lojaRows.get(row.loja) ?? [])
                  .slice(-12)
                  .map((r) => Number(r.faturamento));
                return (
                  <tr
                    key={row.id}
                    className="row-hover border-b border-rule-soft"
                  >
                    <td className="py-3 pl-2 text-ink-3 font-mono text-xs tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="py-3">
                      <Link
                        to={`/lojas/${encodeURIComponent(row.loja)}`}
                        className="font-semibold text-ink hover:text-bordo transition-colors"
                      >
                        {row.loja}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-semibold font-mono">
                      {fmtMoney(Number(row.faturamento))}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-mono text-ink-2">
                      {fmtInt(row.pedidos)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-mono text-ink-2">
                      {fmtMoney(Number(row.ticket_medio))}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <NumberBadge value={row.mom_percent} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <NumberBadge value={row.yoy_percent} />
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <span className="inline-flex justify-end">
                        <Spark values={serie} width={96} height={26} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-ink/20">
                <td colSpan={2} className="py-3 pl-2 font-bold text-ink">
                  Rede
                </td>
                <td className="py-3 px-3 text-right tabular-nums font-bold font-mono text-bordo">
                  {fmtMoney(lastRede.faturamento)}
                </td>
                <td className="py-3 px-3 text-right tabular-nums font-bold font-mono text-ink">
                  {fmtInt(lastRede.pedidos)}
                </td>
                <td className="py-3 px-3 text-right tabular-nums font-bold font-mono text-ink">
                  {fmtMoney(lastRede.ticket_medio)}
                </td>
                <td className="py-3 px-3 text-right">
                  <NumberBadge value={momRede} />
                </td>
                <td className="py-3 px-3 text-right">
                  <NumberBadge value={yoyPercent} />
                </td>
                <td className="py-3 pr-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-rule pl-4">
      <p className="eyebrow">{label}</p>
      <p className="number-hero text-[22px] mt-1 text-ink">{value}</p>
    </div>
  );
}
