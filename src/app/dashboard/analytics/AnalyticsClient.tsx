"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3, Fish, MapPin, TrendingUp, Calendar, ChevronLeft,
  Flame, Target, Feather
} from "lucide-react";

interface Session {
  id: string;
  date: string;
  river_name: string | null;
  total_fish: number | null;
  weather: string | null;
  water_temp_f: number | null;
  water_clarity: string | null;
  notes: string | null;
  section: string | null;
}

interface Catch {
  id: string;
  session_id: string;
  species: string | null;
  length_inches: number | null;
  fly_pattern_id: string | null;
  fly_size: string | null;
  time_caught: string | null;
  flyPatternName: string | null;
}

type TimeRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

export default function AnalyticsClient({
  sessions,
  catches,
}: {
  sessions: Session[];
  catches: Catch[];
}) {
  const [range, setRange] = useState<TimeRange>("3M");

  const cutoffDate = useMemo(() => {
    if (range === "ALL") return null;
    const d = new Date();
    const months = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 }[range];
    d.setMonth(d.getMonth() - months);
    return d;
  }, [range]);

  const filteredSessions = useMemo(() => {
    if (!cutoffDate) return sessions;
    return sessions.filter(s => new Date(s.date + "T12:00:00") >= cutoffDate);
  }, [sessions, cutoffDate]);

  const filteredSessionIds = useMemo(() => new Set(filteredSessions.map(s => s.id)), [filteredSessions]);
  const filteredCatches = useMemo(() => catches.filter(c => filteredSessionIds.has(c.session_id)), [catches, filteredSessionIds]);

  // Stats
  const totalSessions = filteredSessions.length;
  const totalFish = filteredSessions.reduce((sum, s) => sum + (s.total_fish || 0), 0);
  const avgPerSession = totalSessions > 0 ? (totalFish / totalSessions).toFixed(1) : "0";
  const bestSession = filteredSessions.reduce((best, s) => (s.total_fish || 0) > (best?.total_fish || 0) ? s : best, null as Session | null);
  const lengths = filteredCatches.map(c => c.length_inches).filter((l): l is number => l != null && l > 0);
  const biggestFish = lengths.length > 0 ? Math.max(...lengths) : 0;

  // Species breakdown
  const speciesData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredCatches.forEach(c => { if (c.species) map[c.species] = (map[c.species] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [filteredCatches]);

  // Top rivers
  const riverData = useMemo(() => {
    const map: Record<string, { sessions: number; fish: number }> = {};
    filteredSessions.forEach(s => {
      const name = s.river_name || "Unknown";
      if (!map[name]) map[name] = { sessions: 0, fish: 0 };
      map[name].sessions++;
      map[name].fish += s.total_fish || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].sessions - a[1].sessions).slice(0, 6);
  }, [filteredSessions]);

  // Monthly activity
  const monthlyData = useMemo(() => {
    const map: Record<string, { sessions: number; fish: number }> = {};
    filteredSessions.forEach(s => {
      const d = new Date(s.date + "T12:00:00");
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (!map[key]) map[key] = { sessions: 0, fish: 0 };
      map[key].sessions++;
      map[key].fish += s.total_fish || 0;
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([key, val]) => {
      const d = new Date(key + "-15");
      return { label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), ...val };
    });
  }, [filteredSessions]);

  // Top flies
  const flyData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredCatches.forEach(c => { if (c.flyPatternName) map[c.flyPatternName] = (map[c.flyPatternName] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [filteredCatches]);

  // Catch rate over time (per session, chronological)
  const catchRateData = useMemo(() => {
    return [...filteredSessions]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(s => ({
        date: new Date(s.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        fish: s.total_fish || 0,
        river: s.river_name || "",
      }));
  }, [filteredSessions]);

  const maxMonthlyFish = Math.max(...monthlyData.map(m => m.fish), 1);
  const maxSpecies = speciesData.length > 0 ? speciesData[0][1] : 1;
  const maxRiverSessions = riverData.length > 0 ? riverData[0][1].sessions : 1;
  const maxFly = flyData.length > 0 ? flyData[0][1] : 1;
  const maxCatchRate = Math.max(...catchRateData.map(d => d.fish), 1);

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-[#8B949E] hover:text-[#F0F6FC] transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-[#E8923A]" />
              <h1 className="font-serif text-2xl text-[#F0F6FC]">Analytics</h1>
            </div>
          </div>

          {/* Time range picker */}
          <div className="flex gap-1 bg-[#161B22] rounded-lg p-1 border border-[#21262D]">
            {(["1M", "3M", "6M", "1Y", "ALL"] as TimeRange[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  range === r
                    ? "bg-[#E8923A] text-white"
                    : "text-[#8B949E] hover:text-[#F0F6FC]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <StatCard icon={<Calendar className="h-4 w-4 text-[#E8923A]" />} value={String(totalSessions)} label="Sessions" />
          <StatCard icon={<Fish className="h-4 w-4 text-[#0BA5C7]" />} value={String(totalFish)} label="Total Fish" />
          <StatCard icon={<TrendingUp className="h-4 w-4 text-[#2EA44F]" />} value={avgPerSession} label="Avg / Session" />
          <StatCard icon={<Target className="h-4 w-4 text-[#FFD700]" />} value={bestSession ? String(bestSession.total_fish) : "—"} label="Best Session" />
          <StatCard icon={<Flame className="h-4 w-4 text-orange-400" />} value={biggestFish > 0 ? `${biggestFish.toFixed(1)}"` : "—"} label="Biggest Fish" />
        </div>

        {totalSessions === 0 ? (
          <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-12 text-center">
            <BarChart3 className="h-12 w-12 text-[#484F58] mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#F0F6FC] mb-2">No data to analyze</h2>
            <p className="text-sm text-[#8B949E]">Start logging sessions to see your trends here.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Catch Rate Over Time */}
            <ChartCard title="Catch Rate" icon={<TrendingUp className="h-4 w-4 text-[#E8923A]" />} span="lg:col-span-2">
              <div className="flex items-end gap-[2px] h-40">
                {catchRateData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div
                      className="w-full bg-[#E8923A]/80 rounded-t hover:bg-[#E8923A] transition-colors min-h-[2px]"
                      style={{ height: `${(d.fish / maxCatchRate) * 100}%` }}
                    />
                    <div className="absolute bottom-full mb-1 px-2 py-1 bg-[#1F2937] border border-[#21262D] rounded text-[10px] text-[#F0F6FC] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {d.fish} fish · {d.date}
                      {d.river && <span className="text-[#E8923A]"> · {d.river}</span>}
                    </div>
                  </div>
                ))}
              </div>
              {catchRateData.length > 0 && (
                <div className="flex justify-between mt-2 text-[9px] text-[#484F58]">
                  <span>{catchRateData[0].date}</span>
                  <span>{catchRateData[catchRateData.length - 1].date}</span>
                </div>
              )}
            </ChartCard>

            {/* Species Breakdown */}
            <ChartCard title="Species Breakdown" icon={<Fish className="h-4 w-4 text-[#0BA5C7]" />}>
              <div className="space-y-2.5">
                {speciesData.map(([species, count]) => (
                  <div key={species}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#F0F6FC] font-medium truncate mr-2">{species}</span>
                      <span className="text-[#8B949E] font-mono shrink-0">{count}</span>
                    </div>
                    <div className="h-2 bg-[#0D1117] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0BA5C7] rounded-full transition-all"
                        style={{ width: `${(count / maxSpecies) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {speciesData.length === 0 && <p className="text-xs text-[#484F58]">No species data</p>}
              </div>
            </ChartCard>

            {/* Top Rivers */}
            <ChartCard title="Top Rivers" icon={<MapPin className="h-4 w-4 text-[#E8923A]" />}>
              <div className="space-y-2.5">
                {riverData.map(([river, data]) => (
                  <div key={river}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#F0F6FC] font-medium truncate mr-2">{river}</span>
                      <span className="text-[#8B949E] font-mono shrink-0">{data.sessions}s · {data.fish}f</span>
                    </div>
                    <div className="h-2 bg-[#0D1117] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#E8923A] rounded-full transition-all"
                        style={{ width: `${(data.sessions / maxRiverSessions) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {riverData.length === 0 && <p className="text-xs text-[#484F58]">No river data</p>}
              </div>
            </ChartCard>

            {/* Monthly Activity */}
            <ChartCard title="Monthly Activity" icon={<Calendar className="h-4 w-4 text-[#2EA44F]" />}>
              <div className="flex items-end gap-1 h-32">
                {monthlyData.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div
                      className="w-full bg-[#2EA44F]/70 rounded-t hover:bg-[#2EA44F] transition-colors min-h-[2px]"
                      style={{ height: `${(m.fish / maxMonthlyFish) * 100}%` }}
                    />
                    <span className="text-[8px] text-[#484F58] mt-1 truncate w-full text-center">{m.label}</span>
                    <div className="absolute bottom-full mb-1 px-2 py-1 bg-[#1F2937] border border-[#21262D] rounded text-[10px] text-[#F0F6FC] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {m.sessions} sessions · {m.fish} fish
                    </div>
                  </div>
                ))}
              </div>
              {monthlyData.length === 0 && <p className="text-xs text-[#484F58]">No monthly data</p>}
            </ChartCard>

            {/* Top Flies */}
            <ChartCard title="Top Flies" icon={<Feather className="h-4 w-4 text-purple-400" />}>
              <div className="space-y-2.5">
                {flyData.map(([fly, count]) => (
                  <div key={fly}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#F0F6FC] font-medium truncate mr-2">{fly}</span>
                      <span className="text-[#8B949E] font-mono shrink-0">{count} catches</span>
                    </div>
                    <div className="h-2 bg-[#0D1117] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${(count / maxFly) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {flyData.length === 0 && <p className="text-xs text-[#484F58]">No fly data — log catches with flies to see this</p>}
              </div>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-4 text-center">
      <div className="flex items-center justify-center mb-1.5">{icon}</div>
      <p className="text-2xl font-bold text-[#F0F6FC] font-mono">{value}</p>
      <p className="text-[10px] text-[#8B949E] mt-0.5 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ChartCard({ title, icon, children, span }: { title: string; icon: React.ReactNode; children: React.ReactNode; span?: string }) {
  return (
    <div className={`bg-[#161B22] border border-[#21262D] rounded-xl p-5 ${span || ""}`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}
