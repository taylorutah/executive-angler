"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const AWARDS_VISIBLE = process.env.NEXT_PUBLIC_FEATURE_AWARDS_VISIBLE === "true";

import {
  Fish,
  Thermometer,
  Droplets,
  Calendar,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Activity,
  Trophy,
  Flame,
  Crown,
  Sunrise,
  Lock,
} from "lucide-react";
import type { RiverIntel } from "@/app/api/intel/river/[riverId]/route";

interface RiverAnglerIntelProps {
  riverId: string;
  riverName: string;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr + "T12:00:00");
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function formatDate(d: string): string {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function clarityColor(clarity: string): string {
  const c = clarity.toLowerCase();
  if (c.includes("clear")) return "text-[#00B4D8]";
  if (c.includes("stained") || c.includes("off")) return "text-amber-400";
  if (c.includes("muddy") || c.includes("high")) return "text-red-400";
  return "text-[#A8B2BD]";
}

// Skeleton for loading state
function IntelSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-[#161B22] rounded-xl border border-[#21262D]" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 bg-[#161B22] rounded-xl border border-[#21262D]" />
        <div className="h-48 bg-[#161B22] rounded-xl border border-[#21262D]" />
      </div>
    </div>
  );
}

export default function RiverAnglerIntel({ riverId, riverName }: RiverAnglerIntelProps) {
  const [intel, setIntel] = useState<RiverIntel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllReports, setShowAllReports] = useState(false);

  useEffect(() => {
    fetch(`/api/intel/river/${riverId}`)
      .then((r) => r.json())
      .then((d) => {
        setIntel(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [riverId]);

  if (loading) return <IntelSkeleton />;

  // No data — show an invite to log
  if (!intel || intel.totalSessions === 0) {
    return (
      <div className="bg-[#161B22] rounded-xl border border-[#21262D] border-dashed p-8 text-center">
        <Activity className="h-9 w-9 text-[#6E7681] mx-auto mb-3" />
        <h3 className="font-heading text-lg font-semibold text-[#F0F6FC] mb-1">
          No Angler Reports Yet
        </h3>
        <p className="text-sm text-[#A8B2BD] mb-4 max-w-sm mx-auto">
          Be the first to log a session on {riverName}. Your reports help the whole community fish smarter.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8923A] text-white text-sm font-medium rounded-lg hover:bg-[#F0A65A] transition-colors"
        >
          <Fish className="h-4 w-4" /> Get the App — Log a Session
        </Link>
      </div>
    );
  }

  const hasFlies = intel.topFlies.length > 0;
  const hasSpecies = intel.speciesBreakdown.length > 0;
  const hasConditions = intel.avgWaterTempF != null || intel.waterClarity.length > 0;
  const hasReports = intel.recentReports.length > 0;
  const totalSpeciesCount = intel.speciesBreakdown.reduce((a, s) => a + s.count, 0);

  return (
    <div className="space-y-4">
      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-4 flex flex-col gap-1">
          <span className="text-[10px] text-[#6E7681] uppercase tracking-widest font-medium">
            Sessions (30d)
          </span>
          <span className="font-mono text-3xl font-bold text-[#E8923A]">
            {intel.sessions30d}
          </span>
          {intel.sessions7d > 0 && (
            <span className="text-[10px] text-[#00B4D8]">
              {intel.sessions7d} this week
            </span>
          )}
        </div>
        <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-4 flex flex-col gap-1">
          <span className="text-[10px] text-[#6E7681] uppercase tracking-widest font-medium">
            Avg Fish / Trip
          </span>
          <span className="font-mono text-3xl font-bold text-[#E8923A]">
            {intel.avgFishPerSession ?? "—"}
          </span>
          {intel.maxLengthInches && (
            <span className="text-[10px] text-[#A8B2BD]">
              Best: {intel.maxLengthInches}&quot;
            </span>
          )}
        </div>
        <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-4 flex flex-col gap-1">
          <span className="text-[10px] text-[#6E7681] uppercase tracking-widest font-medium">
            Last Session
          </span>
          <span className="font-mono text-xl font-bold text-[#E8923A] leading-tight pt-1">
            {timeAgo(intel.lastSessionDate)}
          </span>
          {intel.lastSessionDate && (
            <span className="text-[10px] text-[#6E7681]">
              {formatDate(intel.lastSessionDate)}
            </span>
          )}
        </div>
        <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-4 flex flex-col gap-1">
          <span className="text-[10px] text-[#6E7681] uppercase tracking-widest font-medium">
            Fish Recorded
          </span>
          <span className="font-mono text-3xl font-bold text-[#E8923A]">
            {intel.totalFishRecorded}
          </span>
          <span className="text-[10px] text-[#6E7681]">
            {intel.totalSessions} session{intel.totalSessions !== 1 ? "s" : ""} total
          </span>
        </div>
      </div>

      {/* ── Main Grid: Flies + Species ──────────────────────────────────── */}
      {(hasFlies || hasSpecies) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Flies */}
          {hasFlies && (
            <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-[#E8923A]" />
                <h3 className="font-heading text-base font-semibold text-[#F0F6FC]">
                  What&apos;s Working
                </h3>
                <span className="ml-auto text-[10px] text-[#6E7681]">from app data</span>
              </div>
              <div className="space-y-2.5">
                {intel.topFlies.map((fly, i) => {
                  const maxCount = intel.topFlies[0].catchCount;
                  const pct = Math.round((fly.catchCount / maxCount) * 100);
                  return (
                    <div key={fly.flyName}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#6E7681] w-4">
                            #{i + 1}
                          </span>
                          <span className="text-sm font-medium text-[#F0F6FC]">
                            {fly.flyName}
                          </span>
                          {fly.sizes.length > 0 && (
                            <span className="text-[10px] text-[#A8B2BD]">
                              {fly.sizes.map(s => `#${s.replace(/^#/, "")}`).join(", ")}
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-xs font-mono text-[#E8923A]">
                          {fly.catchCount}
                          <Fish className="h-3 w-3 opacity-60" />
                        </span>
                      </div>
                      <div className="h-1 bg-[#21262D] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E8923A] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Species Breakdown */}
          {hasSpecies && (
            <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Fish className="h-4 w-4 text-[#E8923A]" />
                <h3 className="font-heading text-base font-semibold text-[#F0F6FC]">
                  Species Caught
                </h3>
                {intel.avgLengthInches && (
                  <span className="ml-auto text-[10px] text-[#6E7681]">
                    avg {intel.avgLengthInches}&quot;
                  </span>
                )}
              </div>
              <div className="space-y-2.5">
                {intel.speciesBreakdown.map((sp) => {
                  const pct =
                    totalSpeciesCount > 0
                      ? Math.round((sp.count / totalSpeciesCount) * 100)
                      : 0;
                  return (
                    <div key={sp.species}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#F0F6FC]">
                          {sp.species}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[#A8B2BD]">
                          {sp.avgLengthInches && (
                            <span className="font-mono text-[#A8B2BD]">
                              avg {sp.avgLengthInches}&quot;
                            </span>
                          )}
                          {sp.maxLengthInches && (
                            <span className="font-mono text-[#E8923A]">
                              best {sp.maxLengthInches}&quot;
                            </span>
                          )}
                          <span className="text-[#6E7681]">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1 bg-[#21262D] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00B4D8] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Conditions + Trip Reports ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conditions */}
        {hasConditions && (
          <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="h-4 w-4 text-[#00B4D8]" />
              <h3 className="font-heading text-base font-semibold text-[#F0F6FC]">
                Reported Conditions
              </h3>
            </div>
            <div className="space-y-3">
              {intel.avgWaterTempF != null && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[#A8B2BD]">
                    <Thermometer className="h-3.5 w-3.5" />
                    Water Temp
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-lg font-bold text-[#F0F6FC]">
                      {intel.avgWaterTempF}°F
                    </span>
                    <span className="text-[10px] text-[#6E7681] ml-1">avg</span>
                  </div>
                </div>
              )}
              {intel.recentWaterTemps.length > 1 && (
                <div>
                  <p className="text-[10px] text-[#6E7681] mb-1.5 uppercase tracking-widest">
                    Recent readings
                  </p>
                  <div className="flex items-end gap-1 h-10">
                    {intel.recentWaterTemps.slice(0, 10).reverse().map((t, i) => {
                      const temps = intel.recentWaterTemps.map((x) => x.temp);
                      const min = Math.min(...temps);
                      const max = Math.max(...temps);
                      const range = max - min || 1;
                      const h = Math.max(15, Math.round(((t.temp - min) / range) * 100));
                      return (
                        <div
                          key={i}
                          title={`${t.temp}°F — ${formatDate(t.date)}`}
                          className="flex-1 bg-[#00B4D8]/60 rounded-sm hover:bg-[#00B4D8] transition-colors"
                          style={{ height: `${h}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
              {intel.waterClarity.length > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-[#21262D]">
                  <div className="flex items-center gap-2 text-sm text-[#A8B2BD]">
                    <Droplets className="h-3.5 w-3.5" />
                    Clarity
                  </div>
                  <div className="flex items-center gap-1.5">
                    {intel.waterClarity.map((c) => (
                      <span
                        key={c.clarity}
                        className={`text-xs font-medium ${clarityColor(c.clarity)}`}
                      >
                        {c.clarity}
                        <span className="text-[#6E7681] ml-0.5">({c.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trip Reports */}
        {hasReports && (
          <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-[#E8923A]" />
              <h3 className="font-heading text-base font-semibold text-[#F0F6FC]">
                Trip Reports
              </h3>
              <span className="ml-auto text-[10px] text-[#6E7681]">
                {intel.totalReports} with notes
              </span>
            </div>
            <div className="space-y-4">
              {(showAllReports
                ? intel.recentReports
                : intel.recentReports.slice(0, 3)
              ).map((report) => (
                <div
                  key={report.sessionId}
                  className="border-l-2 border-[#E8923A]/30 pl-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-3 w-3 text-[#6E7681]" />
                    <span className="text-[10px] text-[#6E7681]">
                      {formatDate(report.date)}
                    </span>
                    {report.totalFish > 0 && (
                      <span className="text-[10px] font-mono text-[#E8923A] ml-auto">
                        {report.totalFish} fish
                      </span>
                    )}
                    {report.waterTemp && (
                      <span className="text-[10px] text-[#00B4D8] font-mono">
                        {report.waterTemp}°F
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A8B2BD] line-clamp-3 leading-relaxed">
                    &ldquo;{report.notes}&rdquo;
                  </p>
                  {report.username && (
                    <p className="text-[10px] text-[#6E7681] mt-1">
                      — {report.username}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {intel.recentReports.length > 3 && (
              <button
                onClick={() => setShowAllReports(!showAllReports)}
                className="mt-4 flex items-center gap-1 text-xs text-[#A8B2BD] hover:text-[#E8923A] transition-colors"
              >
                {showAllReports ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" /> Show all {intel.recentReports.length} reports
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Section Breakdown ───────────────────────────────────────────── */}
      {intel.sections && intel.sections.length > 1 && (
        <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-[#E8923A]" />
            <h3 className="font-heading text-base font-semibold text-[#F0F6FC]">
              By Section
            </h3>
            <span className="ml-auto text-[10px] text-[#6E7681]">{intel.sections.length} sections</span>
          </div>
          <div className="space-y-3">
            {intel.sections.map((s, i) => {
              const maxCount = intel.sections[0].sessionCount;
              const pct = Math.round((s.sessionCount / maxCount) * 100);
              return (
                <div key={s.section}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#6E7681] w-4">#{i + 1}</span>
                      <span className="text-sm font-semibold text-[#F0F6FC]">{s.section}</span>
                      {s.topFly && (
                        <span className="text-[10px] text-[#A8B2BD]">· {s.topFly}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#A8B2BD]">
                      {s.avgFish != null && (
                        <span className="font-mono text-[#E8923A]">{s.avgFish} avg</span>
                      )}
                      <span>{s.sessionCount} sessions</span>
                    </div>
                  </div>
                  <div className="h-1 bg-[#21262D] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E8923A]/60 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── River Activity (anonymous data utility) ─────────────────────── */}
      {AWARDS_VISIBLE && intel.leaderboard && (
        <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-[#E8923A]" />
            <h3 className="font-heading text-base font-semibold text-[#F0F6FC]">
              River Activity
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {intel.leaderboard.riverChampion && (
              <div className="bg-[#0D1117] rounded-lg border border-[#E8923A]/40 p-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <Crown className="h-3.5 w-3.5 text-[#E8923A]" />
                  <span className="text-[10px] text-[#6E7681] uppercase tracking-widest font-medium">Most Active</span>
                </div>
                <span className="text-sm font-semibold text-[#F0F6FC]">Peak Activity</span>
                <span className="text-xs text-[#A8B2BD] font-mono">{intel.leaderboard.riverChampion.sessionCount} sessions in 90 days</span>
              </div>
            )}
            {intel.leaderboard.biggestFish && (
              <div className="bg-[#0D1117] rounded-lg border border-[#21262D] p-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <Fish className="h-3.5 w-3.5 text-[#00B4D8]" />
                  <span className="text-[10px] text-[#6E7681] uppercase tracking-widest font-medium">Biggest Reported</span>
                </div>
                <span className="text-sm font-semibold text-[#F0F6FC]">
                  {intel.leaderboard.biggestFish.lengthInches}&quot;
                  {intel.leaderboard.biggestFish.species && ` ${intel.leaderboard.biggestFish.species}`}
                </span>
                <span className="text-xs text-[#A8B2BD] font-mono">largest catch logged</span>
              </div>
            )}
            {intel.leaderboard.hotHand && (
              <div className="bg-[#0D1117] rounded-lg border border-[#21262D] p-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] text-[#6E7681] uppercase tracking-widest font-medium">Top Session</span>
                </div>
                <span className="text-sm font-semibold text-[#F0F6FC]">{intel.leaderboard.hotHand.fishCount} fish</span>
                <span className="text-xs text-[#A8B2BD] font-mono">single session high</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PRO Stats ────────────────────────────────────────────────────── */}
      {(intel.gearStats || intel.bestTimeOfDay || intel.bestMonth) && (
        <div className="bg-[#161B22] rounded-xl border border-[#21262D] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-4 w-4 text-[#E8923A]" />
            <h3 className="font-heading text-base font-semibold text-[#F0F6FC]">
              Advanced Stats
            </h3>
            <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold bg-[#E8923A]/20 text-[#E8923A] rounded uppercase tracking-widest">
              PRO
            </span>
          </div>
          <div className="space-y-5">
            {intel.gearStats && (intel.gearStats.topRodBrand || intel.gearStats.topLeader || intel.gearStats.topTippet) && (
              <div>
                <p className="text-[10px] text-[#6E7681] uppercase tracking-widest mb-2">What the Pros Use</p>
                <div className="space-y-2">
                  {intel.gearStats.topRodBrand && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A8B2BD]">Rod Brand</span>
                      <span className="text-[#F0F6FC] font-medium">{intel.gearStats.topRodBrand}</span>
                    </div>
                  )}
                  {intel.gearStats.topLeader && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A8B2BD]">Leader</span>
                      <span className="text-[#F0F6FC] font-medium">{intel.gearStats.topLeader}</span>
                    </div>
                  )}
                  {intel.gearStats.topTippet && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A8B2BD]">Tippet</span>
                      <span className="text-[#F0F6FC] font-medium">{intel.gearStats.topTippet}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {intel.bestTimeOfDay && (
              <div>
                <p className="text-[10px] text-[#6E7681] uppercase tracking-widest mb-2">Best Time to Fish</p>
                <div className="grid grid-cols-4 gap-2">
                  {(["morning","midday","afternoon","evening"] as const).map((period) => {
                    const isWinner = intel.bestTimeOfDay?.period === period;
                    const labels: Record<string, string> = { morning: "Morning", midday: "Midday", afternoon: "Afternoon", evening: "Evening" };
                    return (
                      <div key={period} className={`text-center py-2 px-1 rounded-lg border text-xs transition-colors ${isWinner ? "border-[#E8923A] bg-[#E8923A]/10 text-[#E8923A]" : "border-[#21262D] text-[#6E7681]"}`}>
                        <div className="font-medium">{labels[period]}</div>
                        {isWinner && <div className="font-mono text-[10px] mt-0.5">{intel.bestTimeOfDay?.avgFish} avg</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {intel.bestMonth && (
              <div>
                <p className="text-[10px] text-[#6E7681] uppercase tracking-widest mb-2">Best Month</p>
                <div className="flex items-baseline gap-2">
                  <Sunrise className="h-4 w-4 text-[#E8923A] shrink-0" />
                  <span className="text-sm font-semibold text-[#F0F6FC]">{intel.bestMonth.month}</span>
                  <span className="text-xs text-[#A8B2BD]">— avg <span className="font-mono text-[#E8923A]">{intel.bestMonth.avgFish}</span> fish/session ({intel.bestMonth.sessionCount} sessions)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Attribution footer ───────────────────────────────────────────── */}
      <p className="text-[10px] text-[#6E7681] text-right">
        Data from {intel.totalSessions} public session{intel.totalSessions !== 1 ? "s" : ""} logged in the{" "}
        <Link href="/" className="text-[#E8923A] hover:underline">
          Executive Angler app
        </Link>
        . Log your session to contribute.
      </p>
    </div>
  );
}
