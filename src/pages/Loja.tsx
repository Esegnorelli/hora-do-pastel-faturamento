import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { useFaturamentoAll } from "@/hooks/useFaturamento";
import { Loading } from "@/components/Loading";
import { NumberBadge } from "@/components/NumberBadge";
import {
  fmtInt,
  fmtMoney,
  fmtMoneyNoSym,
  monthName,
  monthYearLabel,
} from "@/lib/format";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function Loja() {
  const params = useParams();
  const lojaParam = params.nome ?? "";
  const loja = decodeURIComponent(lojaParam);
  const { data, isLoading } = useFaturamentoAll();

  const computed = useMemo(() => {
    if (!data) return null;
    const rows = data
      .filter((r) => r.loja === loja)
      .sort((a, b) => (a.data < b.data ? -1 : 1));
    if (rows.length === 0) return { rows, last: null };
    const last = rows[rows.length - 1];
    const total = rows.reduce((s, r) => s + Number(r.faturamento), 0);
    const totalPedidos = rows.reduce((s, r) => s + Number(r.pedidos), 0);
    const ticket = totalPedidos > 0 ? total / totalPedidos : 0;
    const max = rows.reduce((a, b) =>
      Number(a.faturamento) > Number(b.faturamento) ? a : b,
    );
    const min = rows.reduce((a, b) =>
      Number(a.faturamento) < Number(b.faturamento) ? a : b,
    );
    return {
      rows,
      last,
      total,
      totalPedidos,
      ticket,
      max,
      min,
    };
  }, [data, loja]);

  if (isLoading) return <Loading />;
  if (!computed)
    return (
      <p className="prose-rich">
        Loja <strong>{loja}</strong> não encontrada.
      </p>
    );

  const { rows, last, total, totalPedidos, ticket, max, min } = computed;

  if (!last)
    return (
      <div className="space-y-6">
        <BackLink />
        <p className="prose-rich">
          Sem lançamentos para <strong>{loja}</strong> ainda.
        </p>
      </div>
    );

  const seriePoints = rows.map((r) => ({
    data: r.data,
    label: monthYearLabel(r.data),
    faturamento: Number(r.faturamento),
  }));

  return (
    <div className="space-y-12">
      <BackLink />

      <header>
        <p className="eyebrow">Loja · {rows.length} {rows.length === 1 ? "mês" : "meses"} de operação</p>
        <h1 className="font-display font-black text-[clamp(48px,8vw,96px)] tracking-tight text-bordo-deep mt-1 leading-none">
          {loja}
        </h1>
      </header>

      <section className="grid md:grid-cols-3 gap-x-12 gap-y-6 py-8 border-y border-rule">
        <div>
          <p className="eyebrow">Último mês — {monthName(Number(last.data.slice(5, 7)))}</p>
          <p className="number-hero text-[42px] mt-2 text-bordo-deep">
            {fmtMoneyNoSym(Number(last.faturamento))}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <NumberBadge value={last.mom_percent} size="md" />
            <span className="text-xs text-ink-3">vs mês anterior</span>
          </div>
        </div>
        <div>
          <p className="eyebrow">Maior mês registrado</p>
          <p className="number-hero text-[28px] mt-2 text-ink">
            {fmtMoneyNoSym(Number(max.faturamento))}
          </p>
          <p className="prose-rich text-sm mt-1">
            em {monthName(Number(max.data.slice(5, 7)))} de {max.data.slice(0, 4)}
          </p>
        </div>
        <div>
          <p className="eyebrow">Menor mês registrado</p>
          <p className="number-hero text-[28px] mt-2 text-ink">
            {fmtMoneyNoSym(Number(min.faturamento))}
          </p>
          <p className="prose-rich text-sm mt-1">
            em {monthName(Number(min.data.slice(5, 7)))} de {min.data.slice(0, 4)}
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="eyebrow">Histórico</p>
            <h2 className="font-display font-black text-2xl tracking-tight text-ink mt-1">
              Faturamento mensal de {loja}
            </h2>
          </div>
          <p className="text-sm text-ink-3">
            acumulado: <span className="font-mono font-bold text-ink">{fmtMoney(total ?? 0)}</span>
          </p>
        </div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <AreaChart
              data={seriePoints}
              margin={{ top: 10, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="lojaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#810001" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#810001" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e0d4c0" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6b5b4d" }}
                tickLine={false}
                axisLine={{ stroke: "#e0d4c0" }}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b5b4d" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => new Intl.NumberFormat("pt-BR", { notation: "compact", style: "currency", currency: "BRL", maximumFractionDigits: 1 }).format(Number(v))}
                width={70}
              />
              <Tooltip
                cursor={{ stroke: "#810001", strokeWidth: 1, strokeDasharray: 4 }}
                formatter={(value) => [fmtMoney(Number(value)), "Faturamento"]}
                labelFormatter={(l) => `Mês ${l}`}
              />
              <Area
                type="monotone"
                dataKey="faturamento"
                stroke="#810001"
                strokeWidth={2}
                fill="url(#lojaFill)"
                dot={{ r: 2, fill: "#810001", stroke: "none" }}
                activeDot={{ r: 5, fill: "#dde022", stroke: "#810001", strokeWidth: 1.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="eyebrow">Tabela mês a mês</p>
            <h2 className="font-display font-black text-2xl tracking-tight text-ink mt-1">
              Detalhamento mensal
            </h2>
          </div>
          <p className="text-sm text-ink-3">
            ticket médio do período:{" "}
            <span className="font-mono font-bold text-ink">{fmtMoney(ticket ?? 0)}</span>
            {" · "}
            <span className="font-mono font-bold text-ink">{fmtInt(totalPedidos ?? 0)}</span> pedidos totais
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-ink-3 eyebrow border-b border-rule">
              <th className="text-left font-bold py-3">Mês</th>
              <th className="text-right font-bold py-3 px-3">Faturamento</th>
              <th className="text-right font-bold py-3 px-3">Pedidos</th>
              <th className="text-right font-bold py-3 px-3">Ticket</th>
              <th className="text-right font-bold py-3 px-3">MoM</th>
              <th className="text-right font-bold py-3">YoY</th>
            </tr>
          </thead>
          <tbody>
            {[...rows]
              .reverse()
              .map((r, i) => (
                <tr
                  key={r.id}
                  className={clsx(
                    "row-hover border-b border-rule-soft",
                    i === 0 && "bg-cream-2/40",
                  )}
                >
                  <td className="py-3 font-semibold text-ink">
                    {monthName(Number(r.data.slice(5, 7)))} <span className="text-ink-3 font-normal">de {r.data.slice(0, 4)}</span>
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-mono">
                    {fmtMoney(Number(r.faturamento))}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-mono text-ink-2">
                    {fmtInt(r.pedidos)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-mono text-ink-2">
                    {fmtMoney(Number(r.ticket_medio))}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <NumberBadge value={r.mom_percent} />
                  </td>
                  <td className="py-3 text-right">
                    <NumberBadge value={r.yoy_percent} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 hover:text-bordo transition-colors"
    >
      <ArrowLeft size={14} strokeWidth={2.5} /> dashboard da rede
    </Link>
  );
}
