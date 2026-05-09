import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
} from "lucide-react";
import clsx from "clsx";
import { Loading } from "@/components/Loading";
import { NumberBadge } from "@/components/NumberBadge";
import {
  useDeleteFaturamento,
  useFaturamentoAll,
  useInsertFaturamento,
  useLojas,
  useUpdateFaturamento,
} from "@/hooks/useFaturamento";
import {
  dataPtBR,
  fmtInt,
  fmtMoney,
  monthShortName,
} from "@/lib/format";
import type { Faturamento } from "@/lib/types";

type SortKey = "data" | "loja" | "faturamento" | "pedidos" | "ticket_medio";
type SortDir = "asc" | "desc";

export function Lancamentos() {
  const { data, isLoading } = useFaturamentoAll();
  const { data: lojas } = useLojas();
  const insertMut = useInsertFaturamento();
  const updateMut = useUpdateFaturamento();
  const deleteMut = useDeleteFaturamento();

  const [filterLoja, setFilterLoja] = useState<string>("");
  const [filterAno, setFilterAno] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("data");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const anos = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    for (const r of data) set.add(r.data.slice(0, 4));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let rows = [...data];
    if (filterLoja) rows = rows.filter((r) => r.loja === filterLoja);
    if (filterAno) rows = rows.filter((r) => r.data.startsWith(filterAno));
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp: number;
      if (typeof av === "string" && typeof bv === "string") cmp = av.localeCompare(bv);
      else cmp = Number(av) - Number(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [data, filterLoja, filterAno, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir(k === "loja" ? "asc" : "desc");
    }
  };

  if (isLoading) return <Loading message="lendo lançamentos" />;

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Registro de lançamentos</p>
        <h1 className="font-display font-black text-[clamp(40px,7vw,80px)] tracking-tight text-bordo-deep mt-1 leading-none">
          Lançamentos
        </h1>
        <p className="prose-rich mt-3 max-w-2xl">
          Cadastre faturamento mensal por loja, edite ou remova registros existentes.
          Ao salvar, o dashboard atualiza imediatamente.
        </p>
      </header>

      {/* Toolbar */}
      <div className="flex flex-wrap items-end gap-4 py-4 border-y border-rule">
        <Field label="Loja">
          <select
            value={filterLoja}
            onChange={(e) => setFilterLoja(e.target.value)}
            className="h-9 min-w-[200px] rounded-md border border-rule bg-paper px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bordo/30"
          >
            <option value="">todas</option>
            {(lojas ?? []).map((l) => (
              <option key={l.id} value={l.nome}>
                {l.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ano">
          <select
            value={filterAno}
            onChange={(e) => setFilterAno(e.target.value)}
            className="h-9 min-w-[110px] rounded-md border border-rule bg-paper px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bordo/30"
          >
            <option value="">todos</option>
            {anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
        <p className="text-sm text-ink-3 self-end pb-1.5">
          <Filter size={12} className="inline-block icon-inline" />{" "}
          <span className="font-mono font-bold text-ink">{filtered.length}</span> registro(s)
        </p>
        <div className="ml-auto self-end">
          <button
            onClick={() => setShowNew((v) => !v)}
            className="h-9 px-4 rounded-md bg-bordo text-paper text-sm font-bold inline-flex items-center gap-1.5 hover:bg-bordo-deep transition-colors"
          >
            {showNew ? <X size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
            {showNew ? "fechar" : "novo lançamento"}
          </button>
        </div>
      </div>

      {showNew && (
        <NewEntryForm
          lojas={(lojas ?? []).map((l) => l.nome)}
          isPending={insertMut.isPending}
          onCancel={() => setShowNew(false)}
          onSubmit={async (payload) => {
            await insertMut.mutateAsync(payload);
            setShowNew(false);
          }}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-ink-3 eyebrow border-b border-rule">
              <SortHeader k="data" cur={sortKey} dir={sortDir} onSort={toggleSort}>
                Data
              </SortHeader>
              <th className="text-left font-bold py-3 px-2">Mês</th>
              <th className="text-left font-bold py-3 px-2">Ano</th>
              <SortHeader k="loja" cur={sortKey} dir={sortDir} onSort={toggleSort}>
                Loja
              </SortHeader>
              <SortHeader k="faturamento" cur={sortKey} dir={sortDir} onSort={toggleSort} align="right">
                Faturamento
              </SortHeader>
              <SortHeader k="pedidos" cur={sortKey} dir={sortDir} onSort={toggleSort} align="right">
                Pedidos
              </SortHeader>
              <SortHeader k="ticket_medio" cur={sortKey} dir={sortDir} onSort={toggleSort} align="right">
                Ticket
              </SortHeader>
              <th className="text-right font-bold py-3 px-2">MoM%</th>
              <th className="text-right font-bold py-3 px-2">YoY%</th>
              <th className="text-right font-bold py-3 px-2 w-[80px]">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const isEditing = editingId === row.id;
              return isEditing ? (
                <EditRow
                  key={row.id}
                  row={row}
                  isPending={updateMut.isPending}
                  onCancel={() => setEditingId(null)}
                  onSave={async (patch) => {
                    await updateMut.mutateAsync({ id: row.id, patch });
                    setEditingId(null);
                  }}
                />
              ) : (
                <tr key={row.id} className="row-hover border-b border-rule-soft">
                  <td className="py-3 pl-2 font-mono text-xs tabular-nums text-ink-2">
                    {dataPtBR(row.data)}
                  </td>
                  <td className="py-3 px-2 font-mono text-xs tabular-nums text-ink-3">
                    {monthShortName(Number(row.data.slice(5, 7)))}
                  </td>
                  <td className="py-3 px-2 font-mono text-xs tabular-nums text-ink-3">
                    {row.data.slice(0, 4)}
                  </td>
                  <td className="py-3 px-2 font-semibold text-ink">{row.loja}</td>
                  <td className="py-3 px-2 text-right tabular-nums font-mono">
                    {fmtMoney(Number(row.faturamento))}
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums font-mono text-ink-2">
                    {fmtInt(row.pedidos)}
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums font-mono text-ink-2">
                    {fmtMoney(Number(row.ticket_medio))}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <NumberBadge value={row.mom_percent} />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <NumberBadge value={row.yoy_percent} />
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setEditingId(row.id)}
                        className="p-1.5 rounded hover:bg-cream-2 text-ink-3 hover:text-bordo transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir lançamento de ${row.loja} (${dataPtBR(row.data)})?`)) {
                            deleteMut.mutate(row.id);
                          }
                        }}
                        className="p-1.5 rounded hover:bg-cream-2 text-ink-3 hover:text-negative transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="py-16 text-center text-ink-3 prose-rich">
                  Nenhum lançamento com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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
        "py-3 px-2 font-bold cursor-pointer select-none",
        align === "right" ? "text-right" : "text-left",
      )}
      onClick={() => onSort(k)}
    >
      <span
        className={clsx(
          "inline-flex items-center gap-1",
          active ? "text-bordo" : "",
          align === "right" && "flex-row-reverse",
        )}
      >
        {children}
        {active &&
          (dir === "asc" ? (
            <ChevronUp size={12} strokeWidth={2.5} />
          ) : (
            <ChevronDown size={12} strokeWidth={2.5} />
          ))}
      </span>
    </th>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="eyebrow">{label}</span>
      {children}
    </label>
  );
}

function NewEntryForm({
  lojas,
  isPending,
  onCancel,
  onSubmit,
}: {
  lojas: string[];
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (payload: {
    data: string;
    loja: string;
    faturamento: number;
    pedidos: number;
    ticket_medio: number;
  }) => Promise<void>;
}) {
  const today = new Date();
  const [loja, setLoja] = useState("");
  const [mes, setMes] = useState(String(today.getMonth() + 1));
  const [ano, setAno] = useState(String(today.getFullYear()));
  const [faturamento, setFaturamento] = useState("");
  const [pedidos, setPedidos] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fatNum = parseFloat(faturamento.replace(/\./g, "").replace(",", "."));
  const pedNum = parseInt(pedidos, 10);
  const ticketCalc = fatNum > 0 && pedNum > 0 ? fatNum / pedNum : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loja) return setError("escolha uma loja");
    if (!fatNum || fatNum <= 0) return setError("faturamento inválido");
    if (!pedNum || pedNum <= 0) return setError("pedidos inválidos");
    const dataStr = `${ano}-${String(mes).padStart(2, "0")}-01`;
    try {
      await onSubmit({
        data: dataStr,
        loja,
        faturamento: Math.round(fatNum * 100) / 100,
        pedidos: pedNum,
        ticket_medio: Math.round((fatNum / pedNum) * 100) / 100,
      });
      setLoja("");
      setFaturamento("");
      setPedidos("");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="border border-bordo/30 bg-paper rounded-md p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-black text-xl text-bordo-deep">
          Novo lançamento
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-ink-3 hover:text-ink p-1"
        >
          <X size={18} />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Field label="Loja">
          <select
            value={loja}
            onChange={(e) => setLoja(e.target.value)}
            className="h-9 rounded-md border border-rule bg-cream/40 px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bordo/30"
          >
            <option value="">selecione…</option>
            {lojas.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mês">
          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="h-9 rounded-md border border-rule bg-cream/40 px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-bordo/30"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, "0")} — {monthShortName(m)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ano">
          <input
            type="number"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            min={2019}
            max={2100}
            className="h-9 rounded-md border border-rule bg-cream/40 px-2 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-bordo/30"
          />
        </Field>
        <Field label="Faturamento (R$)">
          <input
            type="text"
            value={faturamento}
            onChange={(e) => setFaturamento(e.target.value)}
            placeholder="ex: 80.000,00"
            className="h-9 rounded-md border border-rule bg-cream/40 px-2 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-bordo/30"
          />
        </Field>
        <Field label="Pedidos">
          <input
            type="number"
            value={pedidos}
            onChange={(e) => setPedidos(e.target.value)}
            placeholder="ex: 1500"
            min={0}
            className="h-9 rounded-md border border-rule bg-cream/40 px-2 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-bordo/30"
          />
        </Field>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-ink-3">
          Ticket calculado:{" "}
          <span className="font-mono font-bold text-ink">
            {ticketCalc ? fmtMoney(ticketCalc) : "—"}
          </span>
        </p>
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-xs font-semibold text-negative">{error}</span>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-4 rounded-md border border-rule text-sm font-semibold text-ink-2 hover:bg-cream-2 transition-colors"
          >
            cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="h-9 px-4 rounded-md bg-bordo text-paper text-sm font-bold hover:bg-bordo-deep disabled:opacity-50 transition-colors"
          >
            {isPending ? "salvando…" : "salvar"}
          </button>
        </div>
      </div>
    </form>
  );
}

function EditRow({
  row,
  isPending,
  onCancel,
  onSave,
}: {
  row: Faturamento;
  isPending: boolean;
  onCancel: () => void;
  onSave: (patch: {
    faturamento: number;
    pedidos: number;
    ticket_medio: number;
  }) => Promise<void>;
}) {
  const [fat, setFat] = useState(String(Number(row.faturamento)));
  const [ped, setPed] = useState(String(row.pedidos));
  const fatNum = parseFloat(fat.replace(/\./g, "").replace(",", "."));
  const pedNum = parseInt(ped, 10);
  const ticket = fatNum > 0 && pedNum > 0 ? fatNum / pedNum : 0;

  return (
    <tr className="bg-cream-2/60 border-b border-rule">
      <td className="py-3 pl-2 font-mono text-xs tabular-nums text-ink-2">
        {dataPtBR(row.data)}
      </td>
      <td className="py-3 px-2 font-mono text-xs tabular-nums text-ink-3">
        {monthShortName(Number(row.data.slice(5, 7)))}
      </td>
      <td className="py-3 px-2 font-mono text-xs tabular-nums text-ink-3">
        {row.data.slice(0, 4)}
      </td>
      <td className="py-3 px-2 font-semibold text-ink">{row.loja}</td>
      <td className="py-3 px-2">
        <input
          type="text"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          className="w-full h-8 rounded border border-rule bg-paper px-2 text-sm text-right font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-bordo/30"
        />
      </td>
      <td className="py-3 px-2">
        <input
          type="number"
          value={ped}
          onChange={(e) => setPed(e.target.value)}
          className="w-full h-8 rounded border border-rule bg-paper px-2 text-sm text-right font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-bordo/30"
        />
      </td>
      <td className="py-3 px-2 text-right tabular-nums font-mono text-ink-2">
        {fmtMoney(ticket)}
      </td>
      <td className="py-3 px-2 text-right text-ink-3 text-xs">—</td>
      <td className="py-3 px-2 text-right text-ink-3 text-xs">—</td>
      <td className="py-3 pr-2 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => {
              if (fatNum > 0 && pedNum > 0) {
                onSave({
                  faturamento: Math.round(fatNum * 100) / 100,
                  pedidos: pedNum,
                  ticket_medio: Math.round(ticket * 100) / 100,
                });
              }
            }}
            disabled={isPending}
            className="p-1.5 rounded bg-bordo text-paper hover:bg-bordo-deep disabled:opacity-50 transition-colors"
            title="Salvar"
          >
            <Check size={14} strokeWidth={2.5} />
          </button>
          <button
            onClick={onCancel}
            className="p-1.5 rounded hover:bg-cream-3 text-ink-3 hover:text-ink transition-colors"
            title="Cancelar"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      </td>
    </tr>
  );
}
