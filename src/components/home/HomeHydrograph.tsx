"use client";

import { useEffect, useState } from "react";
import Hydrograph from "@/components/hydrograph/Hydrograph";
import { HYDRO_FRAME, type HydroReading } from "@/components/hydrograph/geometry";

interface Props {
  riverId: string;
  siteId: string;
  liveCfs?: number | null;
  /** Server-fetched 30-day series; skips the client request when present. */
  readings?: HydroReading[];
}

export default function HomeHydrograph({ riverId, siteId, liveCfs, readings: initial }: Props) {
  const [readings, setReadings] = useState<HydroReading[] | null>(initial ?? null);

  useEffect(() => {
    if (initial && initial.length >= 2) return;
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

  if (readings == null) {
    return <div className={`${HYDRO_FRAME} bg-[var(--surface-raised)]`} aria-hidden />;
  }

  return (
    <Hydrograph
      readings={readings}
      liveCfs={liveCfs}
      label="Thirty-day discharge for this gauge"
    />
  );
}
