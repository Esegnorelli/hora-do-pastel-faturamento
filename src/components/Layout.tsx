import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { Logo } from "./Logo";

const navItem = ({ isActive }: { isActive: boolean }) =>
  clsx(
    "relative px-3 py-1.5 text-sm font-semibold transition-colors",
    isActive
      ? "text-bordo"
      : "text-ink-3 hover:text-ink",
  );

export function Layout() {
  return (
    <div className="min-h-dvh paper">
      <header className="border-b border-rule bg-cream/90 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-[1280px] px-6 h-[72px] flex items-center justify-between gap-6">
          <NavLink to="/" className="flex items-center gap-3 group">
            <Logo size={42} className="transition-transform group-hover:rotate-[-4deg]" />
            <div className="leading-none">
              <p className="font-display font-black text-bordo-deep tracking-tight text-[17px]">
                Hora do Pastel
              </p>
              <p className="eyebrow mt-0.5">Painel de faturamento</p>
            </div>
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navItem}>
              {({ isActive }) => (
                <>
                  Dashboard
                  {isActive && (
                    <span className="absolute left-3 right-3 -bottom-[18px] h-[2px] bg-bordo" />
                  )}
                </>
              )}
            </NavLink>
            <NavLink to="/lancamentos" className={navItem}>
              {({ isActive }) => (
                <>
                  Lançamentos
                  {isActive && (
                    <span className="absolute left-3 right-3 -bottom-[18px] h-[2px] bg-bordo" />
                  )}
                </>
              )}
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] px-6 py-10">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-[1280px] px-6 py-10 border-t border-rule mt-12">
        <div className="flex items-center justify-between text-xs text-ink-3">
          <p>
            <span className="font-semibold text-ink-2">Hora do Pastel</span> ·
            painel interno · dados Supabase em tempo real
          </p>
          <p className="font-mono">v2.0</p>
        </div>
      </footer>
    </div>
  );
}
