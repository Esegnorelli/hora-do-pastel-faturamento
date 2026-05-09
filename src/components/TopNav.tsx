import Link from "next/link";
import { NavLink } from "./NavLink";

export function TopNav() {
  return (
    <header className="bg-surface border-b border-border sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto w-full max-w-[1400px] px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white font-black shadow-sm group-hover:bg-brand-strong transition-colors">
            HP
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-tight">
              Hora do Pastel
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
              Faturamento
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink href="/">Dashboard</NavLink>
          <NavLink href="/vendas">Vendas mês a mês</NavLink>
        </nav>
      </div>
    </header>
  );
}
