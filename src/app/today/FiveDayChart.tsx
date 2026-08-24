import type { ForecastDay } from "@/lib/today/briefing";

export default function FiveDayChart({
  days,
  pickDate,
}: {
  days: ForecastDay[];
  pickDate: string | null;
}) {
  if (days.length === 0) return null;
  const max = Math.max(1, ...days.map((d) => d.precipPct));

  return (
    <div className="mt-4 h-16 w-full" aria-hidden>
      <svg viewBox={`0 0 ${days.length * 56} 64`} className="h-16 w-full" role="img">
        <title>Five-day chance of precipitation</title>
        {days.map((d, i) => {
          const h = Math.max(4, (d.precipPct / max) * 40);
          const x = i * 56 + 12;
          const picked = d.date === pickDate;
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={44 - h}
                width={24}
                height={h}
                rx={2}
                fill={picked ? "var(--signal-live)" : "var(--border-strong)"}
              />
              <text
                x={x + 12}
                y={58}
                textAnchor="middle"
                fill="var(--text-meta)"
                fontSize="9"
                fontFamily="var(--font-archivo), Archivo, sans-serif"
              >
                {d.weekday.slice(0, 2)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
