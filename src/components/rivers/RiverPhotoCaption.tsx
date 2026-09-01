"use client";

import { useEffect, useState } from "react";

interface Props {
  riverId: string;
  place: string;
  date: string;
}

/**
 * Photograph caption: PLACE · CFS · DATE. CFS only when the gauge answered.
 */
export default function RiverPhotoCaption({ riverId, place, date }: Props) {
  const [cfs, setCfs] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/river-conditions/${riverId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { gauges?: { discharge?: { value: number } }[] } | null) => {
        const value = data?.gauges?.[0]?.discharge?.value;
        if (!cancelled && value != null && Number.isFinite(value)) {
          setCfs(Math.round(value));
        }
      })
      .catch(() => {
        /* caption stays without a number */
      });
    return () => {
      cancelled = true;
    };
  }, [riverId]);

  const parts = [place.toUpperCase(), cfs != null ? `${cfs.toLocaleString("en-US")} CFS` : null, date]
    .filter(Boolean)
    .join(" · ");

  return (
    <p className="absolute bottom-0 left-0 right-0 bg-[var(--paper)]/92 px-4 py-2 font-ui text-[11px] uppercase tracking-[0.14em] text-[var(--ink)] sm:px-6">
      {parts}
    </p>
  );
}
