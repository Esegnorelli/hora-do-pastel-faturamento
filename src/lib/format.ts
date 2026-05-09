const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const intFmt = new Intl.NumberFormat("pt-BR");

const intCompact = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const pctFmt = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const fmtMoney = (n: number | null | undefined) =>
  n == null ? "—" : brl.format(n);

export const fmtMoneyCompact = (n: number | null | undefined) =>
  n == null ? "—" : brlCompact.format(n);

export const fmtInt = (n: number | null | undefined) =>
  n == null ? "—" : intFmt.format(n);

export const fmtIntCompact = (n: number | null | undefined) =>
  n == null ? "—" : intCompact.format(n);

export const fmtPercent = (n: number | null | undefined) =>
  n == null ? "—" : pctFmt.format(n / 100);

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const monthShort = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export const monthName = (m: number) => monthNames[m - 1] ?? "";
export const monthShortName = (m: number) => monthShort[m - 1] ?? "";

export const monthYearLabel = (data: string) => {
  const [y, m] = data.split("-");
  return `${monthShortName(Number(m))}/${y.slice(2)}`;
};

export const fullMonthYearLabel = (data: string) => {
  const [y, m] = data.split("-");
  return `${monthName(Number(m))} de ${y}`;
};
