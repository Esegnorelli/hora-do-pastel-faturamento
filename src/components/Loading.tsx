import { Logo } from "./Logo";

export function Loading({ message = "carregando" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Logo size={72} tilt />
      <p className="eyebrow">{message}…</p>
    </div>
  );
}
