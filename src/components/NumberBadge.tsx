import clsx from "clsx";
import { ArrowDown, ArrowUp } from "lucide-react";

type Props = {
  value: number | null;
  size?: "sm" | "md";
  invertColor?: boolean;
};

export function NumberBadge({ value, size = "sm", invertColor = false }: Props) {
  if (value == null || isNaN(value)) {
    return <span className="text-ink-4 tabular-nums text-xs">—</span>;
  }
  const positive = invertColor ? value < 0 : value >= 0;
  const Icon = value >= 0 ? ArrowUp : ArrowDown;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-0.5 font-semibold tabular-nums whitespace-nowrap",
        size === "sm" ? "text-xs" : "text-sm",
        positive ? "text-positive" : "text-negative",
      )}
    >
      <Icon size={size === "sm" ? 11 : 13} strokeWidth={2.5} />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}
