import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  Search,
} from "lucide-react";
import clsx from "clsx";
import { Loading } from "@/components/Loading";
import { Spark } from "@/components/Spark";
import { useFaturamentoAll } from "@/hooks/useFaturamento";
import { aggregateRedeMensal, rowsByLoja } from "@/lib/insights";
import {
  fmtInt,
  fmtMoney,
  fmtMoneyCompact,
  fullMonthYearLabel,
  monthName,
  monthShortName,
} from "@/lib/format";
import type { Faturamento } from "@/lib/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SortKey =
  | "loja"
  | "faturamento"
  | "pedidos"
  | "ticket_medio"
  | "mom_percent"
  | "yoy_percent";
type SortDir = "asc" | "desc";

export function Dashboard() {
  const { data, isLoading, error } = useFaturamentoAll();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("faturamento");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");

  const computed = useMemo(() => {
    if (!data || data.length === 0) return null;
    const rede = aggregateRedeMensal(data);
    const lojaRows = rowsByLoja(data);
    const dates = rede.map((r) => r.data); // sorted asc
    const last = dates[dates.length - 1];
    const cur = selectedDate ?? last;
    const idx = dates.indexOf(cur);
    const prev = idx > 0 ? dates[idx - 1] : null;
    const next = idx < dates.length - 1 ? dates[idx + 1] : null;

    const curRede = rede.find((r) => r.data === cur)!;
    const prevRede = prev ? rede.find((r) => r.data === prev)! : null;

    const ano = Number(cur.slice(0, 4));
    const yoyDate = `${ano - 1}-${cur.slice(5)}`;
    const yoyRede = rede.find((r) => r.data === yoyDate);

    const momRede =
      prevRede && prevRede.faturamento > 0
        ? ((curRede.faturamento - prevRede.faturamento) /
            prevRede.faturamento) *
          100
        : null;
    const yoyRedePct =
      yoyRede && yoyRede.faturamento > 0
        ? ((curRede.faturamento - yoyRede.faturamento) / yoyRede.faturamento) *
          100
        : null;

    const monthRows = data.filter((r) => r.data === cur);

    // YTD
    const lastMonthNumber = Number(cur.slice(5, 7));
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

    // Last update
    let lastUpdate: string | null = null;
    for (const r of data) {
      const t = r.updated_at ?? r.created_at ?? null;
      if (t && (!lastUpdate || t > lastUpdate)) lastUpdate = t;
    }

    // Anos disponíveis (descending)
    const anosSet = new Set<number>();
    for (const d of dates) anosSet.add(Number(d.slice(0, 4)));
    const anos = [...anosSet].sort((a, b) => b - a);

    // Meses do ano selecionado (que existem no banco)
    const mesesNoAno = dates
      .filter((d) => d.slice(0, 4) === String(ano))
      .map((d) => Number(d.slice(5, 7)));

    return {
      rede,
      lojaRows,
      dates,
      cur,
      prev,
      next,
      curRede,
      prevRede,
      yoyRede,
      momRede,
      yoyRedePct,
      monthRows,
      ano,
      ytdAtual,
      ytdAnterior,
      ytdYoy,
      lastUpdate,
      anos,
      mesesNoAno,
    };
  }, [data, selectedDate]);

  if (isLoading) return <Loading message="lendo o caixa da rede" />;
  if (error)
    return (
      <p className="prose-rich text-negative">
        Erro: {(error as Error).message}
      </p>
    );
  if (!computed) return <p className="prose-rich">Sem dados ainda.</p>;

  const {
    rede,
    lojaRows,
    cur,
    prev,
    next,
    curRede,
    momRede,
    yoyRedePct,
    monthRows,
    ano,
    ytdAtual,
    ytdYoy,
    lastUpdate,
    anos,
    mesesNoAno,
  } = computed;

  const goToYear = (y: number) => {
    const candidate = `${y}-${cur.slice(5)}`;
    const exists = rede.some((r) => r.data === candidate);
    if (exists) {
      setSelectedDate(candidate);
    } else {
      // Pick last available month of that year
      const fallback = rede
        .filter((r) => r.data.slice(0, 4) === String(y))
        .at(-1);
      if (fallback) setSelectedDate(fallback.data);
    }
  };

  const goToMonth = (m: number) => {
    const candidate = `${ano}-${String(m).padStart(2, "0")}-01`;
    if (rede.some((r) => r.data === candidate)) setSelectedDate(candidate);
  };

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir(k === "loja" ? "asc" : "desc");
    }
  };

  const filtered = monthRows.filter((r) =>
    search.trim()
      ? r.loja.toLowerCase().includes(search.toLowerCase().trim())
      : true,
  );
  const sorted = sortRows(filtered, sortKey, sortDir);

  const totalFat = monthRows.reduce((s, r) => s + Number(r.faturamento), 0);
  const totalPed = monthRows.reduce((s, r) => s + Number(r.pedidos), 0);
  const ticketRede = totalPed > 0 ? totalFat / totalPed : 0;

  // Max for cell-bar scaling (faturamento column)
  const maxFat = Math.max(...monthRows.map((r) => Number(r.faturamento)), 1);
  const maxAbsMoM = Math.max(
    ...monthRows.map((r) =>
      r.mom_percent != null ? Math.abs(r.mom_percent) : 0,
    ),
    1,
  );
  const maxAbsYoY = Math.max(
    ...monthRows.map((r) =>
      r.yoy_percent != null ? Math.abs(r.yoy_percent) : 0,
    ),
    1,
  );

  const last24 = rede.slice(-24);

  return (
    <div className="space-y-6">
      {/* PERIOD SELECTOR */}
      <section className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => prev && setSelectedDate(prev)}
              disabled={!prev}
              className="h-9 w-9 flex items-center justify-center rounded-md border border-rule bg-paper hover:bg-cream-2 disabled:opacity-30 transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2 px-3 h-9 rounded-md bg-bordo text-paper font-bold text-sm tabular-nums min-w-[180px] justify-center">
              <span className="capitalize">{fullMonthYearLabel(cur)}</span>
            </div>
            <button
              onClick={() => next && setSelectedDate(next)}
              disabled={!next}
              className="h-9 w-9 flex items-center justify-center rounded-md border border-rule bg-paper hover:bg-cream-2 disabled:opacity-30 transition-colors"
              title="Próximo mês"
            >
              <ChevronRight size={16} />
            </button>
            <div className="ml-2 hidden md:flex items-center gap-1">
              {anos.slice(0, 5).map((y) => (
                <button
                  key={y}
                  onClick={() => goToYear(y)}
                  className={clsx(
                    "px-2.5 h-9 rounded-md text-xs font-bold tabular-nums transition-colors",
                    y === ano
                      ? "bg-cream-3 text-bordo"
                      : "text-ink-3 hover:bg-cream-2",
                  )}
                >
                  {y}
                </button>
              ))}
              <select
                onChange={(e) => goToYear(Number(e.target.value))}
                value={ano}
                className="h-9 rounded-md border border-rule bg-paper px-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-bordo/30 ml-1"
              >
                {anos.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            {next === null && (
              <span className="ml-2 text-[11px] uppercase tracking-[0.14em] font-bold text-bordo px-2 py-1 rounded bg-bordo-tint">
                último mês
              </span>
            )}
          </div>
          {lastUpdate && (
            <p className="text-[11px] tabular-nums text-ink-3 font-medium">
              <span className="eyebrow inline">última entrada</span>{" "}
              <span className="text-ink-2 font-semibold">
                {fmtTimestamp(lastUpdate)}
              </span>
            </p>
          )}
        </div>
        {/* Mês pills do ano selecionado */}
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const exists = mesesNoAno.includes(m);
            const active =
              cur.slice(0, 4) === String(ano) &&
              Number(cur.slice(5, 7)) === m;
            return (
              <button
                key={m}
                onClick={() => exists && goToMonth(m)}
                disabled={!exists}
                className={clsx(
                  "px-3 h-7 rounded text-[11px] uppercase tracking-wider font-bold transition-colors min-w-[44px]",
                  active
                    ? "bg-bordo text-paper"
                    : exists
                      ? "bg-paper border border-rule text-ink-2 hover:bg-cream-2"
                      : "text-ink-4/50 cursor-not-allowed",
                )}
              >
                {monthShortName(m)}
              </button>
            );
          })}
        </div>
      </section>

      {/* KPI STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-rule rounded-lg bg-paper overflow-hidden">
        <Kpi
          label="Faturamento"
          value={fmtMoney(curRede.faturamento)}
          sub={
            momRede !== null
              ? `${momRede >= 0 ? "+" : ""}${momRede.toFixed(1)}% MoM`
              : "—"
          }
          subTone={momRede == null ? "neutral" : momRede >= 0 ? "pos" : "neg"}
        />
        <Kpi
          label="vs ano anterior"
          value={
            yoyRedePct !== null
              ? `${yoyRedePct >= 0 ? "+" : ""}${yoyRedePct.toFixed(1)}%`
              : "—"
          }
          valueColor={
            yoyRedePct == null
              ? "text-ink-3"
              : yoyRedePct >= 0
                ? "text-positive"
                : "text-negative"
          }
          sub={`vs ${monthName(Number(cur.slice(5, 7)))} ${ano - 1}`}
        />
        <Kpi
          label="Pedidos"
          value={fmtInt(curRede.pedidos)}
          sub={`${curRede.lojas_count} lojas`}
        />
        <Kpi label="Ticket médio" value={fmtMoney(ticketRede)} sub="rede" />
        <Kpi
          label={`Acumulado ${ano}`}
          value={fmtMoney(ytdAtual)}
          sub={
            ytdYoy !== null
              ? `${ytdYoy >= 0 ? "+" : ""}${ytdYoy.toFixed(1)}% YoY`
              : "—"
          }
          subTone={ytdYoy == null ? "neutral" : ytdYoy >= 0 ? "pos" : "neg"}
        />
      </section>

      {/* MINI CHART */}
      <section className="border border-rule rounded-lg bg-paper p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="eyebrow">Curva da rede · últimos 24 meses</p>
          <p className="text-[11px] tabular-nums text-ink-3">
            ponto destacado: {fullMonthYearLabel(cur)}
          </p>
        </div>
        <div style={{ width: "100%", height: 160 }}>
          <ResponsiveContainer>
            <AreaChart
              data={last24.map((r) => ({
                ...r,
                label: monthShortName(Number(r.data.slice(5, 7))) + "/" + r.data.slice(2, 4),
              }))}
              margin={{ top: 6, right: 4, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="dashRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#810001" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#810001" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e0d4c0" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#6b5b4d" }}
                tickLine={false}
                axisLine={{ stroke: "#e0d4c0" }}
                interval="preserveStartEnd"
                minTickGap={20}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b5b4d" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => fmtMoneyCompact(Number(v))}
                width={56}
              />
              <Tooltip
                cursor={{ stroke: "#810001", strokeWidth: 1, strokeDasharray: 4 }}
                formatter={(value) => [fmtMoney(Number(value)), "Faturamento"]}
                labelFormatter={(l) => `${l}`}
              />
              <Area
                type="monotone"
                dataKey="faturamento"
                stroke="#810001"
                strokeWidth={1.6}
                fill="url(#dashRed)"
                dot={false}
              />
              {last24.find((r) => r.data === cur) && (
                <ReferenceDot
                  x={
                    monthShortName(Number(cur.slice(5, 7))) +
                    "/" +
                    cur.slice(2, 4)
                  }
                  y={curRede.faturamento}
                  r={5}
                  fill="#dde022"
                  stroke="#810001"
                  strokeWidth={1.5}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* HEROIC TABLE */}
      <section className="border border-rule rounded-lg bg-paper overflow-hidden">
        <header className="flex items-center justify-between gap-3 flex-wrap px-4 py-3 border-b border-rule bg-cream-2/40">
          <div>
            <p className="eyebrow">Detalhamento por loja</p>
            <p className="text-sm font-bold text-ink mt-0.5 capitalize">
              {fullMonthYearLabel(cur)} · {monthRows.length} loja{monthRows.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search
                size={13}
                strokeWidth={2}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="filtrar loja…"
                className="h-8 pl-7 pr-3 rounded-md border border-rule bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-bordo/30 w-[180px]"
              />
            </div>
            <Link
              to="/lancamentos"
              className="h-8 px-3 rounded-md border border-rule bg-paper text-xs font-bold inline-flex items-center gap-1 text-ink-2 hover:text-bordo hover:border-bordo/30 transition-colors"
            >
              ver lançamentos
              <ArrowUpRight size={12} strokeWidth={2.5} />
            </Link>
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream-2/40 sticky top-0">
              <tr className="text-ink-3 eyebrow border-b border-rule">
                <th className="text-left font-bold py-2.5 pl-4 w-[36px]">#</th>
                <SortHeader k="loja" cur={sortKey} dir={sortDir} onSort={toggleSort}>
                  Loja
                </SortHeader>
                <th className="text-left font-bold py-2.5 px-2 w-[60px]">Data</th>
                <SortHeader
                  k="faturamento"
                  cur={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                  align="right"
                >
                  Faturamento
                </SortHeader>
                <SortHeader
                  k="pedidos"
                  cur={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                  align="right"
                >
                  Pedidos
                </SortHeader>
                <SortHeader
                  k="ticket_medio"
                  cur={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                  align="right"
                >
                  Ticket
                </SortHeader>
                <SortHeader
                  k="mom_percent"
                  cur={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                  align="right"
                >
                  MoM %
                </SortHeader>
                <SortHeader
                  k="yoy_percent"
                  cur={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                  align="right"
                >
                  YoY %
                </SortHeader>
                <th className="text-right font-bold py-2.5 px-2">12 meses</th>
                <th className="w-[28px]"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const serie = (lojaRows.get(row.loja) ?? [])
                  .slice(-12)
                  .map((r) => Number(r.faturamento));
                const fatPct = (Number(row.faturamento) / maxFat) * 100;
                const momPctNorm =
                  row.mom_percent != null
                    ? Math.min(100, (Math.abs(row.mom_percent) / maxAbsMoM) * 100)
                    : 0;
                const yoyPctNorm =
                  row.yoy_percent != null
                    ? Math.min(100, (Math.abs(row.yoy_percent) / maxAbsYoY) * 100)
                    : 0;
                const isNew = row.yoy_percent == null;
                return (
                  <tr
                    key={row.id}
                    className="row-hover border-b border-rule-soft last:border-b-0"
                  >
                    <td className="py-2.5 pl-4 text-ink-3 font-mono text-[11px] tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link
                          to={`/lojas/${encodeURIComponent(row.loja)}`}
                          className="font-semibold text-ink hover:text-bordo transition-colors truncate"
                        >
                          {row.loja}
                        </Link>
                        {isNew && (
                          <span
                            className="shrink-0 px-1.5 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-[0.12em] bg-chartreuse text-bordo-deep"
                            title="Loja sem dados do mesmo mês no ano anterior"
                          >
                            nova
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-ink-3 font-mono text-[11px] tabular-nums whitespace-nowrap">
                      {row.data.slice(8, 10)}/{row.data.slice(5, 7)}/{row.data.slice(2, 4)}
                    </td>
                    <td className="py-2.5 px-2 text-right relative">
                      <div
                        className="absolute inset-y-1 right-2 left-auto pointer-events-none"
                        style={{
                          width: `${Math.max(2, fatPct * 0.6)}%`,
                          background:
                            "linear-gradient(90deg, transparent 0%, rgba(129, 0, 1, 0.07) 100%)",
                          borderRight: "1px solid rgba(129,0,1,0.18)",
                        }}
                      />
                      <span className="relative tabular-nums font-mono font-semibold">
                        {fmtMoney(Number(row.faturamento))}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums font-mono text-ink-2">
                      {fmtInt(row.pedidos)}
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums font-mono text-ink-2">
                      {fmtMoney(Number(row.ticket_medio))}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <PercentCell
                        value={row.mom_percent}
                        magnitude={momPctNorm}
                      />
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <PercentCell
                        value={row.yoy_percent}
                        magnitude={yoyPctNorm}
                      />
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className="inline-flex justify-end">
                        <Spark values={serie} width={88} height={22} />
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <Link
                        to={`/lojas/${encodeURIComponent(row.loja)}`}
                        className="text-ink-3 hover:text-bordo transition-colors"
                        title="Ver loja"
                      >
                        <ExternalLink size={13} strokeWidth={2} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-ink-3">
                    {search ? `Nenhuma loja com "${search}".` : "Sem dados."}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-cream-2/40 border-t-2 border-ink/20">
                <td colSpan={3} className="py-3 pl-4 font-bold text-ink">
                  Rede
                </td>
                <td className="py-3 px-2 text-right tabular-nums font-bold font-mono text-bordo">
                  {fmtMoney(totalFat)}
                </td>
                <td className="py-3 px-2 text-right tabular-nums font-bold font-mono text-ink">
                  {fmtInt(totalPed)}
                </td>
                <td className="py-3 px-2 text-right tabular-nums font-bold font-mono text-ink">
                  {fmtMoney(ticketRede)}
                </td>
                <td className="py-3 px-2 text-right">
                  <PercentCell value={momRede} magnitude={50} />
                </td>
                <td className="py-3 px-2 text-right">
                  <PercentCell value={yoyRedePct} magnitude={50} />
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  subTone = "neutral",
  valueColor = "text-ink",
}: {
  label: string;
  value: string;
  sub?: string;
  subTone?: "pos" | "neg" | "neutral";
  valueColor?: string;
}) {
  return (
    <div className="px-4 py-3 border-r border-rule last:border-r-0">
      <p className="eyebrow">{label}</p>
      <p
        className={clsx(
          "mt-1 text-2xl font-extrabold tracking-tight tabular-nums",
          valueColor,
        )}
      >
        {value}
      </p>
      {sub && (
        <p
          className={clsx(
            "text-[11px] mt-0.5 font-semibold tabular-nums",
            subTone === "pos" && "text-positive",
            subTone === "neg" && "text-negative",
            subTone === "neutral" && "text-ink-3",
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function PercentCell({
  value,
  magnitude,
}: {
  value: number | null;
  magnitude: number; // 0..100, magnitude relative to max in column
}) {
  if (value == null || isNaN(value)) {
    return <span className="text-ink-4 tabular-nums text-xs font-mono">—</span>;
  }
  const positive = value >= 0;
  const color = positive ? "#2f6b1f" : "#b00012";
  const bg = positive ? "rgba(47, 107, 31, 0.08)" : "rgba(176, 0, 18, 0.08)";

  return (
    <span
      className="relative inline-flex items-center justify-end gap-1 tabular-nums font-mono font-semibold text-xs px-1.5 py-0.5 rounded-sm"
      style={{ color, backgroundColor: bg }}
    >
      <span
        className="absolute inset-y-0 right-0 pointer-events-none"
        style={{
          width: `${Math.min(100, Math.max(8, magnitude))}%`,
          background: positive
            ? "linear-gradient(90deg, transparent 0%, rgba(47,107,31,0.10) 100%)"
            : "linear-gradient(90deg, transparent 0%, rgba(176,0,18,0.10) 100%)",
          borderRadius: "inherit",
        }}
      />
      <span className="relative">
        {positive ? "+" : ""}
        {value.toFixed(1)}%
      </span>
    </span>
  );
}

function SortHeader({
  k,
  cur,
  dir,
  onSort,
  align = "left",
  children,
}: {
  k: SortKey;
  cur: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  const active = k === cur;
  return (
    <th
      className={clsx(
        "py-2.5 px-2 font-bold cursor-pointer select-none transition-colors",
        align === "right" ? "text-right" : "text-left",
        active ? "text-bordo" : "hover:text-ink",
      )}
      onClick={() => onSort(k)}
    >
      <span
        className={clsx(
          "inline-flex items-center gap-1",
          align === "right" && "flex-row-reverse",
        )}
      >
        {children}
        {active ? (
          dir === "asc" ? (
            <ChevronUp size={11} strokeWidth={3} />
          ) : (
            <ChevronDown size={11} strokeWidth={3} />
          )
        ) : (
          <ChevronDown size={11} strokeWidth={2} className="opacity-25" />
        )}
      </span>
    </th>
  );
}

function sortRows(
  rows: Faturamento[],
  key: SortKey,
  dir: SortDir,
): Faturamento[] {
  const sign = dir === "asc" ? 1 : -1;
  const sorted = [...rows].sort((a, b) => {
    if (key === "loja") return sign * a.loja.localeCompare(b.loja);
    const av = a[key];
    const bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return sign * (Number(av) - Number(bv));
  });
  return sorted;
}

function fmtTimestamp(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} · ${hh}:${mi}`;
}
