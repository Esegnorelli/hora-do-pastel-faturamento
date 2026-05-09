import clsx from "clsx";
import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={clsx(
        "rounded-2xl bg-surface border border-border shadow-sm",
        className,
      )}
    >
      {(title || subtitle || action) && (
        <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
          <div>
            {title && (
              <h2 className="text-[15px] font-semibold tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className="px-5 pb-5">{children}</div>
    </section>
  );
}
