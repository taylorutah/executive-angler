'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { RiverStats } from '@/types/awards';
import { Loader2, TrendingUp, ChevronRight } from "@/icons";
import PageHeader from '@/components/ui/PageHeader';

const AWARDS_VISIBLE = process.env.NEXT_PUBLIC_FEATURE_AWARDS_VISIBLE === 'true';

export default function RiverStatsView() {
  const [stats, setStats] = useState<RiverStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats/river');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--action)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  const totalSessions = stats.reduce((sum, s) => sum + s.total_sessions, 0);
  const totalFish = stats.reduce((sum, s) => sum + s.total_fish, 0);

  const meta = stats.length === 0
    ? null
    : (
      <span className="inline-flex flex-wrap items-baseline gap-x-2">
        <span><span className="text-[var(--action)] font-semibold">{stats.length}</span> rivers</span>
        <span className="text-[#3a4150]">·</span>
        <span><span className="text-[var(--text-primary)] font-semibold">{totalSessions}</span> sessions</span>
        <span className="text-[#3a4150]">·</span>
        <span><span className="text-[var(--text-primary)] font-semibold">{totalFish}</span> fish</span>
      </span>
    );

  // Most-fished river by session count drives the relative bar — gives each
  // row a quick-glance "how much have I been here" cue without a real chart.
  const maxSessions = stats.reduce((m, s) => Math.max(m, s.total_sessions), 1);

  return (
    <>
      <PageHeader eyebrow="Journal" title="River stats" meta={meta} />

      {stats.length === 0 ? (
        <div className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-xl p-10 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-3 text-[#3a4150]" />
          <p className="text-[14px] text-[var(--text-body)]">No stats yet. Log a session to start tracking your rivers.</p>
        </div>
      ) : (
        <div className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-xl divide-y divide-[#21262D] overflow-hidden">
          {stats.map((s) => (
            <RiverRow key={s.river_name} stats={s} maxSessions={maxSessions} />
          ))}
        </div>
      )}
    </>
  );
}

function RiverRow({
  stats: s,
  maxSessions,
}: {
  stats: RiverStats;
  maxSessions: number;
}) {
  const lastFished = s.last_session
    ? new Date(s.last_session + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const href = s.river_slug ? `/rivers/${s.river_slug}` : '/journal';
  const intensity = Math.max(0.18, s.total_sessions / maxSessions);

  return (
    <Link
      href={href}
      className="group relative block px-4 py-3.5 hover:bg-[#1F2630] transition-colors"
    >
      {/* Copper accent rail — width scales with relative session count */}
      <span
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--action)] transition-all group-hover:w-[5px]"
        style={{ opacity: intensity }}
        aria-hidden
      />

      <div className="pl-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-heading text-[17px] text-[var(--text-primary)] tracking-[-0.005em] truncate">
            {s.river_name}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {AWARDS_VISIBLE && s.awards.length > 0 && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#FFD479] tracking-[0.04em]">
                ★ {s.awards.length}
              </span>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-[#3a4150] group-hover:text-[var(--action)] transition-colors" />
          </div>
        </div>

        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-mono text-[12px] text-[var(--text-meta)] tabular-nums">
          <span>
            <span className="text-[var(--text-primary)] font-semibold">{s.total_sessions}</span>{' '}
            <span className="lowercase">{s.total_sessions === 1 ? 'session' : 'sessions'}</span>
          </span>
          <span className="text-[#3a4150]">·</span>
          <span>
            <span className="text-[var(--signal-live)] font-semibold">{s.total_fish}</span> fish
          </span>
          <span className="text-[#3a4150]">·</span>
          <span>
            <span className="text-[var(--text-body)]">{s.avg_fish_per_session.toFixed(1)}</span>
            <span className="text-[var(--text-meta)]">/s</span>
          </span>
          {s.biggest_fish ? (
            <>
              <span className="text-[#3a4150]">·</span>
              <span>
                <span className="text-[var(--action)] font-semibold">{s.biggest_fish}&quot;</span>{' '}
                <span className="lowercase">pb</span>
              </span>
            </>
          ) : null}
          {s.species_caught.length > 0 ? (
            <>
              <span className="text-[#3a4150]">·</span>
              <span>
                <span className="text-[#7BD9C2] font-semibold">{s.species_caught.length}</span> species
              </span>
            </>
          ) : null}
          {s.favorite_fly ? (
            <>
              <span className="text-[#3a4150]">·</span>
              <span className="text-[#C4B5FD] lowercase">{s.favorite_fly}</span>
            </>
          ) : null}
          <span className="text-[#3a4150]">·</span>
          <span className="text-[var(--text-meta)]">last fished {lastFished}</span>
        </div>
      </div>
    </Link>
  );
}
