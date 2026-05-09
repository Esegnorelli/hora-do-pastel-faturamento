import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteFaturamento,
  fetchAllFaturamento,
  fetchLojas,
  insertFaturamento,
  updateFaturamento,
} from "@/lib/data";

const KEY_FATURAMENTO = ["faturamento", "all"] as const;
const KEY_LOJAS = ["lojas"] as const;

export function useFaturamentoAll() {
  return useQuery({
    queryKey: KEY_FATURAMENTO,
    queryFn: fetchAllFaturamento,
    staleTime: 60_000,
  });
}

export function useLojas() {
  return useQuery({
    queryKey: KEY_LOJAS,
    queryFn: fetchLojas,
    staleTime: 5 * 60_000,
  });
}

export function useInsertFaturamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: insertFaturamento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_FATURAMENTO });
    },
  });
}

export function useUpdateFaturamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: number;
      patch: Parameters<typeof updateFaturamento>[1];
    }) => updateFaturamento(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_FATURAMENTO });
    },
  });
}

export function useDeleteFaturamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFaturamento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_FATURAMENTO });
    },
  });
}
