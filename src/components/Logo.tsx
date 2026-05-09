import clsx from "clsx";

type Props = {
  size?: number;
  tilt?: boolean;
  className?: string;
};

export function Logo({ size = 40, tilt = false, className }: Props) {
  return (
    <img
      src="/hdp-logo.svg"
      alt="Hora do Pastel"
      width={size}
      height={size}
      className={clsx(tilt && "mascot-tilt", className)}
      style={{ objectFit: "contain" }}
    />
  );
}
