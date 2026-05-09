import { KpiCard } from "@/components/KpiCard";
import { Card } from "@/components/Card";
import { StoreTrendCard } from "@/components/StoreTrendCard";
import { NetworkBreathingChart } from "@/components/charts/NetworkBreathingChart";
import { StoreRankingChart } from "@/components/charts/StoreRankingChart";
import { TicketScatter } from "@/components/charts/TicketScatter";
import { YoYComparisonChart } from "@/components/charts/YoYComparisonChart";
import {
  getComparativoAnual,
  getEvolucaoRede,
  getFaturamentoMes,
  getResumoMes,
  getResumoYTD,
  getTendenciasLojas,
  getUltimaData,
} from "@/lib/data";
import { fmtInt, fmtMoney, fullMonthYearLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ultimaData = await getUltimaData();
  if (!ultimaData) {
    return (
      <div className="rounded-2xl bg-surface border border-border p-8 text-center text-muted">
        Sem dados de faturamento ainda.
      </div>
    );
  }

  const [resumo, linhas, evolucao, ytd, tendencias, comparativo] =
    await Promise.all([
      getResumoMes(ultimaData),
      getFaturamentoMes(ultimaData),
      getEvolucaoRede(36),
      getResumoYTD(),
      getTendenciasLojas(12),
      getComparativoAnual(Number(ultimaData.slice(0, 4))),
    ]);

  const anoAtual = Number(ultimaData.slice(0, 4));
  const top6 = tendencias.slice(0, 6);
  const piores = [...tendencias]
    .filter((t) => t.variacao_pct !== null)
    .sort((a, b) => (a.variacao_pct ?? 0) - (b.variacao_pct ?? 0))
    .slice(0, 3);
  const melhores = [...tendencias]
    .filter((t) => t.variacao_pct !== null)
    .sort((a, b) => (b.variacao_pct ?? 0) - (a.variacao_pct ?? 0))
    .slice(0, 3);

  // Sparklines for KPI cards (rede last 12 months)
  const ult12 = evolucao.slice(-12);
  const sparkFat = ult12.map((e) => e.faturamento);
  const sparkPed = ult12.map((e) => e.pedidos);
  const sparkTicket = ult12.map((e) => e.ticket_medio);
  const sparkLojas = ult12.map((e) => e.lojas_count);

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted font-semibold">
            Painel da rede
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Visão geral · {fullMonthYearLabel(ultimaData)}
          </h1>
          <p className="text-sm text-muted mt-1">
            Faturamento consolidado das lojas Hora do Pastel — atualizado em
            tempo real.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-brand/12 border border-brand/40 text-foreground px-3 py-1.5 text-xs font-bold tracking-wide uppercase">
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand">
            <span className="live-pulse" />
          </span>
          AO VIVO · Supabase
        </span>
      </header>

      <section className="rounded-3xl bg-gradient-to-br from-[#0d0d1a] via-[#1c0a0c] to-[#700009] text-white p-6 sm:p-8 glow-card-static overflow-hidden relative">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-brand/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-[#ffb500]/20 blur-3xl pointer-events-none" />
        <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 font-semibold">
              Acumulado {ytd.atual.ano}
            </p>
            <p className="mt-1 text-4xl sm:text-5xl font-bold tracking-tight tabular-nums shimmer-text">
              {fmtMoney(ytd.atual.faturamento)}
            </p>
            <p className="mt-2 text-sm text-white/70">
              Soma do faturamento de janeiro a{" "}
              {fullMonthYearLabel(ultimaData).toLowerCase()}. Comparado com{" "}
              {fmtMoney(ytd.anterior.faturamento)} no mesmo período de{" "}
              {ytd.anterior.ano}.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3 max-w-xl">
              <div className="rounded-xl bg-white/8 backdrop-blur-sm p-3 border border-white/10">
                <p className="text-[11px] uppercase tracking-wide text-white/60">
                  Pedidos
                </p>
                <p className="text-lg font-bold tabular-nums">
                  {fmtInt(ytd.atual.pedidos)}
                </p>
              </div>
              <div className="rounded-xl bg-white/8 backdrop-blur-sm p-3 border border-white/10">
                <p className="text-[11px] uppercase tracking-wide text-white/60">
                  Ticket médio
                </p>
                <p className="text-lg font-bold tabular-nums">
                  {fmtMoney(ytd.atual.ticket_medio)}
                </p>
              </div>
              <div className="rounded-xl bg-white/8 backdrop-blur-sm p-3 border border-white/10">
                <p className="text-[11px] uppercase tracking-wide text-white/60">
                  Lojas operando
                </p>
                <p className="text-lg font-bold tabular-nums">
                  {resumo.lojas_ativas}
                </p>
              </div>
            </div>
          </div>
          <div className="self-center lg:justify-self-end">
            <div className="rounded-2xl bg-white/8 backdrop-blur-md border border-white/15 px-6 py-5 min-w-[260px]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/60 font-semibold">
                Crescimento YoY
              </p>
              {ytd.yoy_percent !== null ? (
                <>
                  <p
                    className="mt-2 text-4xl font-bold tabular-nums"
                    style={{
                      color:
                        ytd.yoy_percent >= 0 ? "#ffb500" : "#ff5566",
                    }}
                  >
                    {ytd.yoy_percent >= 0 ? "+" : ""}
                    {ytd.yoy_percent.toFixed(1)}%
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    {ytd.atual.ano} vs {ytd.anterior.ano} — janeiro a{" "}
                    {fullMonthYearLabel(ultimaData)
                      .toLowerCase()
                      .split(" ")[0]}
                  </p>
                  <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.min(100, Math.abs(ytd.yoy_percent))}%`,
                        background:
                          ytd.yoy_percent >= 0
                            ? "linear-gradient(90deg, #ffb500, #ffc533)"
                            : "linear-gradient(90deg, #b00012, #ff5566)",
                      }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-2xl text-white/70 mt-2">—</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={`Faturamento ${fullMonthYearLabel(ultimaData)}`}
          value={fmtMoney(resumo.faturamento)}
          trend={resumo.yoy_percent}
          hint="vs. mesmo mês ano anterior"
          spark={sparkFat}
        />
        <KpiCard
          label="Pedidos do mês"
          value={fmtInt(resumo.pedidos)}
          hint={`${fmtInt(resumo.lojas_ativas)} lojas reportando`}
          spark={sparkPed}
        />
        <KpiCard
          label="Ticket médio"
          value={fmtMoney(resumo.ticket_medio)}
          hint="rede consolidada"
          spark={sparkTicket}
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
          spark={sparkLojas}
        />
      </div>

      <Card
        title="Crescimento da rede"
        subtitle="Faturamento mensal e número de lojas operando · últimos 36 meses"
      >
        <NetworkBreathingChart
          points={evolucao.map((e) => ({
            data: e.data,
            faturamento: e.faturamento,
            lojas_count: e.lojas_count,
          }))}
        />
      </Card>

      <Card
        title={`Comparativo ${anoAtual} × ${anoAtual - 1}`}
        subtitle="Faturamento mensal da rede mês a mês"
      >
        <YoYComparisonChart rows={comparativo} anoAtual={anoAtual} />
      </Card>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Maiores faturamentos"
          subtitle={`Top lojas em ${fullMonthYearLabel(ultimaData)} · sparkline = últimos 12 meses`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {top6.map((t, i) => (
              <StoreTrendCard key={t.loja} tendencia={t} rank={i + 1} />
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card title="Em alta" subtitle="Maior crescimento MoM no último mês">
            <div className="grid grid-cols-1 gap-3">
              {melhores.map((t) => (
                <StoreTrendCard key={t.loja} tendencia={t} />
              ))}
            </div>
          </Card>
          <Card title="Atenção" subtitle="Maior queda MoM no último mês">
            <div className="grid grid-cols-1 gap-3">
              {piores.map((t) => (
                <StoreTrendCard key={t.loja} tendencia={t} />
              ))}
            </div>
          </Card>
        </div>
      </section>

      <Card
        title="Ranking completo do mês"
        subtitle={`Faturamento de cada loja em ${fullMonthYearLabel(ultimaData)} · barra dourada = líder`}
      >
        <StoreRankingChart
          items={linhas.map((l) => ({
            loja: l.loja,
            faturamento: Number(l.faturamento),
            pedidos: l.pedidos,
          }))}
        />
      </Card>

      <Card
        title="Pedidos × Ticket médio"
        subtitle="Cada bolha é uma loja · tamanho = faturamento total · contorno dourado"
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
