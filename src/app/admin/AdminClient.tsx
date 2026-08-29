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
    <div className="ea-card flex flex-col gap-3">
      <span
        className="h-9 w-9 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]"
        aria-hidden
      >
        {icon}
      </span>
      <p className="ea-stat-value">{value.toLocaleString()}</p>
      <p className="ea-stat-label">{label}</p>
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
    <div className="min-h-screen bg-[var(--paper)] text-[var(--text-1)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-6 py-6">
        <div className="mx-auto flex max-w-[var(--container)] items-center gap-3">
          <Shield className="h-6 w-6 text-[var(--accent)]" />
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)]">Admin Dashboard</h1>
        </div>
      </header>

      <main className="mx-auto max-w-[var(--container)] space-y-10 px-6 py-8">
        {/* ── Quick Links ── */}
        <section>
          <h2 className="ea-overline mb-4">
            Manage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/admin/users" className="card-hover group flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors duration-150 ease-standard">
              <Users className="h-5 w-5 text-[var(--accent)]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-1)]">User Management</p>
                <p className="text-xs text-[var(--text-3)]">View all users, activity, stats</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-3)] group-hover:text-[var(--accent)]" />
            </Link>
            <Link href="/admin/photos" className="card-hover group flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors duration-150 ease-standard">
              <ImageIcon className="h-5 w-5 text-[var(--accent)]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-1)]">Photo Moderation</p>
                <p className="text-xs text-[var(--text-3)]">Review uploaded photos</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-3)] group-hover:text-[var(--accent)]" />
            </Link>
            <Link href="/admin/promo-codes" className="card-hover group flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors duration-150 ease-standard">
              <TicketPercent className="h-5 w-5 text-[var(--accent)]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-1)]">Promo Codes</p>
                <p className="text-xs text-[var(--text-3)]">Track redemptions & active Pro users</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-3)] group-hover:text-[var(--accent)]" />
            </Link>
            <Link href="/admin/submissions" className="card-hover group flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors duration-150 ease-standard">
              <Send className="h-5 w-5 text-[var(--accent)]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-1)]">Submissions</p>
                <p className="text-xs text-[var(--text-3)]">Review community content</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-3)] group-hover:text-[var(--accent)]" />
            </Link>
          </div>
          <div className="mt-3">
            <Link href="/admin/setup" className="group inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-2)] hover:border-[var(--border-strong)] hover:text-[var(--text-1)] transition-colors duration-150 ease-standard">
              <Database className="h-3.5 w-3.5 text-[var(--text-3)]" />
              <span>Database Setup · schema & migrations</span>
            </Link>
          </div>
        </section>

        {/* ── Metric Cards Grid ── */}
        <section>
          <h2 className="ea-overline mb-4">
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
            <h2 className="ea-overline mb-4">
              Top Rivers
            </h2>
            <div className="ea-card">
              <ul className="space-y-3">
                {topRivers.map((river, i) => {
                  const pct = Math.max(
                    (river.count / maxRiverCount) * 100,
                    4
                  );
                  return (
                    <li key={river.name} className="flex items-center gap-3">
                      <span className="w-5 shrink-0 text-right num text-xs text-[var(--text-3)]">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm text-[var(--text-1)]">
                            <MapPin className="h-3.5 w-3.5 text-[var(--text-3)]" />
                            {river.name}
                          </span>
                          <span className="num text-xs text-[var(--text-1)]">
                            {river.count}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-[var(--radius-sm)] bg-[var(--paper-deep)]">
                          <div
                            className="h-2 rounded-[var(--radius-sm)] bg-[var(--accent)]"
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
            <h2 className="ea-overline mb-4">
              Recent Sessions
            </h2>
            <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]">
              <table className="ea-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>River</th>
                    <th>Angler</th>
                    <th className="text-right">Fish</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((s) => {
                    const displayName =
                      s.profiles?.display_name ||
                      s.profiles?.username ||
                      s.user_id.slice(0, 8);
                    return (
                      <tr key={s.id}>
                        <td className="whitespace-nowrap num text-[var(--text-2)]">
                          {s.date}
                        </td>
                        <td className="text-[var(--text-1)]">
                          {s.river_name ?? "—"}
                        </td>
                        <td className="text-[var(--text-2)]">
                          {displayName}
                        </td>
                        <td className="text-right num text-[var(--text-1)]">
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
