import Link from "next/link";
import { NavLink } from "./NavLink";

export function TopNav() {
  return (
    <header className="bg-surface border-b border-border sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto w-full max-w-[1400px] px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group min-w-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-strong text-white font-black shadow-sm group-hover:shadow-md transition-all">
            HP
          </span>
          <div className="leading-tight min-w-0">
            <p className="text-[15px] font-semibold tracking-tight truncate">
              Hora do Pastel
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted truncate">
              Faturamento
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-1 flex-shrink-0">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/vendas">Vendas mês a mês</NavLink>
        </nav>
      </div>
    </header>
  );
}
