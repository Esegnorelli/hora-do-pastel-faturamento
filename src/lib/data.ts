import { supabase } from "./supabase";
import type { Faturamento, Loja, LojaMensal, RedeMensal } from "./types";

export async function getLojas(): Promise<Loja[]> {
  const { data, error } = await supabase
    .from("lojas")
    .select("id, nome, ativa")
    .order("nome");
  if (error) throw new Error(`getLojas: ${error.message}`);
  return data ?? [];
}

export async function getUltimaData(): Promise<string | null> {
  const { data, error } = await supabase
    .from("faturamento")
    .select("data")
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getUltimaData: ${error.message}`);
  return data?.data ?? null;
}

export async function getFaturamentoMes(
  data: string,
): Promise<Faturamento[]> {
  const { data: rows, error } = await supabase
    .from("faturamento")
    .select("*")
    .eq("data", data)
    .order("faturamento", { ascending: false });
  if (error) throw new Error(`getFaturamentoMes: ${error.message}`);
  return rows ?? [];
}

export async function getEvolucaoRede(meses = 24): Promise<RedeMensal[]> {
  const { data, error } = await supabase
    .from("faturamento")
    .select("data, faturamento, pedidos");
  if (error) throw new Error(`getEvolucaoRede: ${error.message}`);

  const byMonth = new Map<
    string,
    { faturamento: number; pedidos: number; lojas: number }
  >();
  for (const r of data ?? []) {
    const cur = byMonth.get(r.data) ?? {
      faturamento: 0,
      pedidos: 0,
      lojas: 0,
    };
    cur.faturamento += Number(r.faturamento);
    cur.pedidos += Number(r.pedidos);
    cur.lojas += 1;
    byMonth.set(r.data, cur);
  }
  const sorted = [...byMonth.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([data, v]) => ({
      data,
      faturamento: Math.round(v.faturamento * 100) / 100,
      pedidos: v.pedidos,
      ticket_medio:
        v.pedidos > 0
          ? Math.round((v.faturamento / v.pedidos) * 100) / 100
          : 0,
      lojas_count: v.lojas,
    }));
  return sorted.slice(-meses);
}

export async function getFaturamentoPorLoja(
  loja?: string,
  ano?: number,
): Promise<Faturamento[]> {
  let q = supabase
    .from("faturamento")
    .select("*")
    .order("data", { ascending: true });
  if (loja) q = q.eq("loja", loja);
  if (ano) {
    q = q.gte("data", `${ano}-01-01`).lte("data", `${ano}-12-01`);
  }
  const { data, error } = await q;
  if (error) throw new Error(`getFaturamentoPorLoja: ${error.message}`);
  return data ?? [];
}

export async function getAnosDisponiveis(): Promise<number[]> {
  const { data, error } = await supabase.from("faturamento").select("data");
  if (error) throw new Error(`getAnosDisponiveis: ${error.message}`);
  const anos = new Set<number>();
  for (const r of data ?? []) {
    anos.add(Number((r.data as string).slice(0, 4)));
  }
  return [...anos].sort((a, b) => b - a);
}

export async function getResumoMes(data: string): Promise<{
  faturamento: number;
  pedidos: number;
  ticket_medio: number;
  lojas_ativas: number;
  yoy_percent: number | null;
  mom_percent: number | null;
}> {
  const linhas = await getFaturamentoMes(data);
  const faturamento = linhas.reduce(
    (s, r) => s + Number(r.faturamento),
    0,
  );
  const pedidos = linhas.reduce((s, r) => s + Number(r.pedidos), 0);
  const ticket_medio = pedidos > 0 ? faturamento / pedidos : 0;
  const lojas_ativas = linhas.length;

  const [yPrev, mPrev] = data.split("-").map(Number);
  const ano_passado = `${yPrev - 1}-${String(mPrev).padStart(2, "0")}-01`;
  const mes_passado_d = new Date(yPrev, mPrev - 2, 1);
  const mes_passado = `${mes_passado_d.getFullYear()}-${String(
    mes_passado_d.getMonth() + 1,
  ).padStart(2, "0")}-01`;

  const { data: prevYearRows } = await supabase
    .from("faturamento")
    .select("faturamento")
    .eq("data", ano_passado);
  const { data: prevMonthRows } = await supabase
    .from("faturamento")
    .select("faturamento")
    .eq("data", mes_passado);

  const sumYear =
    prevYearRows?.reduce((s, r) => s + Number(r.faturamento), 0) ?? 0;
  const sumMonth =
    prevMonthRows?.reduce((s, r) => s + Number(r.faturamento), 0) ?? 0;

  const yoy_percent =
    sumYear > 0 ? ((faturamento - sumYear) / sumYear) * 100 : null;
  const mom_percent =
    sumMonth > 0 ? ((faturamento - sumMonth) / sumMonth) * 100 : null;

  return {
    faturamento,
    pedidos,
    ticket_medio,
    lojas_ativas,
    yoy_percent,
    mom_percent,
  };
}

export type LojaSerie = {
  loja: string;
  pontos: {
    data: string;
    faturamento: number;
    pedidos: number;
    ticket_medio: number;
  }[];
};

export async function getSeriesPorLoja(ano: number): Promise<LojaSerie[]> {
  const { data, error } = await supabase
    .from("faturamento")
    .select("loja, data, faturamento, pedidos, ticket_medio")
    .gte("data", `${ano}-01-01`)
    .lte("data", `${ano}-12-01`)
    .order("data", { ascending: true });
  if (error) throw new Error(`getSeriesPorLoja: ${error.message}`);

  const map = new Map<string, LojaSerie>();
  for (const r of data ?? []) {
    const s: LojaSerie = map.get(r.loja) ?? { loja: r.loja, pontos: [] };
    s.pontos.push({
      data: r.data,
      faturamento: Number(r.faturamento),
      pedidos: Number(r.pedidos),
      ticket_medio: Number(r.ticket_medio),
    });
    map.set(r.loja, s);
  }
  return [...map.values()].sort((a, b) => a.loja.localeCompare(b.loja));
}

export type ComparativoAno = {
  mes: number;
  atual: number | null;
  anterior: number | null;
};

export async function getComparativoAnual(
  ano: number,
): Promise<ComparativoAno[]> {
  const { data, error } = await supabase
    .from("faturamento")
    .select("data, faturamento")
    .gte("data", `${ano - 1}-01-01`)
    .lte("data", `${ano}-12-01`);
  if (error) throw new Error(`getComparativoAnual: ${error.message}`);

  const byMonth = new Map<string, number>();
  for (const r of data ?? []) {
    byMonth.set(
      r.data,
      (byMonth.get(r.data) ?? 0) + Number(r.faturamento),
    );
  }

  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const k = `${ano}-${String(m).padStart(2, "0")}-01`;
    const kPrev = `${ano - 1}-${String(m).padStart(2, "0")}-01`;
    return {
      mes: m,
      atual: byMonth.has(k) ? byMonth.get(k)! : null,
      anterior: byMonth.has(kPrev) ? byMonth.get(kPrev)! : null,
    };
  });
}

export type LojaTendencia = {
  loja: string;
  ultimo: number;
  anterior: number;
  variacao_pct: number | null;
  ultimo_data: string;
  serie: number[];
};

export async function getTendenciasLojas(
  meses = 12,
): Promise<LojaTendencia[]> {
  const ultima = await getUltimaData();
  if (!ultima) return [];
  const [y, m] = ultima.split("-").map(Number);
  const inicio = new Date(y, m - meses, 1);
  const inicioStr = `${inicio.getFullYear()}-${String(
    inicio.getMonth() + 1,
  ).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("faturamento")
    .select("loja, data, faturamento")
    .gte("data", inicioStr)
    .order("data", { ascending: true });
  if (error) throw new Error(`getTendenciasLojas: ${error.message}`);

  const byLoja = new Map<string, { data: string; faturamento: number }[]>();
  for (const r of data ?? []) {
    const arr = byLoja.get(r.loja) ?? [];
    arr.push({ data: r.data, faturamento: Number(r.faturamento) });
    byLoja.set(r.loja, arr);
  }

  const result: LojaTendencia[] = [];
  for (const [loja, pontos] of byLoja) {
    if (pontos.length === 0) continue;
    const ultimo = pontos[pontos.length - 1];
    const anterior = pontos[pontos.length - 2];
    const variacao =
      anterior && anterior.faturamento > 0
        ? ((ultimo.faturamento - anterior.faturamento) /
            anterior.faturamento) *
          100
        : null;
    result.push({
      loja,
      ultimo: ultimo.faturamento,
      anterior: anterior?.faturamento ?? 0,
      variacao_pct: variacao,
      ultimo_data: ultimo.data,
      serie: pontos.map((p) => p.faturamento),
    });
  }

  return result.sort((a, b) => b.ultimo - a.ultimo);
}

export type ResumoYTD = {
  ano: number;
  faturamento: number;
  pedidos: number;
  ticket_medio: number;
  meses_completos: number;
};

export async function getResumoYTD(): Promise<{
  atual: ResumoYTD;
  anterior: ResumoYTD;
  yoy_percent: number | null;
}> {
  const ultima = await getUltimaData();
  if (!ultima) {
    const empty: ResumoYTD = {
      ano: 0,
      faturamento: 0,
      pedidos: 0,
      ticket_medio: 0,
      meses_completos: 0,
    };
    return { atual: empty, anterior: empty, yoy_percent: null };
  }
  const [y, m] = ultima.split("-").map(Number);

  const { data, error } = await supabase
    .from("faturamento")
    .select("data, faturamento, pedidos")
    .gte("data", `${y - 1}-01-01`)
    .lte("data", `${y}-${String(m).padStart(2, "0")}-01`);
  if (error) throw new Error(`getResumoYTD: ${error.message}`);

  let curFat = 0,
    curPed = 0,
    prevFat = 0,
    prevPed = 0;
  for (const r of data ?? []) {
    const ano = Number(r.data.slice(0, 4));
    const mes = Number(r.data.slice(5, 7));
    if (ano === y && mes <= m) {
      curFat += Number(r.faturamento);
      curPed += Number(r.pedidos);
    } else if (ano === y - 1 && mes <= m) {
      prevFat += Number(r.faturamento);
      prevPed += Number(r.pedidos);
    }
  }

  const atual: ResumoYTD = {
    ano: y,
    faturamento: curFat,
    pedidos: curPed,
    ticket_medio: curPed > 0 ? curFat / curPed : 0,
    meses_completos: m,
  };
  const anterior: ResumoYTD = {
    ano: y - 1,
    faturamento: prevFat,
    pedidos: prevPed,
    ticket_medio: prevPed > 0 ? prevFat / prevPed : 0,
    meses_completos: m,
  };
  const yoy_percent =
    prevFat > 0 ? ((curFat - prevFat) / prevFat) * 100 : null;

  return { atual, anterior, yoy_percent };
}

export type LinhaResumoLoja = LojaMensal;
