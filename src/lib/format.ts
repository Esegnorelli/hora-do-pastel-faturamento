const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const brlNoSym = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const brlCompact = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const intFmt = new Intl.NumberFormat("pt-BR");
const intCompact = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const fmtMoney = (n: number | null | undefined) =>
  n == null ? "—" : brl.format(n);
export const fmtMoneyNoSym = (n: number | null | undefined) =>
  n == null ? "—" : brlNoSym.format(n);
export const fmtMoneyCompact = (n: number | null | undefined) =>
  n == null ? "—" : brlCompact.format(n);
export const fmtInt = (n: number | null | undefined) =>
  n == null ? "—" : intFmt.format(n);
export const fmtIntCompact = (n: number | null | undefined) =>
  n == null ? "—" : intCompact.format(n);
export const fmtPercent = (n: number | null | undefined, digits = 1) =>
  n == null
    ? "—"
    : `${n >= 0 ? "+" : ""}${n.toFixed(digits)}%`;

const monthNames = [
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

export const dataPtBR = (data: string) => {
  const [y, m, d] = data.split("-");
  return `${d}/${m}/${y}`;
};

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const unslugify = (s: string) => decodeURIComponent(s);
