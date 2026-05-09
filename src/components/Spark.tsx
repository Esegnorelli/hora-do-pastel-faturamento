import clsx from "clsx";

type Props = {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  showArea?: boolean;
  showDots?: boolean;
  className?: string;
};

export function Spark({
  values,
  width = 120,
  height = 32,
  stroke = "var(--color-bordo)",
  fill = "rgba(129, 0, 1, 0.10)",
  showArea = true,
  showDots = false,
  className,
}: Props) {
  if (values.length < 2) {
    return (
      <svg width={width} height={height} className={className} aria-hidden>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="var(--color-rule)"
          strokeWidth={1}
        />
      </svg>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const polyline = points.map((p) => p.join(",")).join(" ");
  const areaPoints = `0,${height} ${polyline} ${width},${height}`;
  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} className={clsx(className)} aria-hidden>
      {showArea && <polyline points={areaPoints} fill={fill} stroke="none" />}
      <polyline
        points={polyline}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {showDots &&
        points.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={1.2}
            fill={stroke}
          />
        ))}
      <circle cx={last[0]} cy={last[1]} r={2.2} fill="var(--color-chartreuse)" stroke={stroke} strokeWidth={1} />
    </svg>
  );
}
