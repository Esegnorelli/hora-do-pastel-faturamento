import { supabase } from "./supabase";
import type { Faturamento, Loja } from "./types";

export async function fetchAllFaturamento(): Promise<Faturamento[]> {
  const all: Faturamento[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("faturamento")
      .select("*")
      .order("data", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`fetchAllFaturamento: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...(data as Faturamento[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

export async function fetchLojas(): Promise<Loja[]> {
  const { data, error } = await supabase
    .from("lojas")
    .select("id, nome, ativa")
    .order("nome");
  if (error) throw new Error(`fetchLojas: ${error.message}`);
  return data ?? [];
}

export async function insertFaturamento(payload: {
  data: string;
  loja: string;
  faturamento: number;
  pedidos: number;
  ticket_medio: number;
}): Promise<Faturamento> {
  const { data, error } = await supabase
    .from("faturamento")
    .insert([payload])
    .select()
    .single();
  if (error) throw new Error(`insertFaturamento: ${error.message}`);
  return data as Faturamento;
}

export async function updateFaturamento(
  id: number,
  patch: Partial<Pick<Faturamento, "faturamento" | "pedidos" | "ticket_medio">>,
): Promise<Faturamento> {
  const { data, error } = await supabase
    .from("faturamento")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`updateFaturamento: ${error.message}`);
  return data as Faturamento;
}

export async function deleteFaturamento(id: number): Promise<void> {
  const { error } = await supabase.from("faturamento").delete().eq("id", id);
  if (error) throw new Error(`deleteFaturamento: ${error.message}`);
}

export async function recomputeMomYoyForAllRows(): Promise<void> {
  // Delegated to a function invocation if you add an RPC; for now no-op.
  // The existing data already has mom/yoy populated; only used after schema changes.
}
