type Props = {
  values: number[];
  width?: number;
  height?: number;
  positive?: boolean | null;
};

export function Sparkline({
  values,
  width = 96,
  height = 28,
  positive = true,
}: Props) {
  if (values.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden="true">
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={2}
        />
      </svg>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Use brand red for the line; tint of fill follows trend (positive/negative)
  const stroke = "#b00012";
  const fill =
    positive === false
      ? "rgba(176, 0, 18, 0.18)"
      : positive === true
        ? "rgba(176, 0, 18, 0.16)"
        : "rgba(255, 255, 255, 0.05)";
  const last = values[values.length - 1];
  const lastX = (values.length - 1) * stepX;
  const lastY = height - ((last - min) / range) * (height - 4) - 2;

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} aria-hidden="true">
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b00012" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#b00012" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={areaPoints} fill="url(#sparkfill)" stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2.4} fill="#ffb500" />
    </svg>
  );
}
