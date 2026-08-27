"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Waves, Thermometer, ArrowUpDown, Clock, AlertTriangle,
  Wind, Droplets, Gauge
} from "@/icons";
import { fetchOnce } from "./fetch-once";
import { missingInstantaneousCopy } from "@/lib/rivers/missing-gauge";

// ── USGS types ──────────────────────────────────────────────────────────────

interface GaugeReading {
  siteId: string;
  siteName: string;
  section: string;
  riverId: string;
  timestamp: string;
  discharge?: { value: number; unit: string };
  gageHeight?: { value: number; unit: string };
  waterTemp?: { valueCelsius: number; valueFahrenheit: number; unit: string };
  source: string;
  stale: boolean;
}

// ── Weather types ────────────────────────────────────────────────────────────

interface WeatherData {
  tempF: number;
  feelsLikeF: number;
  humidity: number;
  windMph: number;
  windDirection: number;
  windDirectionLabel: string;
  weatherCode: number;
  weatherLabel: string;
  weatherIcon: string;
  pressureHpa: number;
  pressureMb: number;
  pressureInHg: number;
  fetchedAt: string;
}

interface WeatherSection {
  section: string;
  latitude: number;
  longitude: number;
  weather: WeatherData;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch { return ""; }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch { return ""; }
}

function getFlowLabel(cfs: number): { label: string; color: string } {
  // Measurement, not status. Thresholds are unchanged; colour is meta.
  const color = "text-[var(--text-meta)]";
  if (cfs < 100) return { label: "Low", color };
  if (cfs < 500) return { label: "Normal", color };
  if (cfs < 2000) return { label: "Moderate", color };
  if (cfs < 5000) return { label: "High", color };
  return { label: "Flood Stage", color };
}

