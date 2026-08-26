"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AreaChart, Area, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts";
import { GripVertical, MoreHorizontal, Droplets, Thermometer, Wind, ChevronRight, AlertTriangle } from "lucide-react";
import { COPPER_400 } from "@/lib/palette";

export interface GaugeChoice {
  site_id: string;
  name: string;
  section: string;
}

interface ConditionsResponse {
  gauges: Array<{
    siteId: string;
    siteName: string;
    section: string;
    timestamp: string;
    discharge?: { value: number; unit: string };
    gageHeight?: { value: number; unit: string };
    waterTemp?: { valueCelsius: number; valueFahrenheit: number; unit: string };
    stale: boolean;
  }>;
}

interface WeatherResponse {
  sections: Array<{
    section: string;
    weather: {
      tempF: number;
      windMph: number;
      windDirectionLabel: string;
      weatherIcon: string;
      weatherLabel: string;
    };
  }>;
}

interface HistoryResponse {
  readings: Array<{ date: string; discharge: number }>;
}

interface Props {
  riverId: string;
  riverName: string;
  riverSlug: string;
  siteId: string;
  sectionName: string;
  hatchNow?: string[];
  mode: "favorite" | "yours";
  // Favorite-mode props
  favoriteId?: string;
  dragListeners?: Record<string, unknown>;
  dragAttributes?: Record<string, unknown>;
  onRemove?: () => void;
  // Yours-mode props
  gauges?: GaugeChoice[];
  onChangeGauge?: (siteId: string) => void;
}

function trendArrow(current: number, weekMedian: number): string {
  const diff = ((current - weekMedian) / Math.max(weekMedian, 1)) * 100;
  if (diff > 8) return "↑";
  if (diff < -8) return "↓";
  return "→";
}

function tempColor(f: number | undefined): string {
  if (f == null) return "text-[var(--text-body)]";
  if (f < 45) return "text-[var(--signal-live)]";
  if (f < 60) return "text-[#7BD9C2]";
  if (f < 68) return "text-[#90EE90]";
  if (f < 72) return "text-[var(--action)]";
  return "text-[#E5484D]";
}

