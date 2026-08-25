"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Droplets } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { fetchOnce } from "./fetch-once";
import Hydrograph from "@/components/hydrograph/Hydrograph";
import { HYDRO, hydroScales, type HydroReading } from "@/components/hydrograph/geometry";

/* ── Types ─────────────────────────────────────────────── */

interface FlowPoint {
  datetime: string;
  value: number;
  unit: string;
}

interface DailyReading {
  date: string;
  discharge: number;
}

interface SessionMarker {
  date: string;
  fishCount: number;
  topFly: string | null;
  species: string[];
  x: number;
  y: number;
  flow: number;
}

interface GaugeOption {
  site_id: string;
  name: string;
  section: string;
}

interface Props {
  usgsGaugeId: string | null; // JSON array string or single site ID or null
  riverName: string;
  riverId: string;
}

/* ── Helpers ───────────────────────────────────────────── */

function parseGauges(raw: string | null): GaugeOption[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed) as GaugeOption[];
    } catch {
      return [];
    }
  }
  return [{ site_id: trimmed, name: "Main Gauge", section: "Main" }];
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function downsample(points: FlowPoint[], maxPoints: number): FlowPoint[] {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const result: FlowPoint[] = [];
  for (let i = 0; i < points.length; i++) {
    if (i % step === 0 || i === points.length - 1) {
      result.push(points[i]);
    }
  }
  return result;
}

/** Daily means from the history API, trimmed to the window this card claims. */
const WINDOW_DAYS = 30;

/* ── Component ─────────────────────────────────────────── */