// Find the weather section that best matches a USGS gauge section name.
// Falls back to first section if no match.
function matchWeather(section: string, weatherSections: WeatherSection[]): WeatherData | null {
  if (weatherSections.length === 0) return null;
  const exact = weatherSections.find(w => w.section === section);
  if (exact) return exact.weather;
  // Fuzzy: section name contained in weather section name or vice versa
  const fuzzy = weatherSections.find(
    w => w.section.toLowerCase().includes(section.toLowerCase()) ||
         section.toLowerCase().includes(w.section.toLowerCase())
  );
  return (fuzzy ?? weatherSections[0]).weather;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  riverId: string;
  usgsSiteId?: string;
  riverName?: string;
  riverLatitude?: number | null;
  riverLongitude?: number | null;
  onSectionChange?: (siteId: string, section: string) => void;
  /** `band` = instrument body inside InstrumentWell. Default keeps the stacked card. */
  layout?: "card" | "band";
  /** Server-rendered readings already in hand — paint numbers, not greys. */
  initialGauges?: GaugeReading[];
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RiverConditionsCard({ riverId, usgsSiteId, riverName, riverLatitude, riverLongitude, onSectionChange, layout = "card", initialGauges }: Props) {
  const [gauges, setGauges] = useState<GaugeReading[]>(initialGauges ?? []);
  const [weatherSections, setWeatherSections] = useState<WeatherSection[]>([]);
  const [loadingConditions, setLoadingConditions] = useState(!initialGauges?.length);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [conditionsError, setConditionsError] = useState(false);

  // URL is the single source of truth for section selection — both this card
  // and <RiverSectionPills> read/write `?section=<siteId>`, keeping FlowChart,
  // Fishability, and Conditions pinned to the same gauge (iOS parity).
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sectionFromUrl = searchParams?.get("section") || "";

  const selectedIdx = useMemo(() => {
    if (sectionFromUrl && gauges.length > 0) {
      const idx = gauges.findIndex((g) => g.siteId === sectionFromUrl);
      if (idx >= 0) return idx;
    }
    return 0;
  }, [sectionFromUrl, gauges]);

  // Notify parent (drives WaterLevelChart) whenever the active gauge changes.
  useEffect(() => {
    if (gauges.length === 0) return;
    const g = gauges[selectedIdx];
    if (g) onSectionChange?.(g.siteId, g.section);
  }, [selectedIdx, gauges, onSectionChange]);

  const setSection = (siteId: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("section", siteId);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  // Fetch USGS conditions
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetchOnce(`/api/river-conditions/${riverId}`);
        if (!res.ok) { setConditionsError(true); return; }
        const data = await res.json();
        if (!cancelled && data.gauges) {
          setGauges(data.gauges);
        }
      } catch {
        if (!cancelled) setConditionsError(true);
      } finally {
        if (!cancelled) setLoadingConditions(false);
      }
    }
    load();
    const interval = setInterval(load, 15 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [riverId]);

  // Fetch weather (only if we have coordinates)
  useEffect(() => {
    if (!riverLatitude || !riverLongitude) { setLoadingWeather(false); return; }
    let cancelled = false;
    async function load() {
      try {
        const res = await fetchOnce(`/api/river-weather/${riverId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.sections) setWeatherSections(data.sections);
      } catch {
        // silent — weather is best-effort
      } finally {
        if (!cancelled) setLoadingWeather(false);
      }
    }
    load();
    const interval = setInterval(load, 30 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [riverId, riverLatitude, riverLongitude]);

  if (loadingConditions && gauges.length === 0) {
    if (layout === "band") {
      return (
        <div aria-hidden>
          <div className="mb-5 h-8 w-48 bg-[var(--border-rule)]" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 border border-[var(--border-rule)] bg-[var(--surface-raised)]" />
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="animate-pulse rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)] p-6">
        <div className="mb-4 h-5 w-40 rounded bg-[var(--border-rule)]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded bg-[var(--border-rule)]" />
          ))}
        </div>
      </div>
    );
  }

  if (conditionsError || gauges.length === 0) {
    if (layout === "band") {
      return (
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
            On the water
          </h2>
          <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-[var(--text-body)]">
            {usgsSiteId
              ? missingInstantaneousCopy(riverName ?? "this river", usgsSiteId)
              : `No USGS instantaneous reading is available${riverName ? ` for ${riverName}` : ""}. Daily means, when present, are below. We do not guess a live flow.`}
          </p>
        </div>
      );
    }
    return null;
  }

  const active = gauges[selectedIdx] ?? gauges[0];
  const flow = active.discharge ? getFlowLabel(active.discharge.value) : null;
  const hasMultipleSections = gauges.length > 1;
  const weather = matchWeather(active.section, weatherSections);

  if (layout === "band") {
    return (
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
            On the water
          </h2>
          <span className="inline-flex items-center gap-1.5 border border-[var(--border-rule)] px-2.5 py-1 text-[11px] font-medium text-[var(--signal-live)]">
            <span className="inline-block h-1.5 w-1.5 bg-[var(--signal-live)]" />
            Live
          </span>
        </div>

        {hasMultipleSections && (
          <div
            className="mb-4 flex gap-1.5 overflow-x-auto pb-1"
            role="tablist"
            aria-label="River section"
          >
            {gauges.map((g, idx) => (
              <button
                key={g.siteId}
                type="button"
                role="tab"
                aria-selected={idx === selectedIdx}
                onClick={() => setSection(g.siteId)}
                className={`shrink-0 border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  idx === selectedIdx
                    ? "border-[var(--action)] bg-[var(--action)] text-[var(--on-action)]"
                    : "border-[var(--border-rule)] bg-[var(--surface-raised)] text-[var(--text-body)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                }`}
                style={{ borderRadius: "var(--radius-instrument)" }}
              >
                {g.section || g.siteName}
              </button>
            ))}
          </div>
        )}

        {active.stale && (
          <div className="mb-4 flex items-center gap-2 border border-[var(--border-rule)] bg-[var(--surface-raised)] p-2 text-xs text-[var(--action)]">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Reading may be delayed — last update {formatTimestamp(active.timestamp)}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {active.discharge && (
            <Metric
              icon={<Waves className="h-4 w-4 text-[var(--signal-live)]" />}
              label="Streamflow"
              value={`${active.discharge.value.toLocaleString()}`}
              unit="cfs"
              badge={flow?.label}
              badgeClass={flow?.color}
            />
          )}
          {active.gageHeight && (
            <Metric
              icon={<ArrowUpDown className="h-4 w-4 text-[var(--action)]" />}
              label="Gage height"
              value={`${active.gageHeight.value}`}
              unit="ft"
            />
          )}
          {active.waterTemp && (
            <Metric
              icon={<Thermometer className="h-4 w-4 text-[var(--signal-live)]" />}
              label="Water temp"
              value={`${active.waterTemp.valueFahrenheit}`}
              unit="°F"
            />
          )}
          {weather && (
            <Metric
              icon={<Wind className="h-4 w-4 text-[var(--signal-live)]" />}
              label={weather.weatherLabel}
              value={`${weather.tempF}`}
              unit={`°F · ${weather.windMph} mph ${weather.windDirectionLabel}`}
            />
          )}
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--text-meta)]">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {formatTimestamp(active.timestamp)} · USGS {active.siteId}
          </span>
          {weather ? (
            <span>Weather {formatTime(weather.fetchedAt)} · Open-Meteo</span>
          ) : null}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
          River Conditions
        </h3>
        <span className="flex items-center gap-1.5 rounded-chip bg-[var(--signal-live)]/10 px-2.5 py-1 text-[10px] font-medium text-[var(--signal-live)]">
          <span className="inline-block h-1.5 w-1.5 rounded-chip bg-[var(--signal-live)]" />
          Live
        </span>
      </div>

      {/* Shared section tabs — one click updates BOTH flows and weather */}
      {hasMultipleSections && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {gauges.map((g, idx) => (
            <button
              key={g.siteId}
              onClick={() => setSection(g.siteId)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors shrink-0 ${
                idx === selectedIdx
                  ? "bg-[var(--action)] text-white"
                  : "bg-[var(--surface-page)] text-[var(--text-body)] hover:text-[var(--text-primary)] hover:bg-[var(--border-rule)]"
              }`}
            >
              {g.section}
            </button>
          ))}
        </div>
      )}

      <>
          {/* Stale warning */}
          {active.stale && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-[var(--surface-raised)] rounded-lg text-xs text-[var(--action)]">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Reading may be delayed — last update {formatTimestamp(active.timestamp)}</span>
            </div>
          )}

          {/* ── USGS Flow metrics ── */}
          <div className="space-y-3">
            {active.discharge && (
              <div className="flex items-center justify-between p-3 bg-[var(--surface-page)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--signal-live)]/10 flex items-center justify-center">
                    <Waves className="h-4 w-4 text-[var(--signal-live)]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-meta)] font-medium uppercase tracking-wide">Streamflow</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {active.discharge.value.toLocaleString()}{" "}
                      <span className="text-[var(--text-meta)] font-normal">cfs</span>
                    </p>
                  </div>
                </div>
                {flow && <span className={`text-xs font-semibold ${flow.color}`}>{flow.label}</span>}
              </div>
            )}

            {active.gageHeight && (
              <div className="flex items-center justify-between p-3 bg-[var(--surface-page)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--action)]/10 flex items-center justify-center">
                    <ArrowUpDown className="h-4 w-4 text-[var(--action)]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-meta)] font-medium uppercase tracking-wide">Gage Height</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {active.gageHeight.value}{" "}
                      <span className="text-[var(--text-meta)] font-normal">ft</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {active.waterTemp && (
              <div className="flex items-center justify-between p-3 bg-[var(--surface-page)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-sm bg-[var(--signal-live)]/10 flex items-center justify-center">
                    <Thermometer className="h-4 w-4 text-[var(--signal-live)]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-meta)] font-medium uppercase tracking-wide">Water Temp</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {active.waterTemp.valueFahrenheit}°F{" "}
                      <span className="text-[var(--text-meta)] font-normal">/ {active.waterTemp.valueCelsius}°C</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Weather divider + metrics ── */}
          {weather && (
            <>
              <div className="flex items-center gap-3 my-4">
                <div className="h-px flex-1 bg-[var(--border-rule)]" />
                <span className="text-[10px] text-[var(--text-meta)] font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-base leading-none">{weather.weatherIcon}</span>
                  {weather.weatherLabel} · {weather.tempF}°F
                </span>
                <div className="h-px flex-1 bg-[var(--border-rule)]" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[var(--surface-page)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--signal-live)]/10 flex items-center justify-center">
                      <Thermometer className="h-4 w-4 text-[var(--signal-live)]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-meta)] font-medium uppercase tracking-wide">Air Temp</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {weather.tempF}°F{" "}
                        <span className="text-[var(--text-meta)] font-normal">feels like {weather.feelsLikeF}°F</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--surface-page)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--signal-live)]/10 flex items-center justify-center">
                      <Wind className="h-4 w-4 text-[var(--signal-live)]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-meta)] font-medium uppercase tracking-wide">Wind</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {weather.windMph}{" "}
                        <span className="text-[var(--text-meta)] font-normal">mph {weather.windDirectionLabel}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--surface-page)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--signal-live)]/10 flex items-center justify-center">
                      <Droplets className="h-4 w-4 text-[var(--signal-live)]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-meta)] font-medium uppercase tracking-wide">Humidity</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {weather.humidity}<span className="text-[var(--text-meta)] font-normal">%</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--surface-page)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--action)]/10 flex items-center justify-center">
                      <Gauge className="h-4 w-4 text-[var(--action)]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-meta)] font-medium uppercase tracking-wide">Barometric Pressure</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {weather.pressureInHg.toFixed(2)}{" "}
                        <span className="text-[var(--text-meta)] font-normal">inHg</span>
                        <span className="text-[var(--text-meta)] font-normal text-xs ml-1.5">({Math.round(weather.pressureHpa)} hPa)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[var(--text-meta)]">
                <Clock className="h-3 w-3" />
                <span>Weather updated {formatTime(weather.fetchedAt)} · Open-Meteo</span>
              </div>
            </>
          )}

          {/* USGS Footer */}
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--text-meta)]">
            <Clock className="h-3 w-3" />
            <span>{formatTimestamp(active.timestamp)} · USGS {active.siteId}</span>
          </div>
      </>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  unit,
  badge,
  badgeClass,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
  badge?: string;
  badgeClass?: string;
}) {
  return (
    <div className="border border-[var(--border-rule)] bg-[var(--surface-raised)] px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[var(--text-meta)]">
          {icon}
          <p className="text-[10px] font-medium uppercase tracking-wide">{label}</p>
        </div>
        {badge ? (
          <span className={`text-[11px] font-semibold ${badgeClass ?? ""}`}>{badge}</span>
        ) : null}
      </div>
      <p className="num text-2xl font-bold leading-none text-[var(--text-primary)]">
        {value}
        {unit ? (
          <span className="ml-1.5 text-[12px] font-normal text-[var(--text-meta)]">{unit}</span>
        ) : null}
      </p>
    </div>
  );
}
