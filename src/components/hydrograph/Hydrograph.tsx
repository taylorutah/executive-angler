import type { ReactNode } from "react";
import {
  HYDRO,
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

/**
 * Shared 30-day instrument. SVG only — no library, no draw-on animation,
 * no count-up. Median band is that series' own median ± IQR.
 */
export default function Hydrograph({ readings, liveCfs, label, children }: Props) {
  const gradId = `hydro-${readings[0]?.date ?? "x"}-${readings.length}`;
  if (readings.length < 2) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
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

  return (
    <svg
      viewBox={`0 0 ${HYDRO.W} ${HYDRO.H}`}
      className="h-[9.5rem] w-full"
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
          />
        ))}

      {yLabels.map((tick) => (
        <text
          key={tick}
          x={HYDRO.PAD.left - 8}
          y={yAt(tick) + 3}
          textAnchor="end"
          fill="var(--text-2)"
          fontSize="13"
          fontFamily="var(--font-ibm-plex-mono), ui-monospace, monospace"
        >
          {formatAxisCfs(tick)}
        </text>
      ))}

      <path d={area} fill={`url(#hydro-fill-${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke="var(--signal-live)"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      <line
        x1={xAt(lastIndex)}
        y1={HYDRO.PAD.top}
        x2={xAt(lastIndex)}
        y2={yAt(last.discharge)}
        stroke="var(--border-rule)"
        strokeWidth="1"
      />
      <circle
        cx={xAt(lastIndex)}
        cy={yAt(last.discharge)}
        r="4"
        fill="var(--signal-live)"
      />
      <text
        x={xAt(lastIndex) + 10}
        y={yAt(last.discharge) + 4}
        fill="var(--signal-live)"
        fontSize="12"
        fontFamily="var(--font-ibm-plex-mono), ui-monospace, monospace"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatAxisCfs(Math.round(last.discharge))}
      </text>

      <text
        x={HYDRO.PAD.left}
        y={HYDRO.H - 6}
        fill="var(--text-2)"
        fontSize="13"
        fontFamily="var(--font-ibm-plex-mono), ui-monospace, monospace"
      >
        {formatAxisDay(first.date)}
      </text>
      <text
        x={HYDRO.W - HYDRO.PAD.right}
        y={HYDRO.H - 6}
        textAnchor="end"
        fill="var(--text-2)"
        fontSize="13"
        fontFamily="var(--font-ibm-plex-mono), ui-monospace, monospace"
      >
        {formatAxisDay(last.date)}
      </text>

      {children?.(geo)}
    </svg>
  );
}
