"use client";

import { useEffect, useState } from "react";
import {
  Bug,
  Timer,
  Cloud,
  MapPin,
  Fish,
  TrendingUp,
  Flame,
  AlertCircle,
} from "@/icons";
import AIInsightsCard from "@/components/journal/AIInsightsCard";
import PageHeader from "@/components/ui/PageHeader";
import FirstRunEmpty, { INSIGHTS_SESSION_FLOOR } from "@/app/today/FirstRunEmpty";

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

// Token-derived categorical ramps (DESIGN.md: no hardcoded hex) —
// single-hue accent tints, darkest = rank 1.
const SPECIES_COLORS = [
  "var(--accent)",
  "color-mix(in srgb, var(--accent) 84%, var(--paper))",
  "color-mix(in srgb, var(--accent) 68%, var(--paper))",
  "color-mix(in srgb, var(--accent) 52%, var(--paper))",
  "color-mix(in srgb, var(--accent) 40%, var(--paper))",
  "color-mix(in srgb, var(--accent) 30%, var(--paper))",
  "color-mix(in srgb, var(--accent) 22%, var(--paper))",
  "color-mix(in srgb, var(--accent) 15%, var(--paper))",
  "color-mix(in srgb, var(--accent) 9%, var(--paper))",
  "color-mix(in srgb, var(--accent) 5%, var(--paper))",
];

const TIME_SLOT_COLORS: Record<string, string> = {
  Morning: "var(--accent)",
  Midday: "color-mix(in srgb, var(--accent) 72%, var(--paper))",
  Afternoon: "color-mix(in srgb, var(--accent) 48%, var(--paper))",
  Evening: "color-mix(in srgb, var(--accent) 26%, var(--paper))",
};

// =============================================
// Component
// =============================================

