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
          stroke="#e7e5e4"
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
  const stroke =
    positive === false
      ? "#dc2626"
      : positive === true
        ? "#16a34a"
        : "#78716c";
  const fill =
    positive === false
      ? "rgba(220,38,38,0.10)"
      : positive === true
        ? "rgba(22,163,74,0.10)"
        : "rgba(120,113,108,0.10)";
  const last = values[values.length - 1];
  const lastX = (values.length - 1) * stepX;
  const lastY = height - ((last - min) / range) * (height - 4) - 2;

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline points={areaPoints} fill={fill} stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2.4} fill={stroke} />
    </svg>
  );
}
