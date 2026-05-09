export type Faturamento = {
  id: number;
  data: string; // YYYY-MM-DD (always day 01)
  loja: string;
  faturamento: number;
  pedidos: number;
  ticket_medio: number;
  mom_percent: number | null;
  yoy_percent: number | null;
  created_at?: string;
  updated_at?: string;
};

export type Loja = {
  id: number;
  nome: string;
  ativa: boolean | null;
};

export type LojaSlug = string; // url-safe slug
