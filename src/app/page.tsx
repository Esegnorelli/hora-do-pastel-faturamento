import { KpiCard } from "@/components/KpiCard";
import { Card } from "@/components/Card";
import { RevenueAreaChart } from "@/components/charts/RevenueAreaChart";
import { StoreRankingChart } from "@/components/charts/StoreRankingChart";
import { TicketScatter } from "@/components/charts/TicketScatter";
import {
  getEvolucaoRede,
  getFaturamentoMes,
  getResumoMes,
  getUltimaData,
} from "@/lib/data";
import {
  fmtInt,
  fmtMoney,
  fullMonthYearLabel,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ultimaData = await getUltimaData();
  if (!ultimaData) {
    return (
      <div className="rounded-2xl bg-surface border border-border p-8 text-center">
        <p className="text-muted">Sem dados de faturamento ainda.</p>
      </div>
    );
  }

  const [resumo, linhas, evolucao] = await Promise.all([
    getResumoMes(ultimaData),
    getFaturamentoMes(ultimaData),
    getEvolucaoRede(24),
  ]);

  const top5 = [...linhas]
    .sort((a, b) => Number(b.faturamento) - Number(a.faturamento))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted font-semibold">
            Painel da rede
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Visão geral · {fullMonthYearLabel(ultimaData)}
          </h1>
          <p className="text-sm text-muted mt-1">
            Faturamento consolidado das lojas Hora do Pastel.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft text-brand px-3 py-1.5 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
          Dados ao vivo · Supabase
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Faturamento"
          value={fmtMoney(resumo.faturamento)}
          trend={resumo.yoy_percent}
          hint="vs. mesmo mês ano anterior"
        />
        <KpiCard
          label="Pedidos"
          value={fmtInt(resumo.pedidos)}
          hint={`${fmtInt(resumo.lojas_ativas)} lojas reportando`}
        />
        <KpiCard
          label="Ticket médio"
          value={fmtMoney(resumo.ticket_medio)}
          hint="rede consolidada"
        />
        <KpiCard
          label="vs. mês anterior"
          value={
            resumo.mom_percent !== null
              ? `${resumo.mom_percent >= 0 ? "+" : ""}${resumo.mom_percent.toFixed(1)}%`
              : "—"
          }
          trend={resumo.mom_percent}
          hint="MoM faturamento"
        />
      </div>

      <Card
        title="Evolução do faturamento da rede"
        subtitle="Últimos 24 meses · soma de todas as lojas"
      >
        <RevenueAreaChart
          points={evolucao.map((e) => ({
            data: e.data,
            faturamento: e.faturamento,
            pedidos: e.pedidos,
          }))}
        />
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card
          title="Ranking de lojas"
          subtitle={`Faturamento por loja em ${fullMonthYearLabel(ultimaData)}`}
          className="xl:col-span-2"
        >
          <StoreRankingChart
            items={linhas.map((l) => ({
              loja: l.loja,
              faturamento: Number(l.faturamento),
              pedidos: l.pedidos,
            }))}
          />
        </Card>

        <Card title="Top 5 lojas" subtitle="Maiores faturamentos do mês">
          <ol className="space-y-3">
            {top5.map((row, i) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-bold text-sm">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{row.loja}</p>
                    <p className="text-xs text-muted">
                      {fmtInt(row.pedidos)} pedidos · ticket R${" "}
                      {Number(row.ticket_medio).toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="font-bold tabular-nums">
                  {fmtMoney(Number(row.faturamento))}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card
        title="Pedidos × Ticket médio"
        subtitle="Cada bolha é uma loja · tamanho = faturamento total"
      >
        <TicketScatter
          items={linhas.map((l) => ({
            loja: l.loja,
            pedidos: l.pedidos,
            ticket_medio: Number(l.ticket_medio),
            faturamento: Number(l.faturamento),
          }))}
        />
      </Card>
    </div>
  );
}
