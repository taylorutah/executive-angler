"use client";

import { useState, useEffect } from "react";
import { Target, TrendingUp, Thermometer, Waves, CloudSun } from "@/icons";
import { useAuth } from "@/lib/auth-context";
import { fetchOnce } from "./fetch-once";

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
  const { user, isLoading: authLoading } = useAuth();
  const [bestWindow, setBestWindow] = useState<BestWindow | null>(null);
  const [hatchCorrelation, setHatchCorrelation] = useState<HatchCorrelation[]>([]);
  const [currentFlow, setCurrentFlow] = useState<number | null>(null);
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The insights endpoint is owner-scoped; a guest would only earn a 401.
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    async function load() {
      try {
        const res = await fetchOnce(`/api/insights/river-conditions?riverId=${riverId}`);
        if (!res.ok) return;
        const data = await res.json();
        setBestWindow(data.bestWindow);
        setHatchCorrelation(data.hatchCorrelation || []);

        // Fetch current conditions
        const condRes = await fetchOnce(`/api/river-conditions/${riverId}`);
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
  }, [riverId, user, authLoading]);

  if (!user) return null;

  if (loading) return null;

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
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-5 w-5 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-[var(--text-1)]">Your Best Window</h3>
        </div>

        <p className="text-xs text-[var(--text-3)] mb-4">
          Based on your top sessions ({bestWindow.session_count} total):
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {bestWindow.flow_min !== null && bestWindow.flow_max !== null && (
            <div className="bg-[var(--paper-deep)] rounded-[var(--radius-md)] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Waves className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-3)]">Optimal Flow</span>
              </div>
              <p className="num text-sm font-semibold text-[var(--text-1)]">
                {bestWindow.flow_min}–{bestWindow.flow_max} cfs
              </p>
              {currentFlow !== null && (
                <p className={`num text-xs mt-0.5 ${flowInRange ? "font-semibold text-[var(--text-1)]" : "text-[var(--text-3)]"}`}>
                  Now: {currentFlow} cfs {flowInRange ? "in range" : "outside range"}
                </p>
              )}
            </div>
          )}

          {bestWindow.temp_min !== null && bestWindow.temp_max !== null && (
            <div className="bg-[var(--paper-deep)] rounded-[var(--radius-md)] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Thermometer className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-3)]">Optimal Temp</span>
              </div>
              <p className="num text-sm font-semibold text-[var(--text-1)]">
                {bestWindow.temp_min}–{bestWindow.temp_max}°F
              </p>
              {currentTemp !== null && (
                <p className={`num text-xs mt-0.5 ${tempInRange ? "font-semibold text-[var(--text-1)]" : "text-[var(--text-3)]"}`}>
                  Now: {currentTemp}°F {tempInRange ? "in range" : "outside range"}
                </p>
              )}
            </div>
          )}

          {bestWindow.best_fly && (
            <div className="bg-[var(--paper-deep)] rounded-[var(--radius-md)] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-3)]">Top Fly</span>
              </div>
              <p className="text-sm font-semibold text-[var(--text-1)] truncate">{bestWindow.best_fly}</p>
              <p className="num text-xs text-[var(--text-3)]">{bestWindow.avg_fish} fish/session avg</p>
            </div>
          )}

          {bestWindow.best_species && (
            <div className="bg-[var(--paper-deep)] rounded-[var(--radius-md)] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CloudSun className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--text-3)]">Primary Target</span>
              </div>
              <p className="text-sm font-semibold text-[var(--text-1)] truncate">{bestWindow.best_species}</p>
            </div>
          )}
        </div>

        {/* GO NOW signal */}
        {goSignal && (
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper-deep)] p-3 text-center">
            <p className="text-sm font-semibold text-[var(--text-1)]">
              Conditions match your best sessions
            </p>
          </div>
        )}
        {partialSignal && (
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper-deep)] p-3 text-center">
            <p className="text-sm font-medium text-[var(--text-2)]">
              Partially within your optimal range
            </p>
          </div>
        )}
      </div>

      {/* Fly Performance — actual catch counts per canonical fly */}
      {hatchCorrelation.length > 0 && (
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-1)] mb-1">Your Fly Performance</h3>
          <p className="text-xs text-[var(--text-3)] mb-3">
            Real catch counts per fly across your sessions on this river.
          </p>
          <div className="space-y-2">
            {hatchCorrelation.slice(0, 5).map((h) => (
              <div key={h.fly_name} className="flex items-center justify-between py-1.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[var(--text-1)] truncate">{h.fly_name}</p>
                  <p className="text-xs text-[var(--text-3)]">
                    {h.months.slice(0, 4).join(", ")}
                    {h.months.length > 4 ? "…" : ""}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="num text-xs font-semibold text-[var(--accent)]">
                    {h.catch_count} {h.catch_count === 1 ? "catch" : "catches"}
                  </p>
                  <p className="num text-xs text-[var(--text-3)]">
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
