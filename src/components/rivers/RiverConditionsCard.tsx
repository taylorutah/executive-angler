"use client";

import { useEffect, useState } from "react";
import { Waves, Thermometer, ArrowUpDown, Clock, AlertTriangle, Lock, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function getFlowLabel(cfs: number): { label: string; color: string } {
  if (cfs < 100) return { label: "Low", color: "text-amber-400" };
  if (cfs < 500) return { label: "Normal", color: "text-emerald-400" };
  if (cfs < 2000) return { label: "Moderate", color: "text-blue-400" };
  if (cfs < 5000) return { label: "High", color: "text-orange-400" };
  return { label: "Flood Stage", color: "text-red-400" };
}

export default function RiverConditionsCard({ riverId }: { riverId: string }) {
  const [gauges, setGauges] = useState<GaugeReading[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check auth state
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/river-conditions/${riverId}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        if (!cancelled && data.gauges) {
          setGauges(data.gauges);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [riverId]);

  if (loading || isAuthenticated === null) {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm animate-pulse">
        <div className="h-5 w-36 bg-[#21262D] rounded mb-4" />
        <div className="space-y-3">
          <div className="h-12 bg-[#21262D] rounded" />
          <div className="h-12 bg-[#21262D] rounded" />
          <div className="h-12 bg-[#21262D] rounded" />
        </div>
      </div>
    );
  }

  if (error || gauges.length === 0) return null;

  const active = gauges[selectedIdx] ?? gauges[0];
  const flow = active.discharge ? getFlowLabel(active.discharge.value) : null;
  const hasMultiple = gauges.length > 1;

  // Authenticated users see live data; anonymous visitors see blurred teaser
  const showLiveData = isAuthenticated;

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
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

      {/* Section tabs */}
      {hasMultiple && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {gauges.map((g, idx) => (
            <button
              key={g.siteId}
              onClick={() => setSelectedIdx(idx)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors shrink-0 ${
                idx === selectedIdx
                  ? "bg-[#E8923A] text-white"
                  : "bg-[#0D1117] text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D]"
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

          {/* Live metrics */}
          <div className="space-y-3">
            {active.discharge && (
              <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Waves className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#484F58] font-medium uppercase tracking-wide">
                      Streamflow
                    </p>
                    <p className="text-sm font-semibold text-[#F0F6FC]">
                      {active.discharge.value.toLocaleString()}{" "}
                      <span className="text-[#484F58] font-normal">cfs</span>
                    </p>
                  </div>
                </div>
                {flow && (
                  <span className={`text-xs font-semibold ${flow.color}`}>
                    {flow.label}
                  </span>
                )}
              </div>
            )}

            {active.gageHeight && (
              <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E8923A]/10 flex items-center justify-center">
                    <ArrowUpDown className="h-4 w-4 text-[#E8923A]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#484F58] font-medium uppercase tracking-wide">
                      Gage Height
                    </p>
                    <p className="text-sm font-semibold text-[#F0F6FC]">
                      {active.gageHeight.value}{" "}
                      <span className="text-[#484F58] font-normal">ft</span>
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
                    <p className="text-[10px] text-[#484F58] font-medium uppercase tracking-wide">
                      Water Temp
                    </p>
                    <p className="text-sm font-semibold text-[#F0F6FC]">
                      {active.waterTemp.valueFahrenheit}°F{" "}
                      <span className="text-[#484F58] font-normal">
                        / {active.waterTemp.valueCelsius}°C
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-[#484F58]">
            <Clock className="h-3 w-3" />
            <span>
              {formatTimestamp(active.timestamp)} &middot; USGS {active.siteId}
            </span>
          </div>
        </>
      ) : (
        <>
          {/* Blurred teaser for anonymous visitors */}
          <div className="space-y-3 relative">
            <div className="blur-[6px] select-none pointer-events-none">
              <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Waves className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#484F58] font-medium uppercase tracking-wide">Streamflow</p>
                    <p className="text-sm font-semibold text-[#F0F6FC]">
                      {active.discharge ? `${active.discharge.value.toLocaleString()} cfs` : "--- cfs"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-400">Normal</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E8923A]/10 flex items-center justify-center">
                    <ArrowUpDown className="h-4 w-4 text-[#E8923A]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#484F58] font-medium uppercase tracking-wide">Gage Height</p>
                    <p className="text-sm font-semibold text-[#F0F6FC]">
                      {active.gageHeight ? `${active.gageHeight.value} ft` : "-.-- ft"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Thermometer className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#484F58] font-medium uppercase tracking-wide">Water Temp</p>
                    <p className="text-sm font-semibold text-[#F0F6FC]">
                      {active.waterTemp ? `${active.waterTemp.valueFahrenheit}°F` : "--°F"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade CTA */}
          <a
            href="https://apps.apple.com/app/executive-angler/id6745498032"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#E8923A] hover:bg-[#F0A65A] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Smartphone className="h-4 w-4" />
            Unlock with Pro
          </a>
          <p className="mt-2 text-center text-[10px] text-[#484F58]">
            Live USGS flow, gage height &amp; water temp — updated every 15 min
          </p>
        </>
      )}
    </div>
  );
}
