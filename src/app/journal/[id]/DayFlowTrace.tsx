import type { DayFlow } from "@/lib/journal/day-flow";

interface Props {
  flow: DayFlow | null;
  /** Minutes past local midnight for each catch. */
  catchMinutes: number[];
  className?: string;
}

const W = 260;
const H = 72;

/**
 * One day of discharge, drawn small, with a tick where each fish came.
 * Static SVG — no client bundle, and no request for a viewer who is not
 * the owner (the page only renders this inside the owner branch).
 */
export default function DayFlowTrace({ flow, catchMinutes, className = "" }: Props) {
  if (!flow) {
    return (
      <div className={className}>
        <p className="ea-overline">
          Flow that day
        </p>
        <p className="mt-2 text-sm text-[var(--text-2)]">
          No gauge reading on record for this water.
        </p>
      </div>
    );
  }

  const cfsValues = flow.readings.map((r) => r.cfs);
  const min = Math.min(...cfsValues);
  const max = Math.max(...cfsValues);
  const span = max - min || 1;

  const x = (minutes: number) => (minutes / 1440) * W;
  const y = (cfs: number) => H - ((cfs - min) / span) * (H - 8) - 4;

  const line = flow.readings.map((r) => `${x(r.minutes).toFixed(1)},${y(r.cfs).toFixed(1)}`).join(" ");
  const area = `${line} ${x(flow.readings[flow.readings.length - 1].minutes).toFixed(1)},${H} ${x(flow.readings[0].minutes).toFixed(1)},${H}`;

  const cfsAt = (minutes: number) => {
    let best = flow.readings[0];
    for (const r of flow.readings) {
      if (Math.abs(r.minutes - minutes) < Math.abs(best.minutes - minutes)) best = r;
    }
    return best.cfs;
  };

  return (
    <div className={className}>
      <p className="ea-overline">
        Flow that day
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-full"
        role="img"
        aria-label={`Discharge at ${flow.gaugeName} through the day, ${Math.round(min)} to ${Math.round(max)} cubic feet per second, with a mark at each catch.`}
      >
        <polygon points={area} fill="var(--accent)" opacity="0.14" />
        <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        {catchMinutes.map((m, i) => (
          <circle
            key={i}
            cx={x(m)}
            cy={y(cfsAt(m))}
            r="3"
            fill="var(--accent)"
            stroke="var(--paper-deep)"
            strokeWidth="1"
          />
        ))}
      </svg>
      <div className="mt-1 flex items-baseline justify-between">
        {Math.round(min) === Math.round(max) ? (
          <span className="num text-xs text-[var(--text-3)]">
            {Math.round(min).toLocaleString()} cfs, steady all day
          </span>
        ) : (
          <>
            <span className="num text-xs text-[var(--text-3)]">{Math.round(min).toLocaleString()} cfs</span>
            <span className="num text-xs text-[var(--text-3)]">{Math.round(max).toLocaleString()} cfs</span>
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-[var(--text-3)]">
        USGS {flow.siteId} · {flow.gaugeName}
      </p>
    </div>
  );
}
