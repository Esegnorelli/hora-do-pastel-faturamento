import type { Faturamento } from "./types";

/**
 * Editorial insights — computed sentences that the dashboard speaks back
 * to the operator. Each insight has a strength score so the page can pick
 * the most striking ones without overwhelming.
 */
export type Insight = {
  id: string;
  strength: number; // 0..100
  kind: "record" | "drop" | "rise" | "consistency" | "milestone" | "anomaly";
  loja?: string;
  text: string;
};

export type RedeMensal = {
  data: string;
  faturamento: number;
  pedidos: number;
  ticket_medio: number;
  lojas_count: number;
};

const MES_NOMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const mesNome = (data: string) => MES_NOMES[Number(data.slice(5, 7)) - 1];

export function aggregateRedeMensal(rows: Faturamento[]): RedeMensal[] {
  const byMonth = new Map<
    string,
    { faturamento: number; pedidos: number; lojas: number }
  >();
  for (const r of rows) {
    const cur = byMonth.get(r.data) ?? { faturamento: 0, pedidos: 0, lojas: 0 };
    cur.faturamento += Number(r.faturamento);
    cur.pedidos += Number(r.pedidos);
    cur.lojas += 1;
    byMonth.set(r.data, cur);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([data, v]) => ({
      data,
      faturamento: Math.round(v.faturamento * 100) / 100,
      pedidos: v.pedidos,
      ticket_medio:
        v.pedidos > 0 ? Math.round((v.faturamento / v.pedidos) * 100) / 100 : 0,
      lojas_count: v.lojas,
    }));
}

export function rowsForMonth(rows: Faturamento[], data: string) {
  return rows.filter((r) => r.data === data);
}

export function rowsByLoja(rows: Faturamento[]) {
  const map = new Map<string, Faturamento[]>();
  for (const r of rows) {
    const arr = map.get(r.loja) ?? [];
    arr.push(r);
    map.set(r.loja, arr);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => (a.data < b.data ? -1 : 1));
  }
  return map;
}

/**
 * Generate up to N editorial insights for the latest closed month.
 * Picked from a pool by strength score, deduplicated by kind+loja so we
 * don't flood the screen with similar messages.
 */
export function buildInsights(rows: Faturamento[], limit = 6): Insight[] {
  if (rows.length === 0) return [];
  const all = [...rows].sort((a, b) => (a.data < b.data ? -1 : 1));
  const lastData = all[all.length - 1].data;
  const byLoja = rowsByLoja(all);

  const pool: Insight[] = [];

  // 1) Network record
  const rede = aggregateRedeMensal(all);
  const lastRede = rede[rede.length - 1];
  const histAntes = rede.slice(0, -1);
  if (histAntes.length > 0) {
    const maxAntes = Math.max(...histAntes.map((r) => r.faturamento));
    if (lastRede.faturamento >= maxAntes) {
      pool.push({
        id: `record-rede-${lastData}`,
        strength: 95,
        kind: "milestone",
        text: `A rede atingiu seu maior faturamento já registrado em ${mesNome(lastData)}, com ${fmt(lastRede.faturamento)}.`,
      });
    }
  }

  // 2) Per-store records (best month ever)
  for (const [loja, arr] of byLoja) {
    const last = arr[arr.length - 1];
    if (last.data !== lastData) continue;
    if (arr.length < 6) continue;
    const max = Math.max(...arr.slice(0, -1).map((r) => Number(r.faturamento)));
    if (Number(last.faturamento) > max) {
      const strength = Math.min(95, 60 + (arr.length / 12) * 5);
      pool.push({
        id: `record-${loja}-${lastData}`,
        strength,
        kind: "record",
        loja,
        text: `${loja} bateu seu recorde histórico em ${mesNome(lastData)} com ${fmt(Number(last.faturamento))}.`,
      });
    }
  }

  // 3) Big YoY winners (>= 25%)
  for (const [loja, arr] of byLoja) {
    const last = arr[arr.length - 1];
    if (last.data !== lastData) continue;
    const yoy = last.yoy_percent;
    if (yoy != null && yoy >= 25) {
      pool.push({
        id: `yoy-up-${loja}-${lastData}`,
        strength: Math.min(90, 50 + yoy / 2),
        kind: "rise",
        loja,
        text: `${loja} cresceu ${yoy.toFixed(1)}% em ${mesNome(lastData)} contra o mesmo mês do ano passado.`,
      });
    }
  }

  // 4) Big YoY losers (<= -20%)
  for (const [loja, arr] of byLoja) {
    const last = arr[arr.length - 1];
    if (last.data !== lastData) continue;
    const yoy = last.yoy_percent;
    if (yoy != null && yoy <= -20) {
      pool.push({
        id: `yoy-down-${loja}-${lastData}`,
        strength: Math.min(90, 50 + Math.abs(yoy) / 2),
        kind: "drop",
        loja,
        text: `${loja} caiu ${Math.abs(yoy).toFixed(1)}% em ${mesNome(lastData)} ano contra ano — vale uma conversa.`,
      });
    }
  }

  // 5) Consistency: stores up MoM 3+ months in a row
  for (const [loja, arr] of byLoja) {
    if (arr.length < 4) continue;
    const last4 = arr.slice(-4);
    if (last4[3].data !== lastData) continue;
    const allUp = last4
      .slice(1)
      .every((r) => r.mom_percent != null && r.mom_percent > 0);
    if (allUp) {
      pool.push({
        id: `streak-up-${loja}-${lastData}`,
        strength: 75,
        kind: "consistency",
        loja,
        text: `${loja} acumula 3 meses seguidos de crescimento.`,
      });
    }
  }

  // 6) Network-wide MoM
  if (rede.length >= 2) {
    const cur = rede[rede.length - 1];
    const prev = rede[rede.length - 2];
    if (prev.faturamento > 0) {
      const mom = ((cur.faturamento - prev.faturamento) / prev.faturamento) * 100;
      const sign = mom >= 0 ? "subiu" : "caiu";
      pool.push({
        id: `mom-rede-${lastData}`,
        strength: 60 + Math.min(20, Math.abs(mom)),
        kind: mom >= 0 ? "rise" : "drop",
        text: `A rede ${sign} ${Math.abs(mom).toFixed(1)}% em ${mesNome(lastData)} contra ${mesNome(prev.data)}.`,
      });
    }
  }

  // 7) Pioneers / new lojas (< 3 months of data, last is the new one)
  for (const [loja, arr] of byLoja) {
    if (arr.length > 4) continue;
    const last = arr[arr.length - 1];
    if (last.data !== lastData) continue;
    pool.push({
      id: `new-${loja}-${lastData}`,
      strength: 70,
      kind: "milestone",
      loja,
      text: `${loja} é uma loja nova — apenas ${arr.length} ${arr.length === 1 ? "mês" : "meses"} de operação.`,
    });
  }

  // Deduplicate by loja+kind, sort by strength, cap
  const seen = new Set<string>();
  return pool
    .sort((a, b) => b.strength - a.strength)
    .filter((i) => {
      const k = `${i.kind}-${i.loja ?? ""}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, limit);
}

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);
