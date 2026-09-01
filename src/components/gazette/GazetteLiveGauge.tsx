"use client";

import { useEffect, useState } from "react";
import GazetteHydrograph from "./GazetteHydrograph";
import type { GaugeSnapshot } from "@/components/home/conditions";
import {
  deltaCfsFromHistory,
  formatObservedAt,
  formatSeriesTrendLine,
  formatTwentyFourHourLine,
  preferMeasuredDelta,
} from "@/components/home/conditions";
import type { HydroReading } from "@/components/hydrograph/geometry";

interface Props {
  riverId: string;
  siteId: string | null;
  place: string;
  initialSnapshot?: GaugeSnapshot | null;
  initialHistory?: HydroReading[];
}

type ConditionsJson = {
  readings?: Array<{
    timestamp?: string;
    stale?: boolean;
    discharge?: { value: number };
    waterTemp?: { valueFahrenheit: number };
  }>;
  gauges?: Array<{
    timestamp?: string;
    stale?: boolean;
    discharge?: { value: number };
    waterTemp?: { valueFahrenheit: number };
  }>;
};

type FlagshipJson = {
  snapshots?: Record<string, GaugeSnapshot>;
  histories?: Record<string, HydroReading[]>;
};

export default function GazetteLiveGauge({
  riverId,
  siteId,
  place: _place,
  initialSnapshot = null,
  initialHistory,
}: Props) {
  const [snapshot, setSnapshot] = useState<GaugeSnapshot | null>(initialSnapshot);
  const [history, setHistory] = useState<HydroReading[] | null>(
    initialHistory && initialHistory.length >= 2 ? initialHistory : null,
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/river-conditions/${encodeURIComponent(riverId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: ConditionsJson | null) => {
        const row = json?.readings?.[0] ?? json?.gauges?.[0];
        if (cancelled || !row) return;
        setSnapshot((prev) => ({
          cfs: row.discharge?.value ?? prev?.cfs ?? null,
          deltaCfs: prev?.deltaCfs ?? null,
          waterTempF: row.waterTemp?.valueFahrenheit ?? prev?.waterTempF ?? null,
          observedAt: row.timestamp ?? prev?.observedAt ?? null,
          stale: Boolean(row.stale),
        }));
      })
      .catch(() => {
        /* gauge is optional */
      });

    fetch("/api/home/flagship-gauges")
      .then((r) => (r.ok ? r.json() : null))
      .then((json: FlagshipJson | null) => {
        if (cancelled || !json?.snapshots?.[riverId]) return;
        const next = json.snapshots[riverId];
        setSnapshot((prev) => ({
          cfs: next.cfs ?? prev?.cfs ?? null,
          deltaCfs: preferMeasuredDelta(next.deltaCfs, prev?.deltaCfs),
          waterTempF: next.waterTempF ?? prev?.waterTempF ?? null,
          observedAt: next.observedAt ?? prev?.observedAt ?? null,
          stale: next.stale ?? prev?.stale ?? false,
        }));
        if (json.histories?.[riverId]?.length) setHistory(json.histories[riverId]);
      })
      .catch(() => {
        /* flagship payload is optional */
      });

    if (!(initialHistory && initialHistory.length >= 2) && siteId) {
      fetch(
        `/api/river-history/${encodeURIComponent(riverId)}?siteId=${encodeURIComponent(siteId)}`,
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((json: { readings?: HydroReading[] } | null) => {
          if (cancelled || !json?.readings?.length) return;
          setHistory((prev) => prev ?? json.readings!.slice(-30));
        })
        .catch(() => {
          /* hydrograph fetch is the fallback */
        });
    }

    return () => {
      cancelled = true;
    };
  }, [riverId, siteId, initialHistory]);

  const cfs = snapshot?.cfs ?? null;
  const live = cfs != null && !snapshot?.stale;
  const deltaCfs = preferMeasuredDelta(
    snapshot?.deltaCfs,
    deltaCfsFromHistory(cfs, history),
  );
  const trend =
    formatTwentyFourHourLine(deltaCfs, cfs) ?? formatSeriesTrendLine(cfs, history);
  const updated = formatObservedAt(snapshot?.observedAt ?? null);
  const temp = snapshot?.waterTempF ?? null;

  return (
    <section className="mx-auto grid max-w-[72rem] gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      <div>
        <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
          Live gauge
        </p>
        <p className="mt-3 flex items-baseline gap-3">
          <span
            className={`font-display text-[clamp(64px,10vw,112px)] font-semibold leading-none tabular-nums ${
              live ? "text-[var(--ink)]" : "text-[var(--text-3)]"
            }`}
          >
            {cfs != null ? cfs.toLocaleString("en-US") : "—"}
          </span>
          <span className="font-ui text-[14px] uppercase tracking-[0.16em] text-[var(--text-3)]">
            CFS
          </span>
        </p>
        {trend ? (
          <p
            className={`mt-3 font-ui text-[13px] uppercase tracking-[0.08em] ${
              trend.dropping ? "text-[var(--danger)]" : "text-[var(--water-live)]"
            }`}
          >
            {trend.dropping ? "↓ " : "↑ "}
            {trend.text}
          </p>
        ) : null}
        <dl className="mt-8 space-y-2 font-ui text-[12px] uppercase tracking-[0.12em]">
          <div className="flex gap-6">
            <dt className="w-28 text-[var(--text-3)]">Water temp</dt>
            <dd className="num text-[var(--ink)]">{temp != null ? `${temp}°F` : "—"}</dd>
          </div>
          <div className="flex gap-6">
            <dt className="w-28 text-[var(--text-3)]">Updated</dt>
            <dd className="text-[var(--ink)]">{updated ? `${updated} USGS` : "—"}</dd>
          </div>
        </dl>
      </div>
      <GazetteHydrograph
        riverId={riverId}
        siteId={siteId}
        liveCfs={cfs}
        readings={history ?? undefined}
      />
    </section>
  );
}
