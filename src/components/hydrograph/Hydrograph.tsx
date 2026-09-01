import type { ReactNode } from "react";
import {
  HYDRO,
  HYDRO_FRAME,
  formatAxisCfs,
  formatAxisDay,
  hydroScales,
  type HydroReading,
} from "./geometry";

interface Props {
  readings: HydroReading[];
  liveCfs?: number | null;
  label?: string;
  children?: (geo: ReturnType<typeof hydroScales>) => ReactNode;
}

const AXIS =
  "pointer-events-none absolute font-mono text-sm tabular-nums text-[var(--text-2)]";

/**
 * Shared 30-day instrument. SVG plot only — no library, no draw-on
 * animation, no count-up. Axis type is HTML so it stays CSS-pixel
 * readable when the plot stretches to fill the well.
 * Median band is that series' own median ± IQR.
 */
export default function Hydrograph({ readings, liveCfs, label, children }: Props) {
  const gradId = `hydro-${readings[0]?.date ?? "x"}-${readings.length}`;
  if (readings.length < 2) {
    return (
      <p className="font-mono text-sm uppercase tracking-[0.16em] text-[var(--text-meta)]">
        No hydrograph for this gauge
      </p>
    );
  }

  const geo = hydroScales(readings, liveCfs);
  const { series, band, xAt, yAt, yLabels, last, lastIndex } = geo;
  const line = series
    .map((r, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(r.discharge).toFixed(1)}`)
    .join(" ");
  const baseline = HYDRO.PAD.top + geo.innerH;
  const area = `${line} L ${xAt(lastIndex).toFixed(1)} ${baseline} L ${xAt(0).toFixed(1)} ${baseline} Z`;
  const first = series[0];
  const leftGutter = `${(HYDRO.PAD.left / HYDRO.W) * 100}%`;
  const rightGutter = `${(HYDRO.PAD.right / HYDRO.W) * 100}%`;

  return (
    <div className={HYDRO_FRAME}>
      <svg
        viewBox={`0 0 ${HYDRO.W} ${HYDRO.H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        fill="none"
        role="img"
        aria-label={label ?? "Thirty-day discharge for this gauge"}
      >
        <defs>
          <linearGradient id={`hydro-fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--signal-live)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--signal-live)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {band && (
          <rect
            x={HYDRO.PAD.left}
            y={yAt(band.high)}
            width={geo.innerW}
            height={Math.max(0, yAt(band.low) - yAt(band.high))}
            fill="var(--signal-live)"
            opacity="0.08"
          />
        )}

        {band &&
          [band.low, band.high].map((edge) => (
            <line
              key={edge}
              x1={HYDRO.PAD.left}
              y1={yAt(edge)}
              x2={HYDRO.W - HYDRO.PAD.right}
              y2={yAt(edge)}
              stroke="var(--border-rule)"
              strokeWidth="1"
              vectorEffect="nonScalingStroke"
            />
          ))}

        <path d={area} fill={`url(#hydro-fill-${gradId})`} />
        <path
          d={line}
          fill="none"
          stroke="var(--signal-live)"
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="nonScalingStroke"
        />

        <line
          x1={xAt(lastIndex)}
          y1={HYDRO.PAD.top}
          x2={xAt(lastIndex)}
          y2={yAt(last.discharge)}
          stroke="var(--border-rule)"
          strokeWidth="1"
          vectorEffect="nonScalingStroke"
        />

        {children?.(geo)}
      </svg>

      {yLabels.map((tick) => (
        <span
          key={tick}
          className={`${AXIS} pr-2 text-right`}
          style={{
            left: 0,
            width: leftGutter,
            top: `${(yAt(tick) / HYDRO.H) * 100}%`,
            transform: "translateY(-50%)",
          }}
        >
          {formatAxisCfs(tick)}
        </span>
      ))}

      <span
        aria-hidden
        className="absolute h-2 w-2 rounded-full bg-[var(--signal-live)]"
        style={{
          left: `${(xAt(lastIndex) / HYDRO.W) * 100}%`,
          top: `${(yAt(last.discharge) / HYDRO.H) * 100}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
      <span
        className="pointer-events-none absolute font-mono text-sm tabular-nums text-[var(--signal-live)]"
        style={{
          left: `${((xAt(lastIndex) + 10) / HYDRO.W) * 100}%`,
          top: `${(yAt(last.discharge) / HYDRO.H) * 100}%`,
          transform: "translateY(-50%)",
        }}
      >
        {formatAxisCfs(Math.round(last.discharge))}
      </span>

      <span
        className={AXIS}
        style={{
          left: leftGutter,
          bottom: 2,
        }}
      >
        {formatAxisDay(first.date)}
      </span>
      <span
        className={`${AXIS} text-right`}
        style={{
          right: rightGutter,
          bottom: 2,
        }}
      >
        {formatAxisDay(last.date)}
      </span>
    </div>
  );
}
