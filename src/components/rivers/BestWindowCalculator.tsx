"use client";

import { useState, useEffect } from "react";
import { Target, Loader2, TrendingUp, Thermometer, Waves, CloudSun } from "lucide-react";

interface BestWindow {
  flow_min: number | null;
  flow_max: number | null;
  temp_min: number | null;
  temp_max: number | null;
  best_fly: string | null;
  best_species: string | null;
  avg_fish: number;
  session_count: number;
  sessions_with_flow: number;
  sessions_with_temp: number;
}

interface HatchCorrelation {
  fly_name: string;
  months: string[];
  pct_of_catches: number;
  catch_count: number;
  session_count: number;
  last_caught: string | null;
  avg_fish_per_session: number;
}

interface Props {
  riverId: string;
}

export default function BestWindowCalculator({ riverId }: Props) {
  const [bestWindow, setBestWindow] = useState<BestWindow | null>(null);
  const [hatchCorrelation, setHatchCorrelation] = useState<HatchCorrelation[]>([]);
  const [currentFlow, setCurrentFlow] = useState<number | null>(null);
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState<"loading" | "none" | "ready">("loading");

  useEffect(() => {
    async function load() {
      try {
        // Fetch insights
        const res = await fetch(`/api/insights/river-conditions?riverId=${riverId}`);
        if (res.status === 401) { setAuthState("none"); return; }
        if (!res.ok) return;
        setAuthState("ready");
        const data = await res.json();
        setBestWindow(data.bestWindow);
        setHatchCorrelation(data.hatchCorrelation || []);

        // Fetch current conditions
        const condRes = await fetch(`/api/river-conditions/${riverId}`);
        if (condRes.ok) {
          const condData = await condRes.json();
          const gauge = condData.gauges?.[0];
          if (gauge) {
            if (gauge.discharge?.value) setCurrentFlow(gauge.discharge.value);
            if (gauge.waterTemp?.valueFahrenheit) setCurrentTemp(gauge.waterTemp.valueFahrenheit);
          }
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [riverId]);

  if (loading) {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-6">
        <div className="flex items-center gap-2 text-[#6E7681]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Calculating your best window...</span>
        </div>
      </div>
    );
  }

  if (authState === "none") return null;

  if (!bestWindow || bestWindow.session_count < 3) return null;

  // Determine "go now" signal
  const flowInRange = currentFlow !== null && bestWindow.flow_min !== null && bestWindow.flow_max !== null
    ? currentFlow >= bestWindow.flow_min && currentFlow <= bestWindow.flow_max
    : null;
  const tempInRange = currentTemp !== null && bestWindow.temp_min !== null && bestWindow.temp_max !== null
    ? currentTemp >= bestWindow.temp_min && currentTemp <= bestWindow.temp_max
    : null;

  const signalCount = [flowInRange, tempInRange].filter((v) => v === true).length;
  const totalChecks = [flowInRange, tempInRange].filter((v) => v !== null).length;
  const goSignal = totalChecks > 0 && signalCount === totalChecks;
  const partialSignal = totalChecks > 0 && signalCount > 0 && !goSignal;

  return (
    <div className="space-y-4">
      {/* Best Window Card */}
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-5 w-5 text-[#E8923A]" />
          <h3 className="text-sm font-bold text-[#F0F6FC]">Your Best Window</h3>
          <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">PRO</span>
        </div>

        <p className="text-xs text-[#6E7681] mb-4">
          Based on your top sessions ({bestWindow.session_count} total):
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {bestWindow.flow_min !== null && bestWindow.flow_max !== null && (
            <div className="bg-[#0D1117] rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Waves className="h-3.5 w-3.5 text-[#00B4D8]" />
                <span className="text-[10px] text-[#6E7681]">Optimal Flow</span>
              </div>
              <p className="text-sm font-bold text-[#F0F6FC]">
                {bestWindow.flow_min}–{bestWindow.flow_max} cfs
              </p>
              {currentFlow !== null && (
                <p className={`text-[10px] mt-0.5 ${flowInRange ? "text-green-400" : "text-amber-400"}`}>
                  Now: {currentFlow} cfs {flowInRange ? "✓" : ""}
                </p>
              )}
            </div>
          )}

          {bestWindow.temp_min !== null && bestWindow.temp_max !== null && (
            <div className="bg-[#0D1117] rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Thermometer className="h-3.5 w-3.5 text-red-400" />
                <span className="text-[10px] text-[#6E7681]">Optimal Temp</span>
              </div>
              <p className="text-sm font-bold text-[#F0F6FC]">
                {bestWindow.temp_min}–{bestWindow.temp_max}°F
              </p>
              {currentTemp !== null && (
                <p className={`text-[10px] mt-0.5 ${tempInRange ? "text-green-400" : "text-amber-400"}`}>
                  Now: {currentTemp}°F {tempInRange ? "✓" : ""}
                </p>
              )}
            </div>
          )}

          {bestWindow.best_fly && (
            <div className="bg-[#0D1117] rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-[#E8923A]" />
                <span className="text-[10px] text-[#6E7681]">Top Fly</span>
              </div>
              <p className="text-sm font-bold text-[#F0F6FC] truncate">{bestWindow.best_fly}</p>
              <p className="text-[10px] text-[#6E7681]">{bestWindow.avg_fish} fish/session avg</p>
            </div>
          )}

          {bestWindow.best_species && (
            <div className="bg-[#0D1117] rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CloudSun className="h-3.5 w-3.5 text-green-400" />
                <span className="text-[10px] text-[#6E7681]">Primary Target</span>
              </div>
              <p className="text-sm font-bold text-[#F0F6FC] truncate">{bestWindow.best_species}</p>
            </div>
          )}
        </div>

        {/* GO NOW signal */}
        {goSignal && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-sm font-bold text-green-400">
              Conditions match your best sessions — GO NOW
            </p>
          </div>
        )}
        {partialSignal && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-amber-400">
              Partially within your optimal range
            </p>
          </div>
        )}
      </div>

      {/* Fly Performance — actual catch counts per canonical fly */}
      {hatchCorrelation.length > 0 && (
        <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
          <h3 className="text-sm font-bold text-[#F0F6FC] mb-1">Your Fly Performance</h3>
          <p className="text-[10px] text-[#6E7681] mb-3">
            Real catch counts per fly across your sessions on this river.
          </p>
          <div className="space-y-2">
            {hatchCorrelation.slice(0, 5).map((h) => (
              <div key={h.fly_name} className="flex items-center justify-between py-1.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#F0F6FC] truncate">{h.fly_name}</p>
                  <p className="text-[10px] text-[#6E7681]">
                    {h.months.slice(0, 4).join(", ")}
                    {h.months.length > 4 ? "…" : ""}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-bold text-[#E8923A]">
                    {h.catch_count} {h.catch_count === 1 ? "catch" : "catches"}
                  </p>
                  <p className="text-[10px] text-[#6E7681]">
                    {h.pct_of_catches}% · {h.session_count}{" "}
                    {h.session_count === 1 ? "session" : "sessions"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
