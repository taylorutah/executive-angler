'use client';

import { useEffect, useState } from 'react';
import { AwardBadge } from '@/components/ui/AwardBadge';
import type { RiverStats } from '@/types/awards';
import { TrendingUp, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface RiverStatsWidgetProps {
  riverName: string;
}

export function RiverStatsWidget({ riverName }: RiverStatsWidgetProps) {
  const [stats, setStats] = useState<RiverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/stats/river?river=${encodeURIComponent(riverName)}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (riverName) {
      fetchStats();
    }
  }, [riverName]);

  if (loading) {
    return (
      <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-4 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-[#A8B2BD]" />
      </div>
    );
  }

  if (error || !stats) {
    return null; // Silently fail for widget
  }

  return (
    <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-sm font-semibold text-cream flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#E8923A]" />
          {stats.river_name} Stats
        </h3>
        <Link
          href="/journal/stats"
          className="text-xs text-[#A8B2BD] hover:text-[#00B4D8] transition-colors flex items-center gap-1"
        >
          View All
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Compact stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-[#0D1117] rounded p-2 border border-[#21262D]">
          <div className="text-xs text-[#A8B2BD]">Sessions</div>
          <div className="text-lg font-bold text-cream">{stats.total_sessions}</div>
        </div>
        <div className="bg-[#0D1117] rounded p-2 border border-[#21262D]">
          <div className="text-xs text-[#A8B2BD]">Total Fish</div>
          <div className="text-lg font-bold text-cream">{stats.total_fish}</div>
        </div>
        <div className="bg-[#0D1117] rounded p-2 border border-[#21262D]">
          <div className="text-xs text-[#A8B2BD]">Avg/Trip</div>
          <div className="text-lg font-bold text-cream">{stats.avg_fish_per_session.toFixed(1)}</div>
        </div>
      </div>

      {/* Awards */}
      {stats.awards.length > 0 && (
        <div>
          <div className="text-xs text-[#A8B2BD] uppercase tracking-wide mb-2">
            Achievements ({stats.awards.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.awards.map((award) => (
              <AwardBadge key={award.id} award={award} size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Quick facts */}
      {(stats.favorite_fly || stats.biggest_fish) && (
        <div className="mt-3 pt-3 border-t border-[#21262D] space-y-1">
          {stats.favorite_fly && (
            <div className="flex justify-between text-xs">
              <span className="text-[#A8B2BD]">Top Fly:</span>
              <span className="text-cream font-medium">{stats.favorite_fly}</span>
            </div>
          )}
          {stats.biggest_fish && (
            <div className="flex justify-between text-xs">
              <span className="text-[#A8B2BD]">Biggest:</span>
              <span className="text-cream font-medium">{stats.biggest_fish}&quot;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
