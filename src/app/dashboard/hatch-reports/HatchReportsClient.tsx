"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Bug, MapPin, Calendar, Thermometer } from "lucide-react";
import TipCard from "@/components/ui/TipCard";

interface Session {
  id: string;
  date: string;
  river_name: string | null;
  water_temp_f: number | null;
}

interface Catch {
  id: string;
  session_id: string;
  species: string | null;
  fly_pattern_id: string | null;
  fly_size: string | null;
  time_caught: string | null;
  quantities: number | null;
  flyName: string | null;
  flyType: string | null;
}

interface HatchEntry {
  insect: string;
  size: string;
  pattern: string;
  timeOfDay?: string;
  intensity?: string;
}

interface HatchMonth {
  month: string;
  hatches: HatchEntry[];
}

interface River {
  id: string;
  slug: string;
  name: string;
  hatchChart: HatchMonth[];
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function HatchReportsClient({
  sessions,
  catches,
  rivers,
}: {
  sessions: Session[];
  catches: Catch[];
  rivers: River[];
}) {
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedRiver, setSelectedRiver] = useState<string>("all");

  const sessionMap = useMemo(() => new Map(sessions.map(s => [s.id, s])), [sessions]);

  // Rivers the user has fished
  const userRivers = useMemo(() => {
    const names = new Set(sessions.map(s => s.river_name).filter(Boolean) as string[]);
    return Array.from(names).sort();
  }, [sessions]);

  // Match user rivers to database rivers with hatch data
  const matchedRivers = useMemo(() => {
    return rivers.filter(r =>
      userRivers.some(ur => ur.toLowerCase().includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(ur.toLowerCase()))
    );
  }, [rivers, userRivers]);

  // Get hatch data for selected month
  const monthName = MONTHS[selectedMonth];
  const currentHatches = useMemo(() => {
    const filteredRivers = selectedRiver === "all" ? matchedRivers : matchedRivers.filter(r => r.id === selectedRiver);
    const results: Array<{ river: River; hatches: HatchEntry[] }> = [];

    filteredRivers.forEach(river => {
      const monthData = river.hatchChart.find(m => m.month === monthName);
      if (monthData && monthData.hatches.length > 0) {
        results.push({ river, hatches: monthData.hatches });
      }
    });

    return results;
  }, [matchedRivers, selectedMonth, selectedRiver, monthName]);

  // Your catches for this month across years — what flies worked
  const monthCatchData = useMemo(() => {
    const monthSessions = sessions.filter(s => {
      const d = new Date(s.date + "T12:00:00");
      return d.getMonth() === selectedMonth;
    });
    const sessionIds = new Set(monthSessions.map(s => s.id));
    const monthCatches = catches.filter(c => sessionIds.has(c.session_id));

    // Group by fly
    const flyStats: Record<string, { count: number; type: string | null }> = {};
    monthCatches.forEach(c => {
      if (c.flyName) {
        if (!flyStats[c.flyName]) flyStats[c.flyName] = { count: 0, type: c.flyType };
        flyStats[c.flyName].count += c.quantities || 1;
      }
    });

    // Water temps
    const temps = monthSessions.filter(s => s.water_temp_f != null).map(s => s.water_temp_f!);
    const avgTemp = temps.length > 0 ? Math.round(temps.reduce((s, t) => s + t, 0) / temps.length) : null;

    return {
      sessions: monthSessions.length,
      totalCatches: monthCatches.reduce((s, c) => s + (c.quantities || 1), 0),
      topFlies: Object.entries(flyStats).sort((a, b) => b[1].count - a[1].count).slice(0, 5),
      avgTemp,
    };
  }, [sessions, catches, selectedMonth]);

