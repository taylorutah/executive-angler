"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bug,
  Timer,
  Cloud,
  MapPin,
  Fish,
  TrendingUp,
  Flame,
  BarChart3,
  Loader2,
  AlertCircle,
} from "lucide-react";
import AIInsightsCard from "@/components/journal/AIInsightsCard";

// =============================================
// Types matching API response
// =============================================

interface FlyEffectivenessItem {
  flyName: string;
  flyType: string | null;
  totalCatches: number;
  sessionsUsed: number;
  fishPerSession: number;
}

interface TimeOfDayBucket {
  slot: string;
  catches: number;
  pct: number;
}

interface WeatherBucket {
  condition: string;
  avgFishPerSession: number;
  sessionCount: number;
}

interface RiverBucket {
  river: string;
  avgFishPerSession: number;
  sessionCount: number;
  totalFish: number;
}

interface SpeciesBucket {
  species: string;
  count: number;
  pct: number;
}

interface MonthlyTrendPoint {
  month: string;
  label: string;
  fish: number;
  sessions: number;
}

interface StreakStats {
  currentStreak: number;
  longestStreak: number;
}

interface InsightsPayload {
  flyEffectiveness: FlyEffectivenessItem[];
  bestTimeOfDay: TimeOfDayBucket[];
  weatherCorrelation: WeatherBucket[];
  bestRivers: RiverBucket[];
  speciesBreakdown: SpeciesBucket[];
  monthlyTrends: MonthlyTrendPoint[];
  streakStats: StreakStats;
  totalSessions: number;
  totalCatches: number;
}

// =============================================
// Color palette
// =============================================

const SPECIES_COLORS = [
  "#E8923A", "#00B4D8", "#22C55E", "#A855F7", "#EF4444",
  "#F59E0B", "#EC4899", "#6366F1", "#14B8A6", "#8B5CF6",
];

const TIME_SLOT_COLORS: Record<string, string> = {
  Morning: "#F59E0B",
  Midday: "#00B4D8",
  Afternoon: "#22C55E",
  Evening: "#A855F7",
};

// =============================================
// Component
// =============================================

export default function InsightsPageClient({ isPremium = true }: { isPremium?: boolean }) {
  const [data, setData] = useState<InsightsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/journal/insights");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Failed (${res.status})`);
        }
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load insights");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0D1117] pt-4 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#F0F6FC] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>
          <div className="flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-[#E8923A]" />
            <h1 className="font-heading text-3xl sm:text-4xl text-[#F0F6FC]">
              Journal Insights
            </h1>
          </div>
          <p className="text-slate-400 mt-2">
            Data-driven patterns from your fishing journal.
          </p>
        </div>

        {/* AI Fishing Coach */}
        <div className="mb-8">
          <AIInsightsCard isPremium={isPremium} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonCard key={i} tall={i === 5} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-6 flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Data */}
        {data && <InsightsGrid data={data} />}
      </div>
    </div>
  );
}

// =============================================
// Grid of insight cards
// =============================================

