"use client";

import { useEffect, useState } from "react";

interface Reading {
  date: string;
  discharge: number;
}

interface Props {
  riverId: string;
  siteId: string;
}

const W = 800;
const H = 220;
const PAD = { top: 12, right: 12, bottom: 28, left: 48 };

export default function HomeHydrograph({ riverId, siteId }: Props) {
  const [readings, setReadings] = useState<Reading[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/river-history/${encodeURIComponent(riverId)}?siteId=${encodeURIComponent(siteId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { readings?: Reading[] } | null) => {
        if (cancelled || !json?.readings) return;
        setReadings(json.readings.slice(-30));
      })
      .catch(() => {
        if (!cancelled) setReadings([]);
      });
    return () => {
      cancelled = true;
    };
  }, [riverId, siteId]);

  if (readings == null) {
    return <div className="h-56 w-full bg-[var(--surface-raised)]" aria-hidden />;
  }
  if (readings.length < 2) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
        No hydrograph for this gauge
      </p>
    );
  }

  const values = readings.map((r) => r.discharge);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const points = readings.map((r, i) => {
    const x = PAD.left + (i / (readings.length - 1)) * innerW;
    const y = PAD.top + (1 - (r.discharge - min) / span) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const first = readings[0];
  const last = readings[readings.length - 1];

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-56 w-full"
        role="img"
        aria-label="Thirty-day discharge for this gauge"
      >
        <polyline
          fill="none"
          stroke="var(--signal-live)"
          strokeWidth="2"
          points={points.join(" ")}
        />
        <text x={PAD.left} y={H - 8} className="fill-[var(--text-meta)]" fontSize="11" fontFamily="IBM Plex Mono, monospace">
          {first.date.slice(5)}
        </text>
        <text
          x={W - PAD.right}
          y={H - 8}
          textAnchor="end"
          className="fill-[var(--text-meta)]"
          fontSize="11"
          fontFamily="IBM Plex Mono, monospace"
        >
          {last.date.slice(5)}
        </text>
        <text
          x={PAD.left - 8}
          y={PAD.top + 4}
          textAnchor="end"
          className="fill-[var(--text-meta)]"
          fontSize="11"
          fontFamily="IBM Plex Mono, monospace"
        >
          {Math.round(max)}
        </text>
        <text
          x={PAD.left - 8}
          y={PAD.top + innerH}
          textAnchor="end"
          className="fill-[var(--text-meta)]"
          fontSize="11"
          fontFamily="IBM Plex Mono, monospace"
        >
          {Math.round(min)}
        </text>
      </svg>
      <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
        30-day mean discharge · USGS {siteId}
      </figcaption>
    </figure>
  );
}
