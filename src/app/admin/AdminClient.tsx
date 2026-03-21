"use client";

import Link from "next/link";
import {
  Shield,
  Users,
  Fish,
  MapPin,
  Activity,
  TrendingUp,
  Feather,
  Heart,
  Image as ImageIcon,
  ChevronRight,
  Database,
} from "lucide-react";
import { ReactNode } from "react";

/* ── Types ── */
interface Metrics {
  totalUsers: number;
  totalSessions: number;
  totalCatches: number;
  totalFlies: number;
  totalFollows: number;
  sessionsLast7d: number;
  newUsersLast7d: number;
}

interface River {
  name: string;
  count: number;
}

interface RecentSession {
  id: string;
  date: string;
  river_name: string | null;
  total_fish: number | null;
  user_id: string;
  profiles: { username: string | null; display_name: string | null } | null;
}

interface AdminClientProps {
  metrics: Metrics;
  topRivers: River[];
  recentSessions: RecentSession[];
}

/* ── Metric Card ── */
function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[#484F58]">{icon}</span>
      </div>
      <p className="font-mono text-3xl font-bold text-[#E8923A]">
        {value.toLocaleString()}
      </p>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#484F58]">
        {label}
      </p>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function AdminClient({
  metrics,
  topRivers,
  recentSessions,
}: AdminClientProps) {
  const maxRiverCount = topRivers.length > 0 ? topRivers[0].count : 1;

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#F0F6FC]">
      {/* Header */}
      <header className="border-b border-[#21262D] px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Shield className="h-7 w-7 text-[#E8923A]" />
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-8">
        {/* ── Quick Links ── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#8B949E]">
            Manage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/admin/users" className="group flex items-center gap-3 rounded-xl border border-[#21262D] bg-[#161B22] p-4 hover:border-[#E8923A] transition-colors">
              <Users className="h-5 w-5 text-[#E8923A]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">User Management</p>
                <p className="text-[11px] text-[#484F58]">View all users, activity, stats</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#484F58] group-hover:text-[#E8923A]" />
            </Link>
            <Link href="/admin/photos" className="group flex items-center gap-3 rounded-xl border border-[#21262D] bg-[#161B22] p-4 hover:border-[#0BA5C7] transition-colors">
              <ImageIcon className="h-5 w-5 text-[#0BA5C7]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#F0F6FC] group-hover:text-[#0BA5C7] transition-colors">Photo Moderation</p>
                <p className="text-[11px] text-[#484F58]">Review uploaded photos</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#484F58] group-hover:text-[#0BA5C7]" />
            </Link>
            <Link href="/admin/setup" className="group flex items-center gap-3 rounded-xl border border-[#21262D] bg-[#161B22] p-4 hover:border-[#2EA44F] transition-colors">
              <Database className="h-5 w-5 text-[#2EA44F]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#F0F6FC] group-hover:text-[#2EA44F] transition-colors">Database Setup</p>
                <p className="text-[11px] text-[#484F58]">Schema status & migrations</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#484F58] group-hover:text-[#2EA44F]" />
            </Link>
          </div>
        </section>

        {/* ── Metric Cards Grid ── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#8B949E]">
            Overview
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              icon={<Users className="h-5 w-5" />}
              label="Total Users"
              value={metrics.totalUsers}
            />
            <MetricCard
              icon={<Activity className="h-5 w-5" />}
              label="Total Sessions"
              value={metrics.totalSessions}
            />
            <MetricCard
              icon={<Fish className="h-5 w-5" />}
              label="Total Catches"
              value={metrics.totalCatches}
            />
            <MetricCard
              icon={<Feather className="h-5 w-5" />}
              label="Total Flies"
              value={metrics.totalFlies}
            />
            <MetricCard
              icon={<Heart className="h-5 w-5" />}
              label="Total Follows"
              value={metrics.totalFollows}
            />
            <MetricCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="New Users (7d)"
              value={metrics.newUsersLast7d}
            />
            <MetricCard
              icon={<Activity className="h-5 w-5" />}
              label="Sessions (7d)"
              value={metrics.sessionsLast7d}
            />
          </div>
        </section>

        {/* ── Top Rivers ── */}
        {topRivers.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#8B949E]">
              Top Rivers
            </h2>
            <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-5">
              <ul className="space-y-3">
                {topRivers.map((river, i) => {
                  const pct = Math.max(
                    (river.count / maxRiverCount) * 100,
                    4
                  );
                  return (
                    <li key={river.name} className="flex items-center gap-3">
                      <span className="w-5 shrink-0 text-right font-mono text-xs text-[#484F58]">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm text-[#F0F6FC]">
                            <MapPin className="h-3.5 w-3.5 text-[#0BA5C7]" />
                            {river.name}
                          </span>
                          <span className="font-mono text-xs text-[#E8923A]">
                            {river.count}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#21262D]">
                          <div
                            className="h-1.5 rounded-full bg-[#0BA5C7]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* ── Recent Sessions ── */}
        {recentSessions.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#8B949E]">
              Recent Sessions
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[#21262D] bg-[#161B22]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#21262D] text-xs uppercase tracking-wider text-[#484F58]">
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">River</th>
                    <th className="px-5 py-3 font-semibold">Angler</th>
                    <th className="px-5 py-3 text-right font-semibold">Fish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21262D]">
                  {recentSessions.map((s) => {
                    const displayName =
                      s.profiles?.display_name ||
                      s.profiles?.username ||
                      s.user_id.slice(0, 8);
                    return (
                      <tr
                        key={s.id}
                        className="transition-colors hover:bg-[#21262D]/40"
                      >
                        <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-[#8B949E]">
                          {s.date}
                        </td>
                        <td className="px-5 py-3 text-[#F0F6FC]">
                          {s.river_name ?? "—"}
                        </td>
                        <td className="px-5 py-3 text-[#8B949E]">
                          {displayName}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[#E8923A]">
                          {s.total_fish ?? 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
