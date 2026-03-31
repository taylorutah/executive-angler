'use client';

import { AwardBadge } from '@/components/ui/AwardBadge';
import type { RiverStats } from '@/types/awards';
import { Trophy, Fish, TrendingUp, Star, Target } from 'lucide-react';

const AWARDS_VISIBLE = process.env.NEXT_PUBLIC_FEATURE_AWARDS_VISIBLE === 'true';

interface RiverStatsCardProps {
  stats: RiverStats;
  compact?: boolean;
}

export function RiverStatsCard({ stats, compact = false }: RiverStatsCardProps) {
  if (compact) {
    return (
      <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-heading text-lg text-cream">{stats.river_name}</h3>
            <div className="text-sm text-slate-400">
              {stats.total_sessions} {stats.total_sessions === 1 ? 'session' : 'sessions'}
            </div>
          </div>
          {AWARDS_VISIBLE && stats.awards.length > 0 && (
            <div className="flex gap-1">
              {stats.awards.slice(0, 3).map((award) => (
                <AwardBadge key={award.id} award={award} size="sm" />
              ))}
              {stats.awards.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-[#21262D] flex items-center justify-center text-xs text-slate-400">
                  +{stats.awards.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatItem icon={Fish} label="Total Fish" value={stats.total_fish} />
          <StatItem
            icon={TrendingUp}
            label="Avg/Session"
            value={stats.avg_fish_per_session.toFixed(1)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-heading text-2xl text-cream mb-1">{stats.river_name}</h3>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>
              {stats.total_sessions} {stats.total_sessions === 1 ? 'session' : 'sessions'}
            </span>
            <span>•</span>
            <span>{stats.total_fish} fish</span>
          </div>
        </div>
        {AWARDS_VISIBLE && stats.awards.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8923A]/10 rounded-full">
            <Star className="w-3.5 h-3.5 text-[#E8923A]" />
            <span className="text-xs font-bold text-[#E8923A]">{stats.awards.length} awards</span>
          </div>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatBox
          icon={Fish}
          label="Total Fish"
          value={stats.total_fish.toString()}
          color="#00B4D8"
        />
        <StatBox
          icon={TrendingUp}
          label="Avg Per Session"
          value={stats.avg_fish_per_session.toFixed(1)}
          color="#E8923A"
        />
        <StatBox
          icon={Trophy}
          label="Best Session"
          value={stats.best_session_fish_count.toString()}
          color="#FFD700"
        />
        {stats.biggest_fish && (
          <StatBox
            icon={Target}
            label="Biggest Fish"
            value={`${stats.biggest_fish}"`}
            color="#00B4D8"
          />
        )}
      </div>

      {/* Secondary Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#21262D]">
        {stats.favorite_fly && (
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Favorite Fly</div>
            <div className="text-cream font-medium">{stats.favorite_fly}</div>
          </div>
        )}
        {stats.species_caught.length > 0 && (
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
              Species ({stats.species_caught.length})
            </div>
            <div className="text-cream font-medium">{stats.species_caught.join(', ')}</div>
          </div>
        )}
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Last Fished</div>
          <div className="text-cream font-medium">
            {new Date(stats.last_session).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Awards Section — hidden when FEATURE_AWARDS_VISIBLE is false */}
      {AWARDS_VISIBLE && stats.awards.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[#21262D]">
          <h4 className="font-heading text-lg text-cream mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#E8923A]" />
            River Milestones
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.awards.map((award) => (
              <AwardBadge key={award.id} award={award} size="md" showDetails />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-[#0D1117] rounded-lg p-4 border border-[#21262D]">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
      </div>
      <div className="text-2xl font-bold text-cream">{value}</div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-[#00B4D8]" />
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm font-semibold text-cream">{value}</div>
      </div>
    </div>
  );
}
