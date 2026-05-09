export type Faturamento = {
  id: number;
  data: string;
  loja: string;
  faturamento: number;
  pedidos: number;
  ticket_medio: number;
  mom_percent: number | null;
  yoy_percent: number | null;
};

export type Loja = {
  id: number;
  nome: string;
  ativa: boolean | null;
};

export type RedeMensal = {
  data: string;
  faturamento: number;
  pedidos: number;
  ticket_medio: number;
  lojas_count: number;
};

export type LojaMensal = {
  loja: string;
  faturamento: number;
  pedidos: number;
  ticket_medio: number;
  yoy_percent: number | null;
};
