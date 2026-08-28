"use client";

import { useEffect, useState } from "react";

interface Props {
  siteId: string;
  gaugeLabel?: string;
}

/**
 * Latest USGS discharge for the river's first gauge, from the public
 * flow endpoint. Renders nothing until a real reading arrives — an
 * absent gauge is never dressed up as a number.
 */
export default function PlanFlowLine({ siteId, gaugeLabel }: Props) {
  const [cfs, setCfs] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/search/flow?sites=${siteId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Record<string, number> | null) => {
        if (cancelled) return;
        const value = data?.[siteId];
        if (typeof value === "number") setCfs(value);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [siteId]);

  return (
    <p className="mt-3 text-base text-[var(--text-2)]" aria-live="polite">
      {cfs != null ? (
        <>
          <span className="num text-[var(--accent)]">
            {cfs.toLocaleString("en-US")}
            <span className="ml-1 text-[var(--text-3)]">cfs</span>
          </span>{" "}
          on the gauge{gaugeLabel ? ` at ${gaugeLabel}` : ""} right now.
        </>
      ) : failed ? (
        <span className="text-[var(--text-3)]">
          No live reading from the gauge{gaugeLabel ? ` at ${gaugeLabel}` : ""} right now.
        </span>
      ) : (
        <span className="text-[var(--text-3)]">Reading the gauge…</span>
      )}
    </p>
  );
}
