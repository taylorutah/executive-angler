"use client";

import { useEffect, useState } from "react";
import {
  Waves, Thermometer, ArrowUpDown, Clock, AlertTriangle,
  Lock, Smartphone, Wind, Droplets, Gauge
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  if (cfs < 100) return { label: "Low", color: "text-amber-400" };
  if (cfs < 500) return { label: "Normal", color: "text-emerald-400" };
  if (cfs < 2000) return { label: "Moderate", color: "text-blue-400" };
  if (cfs < 5000) return { label: "High", color: "text-orange-400" };
  return { label: "Flood Stage", color: "text-red-400" };
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
  riverLatitude?: number | null;
  riverLongitude?: number | null;
  onSectionChange?: (siteId: string, section: string) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function RiverConditionsCard({ riverId, riverLatitude, riverLongitude, onSectionChange }: Props) {
  const [gauges, setGauges] = useState<GaugeReading[]>([]);
  const [weatherSections, setWeatherSections] = useState<WeatherSection[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loadingConditions, setLoadingConditions] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [conditionsError, setConditionsError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Auth check
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsAuthenticated(!!data.user));
  }, []);

  // Fetch USGS conditions
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/river-conditions/${riverId}`);
        if (!res.ok) { setConditionsError(true); return; }
        const data = await res.json();
        if (!cancelled && data.gauges) {
          setGauges(data.gauges);
          if (data.gauges.length > 0) {
            onSectionChange?.(data.gauges[0].siteId, data.gauges[0].section);
          }
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
        const res = await fetch(`/api/river-weather/${riverId}`);
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

  const loading = loadingConditions || loadingWeather || isAuthenticated === null;

  if (loading) {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm animate-pulse">
        <div className="h-5 w-40 bg-[#21262D] rounded mb-4" />
        <div className="flex gap-2 mb-4">
          <div className="h-8 w-28 bg-[#21262D] rounded-lg" />
          <div className="h-8 w-24 bg-[#21262D] rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-[#21262D] rounded" />)}
        </div>
      </div>
    );
  }

  if (conditionsError || gauges.length === 0) return null;

  const active = gauges[selectedIdx] ?? gauges[0];
  const flow = active.discharge ? getFlowLabel(active.discharge.value) : null;
  const hasMultipleSections = gauges.length > 1;
  const weather = matchWeather(active.section, weatherSections);
  const showLiveData = isAuthenticated;

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-[#E8923A]">
          River Conditions
        </h3>
        {showLiveData ? (
          <span className="flex items-center gap-1.5 text-[10px] text-[#00B4D8] bg-[#00B4D8]/10 px-2.5 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse inline-block" />
            Live
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] text-[#E8923A] bg-[#E8923A]/10 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide">
            <Lock className="w-2.5 h-2.5" />
            Pro
          </span>
        )}
      </div>

      {/* Shared section tabs — one click updates BOTH flows and weather */}
      {hasMultipleSections && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {gauges.map((g, idx) => (
            <button
              key={g.siteId}
              onClick={() => { setSelectedIdx(idx); onSectionChange?.(g.siteId, g.section); }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors shrink-0 ${
                idx === selectedIdx
                  ? "bg-[#E8923A] text-white"
                  : "bg-[#0D1117] text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#21262D]"
              }`}
            >
              {g.section}
            </button>
          ))}
        </div>
      )}

      {showLiveData ? (
        <>
          {/* Stale warning */}
          {active.stale && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-amber-500/10 rounded-lg text-xs text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Reading may be delayed — last update {formatTimestamp(active.timestamp)}</span>
            </div>
          )}

          {/* ── USGS Flow metrics ── */}
          <div className="space-y-3">
            {active.discharge && (
              <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Waves className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6E7681] font-medium uppercase tracking-wide">Streamflow</p>
                    <p className="text-sm font-semibold text-[#F0F6FC]">
                      {active.discharge.value.toLocaleString()}{" "}
                      <span className="text-[#6E7681] font-normal">cfs</span>
                    </p>
                  </div>
                </div>
                {flow && <span className={`text-xs font-semibold ${flow.color}`}>{flow.label}</span>}
              </div>
            )}

            {active.gageHeight && (
              <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E8923A]/10 flex items-center justify-center">
                    <ArrowUpDown className="h-4 w-4 text-[#E8923A]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6E7681] font-medium uppercase tracking-wide">Gage Height</p>
                    <p className="text-sm font-semibold text-[#F0F6FC]">
                      {active.gageHeight.value}{" "}
                      <span className="text-[#6E7681] font-normal">ft</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {active.waterTemp && (
              <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Thermometer className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6E7681] font-medium uppercase tracking-wide">Water Temp</p>
                    <p className="text-sm font-semibold text-[#F0F6FC]">
                      {active.waterTemp.valueFahrenheit}°F{" "}
                      <span className="text-[#6E7681] font-normal">/ {active.waterTemp.valueCelsius}°C</span>
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
                <div className="h-px flex-1 bg-[#21262D]" />
                <span className="text-[10px] text-[#6E7681] font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-base leading-none">{weather.weatherIcon}</span>
                  {weather.weatherLabel} · {weather.tempF}°F
                </span>
                <div className="h-px flex-1 bg-[#21262D]" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center">
                      <Thermometer className="h-4 w-4 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6E7681] font-medium uppercase tracking-wide">Air Temp</p>
                      <p className="text-sm font-semibold text-[#F0F6FC]">
                        {weather.tempF}°F{" "}
                        <span className="text-[#6E7681] font-normal">feels like {weather.feelsLikeF}°F</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Wind className="h-4 w-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6E7681] font-medium uppercase tracking-wide">Wind</p>
                      <p className="text-sm font-semibold text-[#F0F6FC]">
                        {weather.windMph}{" "}
                        <span className="text-[#6E7681] font-normal">mph {weather.windDirectionLabel}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center">
                      <Droplets className="h-4 w-4 text-teal-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6E7681] font-medium uppercase tracking-wide">Humidity</p>
                      <p className="text-sm font-semibold text-[#F0F6FC]">
                        {weather.humidity}<span className="text-[#6E7681] font-normal">%</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Gauge className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#6E7681] font-medium uppercase tracking-wide">Barometric Pressure</p>
                      <p className="text-sm font-semibold text-[#F0F6FC]">
                        {weather.pressureInHg.toFixed(2)}{" "}
                        <span className="text-[#6E7681] font-normal">inHg</span>
                        <span className="text-[#6E7681] font-normal text-xs ml-1.5">({Math.round(weather.pressureHpa)} hPa)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#6E7681]">
                <Clock className="h-3 w-3" />
                <span>Weather updated {formatTime(weather.fetchedAt)} · Open-Meteo</span>
              </div>
            </>
          )}

          {/* USGS Footer */}
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#6E7681]">
            <Clock className="h-3 w-3" />
            <span>{formatTimestamp(active.timestamp)} · USGS {active.siteId}</span>
          </div>
        </>
      ) : (
        <>
          {/* Blurred teaser */}
          <div className="space-y-3 relative">
            <div className="blur-[6px] select-none pointer-events-none space-y-3">
              {[
                { icon: <Waves className="h-4 w-4 text-blue-400" />, bg: "bg-blue-500/10", label: "Streamflow", value: active.discharge ? `${active.discharge.value.toLocaleString()} cfs` : "--- cfs", badge: "Normal" },
                { icon: <ArrowUpDown className="h-4 w-4 text-[#E8923A]" />, bg: "bg-[#E8923A]/10", label: "Gage Height", value: active.gageHeight ? `${active.gageHeight.value} ft` : "-.-- ft" },
                { icon: <Thermometer className="h-4 w-4 text-emerald-400" />, bg: "bg-emerald-500/10", label: "Water Temp", value: active.waterTemp ? `${active.waterTemp.valueFahrenheit}°F` : "--°F" },
                { icon: <Thermometer className="h-4 w-4 text-sky-400" />, bg: "bg-sky-500/10", label: "Air Temp", value: "62°F feels like 58°F" },
                { icon: <Gauge className="h-4 w-4 text-amber-400" />, bg: "bg-amber-500/10", label: "Barometric Pressure", value: "29.94 inHg" },
              ].map(({ icon, bg, label, value, badge }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
                    <div>
                      <p className="text-[10px] text-[#6E7681] font-medium uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-semibold text-[#F0F6FC]">{value}</p>
                    </div>
                  </div>
                  {badge && <span className="text-xs font-semibold text-emerald-400">{badge}</span>}
                </div>
              ))}
            </div>
          </div>

          <a
            href="https://apps.apple.com/app/executive-angler/id6745498032"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#E8923A] hover:bg-[#F0A65A] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Smartphone className="h-4 w-4" />
            Unlock with Pro
          </a>
          <p className="mt-2 text-center text-[10px] text-[#6E7681]">
            Live flow, gage height, water temp, weather &amp; barometric pressure
          </p>
        </>
      )}
    </div>
  );
}