function InsightsGrid({ data }: { data: InsightsPayload }) {
  const isEmpty = data.totalSessions === 0;

  if (isEmpty) {
    return (
      <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-12 text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-600" />
        <h2 className="font-heading text-xl text-[#F0F6FC] mb-2">No data yet</h2>
        <p className="text-slate-400">
          Log some fishing sessions to see your insights here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* Streak Stats */}
      <Card
        icon={<Flame className="h-5 w-5 text-orange-400" />}
        title="Catch Streaks"
      >
        <div className="flex gap-6 mt-2">
          <StatNumber
            value={data.streakStats.currentStreak}
            label="Current Streak"
          />
          <StatNumber
            value={data.streakStats.longestStreak}
            label="Longest Streak"
          />
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Consecutive sessions with at least 1 fish caught.
        </p>
      </Card>

      {/* Fly Effectiveness */}
      <Card
        icon={<Bug className="h-5 w-5 text-purple-400" />}
        title="Top Flies by Effectiveness"
      >
        {data.flyEffectiveness.length === 0 ? (
          <EmptyNote>Log catches with fly patterns to see effectiveness.</EmptyNote>
        ) : (
          <div className="space-y-3 mt-2">
            {data.flyEffectiveness.map((f, i) => (
              <div key={f.flyName} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#E8923A] w-5 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#F0F6FC] truncate">
                    {f.flyName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {f.totalCatches} fish in {f.sessionsUsed} session
                    {f.sessionsUsed !== 1 ? "s" : ""}
                    {f.flyType ? ` \u00B7 ${f.flyType}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-[#F0F6FC]">
                    {f.fishPerSession.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                    per session
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Best Time of Day */}
      <Card
        icon={<Timer className="h-5 w-5 text-amber-400" />}
        title="Best Time of Day"
      >
        {data.bestTimeOfDay.every((b) => b.catches === 0) ? (
          <EmptyNote>Log catch times to see your peak hours.</EmptyNote>
        ) : (
          <div className="space-y-3 mt-2">
            {data.bestTimeOfDay.map((b) => (
              <div key={b.slot} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: TIME_SLOT_COLORS[b.slot] || "#6E7681" }}
                />
                <span className="text-sm text-[#F0F6FC] w-20">{b.slot}</span>
                <div className="flex-1 h-2 rounded-full bg-[#21262D] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${b.pct}%`,
                      backgroundColor: TIME_SLOT_COLORS[b.slot] || "#6E7681",
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-400 w-12 text-right">
                  {b.pct}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Weather Correlation */}
      <Card
        icon={<Cloud className="h-5 w-5 text-sky-400" />}
        title="Weather Correlation"
      >
        {data.weatherCorrelation.length === 0 ? (
          <EmptyNote>Log weather conditions on your sessions to see correlations.</EmptyNote>
        ) : (
          <div className="space-y-3 mt-2">
            {data.weatherCorrelation.map((w, i) => (
              <div key={w.condition} className="flex items-center gap-3">
                <span className="text-xs font-bold text-sky-400 w-5 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#F0F6FC]">{w.condition}</div>
                  <div className="text-xs text-slate-500">
                    {w.sessionCount} session{w.sessionCount !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-[#F0F6FC]">
                    {w.avgFishPerSession}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                    avg fish
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Best Rivers */}
      <Card
        icon={<MapPin className="h-5 w-5 text-blue-400" />}
        title="Best Rivers"
        subtitle="Min. 2 sessions"
      >
        {data.bestRivers.length === 0 ? (
          <EmptyNote>Fish the same river at least twice to see stats.</EmptyNote>
        ) : (
          <div className="space-y-3 mt-2">
            {data.bestRivers.map((r, i) => (
              <div key={r.river} className="flex items-center gap-3">
                <span className="text-xs font-bold text-blue-400 w-5 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#F0F6FC] truncate">{r.river}</div>
                  <div className="text-xs text-slate-500">
                    {r.totalFish} fish in {r.sessionCount} sessions
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-[#F0F6FC]">
                    {r.avgFishPerSession}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                    avg fish
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Species Breakdown */}
      <Card
        icon={<Fish className="h-5 w-5 text-emerald-400" />}
        title="Species Breakdown"
      >
        {data.speciesBreakdown.length === 0 ? (
          <EmptyNote>Log species on your catches to see the breakdown.</EmptyNote>
        ) : (
          <>
            {/* Simple donut-like bar */}
            <div className="flex h-3 rounded-full overflow-hidden mt-3 mb-4 bg-[#21262D]">
              {data.speciesBreakdown.map((s, i) => (
                <div
                  key={s.species}
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${s.pct}%`,
                    backgroundColor: SPECIES_COLORS[i % SPECIES_COLORS.length],
                    minWidth: s.pct > 0 ? "4px" : "0",
                  }}
                />
              ))}
            </div>
            <div className="space-y-2">
              {data.speciesBreakdown.slice(0, 6).map((s, i) => (
                <div key={s.species} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: SPECIES_COLORS[i % SPECIES_COLORS.length],
                    }}
                  />
                  <span className="text-sm text-[#F0F6FC] flex-1 truncate">
                    {s.species}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {s.count} ({s.pct}%)
                  </span>
                </div>
              ))}
              {data.speciesBreakdown.length > 6 && (
                <div className="text-xs text-slate-500">
                  +{data.speciesBreakdown.length - 6} more species
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Monthly Trends — spans full width */}
      <div className="md:col-span-2 xl:col-span-3">
        <Card
          icon={<TrendingUp className="h-5 w-5 text-green-400" />}
          title="Monthly Trends"
          subtitle="Last 12 months"
        >
          <MonthlyChart trends={data.monthlyTrends} />
        </Card>
      </div>
    </div>
  );
}

// =============================================
// Monthly bar chart (pure CSS)
// =============================================

function MonthlyChart({ trends }: { trends: MonthlyTrendPoint[] }) {
  const maxFish = Math.max(...trends.map((t) => t.fish), 1);

  return (
    <div className="mt-4">
      <div className="flex items-end gap-1 sm:gap-2 h-40">
        {trends.map((t) => {
          const heightPct = maxFish > 0 ? (t.fish / maxFish) * 100 : 0;
          return (
            <div
              key={t.month}
              className="flex-1 flex flex-col items-center justify-end h-full group relative"
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#21262D] text-[#F0F6FC] text-xs font-mono px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {t.fish} fish / {t.sessions} sessions
              </div>
              <div
                className="w-full rounded-t transition-all duration-500"
                style={{
                  height: `${Math.max(heightPct, 2)}%`,
                  backgroundColor:
                    t.fish > 0 ? "#E8923A" : "#21262D",
                  minHeight: "2px",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 sm:gap-2 mt-2">
        {trends.map((t) => (
          <div
            key={t.month}
            className="flex-1 text-center text-[9px] sm:text-[10px] text-slate-500 truncate"
          >
            {t.label.split(" ")[0]}
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================
// Shared components
// =============================================

function Card({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h2 className="text-sm font-bold text-[#F0F6FC]">{title}</h2>
      </div>
      {subtitle && (
        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

function StatNumber({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-mono font-bold text-[#F0F6FC]">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-slate-500 mt-3 italic">{children}</p>
  );
}

function SkeletonCard({ tall }: { tall?: boolean }) {
  return (
    <div
      className={`bg-[#161B22] border border-[#21262D] rounded-xl p-5 animate-pulse ${
        tall ? "md:col-span-2 xl:col-span-3" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded bg-[#21262D]" />
        <div className="h-4 w-32 rounded bg-[#21262D]" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full rounded bg-[#21262D]" />
        <div className="h-3 w-3/4 rounded bg-[#21262D]" />
        <div className="h-3 w-1/2 rounded bg-[#21262D]" />
      </div>
    </div>
  );
}
