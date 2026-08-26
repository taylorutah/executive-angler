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
  Send,
  TicketPercent,
} from "@/icons";
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
    <div className="rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[var(--text-meta)]">{icon}</span>
      </div>
      <p className="font-mono text-3xl font-bold text-[var(--action)]">
        {value.toLocaleString()}
      </p>
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-meta)]">
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
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-rule)] px-6 py-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <Shield className="h-7 w-7 text-[var(--action)]" />
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-8">
        {/* ── Quick Links ── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-body)]">
            Manage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/admin/users" className="group flex items-center gap-3 rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)] p-4 hover:border-[var(--action)] transition-colors">
              <Users className="h-5 w-5 text-[var(--action)]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors">User Management</p>
                <p className="text-[11px] text-[var(--text-meta)]">View all users, activity, stats</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-meta)] group-hover:text-[var(--action)]" />
            </Link>
            <Link href="/admin/photos" className="group flex items-center gap-3 rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)] p-4 hover:border-[var(--signal-live)] transition-colors">
              <ImageIcon className="h-5 w-5 text-[var(--signal-live)]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--signal-live)] transition-colors">Photo Moderation</p>
                <p className="text-[11px] text-[var(--text-meta)]">Review uploaded photos</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-meta)] group-hover:text-[var(--signal-live)]" />
            </Link>
            <Link href="/admin/promo-codes" className="group flex items-center gap-3 rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)] p-4 hover:border-[var(--action)] transition-colors">
              <TicketPercent className="h-5 w-5 text-[var(--action)]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--action)] transition-colors">Promo Codes</p>
                <p className="text-[11px] text-[var(--text-meta)]">Track redemptions & active Pro users</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-meta)] group-hover:text-[var(--action)]" />
            </Link>
            <Link href="/admin/submissions" className="group flex items-center gap-3 rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)] p-4 hover:border-purple-400 transition-colors">
              <Send className="h-5 w-5 text-purple-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-purple-400 transition-colors">Submissions</p>
                <p className="text-[11px] text-[var(--text-meta)]">Review community content</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-meta)] group-hover:text-purple-400" />
            </Link>
          </div>
          <div className="mt-3">
            <Link href="/admin/setup" className="group inline-flex items-center gap-2 rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] px-3 py-2 text-xs text-[var(--text-body)] hover:border-[var(--state-positive)] hover:text-[var(--state-positive)] transition-colors">
              <Database className="h-3.5 w-3.5 text-[var(--state-positive)]" />
              <span>Database Setup · schema & migrations</span>
            </Link>
          </div>
        </section>

        {/* ── Metric Cards Grid ── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-body)]">
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
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-body)]">
              Top Rivers
            </h2>
            <div className="rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)] p-5">
              <ul className="space-y-3">
                {topRivers.map((river, i) => {
                  const pct = Math.max(
                    (river.count / maxRiverCount) * 100,
                    4
                  );
                  return (
                    <li key={river.name} className="flex items-center gap-3">
                      <span className="w-5 shrink-0 text-right font-mono text-xs text-[var(--text-meta)]">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
                            <MapPin className="h-3.5 w-3.5 text-[var(--signal-live)]" />
                            {river.name}
                          </span>
                          <span className="font-mono text-xs text-[var(--action)]">
                            {river.count}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[var(--border-rule)]">
                          <div
                            className="h-1.5 rounded-full bg-[var(--signal-live)]"
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
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-body)]">
              Recent Sessions
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[var(--border-rule)] bg-[var(--surface-raised)]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-rule)] text-xs uppercase tracking-wider text-[var(--text-meta)]">
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
                        className="transition-colors hover:bg-[var(--border-rule)]/40"
                      >
                        <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-[var(--text-body)]">
                          {s.date}
                        </td>
                        <td className="px-5 py-3 text-[var(--text-primary)]">
                          {s.river_name ?? "—"}
                        </td>
                        <td className="px-5 py-3 text-[var(--text-body)]">
                          {displayName}
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[var(--action)]">
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