export default function RiverSectionCard(props: Props) {
  const {
    riverId, riverName, riverSlug, siteId, sectionName, hatchNow,
    mode, favoriteId, dragListeners, dragAttributes, onRemove,
    gauges, onChangeGauge,
  } = props;

  const [conditions, setConditions] = useState<ConditionsResponse["gauges"][number] | null>(null);
  const [weather, setWeather] = useState<WeatherResponse["sections"][number]["weather"] | null>(null);
  const [history, setHistory] = useState<HistoryResponse["readings"]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetch(`/api/river-conditions/${riverId}`).then((r) => r.ok ? r.json() as Promise<ConditionsResponse> : null),
      fetch(`/api/river-weather/${riverId}`).then((r) => r.ok ? r.json() as Promise<WeatherResponse> : null),
      fetch(`/api/river-history/${riverId}?siteId=${siteId}`).then((r) => r.ok ? r.json() as Promise<HistoryResponse> : null),
    ]).then(([condRes, weatherRes, histRes]) => {
      if (cancelled) return;
      const gauge = condRes?.gauges?.find((g) => g.siteId === siteId) ?? null;
      setConditions(gauge);
      const wSection = weatherRes?.sections?.find((s) => s.section === sectionName)
        ?? weatherRes?.sections?.[0];
      setWeather(wSection?.weather ?? null);
      setHistory(histRes?.readings ?? []);
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [riverId, siteId, sectionName]);

  const sparklineData = useMemo(() => {
    if (history.length <= 90) return history;
    const step = Math.ceil(history.length / 90);
    return history.filter((_, i) => i % step === 0 || i === history.length - 1);
  }, [history]);

  const weekMedian = useMemo(() => {
    if (history.length < 7) return conditions?.discharge?.value ?? 0;
    const last7 = history.slice(-7).map((r) => r.discharge).sort((a, b) => a - b);
    return last7[Math.floor(last7.length / 2)];
  }, [history, conditions]);

  const yearMin = useMemo(() => history.length > 0 ? Math.min(...history.map((r) => r.discharge)) : 0, [history]);
  const yearMax = useMemo(() => history.length > 0 ? Math.max(...history.map((r) => r.discharge)) : 0, [history]);

  const currentFlow = conditions?.discharge?.value;
  const flowArrow = currentFlow != null ? trendArrow(currentFlow, weekMedian) : "";
  const waterTempF = conditions?.waterTemp?.valueFahrenheit;

  return (
    <div className="rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-rule)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-[var(--border-rule)]/60">
        {mode === "favorite" && (
          <button
            type="button"
            className="text-[var(--text-meta)] hover:text-[var(--text-body)] cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag to reorder"
            {...dragAttributes}
            {...dragListeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-[var(--text-meta)] tracking-[0.16em] uppercase truncate">
            {riverName}
          </p>
          {mode === "yours" && gauges && gauges.length > 1 ? (
            <select
              className="bg-transparent text-[var(--text-primary)] font-medium text-sm focus:outline-none cursor-pointer hover:text-[var(--action)]"
              value={siteId}
              onChange={(e) => onChangeGauge?.(e.target.value)}
            >
              {gauges.map((g) => (
                <option key={g.site_id} value={g.site_id} className="bg-[var(--surface-raised)]">
                  {g.section} · {g.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-[var(--text-primary)] font-medium text-sm truncate">{sectionName}</p>
          )}
        </div>
        {conditions?.stale && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
            <AlertTriangle className="h-2.5 w-2.5" /> stale
          </span>
        )}
        {mode === "favorite" && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((s) => !s)}
              className="p-1 rounded hover:bg-[var(--border-rule)] text-[var(--text-body)]"
              aria-label="Menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 rounded-lg bg-[var(--surface-page)] border border-[var(--border-rule)] shadow-xl z-10 py-1 text-sm">
                <button
                  type="button"
                  onClick={() => { setShowMenu(false); onRemove?.(); }}
                  className="block w-full text-left px-3 py-1.5 text-[#E5484D] hover:bg-[var(--border-rule)]"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live strip */}
      <div className="grid grid-cols-3 divide-x divide-[#21262D]/60">
        <div className="px-3 py-3 min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-meta)] tracking-wider uppercase">
            <Droplets className="h-3 w-3" /> Flow
          </div>
          <p className="font-mono text-lg font-bold text-[var(--text-primary)] tabular-nums truncate">
            {currentFlow != null ? `${currentFlow.toLocaleString()}` : "—"}
            <span className="text-xs text-[var(--text-body)] font-normal ml-1">cfs</span>
            {currentFlow != null && (
              <span className="text-xs text-[var(--text-body)] ml-1">{flowArrow}</span>
            )}
          </p>
        </div>
        <div className="px-3 py-3 min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-meta)] tracking-wider uppercase">
            <Thermometer className="h-3 w-3" /> Water
          </div>
          <p className={`font-mono text-lg font-bold tabular-nums truncate ${tempColor(waterTempF)}`}>
            {waterTempF != null ? `${waterTempF}°` : "—"}
          </p>
        </div>
        <div className="px-3 py-3 min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-meta)] tracking-wider uppercase">
            <Wind className="h-3 w-3" /> Air
          </div>
          <p className="font-mono text-lg font-bold text-[var(--text-primary)] tabular-nums truncate">
            {weather ? (
              <>
                <span>{weather.weatherIcon}</span>{" "}
                <span>{weather.tempF}°</span>
              </>
            ) : "—"}
          </p>
          {weather && (
            <p className="text-[10px] text-[var(--text-meta)] truncate">
              {weather.windMph} mph {weather.windDirectionLabel}
            </p>
          )}
        </div>
      </div>

      {/* Hatch chip */}
      {hatchNow && hatchNow.length > 0 && (
        <div className="px-4 pt-2 pb-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--signal-live)]/10 border border-[var(--signal-live)]/30 px-2 py-0.5">
            <span className="text-[9px] font-bold text-[var(--signal-live)] tracking-wider uppercase">Hatching</span>
            <span className="text-[11px] text-[var(--text-primary)]">{hatchNow.slice(0, 2).join(" · ")}</span>
          </div>
        </div>
      )}

      {/* Sparkline */}
      <div className="px-2 pt-1 pb-2 h-[80px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-[10px] text-[var(--text-meta)]">
            Loading 12-month flow…
          </div>
        ) : sparklineData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${siteId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0BA5C7" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#0BA5C7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={[0, "dataMax"]} />
              <Tooltip
                contentStyle={{ background: "#0D1117", border: "1px solid #21262D", borderRadius: 8, fontSize: 11 }}
                labelFormatter={(v) => new Date(v + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                formatter={(v) => [`${Number(v).toLocaleString()} cfs`, "Flow"]}
              />
              {currentFlow != null && (
                <ReferenceLine y={currentFlow} stroke={COPPER_400} strokeDasharray="3 3" strokeWidth={1} />
              )}
              <Area
                type="monotone"
                dataKey="discharge"
                stroke="#0BA5C7"
                strokeWidth={1.5}
                fill={`url(#spark-${siteId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-[10px] text-[var(--text-meta)]">
            No history available
          </div>
        )}
      </div>

      {/* Year range + footer link */}
      <div className="px-4 pb-3 flex items-center justify-between text-[10px] text-[var(--text-meta)] gap-2">
        <span className="font-mono tabular-nums">
          12mo: {yearMin > 0 ? `${Math.round(yearMin).toLocaleString()}–${Math.round(yearMax).toLocaleString()}` : "—"} cfs
        </span>
        <Link
          href={`/rivers/${riverSlug}`}
          className="inline-flex items-center gap-0.5 text-[var(--text-body)] hover:text-[var(--action)]"
        >
          Open <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      {/* unused-prop kept to silence lints if favoriteId not used */}
      <span className="hidden" data-fav-id={favoriteId} />
    </div>
  );
}
