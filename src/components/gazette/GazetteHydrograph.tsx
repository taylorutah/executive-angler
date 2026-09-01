"use client";

import { useEffect, useState } from "react";
import {
  HYDRO,
  HYDRO_FRAME,
  formatAxisCfs,
  formatAxisDay,
  hydroScales,
  type HydroReading,
} from "@/components/hydrograph/geometry";

interface Props {
  riverId: string;
  siteId: string | null;
  liveCfs?: number | null;
  readings?: HydroReading[];
}

/**
 * Quiet hairline discharge plot. No gradient fill, no glass.
 */
export default function GazetteHydrograph({ riverId, siteId, liveCfs, readings: initial }: Props) {
  const [readings, setReadings] = useState<HydroReading[] | null>(
    initial && initial.length >= 2 ? initial : null,
  );

  useEffect(() => {
    if (initial && initial.length >= 2) {
      setReadings(initial);
      return;
    }
    if (!siteId) return;
    let cancelled = false;
    fetch(`/api/river-history/${encodeURIComponent(riverId)}?siteId=${encodeURIComponent(siteId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { readings?: HydroReading[] } | null) => {
        if (cancelled || !json?.readings) return;
        setReadings(json.readings.slice(-30));
      })
      .catch(() => {
        if (!cancelled) setReadings([]);
      });
    return () => {
      cancelled = true;
    };
  }, [riverId, siteId, initial]);

  if (!siteId) {
    return (
      <p className="font-ui text-[13px] uppercase tracking-[0.12em] text-[var(--text-3)]">
        No hydrograph for this gauge
      </p>
    );
  }

  if (readings == null) {
    return <div className={`${HYDRO_FRAME} bg-[var(--paper-deep)]`} aria-hidden />;
  }

  if (readings.length < 2) {
    return (
      <p className="font-ui text-[13px] uppercase tracking-[0.12em] text-[var(--text-3)]">
        No hydrograph for this gauge
      </p>
    );
  }

  const geo = hydroScales(readings, liveCfs);
  const { series, xAt, yAt, yLabels, last, lastIndex } = geo;
  const line = series
    .map((r, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(r.discharge).toFixed(1)}`)
    .join(" ");
  const first = series[0];
  const midIndex = Math.floor(lastIndex / 2);
  const leftGutter = `${(HYDRO.PAD.left / HYDRO.W) * 100}%`;
  const rightGutter = `${(HYDRO.PAD.right / HYDRO.W) * 100}%`;
  const axis = "pointer-events-none absolute font-ui text-[11px] tabular-nums text-[var(--text-3)]";

  return (
    <div>
      <p className="mb-2 font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
        Last 30 days · Discharge (CFS)
      </p>
      <div className={HYDRO_FRAME}>
        <svg
          viewBox={`0 0 ${HYDRO.W} ${HYDRO.H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          fill="none"
          role="img"
          aria-label="Thirty-day discharge for this gauge"
        >
          {yLabels.map((tick) => (
            <line
              key={`g-${tick}`}
              x1={HYDRO.PAD.left}
              x2={HYDRO.W - HYDRO.PAD.right}
              y1={yAt(tick)}
              y2={yAt(tick)}
              stroke="rgba(28, 25, 21, 0.12)"
              strokeWidth="1"
              vectorEffect="nonScalingStroke"
            />
          ))}
          <path
            d={line}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="1.25"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="nonScalingStroke"
          />
        </svg>
        {yLabels.map((tick) => (
          <span
            key={tick}
            className={`${axis} pr-2 text-right`}
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
        <span className={axis} style={{ left: leftGutter, bottom: 2 }}>
          {formatAxisDay(first.date)}
        </span>
        {midIndex > 0 && midIndex < lastIndex ? (
          <span
            className={`${axis} -translate-x-1/2`}
            style={{ left: `${(xAt(midIndex) / HYDRO.W) * 100}%`, bottom: 2 }}
          >
            {formatAxisDay(series[midIndex].date)}
          </span>
        ) : null}
        <span className={`${axis} text-right`} style={{ right: rightGutter, bottom: 2 }}>
          {formatAxisDay(last.date)}
        </span>
      </div>
    </div>
  );
}
