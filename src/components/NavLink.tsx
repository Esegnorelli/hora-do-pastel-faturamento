"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={clsx(
        "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-brand-soft text-brand"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
      )}
    >
      {children}
    </Link>
  );
}
