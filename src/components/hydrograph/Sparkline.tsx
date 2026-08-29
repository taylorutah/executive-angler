interface Props {
  values: number[];
}

/** 60×24 last-30-days spark. Empty series holds the same box. */
export default function Sparkline({ values }: Props) {
  const clean = values.filter((n) => Number.isFinite(n) && n >= 0);
  if (clean.length < 2) {
    return <span className="inline-block h-6 w-[60px] shrink-0" aria-hidden />;
  }

  const W = 60;
  const H = 24;
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const span = max - min || 1;
  const pts = clean.map((v, i) => {
    const x = (i / (clean.length - 1)) * W;
    const y = H - ((v - min) / span) * (H - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = pts[pts.length - 1].split(",");
  const area = `M${pts[0]} L${pts.join(" L")} L${W},${H} L0,${H} Z`;

  return (
    <svg
      width={60}
      height={24}
      viewBox={`0 0 ${W} ${H}`}
      className="inline-block h-6 w-[60px] shrink-0"
      fill="none"
      aria-hidden
    >
      <path d={area} fill="var(--accent)" opacity="0.16" />
      <polyline
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.25"
        strokeLinejoin="round"
        points={pts.join(" ")}
      />
      <circle cx={last[0]} cy={last[1]} r="1.6" fill="var(--accent)" />
    </svg>
  );
}