export default function FlowChart({ usgsGaugeId, riverName, riverId }: Props) {
  const gauges = useMemo(() => parseGauges(usgsGaugeId), [usgsGaugeId]);
  const { user } = useAuth();

  // Shared URL state with <RiverSectionPills> at the top of the river page.
  // When the angler picks a section up top, FlowChart switches gauges too —
  // matching iOS, where one picker drives Fishability + Flow chart.
  const searchParams = useSearchParams();
  const sectionFromUrl = searchParams?.get("section") || "";
  const defaultSiteId =
    gauges.find((g) => g.site_id === sectionFromUrl)?.site_id ||
    gauges[0]?.site_id ||
    "";

  const [activeSiteId, setActiveSiteId] = useState(defaultSiteId);

  // Sync when the URL param changes (pill tap elsewhere on the page).
  useEffect(() => {
    if (sectionFromUrl && gauges.some((g) => g.site_id === sectionFromUrl)) {
      setActiveSiteId(sectionFromUrl);
    }
  }, [sectionFromUrl, gauges]);
  const [flowData, setFlowData] = useState<FlowPoint[]>([]);
  const [sessions, setSessions] = useState<SessionMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSession, setHoveredSession] = useState<SessionMarker | null>(null);

  // No gauges linked
  if (gauges.length === 0) {
    return (
      <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-6">
        <div className="flex items-center gap-3 mb-2">
          <Droplets className="h-5 w-5 text-[var(--text-meta)]" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            River Flow — {riverName}
          </h3>
        </div>
        <p className="text-sm text-[var(--text-meta)]">
          No USGS gauge linked to this river.
        </p>
      </div>
    );
  }

  /* eslint-disable react-hooks/rules-of-hooks */

  // Fetch flow data when gauge changes. `/api/river-history` is the public
  // endpoint — `/api/rivers/flow` 401s for signed-out readers.
  useEffect(() => {
    if (!activeSiteId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetchOnce(
          `/api/river-history/${riverId}?siteId=${activeSiteId}`
        );
        if (!res.ok) {
          if (!cancelled) setError("Unable to load flow data");
          return;
        }
        const data = await res.json();
        const readings: DailyReading[] = data.readings || [];
        if (!cancelled) {
          setFlowData(
            readings.slice(-WINDOW_DAYS).map((r) => ({
              datetime: `${r.date}T12:00:00`,
              value: r.discharge,
              unit: "cfs",
            }))
          );
        }
      } catch {
        if (!cancelled) setError("Unable to load flow data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeSiteId, riverId]);

  // Overlay the reader's own sessions. Insights are owner-scoped, so a
  // signed-out visitor must never hit the endpoint.
  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchOnce(
          `/api/insights/river-conditions?riverId=${riverId}`
        );
        if (!res.ok) return;

        const data = await res.json();
        const catches: SessionMarker[] = (data.catches || []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => ({
            date: c.date,
            fishCount: c.fish_count || 0,
            topFly: c.top_fly || null,
            species: c.species || [],
          })
        );
        if (!cancelled) setSessions(catches);
      } catch {
        // Silently skip
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [riverId, user]);

  // Downsample for rendering
  const chartPoints = useMemo(() => downsample(flowData, 300), [flowData]);

  const hydroReadings: HydroReading[] = useMemo(
    () =>
      chartPoints.map((p) => ({
        date: p.datetime.slice(0, 10),
        discharge: p.value,
      })),
    [chartPoints],
  );

  const sessionMarkers = useMemo(() => {
    if (sessions.length === 0 || hydroReadings.length < 2) return [];
    const geo = hydroScales(hydroReadings);
    const tMin = new Date(`${geo.series[0].date}T12:00:00`).getTime();
    const tMax = new Date(`${geo.series[geo.series.length - 1].date}T12:00:00`).getTime();

    return sessions
      .filter((s) => {
        const t = new Date(s.date + "T12:00:00").getTime();
        return t >= tMin && t <= tMax;
      })
      .map((s) => {
        const t = new Date(s.date + "T12:00:00").getTime();
        let nearestFlow = hydroReadings[0].discharge;
        let nearestDist = Infinity;
        for (const p of hydroReadings) {
          const pTime = new Date(`${p.date}T12:00:00`).getTime();
          const dist = Math.abs(pTime - t);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestFlow = p.discharge;
          }
        }
        return {
          ...s,
          x: geo.xAtTime(s.date),
          y: geo.yAt(nearestFlow),
          flow: nearestFlow,
        };
      });
  }, [sessions, hydroReadings]);

  /* eslint-enable react-hooks/rules-of-hooks */

  // Loading state
  if (loading) {
    return (
      <div className="min-h-48 bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-6">
        <div className="flex items-center gap-2 text-[var(--text-meta)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading 30-day flow data...</span>
        </div>
      </div>
    );
  }

  // A failed request and an empty series are different facts — say which.
  if (error || chartPoints.length === 0) {
    return (
      <div className="min-h-48 bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-6">
        <div className="flex items-center gap-3 mb-2">
          <Droplets className="h-5 w-5 text-[var(--text-meta)]" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            River Flow — {riverName}
          </h3>
        </div>
        <p className="text-sm text-[var(--text-meta)]">
          {error || "No flow data for this gauge."}
        </p>
      </div>
    );
  }

  const currentFlow = chartPoints[chartPoints.length - 1];
  const activeGauge = gauges.find((g) => g.site_id === activeSiteId);
  const siteName = activeGauge?.name || "";

  return (
    <div
      data-instrument
      className="rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)] px-5 py-5"
    >
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-meta)]">
            30-day flow
          </h3>
          {siteName ? (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
              {siteName}
            </p>
          ) : null}
        </div>
        <p className="text-right">
          <span className="num text-3xl font-bold leading-none text-[var(--signal-live)]">
            {currentFlow.value.toLocaleString("en-US")}
          </span>
          <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
            cfs
          </span>
        </p>
      </div>

      <div className="relative">
        <Hydrograph
          readings={hydroReadings}
          liveCfs={currentFlow.value}
          label={`Thirty-day discharge for ${riverName}`}
        >
          {() =>
            sessionMarkers.map((sm, i) => (
              <g
                key={`session-${i}`}
                onMouseEnter={() => setHoveredSession(sm)}
                onMouseLeave={() => setHoveredSession(null)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={sm.x}
                  cy={sm.y}
                  r={Math.min(12, 5 + sm.fishCount)}
                  fill="var(--action)"
                  fillOpacity={0.16}
                />
                <circle cx={sm.x} cy={sm.y} r={3} fill="var(--action)" />
              </g>
            ))
          }
        </Hydrograph>

        {hoveredSession && (
          <div
            className="absolute z-20 pointer-events-none rounded-lg border border-[var(--border-rule)] bg-[var(--surface-page)] px-3 py-2 text-xs shadow-[var(--elev-2)]"
            style={{
              left: `${(hoveredSession.x / HYDRO.W) * 100}%`,
              top: `${(hoveredSession.y / HYDRO.H) * 100 - 20}%`,
              transform: "translateX(-50%)",
            }}
          >
            <p className="font-bold text-[var(--action)]">
              {hoveredSession.fishCount} fish caught
            </p>
            <p className="text-[var(--text-primary)]">
              {formatShortDate(hoveredSession.date + "T12:00:00")}
            </p>
            {hoveredSession.topFly && (
              <p className="text-[var(--text-meta)]">Fly: {hoveredSession.topFly}</p>
            )}
            {hoveredSession.species.length > 0 && (
              <p className="text-[var(--text-meta)]">
                {hoveredSession.species.join(", ")}
              </p>
            )}
            <p className="font-mono text-[var(--text-meta)]">
              {hoveredSession.flow.toLocaleString("en-US")} cfs
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-meta)]">
        {sessionMarkers.length > 0
          ? `${sessionMarkers.length} session${sessionMarkers.length !== 1 ? "s" : ""} overlaid · `
          : ""}
        Daily means · band is this gauge&apos;s 30-day median ± IQR · USGS NWIS
      </p>
    </div>
  );
}
