"use client";

import { useEffect, useState, type ReactNode } from "react";
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
  siteName?: string | null;
  place: string;
  initialSnapshot?: GaugeSnapshot | null;
  initialHistory?: HydroReading[];
  showChart?: boolean;
  children?: ReactNode;
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

function measuredTwentyFourHour(snapshot: GaugeSnapshot | null): number | null {
  const delta = snapshot?.deltaCfs;
  if (delta == null || delta === 0) return null;
  return delta;
}

function stillTrend(copy: { text: string; dropping: boolean } | null): string | null {
  if (!copy) return null;
  const num = copy.text.match(/[+\-−]?\d[\d,]*/);
  const arrow = copy.dropping ? "▼" : "▲";
  if (!num) return `TREND: ${copy.text}`;
  return `TREND: ${num[0]} CFS ${arrow}`;
}

export default function GazetteLiveGauge({
  riverId,
  siteId,
  siteName,
  place: _place,
  initialSnapshot = null,
  initialHistory,
  showChart = true,
  children,
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
  const twentyFour = formatTwentyFourHourLine(
    measuredTwentyFourHour(snapshot) ?? deltaCfsFromHistory(cfs, history),
    cfs,
  );
  const series = formatSeriesTrendLine(cfs, history);
  const picked = twentyFour ?? series;
  const trend = stillTrend(picked);
  const dropping = Boolean(picked?.dropping);
  const updated = formatObservedAt(snapshot?.observedAt ?? null);
  const temp = snapshot?.waterTempF ?? null;
  const station = [siteId ? `USGS STATION ${siteId}` : null, siteName]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="mx-auto max-w-[72rem] px-4 py-8 sm:px-8">
      <p className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
        Live gauge{station ? ` · ${station}` : ""}
      </p>
      <dl className="mt-5 grid grid-cols-1 gap-6 border-t border-[var(--border)] pt-5 sm:grid-cols-3 sm:gap-0">
        <div className="sm:border-r sm:border-[var(--border)] sm:pr-6">
          <dt className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
            Flow
          </dt>
          <dd
            className={`mt-2 font-display text-[clamp(36px,5vw,52px)] font-semibold leading-none tabular-nums ${
              live ? "text-[var(--ink)]" : "text-[var(--text-3)]"
            }`}
          >
            {cfs != null ? (
              <>
                {cfs.toLocaleString("en-US")}
                <span className="ml-2 align-baseline font-ui text-[13px] font-medium tracking-[0.14em]">
                  CFS
                </span>
              </>
            ) : (
              "—"
            )}
            {trend ? (
              <span
                className={`mt-2 block font-ui text-[12px] uppercase tracking-[0.08em] ${
                  dropping ? "text-[var(--danger)]" : "text-[var(--copper)]"
                }`}
              >
                {trend}
              </span>
            ) : null}
          </dd>
        </div>
        <div className="sm:border-r sm:border-[var(--border)] sm:px-6">
          <dt className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
            Water temp
          </dt>
          <dd className="mt-2 font-display text-[clamp(36px,5vw,52px)] font-semibold leading-none tabular-nums text-[var(--ink)]">
            {temp != null ? (
              <>
                {temp}
                <span className="ml-2 align-baseline font-ui text-[13px] font-medium tracking-[0.14em]">
                  °F
                </span>
              </>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="sm:pl-6">
          <dt className="font-ui text-[11px] uppercase tracking-[0.16em] text-[var(--text-3)]">
            Updated
          </dt>
          <dd className="mt-2 font-display text-[clamp(36px,5vw,52px)] font-semibold leading-none text-[var(--ink)]">
            {updated ?? "—"}
            <span className="mt-2 block font-ui text-[12px] uppercase tracking-[0.12em] text-[var(--text-3)]">
              USGS
            </span>
          </dd>
        </div>
      </dl>
      {showChart || children ? (
        <div
          className={`mt-8 ${
            children
              ? "grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start"
              : ""
          }`}
        >
          {showChart ? (
            <GazetteHydrograph
              riverId={riverId}
              siteId={siteId}
              liveCfs={cfs}
              readings={history ?? undefined}
            />
          ) : null}
          {children}
        </div>
      ) : null}
    </section>
  );
}