export default function InsightsPageClient() {
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
    <div className="min-h-screen bg-[var(--paper)] pt-6 pb-12">
      <div className="max-w-[var(--container)] mx-auto px-4 sm:px-6">
        <PageHeader
          eyebrow="Journal"
          title="Insights"
          meta="Patterns from your sessions only. Sharper with more volume — 20+ sessions before trusting weather and temp correlations."
        />

        {/* AI Fishing Coach — off by default; enable via NEXT_PUBLIC_FEATURE_AI_INSIGHTS */}
        {process.env.NEXT_PUBLIC_FEATURE_AI_INSIGHTS === "true" && (
          <div className="mb-8">
            <AIInsightsCard />
          </div>
        )}

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
          <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-card)] p-6 flex items-center gap-3 text-[var(--danger)]">
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
  if (data.totalSessions < INSIGHTS_SESSION_FLOOR) {
    return (
      <FirstRunEmpty
        surface="insights"
        purpose="Insights read patterns from your own sessions only. A number here is not a pattern until there is volume."
        actionHref="/journal/new"
        actionLabel="Log a session"
        example={`Weather and temperature wait until ${INSIGHTS_SESSION_FLOOR} sessions. ${data.totalSessions} so far. A single day is a note, not a trend.`}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* Streak Stats */}
      <Card
        icon={<Flame className="h-5 w-5 text-[var(--accent)]" />}
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
        <p className="text-xs text-[var(--text-3)] mt-3">
          Consecutive sessions with at least 1 fish caught.
        </p>
      </Card>

      {/* Fly Effectiveness */}
      <Card
        icon={<Bug className="h-5 w-5 text-[var(--accent)]" />}
        title="Top Flies by Effectiveness"
      >
        {data.flyEffectiveness.length === 0 ? (
          <EmptyNote>Log catches with fly patterns to see effectiveness.</EmptyNote>
        ) : (
          <div className="space-y-3 mt-2">
            {data.flyEffectiveness.map((f, i) => (
              <div key={f.flyName} className="flex items-center gap-3">
                <span className="num text-xs font-semibold text-[var(--accent)] w-5 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--text-1)] truncate">
                    {f.flyName}
                  </div>
                  <div className="text-xs text-[var(--text-3)]">
                    {f.totalCatches} fish in {f.sessionsUsed} session
                    {f.sessionsUsed !== 1 ? "s" : ""}
                    {f.flyType ? ` \u00B7 ${f.flyType}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="num text-sm font-semibold text-[var(--text-1)]">
                    {f.fishPerSession.toFixed(1)}
                  </div>
                  <div className="text-xs text-[var(--text-3)] uppercase tracking-wide">
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
        icon={<Timer className="h-5 w-5 text-[var(--accent)]" />}
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
                  style={{ backgroundColor: TIME_SLOT_COLORS[b.slot] || "var(--text-3)" }}
                />
                <span className="text-sm text-[var(--text-1)] w-20">{b.slot}</span>
                <div className="flex-1 h-2 rounded-full bg-[var(--border)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${b.pct}%`,
                      backgroundColor: TIME_SLOT_COLORS[b.slot] || "var(--text-3)",
                    }}
                  />
                </div>
                <span className="num text-xs text-[var(--text-3)] w-12 text-right">
                  {b.pct}%
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Weather Correlation */}
      <Card
        icon={<Cloud className="h-5 w-5 text-[var(--accent)]" />}
        title="Weather Correlation"
      >
        {data.weatherCorrelation.length === 0 ? (
          <EmptyNote>Log weather conditions on your sessions to see correlations.</EmptyNote>
        ) : (
          <div className="space-y-3 mt-2">
            {data.weatherCorrelation.map((w, i) => (
              <div key={w.condition} className="flex items-center gap-3">
                <span className="num text-xs font-semibold text-[var(--accent)] w-5 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--text-1)]">{w.condition}</div>
                  <div className="text-xs text-[var(--text-3)]">
                    {w.sessionCount} session{w.sessionCount !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="num text-sm font-semibold text-[var(--text-1)]">
                    {w.avgFishPerSession}
                  </div>
                  <div className="text-xs text-[var(--text-3)] uppercase tracking-wide">
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
        icon={<MapPin className="h-5 w-5 text-[var(--accent)]" />}
        title="Best Rivers"
        subtitle="Min. 2 sessions"
      >
        {data.bestRivers.length === 0 ? (
          <EmptyNote>Fish the same river at least twice to see stats.</EmptyNote>
        ) : (
          <div className="space-y-3 mt-2">
            {data.bestRivers.map((r, i) => (
              <div key={r.river} className="flex items-center gap-3">
                <span className="num text-xs font-semibold text-[var(--accent)] w-5 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[var(--text-1)] truncate">{r.river}</div>
                  <div className="text-xs text-[var(--text-3)]">
                    {r.totalFish} fish in {r.sessionCount} sessions
                  </div>
                </div>
                <div className="text-right">
                  <div className="num text-sm font-semibold text-[var(--text-1)]">
                    {r.avgFishPerSession}
                  </div>
                  <div className="text-xs text-[var(--text-3)] uppercase tracking-wide">
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
        icon={<Fish className="h-5 w-5 text-[var(--accent)]" />}
        title="Species Breakdown"
      >
        {data.speciesBreakdown.length === 0 ? (
          <EmptyNote>Log species on your catches to see the breakdown.</EmptyNote>
        ) : (
          <>
            {/* Simple donut-like bar */}
            <div className="flex h-3 rounded-full overflow-hidden mt-3 mb-4 bg-[var(--border)]">
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
                  <span className="text-sm text-[var(--text-1)] flex-1 truncate">
                    {s.species}
                  </span>
                  <span className="num text-xs text-[var(--text-3)]">
                    {s.count} ({s.pct}%)
                  </span>
                </div>
              ))}
              {data.speciesBreakdown.length > 6 && (
                <div className="text-xs text-[var(--text-3)]">
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
          icon={<TrendingUp className="h-5 w-5 text-[var(--accent)]" />}
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
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--ink)] text-[var(--paper)] text-xs num px-2 py-1 rounded-[var(--radius-sm)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {t.fish} fish / {t.sessions} sessions
              </div>
              <div
                className="w-full rounded-t transition-all duration-500"
                style={{
                  height: `${Math.max(heightPct, 2)}%`,
                  backgroundColor:
                    t.fish > 0 ? "var(--accent)" : "var(--border)",
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
            className="flex-1 text-center text-xs text-[var(--text-3)] truncate"
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
    <div className="ea-card">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h2 className="font-display text-base font-semibold text-[var(--text-1)]">{title}</h2>
      </div>
      {subtitle && (
        <p className="ea-overline mb-1">
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
      <div className="ea-stat-value">{value}</div>
      <div className="ea-stat-label mt-0.5">{label}</div>
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-[var(--text-3)] mt-3 italic">{children}</p>
  );
}

function SkeletonCard({ tall }: { tall?: boolean }) {
  return (
    <div
      className={`ea-card animate-pulse ${
        tall ? "md:col-span-2 xl:col-span-3" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded bg-[var(--border)]" />
        <div className="h-4 w-32 rounded bg-[var(--border)]" />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full rounded bg-[var(--border)]" />
        <div className="h-3 w-3/4 rounded bg-[var(--border)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--border)]" />
      </div>
    </div>
  );
}
