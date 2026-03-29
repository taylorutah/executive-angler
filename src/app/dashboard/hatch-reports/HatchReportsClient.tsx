"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Bug, MapPin, Calendar, Thermometer } from "lucide-react";

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
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Bug className="h-6 w-6 text-[#E8923A]" />
            <h1 className="font-serif text-2xl text-[#F0F6FC]">Hatch Reports</h1>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Month selector */}
          <div className="flex gap-1 bg-[#161B22] rounded-lg p-1 border border-[#21262D] overflow-x-auto">
            {MONTH_SHORT.map((m, i) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(i)}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
                  selectedMonth === i
                    ? "bg-[#E8923A] text-white"
                    : i === currentMonth
                    ? "text-[#E8923A] hover:text-[#F0F6FC]"
                    : "text-[#A8B2BD] hover:text-[#F0F6FC]"
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
              className="bg-[#161B22] border border-[#21262D] rounded-lg px-3 py-2 text-sm text-[#F0F6FC] focus:outline-none focus:ring-1 focus:ring-[#E8923A]"
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
          <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5 mb-6">
            <h2 className="text-xs font-bold text-[#6E7681] uppercase tracking-wider mb-3">
              Your {monthName} History
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xl font-bold text-[#E8923A]">{monthCatchData.sessions}</p>
                <p className="text-[10px] text-[#6E7681] uppercase">Sessions</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[#F0F6FC]">{monthCatchData.totalCatches}</p>
                <p className="text-[10px] text-[#6E7681] uppercase">Fish Caught</p>
              </div>
              {monthCatchData.avgTemp && (
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-red-400" />
                  <div>
                    <p className="text-xl font-bold text-[#F0F6FC]">{monthCatchData.avgTemp}°F</p>
                    <p className="text-[10px] text-[#6E7681] uppercase">Avg Water Temp</p>
                  </div>
                </div>
              )}
            </div>
            {monthCatchData.topFlies.length > 0 && (
              <div>
                <p className="text-xs text-[#6E7681] mb-2">Your top flies this month:</p>
                <div className="flex flex-wrap gap-2">
                  {monthCatchData.topFlies.map(([fly, data]) => (
                    <span key={fly} className="text-xs bg-[#E8923A]/10 text-[#E8923A] border border-[#E8923A]/20 rounded-full px-3 py-1">
                      {fly} <span className="text-[#6E7681]">({data.count})</span>
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
              <div key={river.id} className="bg-[#161B22] rounded-xl border border-[#21262D] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#21262D] flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#E8923A]" />
                  <Link href={`/rivers/${river.slug}`} className="text-sm font-bold text-[#F0F6FC] hover:text-[#E8923A] transition-colors">
                    {river.name}
                  </Link>
                  <span className="text-xs text-[#6E7681]">· {hatches.length} hatches</span>
                </div>
                <div className="divide-y divide-[#21262D]">
                  {hatches.map((hatch, i) => (
                    <div key={i} className="px-5 py-3 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F0F6FC]">{hatch.insect}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#A8B2BD]">
                          <span>Size {hatch.size}</span>
                          <span>·</span>
                          <span className="text-[#E8923A]">{hatch.pattern}</span>
                          {hatch.timeOfDay && <><span>·</span><span>{hatch.timeOfDay}</span></>}
                        </div>
                      </div>
                      {hatch.intensity && (
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${intensityColors[hatch.intensity] || "text-[#6E7681]"}`}>
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
          <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-12 text-center">
            <Calendar className="h-12 w-12 text-[#6E7681] mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#F0F6FC] mb-2">
              No hatch data for {monthName}
            </h2>
            <p className="text-sm text-[#A8B2BD]">
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
