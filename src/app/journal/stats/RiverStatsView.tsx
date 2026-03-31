'use client';

import { useEffect, useState } from 'react';
import { RiverStatsCard } from '@/components/stats/RiverStatsCard';
import type { RiverStats } from '@/types/awards';
import { Loader2, TrendingUp } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8923A]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-6 text-red-400">
        {error}
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-12 text-center">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-600" />
        <h3 className="font-heading text-xl text-cream mb-2">No stats yet</h3>
        <p className="text-slate-400">Log some fishing sessions to see your river stats!</p>
      </div>
    );
  }

  const totalSessions = stats.reduce((sum, s) => sum + s.total_sessions, 0);
  const totalFish = stats.reduce((sum, s) => sum + s.total_fish, 0);

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-[#E8923A]/10 to-[#00B4D8]/10 border border-[#21262D] rounded-lg p-6">
        <h2 className="font-heading text-2xl text-cream mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Your River Stats
        </h2>
        <div className={`grid grid-cols-2 ${AWARDS_VISIBLE ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
          <SummaryBox label="Rivers Fished" value={stats.length} />
          <SummaryBox label="Total Sessions" value={totalSessions} />
          <SummaryBox label="Total Fish" value={totalFish} />
        </div>
      </div>

      {/* River Stats Cards */}
      <div className="space-y-4">
        {stats.map((riverStats) => (
          <RiverStatsCard key={riverStats.river_name} stats={riverStats} />
        ))}
      </div>
    </div>
  );
}

function SummaryBox({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon?: any;
}) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-cream mb-1 flex items-center justify-center gap-2">
        {Icon && <Icon className="w-6 h-6 text-[#E8923A]" />}
        {value}
      </div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}
