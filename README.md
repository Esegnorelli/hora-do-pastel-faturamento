# Hora do Pastel — Faturamento

Painel editorial de faturamento da rede **Hora do Pastel**, com identidade visual baseada na marca e na cara de uma pastelaria — não de um SaaS.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | React 19 + Vite 8 + TypeScript |
| Estilo | Tailwind CSS v4 (tokens HDP) |
| Tipografia | Mulish (Google Fonts) + JetBrains Mono (tabular) |
| Ícones | lucide-react |
| Data | TanStack Query 5 |
| Roteamento | React Router 7 |
| Gráficos | Recharts (customizado, sem default look) |
| Backend | Supabase (PostgreSQL + RLS) |
| Hospedagem | Vercel |

## Páginas

- **`/`** — Dashboard editorial: hero number, insights computados, curva da rede 36m, comparativo YoY 12m, tabela densa por loja com sparklines.
- **`/lojas/:nome`** — Drill por loja: histórico completo, recordes, tabela mês a mês com MoM/YoY.
- **`/lancamentos`** — Tabela tipo planilha com filtros, ordenação, edição inline e novo lançamento.

## Paleta da marca

Extraída do `Logo - Vetor.pdf` oficial:

| Cor | Hex | Uso |
| --- | --- | --- |
| Bordô | `#810001` | Texto principal, brand |
| Bordô profundo | `#670007` | Sombra/profundidade |
| Chartreuse | `#DDE022` | Acento (1 por viewport, no máximo) |
| Marrom madeira | `#B78247` | Acento quente |
| Creme | `#FAF6EE` | Fundo |
| Tinta | `#1A120C` | Texto escuro |

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha VITE_SUPABASE_URL e _PUBLISHABLE_KEY
npm run dev                  # http://localhost:5173
```

## Banco

Tabelas em `public` no Supabase:

- **`lojas(id, nome, ativa)`** — cadastro de lojas.
- **`faturamento(id, data, loja, faturamento, pedidos, ticket_medio, mom_percent, yoy_percent)`** — uma linha por loja por mês.