  const intensityColors: Record<string, string> = {
    heavy: "bg-green-500/20 text-green-400 border-green-500/30",
    moderate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    sparse: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="min-h-screen bg-[var(--surface-page)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-[var(--text-body)] hover:text-[var(--text-primary)] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Bug className="h-6 w-6 text-[var(--action)]" />
            <h1 className="font-serif text-2xl text-[var(--text-primary)]">Hatch Reports</h1>
          </div>
        </div>

        <TipCard storageKey="hatch-reports-intro" title="What's hatching on your rivers">
          <p>We match the rivers you&apos;ve logged sessions on to our hatch database — by name — then show insects, sizes, and patterns for the month you pick.</p>
          <p className="text-[var(--text-meta)]">Your own catches for that month (across all years) appear below, so you can see which hatches you&apos;ve actually nailed.</p>
        </TipCard>

        <div className="h-6" />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Month selector */}
          <div className="flex gap-1 bg-[var(--surface-raised)] rounded-lg p-1 border border-[var(--border-rule)] overflow-x-auto">
            {MONTH_SHORT.map((m, i) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(i)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                  selectedMonth === i
                    ? "bg-[var(--action)] text-white"
                    : i === currentMonth
                    ? "text-[var(--action)] hover:text-[var(--text-primary)]"
                    : "text-[var(--text-body)] hover:text-[var(--text-primary)]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* River filter */}
          {matchedRivers.length > 1 && (
            <select
              value={selectedRiver}
              onChange={e => setSelectedRiver(e.target.value)}
              className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--action)]"
            >
              <option value="all">All Rivers</option>
              {matchedRivers.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Your data for this month */}
        {monthCatchData.sessions > 0 && (
          <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-5 mb-6">
            <h2 className="text-xs font-bold text-[var(--text-meta)] uppercase tracking-wider mb-3">
              Your {monthName} History
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xl font-bold font-mono text-[var(--action)]">{monthCatchData.sessions}</p>
                <p className="text-[10px] text-[var(--text-meta)] uppercase">Sessions</p>
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-[var(--text-primary)]">{monthCatchData.totalCatches}</p>
                <p className="text-[10px] text-[var(--text-meta)] uppercase">Fish Caught</p>
              </div>
              {monthCatchData.avgTemp && (
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-red-400" />
                  <div>
                    <p className="text-xl font-bold font-mono text-[var(--text-primary)]">{monthCatchData.avgTemp}°F</p>
                    <p className="text-[10px] text-[var(--text-meta)] uppercase">Avg Water Temp</p>
                  </div>
                </div>
              )}
            </div>
            {monthCatchData.topFlies.length > 0 && (
              <div>
                <p className="text-xs text-[var(--text-meta)] mb-2">Your top flies this month:</p>
                <div className="flex flex-wrap gap-2">
                  {monthCatchData.topFlies.map(([fly, data]) => (
                    <span key={fly} className="text-xs bg-[var(--action)]/10 text-[var(--action)] border border-[var(--action)]/20 rounded-full px-3 py-1">
                      {fly} <span className="text-[var(--text-meta)]">({data.count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hatch data */}
        {currentHatches.length > 0 ? (
          <div className="space-y-4">
            {currentHatches.map(({ river, hatches }) => (
              <div key={river.id} className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--border-rule)] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--action)]" />
                  <Link href={`/rivers/${river.slug}`} className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--action)] transition-colors">
                    {river.name}
                  </Link>
                  <span className="text-xs text-[var(--text-meta)]">· {hatches.length} hatches</span>
                </div>
                <div className="divide-y divide-[#21262D]">
                  {hatches.map((hatch, i) => (
                    <div key={i} className="px-5 py-3 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{hatch.insect}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-body)]">
                          <span>Size {hatch.size}</span>
                          <span>·</span>
                          <span className="text-[var(--action)]">{hatch.pattern}</span>
                          {hatch.timeOfDay && <><span>·</span><span>{hatch.timeOfDay}</span></>}
                        </div>
                      </div>
                      {hatch.intensity && (
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${intensityColors[hatch.intensity] || "text-[var(--text-meta)]"}`}>
                          {hatch.intensity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--surface-raised)] rounded-xl border border-[var(--border-rule)] p-12 text-center">
            <Calendar className="h-12 w-12 text-[var(--text-meta)] mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No hatch data for {monthName}
            </h2>
            <p className="text-sm text-[var(--text-body)]">
              {matchedRivers.length === 0
                ? "Start logging sessions on rivers in our database to see hatch reports."
                : "No hatches recorded for this month on your rivers. Try a different month."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
