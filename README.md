# Hora do Pastel — Faturamento

Dashboard de faturamento da rede **Hora do Pastel**: visão consolidada da rede e detalhamento mês a mês por loja.

## Páginas

- **`/`** — Dashboard com KPIs do mês mais recente, evolução de 24 meses da rede, ranking de lojas e dispersão pedidos × ticket.
- **`/vendas`** — Vendas mês a mês, filtrável por loja e ano:
  - **Todas as lojas**: matriz heatmap loja × mês + gráfico multi-linha interativo.
  - **Loja específica**: KPIs do ano, gráfico combinado faturamento/ticket e tabela com MoM/YoY.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilo | Tailwind CSS v4 |
| Gráficos | Recharts |
| Dados | Supabase (PostgreSQL + RLS) |
| Hospedagem | Vercel |

## Como rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_SUPABASE_URL e _PUBLISHABLE_KEY
npm run dev
```

Abra http://localhost:3000.

## Schema usado no Supabase

Tabelas em `public`:

- **`lojas(id, nome, ativa)`** — cadastro de lojas.
- **`faturamento(id, data, loja, faturamento, pedidos, ticket_medio, mom_percent, yoy_percent)`** — uma linha por loja por mês (`data` é o primeiro dia do mês).

Ambas com RLS habilitada e políticas `SELECT` públicas (somente leitura via _publishable key_).

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx           # shell, top nav
│   ├── page.tsx             # / dashboard
│   ├── vendas/page.tsx      # /vendas mês a mês
│   └── globals.css
├── components/
│   ├── KpiCard.tsx
│   ├── Card.tsx
│   ├── TopNav.tsx
│   ├── NavLink.tsx
│   ├── SalesFilters.tsx
│   ├── MatrixTable.tsx
│   ├── StoreMonthlyTable.tsx
│   └── charts/
│       ├── RevenueAreaChart.tsx
│       ├── StoreRankingChart.tsx
│       ├── TicketScatter.tsx
│       ├── MultiLineChart.tsx
│       └── StoreLineChart.tsx
└── lib/
    ├── supabase.ts          # cliente
    ├── data.ts              # queries
    ├── format.ts            # pt-BR currency/date helpers
    └── types.ts
```

## Deploy

O projeto está configurado para deploy direto no Vercel — sem `vercel.json`. Defina as duas env vars `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no painel do Vercel.
