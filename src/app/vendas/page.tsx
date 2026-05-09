import { Card } from "@/components/Card";
import { KpiCard } from "@/components/KpiCard";
import { MatrixTable } from "@/components/MatrixTable";
import { SalesFilters } from "@/components/SalesFilters";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import { StoreLineChart } from "@/components/charts/StoreLineChart";
import { StoreMonthlyTable } from "@/components/StoreMonthlyTable";
import {
  getAnosDisponiveis,
  getFaturamentoPorLoja,
  getLojas,
  getSeriesPorLoja,
} from "@/lib/data";
import { fmtInt, fmtMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string; ano?: string }>;
}) {
  const params = await searchParams;
  const lojas = await getLojas();
  const anos = await getAnosDisponiveis();
  const ano = Number(params.ano) || anos[0] || new Date().getFullYear();
  const loja = params.loja ?? "";

  const lojaSelecionada = !!loja && loja !== "todas";

  const lojasNomes = lojas.map((l) => l.nome);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted font-semibold">
            Vendas
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {lojaSelecionada ? loja : "Todas as lojas"} · {ano}
          </h1>
          <p className="text-sm text-muted mt-1">
            {lojaSelecionada
              ? "Faturamento mensal detalhado da loja, com variação MoM e YoY."
              : "Faturamento mês a mês de cada loja da rede."}
          </p>
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/12 border border-brand/40 text-foreground px-3 py-1.5 text-xs font-bold tracking-wide uppercase self-center">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand">
              <span className="live-pulse" />
            </span>
            AO VIVO
          </span>
          <SalesFilters
            lojas={lojasNomes}
            anos={anos.length ? anos : [ano]}
            loja={loja}
            ano={ano}
          />
        </div>
      </div>

      {lojaSelecionada ? (
        <LojaDetalhada loja={loja} ano={ano} />
      ) : (
        <RedeMatriz ano={ano} />
      )}
    </div>
  );
}

async function LojaDetalhada({ loja, ano }: { loja: string; ano: number }) {
  const [linhasAno, linhasAnt] = await Promise.all([
    getFaturamentoPorLoja(loja, ano),
    getFaturamentoPorLoja(loja, ano - 1),
  ]);

  const linhasAntMap = new Map(
    linhasAnt.map((r) => [Number(r.data.slice(5, 7)), r]),
  );

  const rows = linhasAno
    .map((r, idx) => {
      const mes = Number(r.data.slice(5, 7));
      const prev = linhasAno[idx - 1];
      const prevYear = linhasAntMap.get(mes);
      return {
        mes,
        faturamento: Number(r.faturamento),
        pedidos: r.pedidos,
        ticket_medio: Number(r.ticket_medio),
        mom_percent:
          prev && Number(prev.faturamento) > 0
            ? ((Number(r.faturamento) - Number(prev.faturamento)) /
                Number(prev.faturamento)) *
              100
            : null,
        yoy_percent:
          prevYear && Number(prevYear.faturamento) > 0
            ? ((Number(r.faturamento) - Number(prevYear.faturamento)) /
                Number(prevYear.faturamento)) *
              100
            : null,
      };
    })
    .sort((a, b) => a.mes - b.mes);

  const total = rows.reduce((s, r) => s + r.faturamento, 0);
  const totalPedidos = rows.reduce((s, r) => s + r.pedidos, 0);
  const ticket = totalPedidos > 0 ? total / totalPedidos : 0;
  const totalAnt = linhasAnt.reduce((s, r) => s + Number(r.faturamento), 0);
  const yoy = totalAnt > 0 ? ((total - totalAnt) / totalAnt) * 100 : null;
  const melhor = rows.length
    ? rows.reduce((a, b) => (a.faturamento > b.faturamento ? a : b))
    : null;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={`Faturamento ${ano}`}
          value={fmtMoney(total)}
          trend={yoy}
          hint={`vs. ${fmtMoney(totalAnt)} em ${ano - 1}`}
        />
        <KpiCard
          label="Pedidos"
          value={fmtInt(totalPedidos)}
          hint={`média ${fmtInt(Math.round(totalPedidos / Math.max(rows.length, 1)))} / mês`}
        />
        <KpiCard label="Ticket médio" value={fmtMoney(ticket)} hint={`acumulado ${ano}`} />
        <KpiCard
          label="Melhor mês"
          value={melhor ? fmtMoney(melhor.faturamento) : "—"}
          hint={melhor ? `mês ${melhor.mes}/${ano}` : ""}
        />
      </div>

      <Card title="Faturamento mensal" subtitle={`Evolução de ${loja} em ${ano}`}>
        <StoreLineChart rows={rows} />
      </Card>

      <Card
        title="Detalhamento mensal"
        subtitle="Variação contra mês anterior (MoM) e mesmo mês ano anterior (YoY)"
      >
        {rows.length ? (
          <StoreMonthlyTable rows={rows} />
        ) : (
          <p className="text-sm text-muted py-6 text-center">
            Sem dados para {loja} em {ano}.
          </p>
        )}
      </Card>
    </>
  );
}

async function RedeMatriz({ ano }: { ano: number }) {
  const series = await getSeriesPorLoja(ano);

  const seriesGrafico = series.map((s) => ({
    loja: s.loja,
    pontos: s.pontos.map((p) => ({
      mes: Number(p.data.slice(5, 7)),
      faturamento: p.faturamento,
    })),
  }));

  const tableRows = series
    .map((s) => {
      const meses = new Map<
        number,
        { faturamento: number; pedidos: number; ticket_medio: number }
      >();
      let total = 0;
      for (const p of s.pontos) {
        const m = Number(p.data.slice(5, 7));
        meses.set(m, {
          faturamento: p.faturamento,
          pedidos: p.pedidos,
          ticket_medio: p.ticket_medio,
        });
        total += p.faturamento;
      }
      return { loja: s.loja, meses, total };
    })
    .sort((a, b) => b.total - a.total);

  const totalRede = tableRows.reduce((s, r) => s + r.total, 0);
  const totalLojas = tableRows.length;
  const melhor = tableRows[0];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label={`Faturamento ${ano}`}
          value={fmtMoney(totalRede)}
          hint={`${totalLojas} lojas com dados`}
        />
        <KpiCard
          label="Líder do ano"
          value={melhor ? fmtMoney(melhor.total) : "—"}
          hint={melhor?.loja}
        />
        <KpiCard
          label="Lojas com dados"
          value={String(totalLojas)}
          hint="reportando neste período"
        />
      </div>

      <Card
        title={`Evolução mensal por loja · ${ano}`}
        subtitle="Clique nas pílulas para incluir/remover lojas no gráfico"
      >
        {seriesGrafico.length ? (
          <MultiLineChart series={seriesGrafico} />
        ) : (
          <p className="text-sm text-muted py-6 text-center">
            Sem dados para {ano}.
          </p>
        )}
      </Card>

      <Card
        title={`Matriz de faturamento · ${ano}`}
        subtitle="Cada célula é o faturamento da loja no mês — intensidade indica volume"
      >
        {tableRows.length ? (
          <MatrixTable rows={tableRows} ano={ano} />
        ) : (
          <p className="text-sm text-muted py-6 text-center">
            Sem dados para {ano}.
          </p>
        )}
      </Card>
    </>
  );
}
