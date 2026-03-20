"use client";

import { useEffect, useState } from "react";
import { Waves, Thermometer, ArrowUpDown, Clock, AlertTriangle } from "lucide-react";

interface USGSConditions {
  siteId: string;
  siteName: string;
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
  const [conditions, setConditions] = useState<USGSConditions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        if (!cancelled) setConditions(data);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    // Refresh every 15 minutes
    const interval = setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [riverId]);

  if (loading) {
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

  if (error || !conditions) return null; // No gauge configured — hide gracefully

  const flow = conditions.discharge
    ? getFlowLabel(conditions.discharge.value)
    : null;

  return (
    <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-[#E8923A]">
          River Conditions
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] text-[#00B4D8] bg-[#00B4D8]/10 px-2.5 py-1 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00B4D8] animate-pulse inline-block" />
          Live
        </span>
      </div>

      {conditions.stale && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-amber-500/10 rounded-lg text-xs text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Reading may be delayed — last update {formatTimestamp(conditions.timestamp)}</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Discharge / Flow */}
        {conditions.discharge && (
          <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Waves className="h-4.5 w-4.5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-[#484F58] font-medium uppercase tracking-wide">
                  Streamflow
                </p>
                <p className="text-sm font-semibold text-[#F0F6FC]">
                  {conditions.discharge.value.toLocaleString()}{" "}
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

        {/* Gage Height */}
        {conditions.gageHeight && (
          <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E8923A]/10 flex items-center justify-center">
                <ArrowUpDown className="h-4.5 w-4.5 text-[#E8923A]" />
              </div>
              <div>
                <p className="text-xs text-[#484F58] font-medium uppercase tracking-wide">
                  Gage Height
                </p>
                <p className="text-sm font-semibold text-[#F0F6FC]">
                  {conditions.gageHeight.value}{" "}
                  <span className="text-[#484F58] font-normal">ft</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Water Temperature */}
        {conditions.waterTemp && (
          <div className="flex items-center justify-between p-3 bg-[#0D1117] rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Thermometer className="h-4.5 w-4.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-[#484F58] font-medium uppercase tracking-wide">
                  Water Temp
                </p>
                <p className="text-sm font-semibold text-[#F0F6FC]">
                  {conditions.waterTemp.valueFahrenheit}°F{" "}
                  <span className="text-[#484F58] font-normal">
                    / {conditions.waterTemp.valueCelsius}°C
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
          {formatTimestamp(conditions.timestamp)} &middot; {conditions.source}
        </span>
      </div>
    </div>
  );
}
