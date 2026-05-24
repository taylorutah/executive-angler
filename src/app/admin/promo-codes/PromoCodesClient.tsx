"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Shield,
  Tag,
  TicketPercent,
  Users as UsersIcon,
  Clock,
  CheckCircle2,
  Copy,
  Search,
} from "lucide-react";
import type { PromoCodeRow, PromoRedemptionRow } from "./page";
import { Button } from "@/components/ui/Button";

export default function PromoCodesClient({
  codes,
  redemptions,
}: {
  codes: PromoCodeRow[];
  redemptions: PromoRedemptionRow[];
}) {
  const [filterCode, setFilterCode] = useState<string>("all");
  const [onlyActive, setOnlyActive] = useState(false);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const totals = useMemo(() => {
    const seats = codes.reduce((a, c) => a + c.max_redemptions, 0);
    const redeemed = codes.reduce((a, c) => a + c.total_redeemed, 0);
    const active = codes.reduce((a, c) => a + c.currently_active, 0);
    const remaining = codes.reduce((a, c) => a + c.remaining, 0);
    return { seats, redeemed, active, remaining };
  }, [codes]);

  const filteredRedemptions = redemptions.filter((r) => {
    if (filterCode !== "all" && r.code !== filterCode) return false;
    if (onlyActive && !r.is_active) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.email?.toLowerCase().includes(q) ||
        r.display_name?.toLowerCase().includes(q) ||
        r.username?.toLowerCase().includes(q) ||
        r.user_id.includes(q) ||
        r.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  async function copyRedeemUrl(code: string) {
    const url = `https://www.executiveangler.com/redeem?code=${code}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // noop
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/admin"
            className="text-[#A8B2BD] hover:text-[#F0F6FC]"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Shield className="h-5 w-5 text-[#E8923A]" />
          <h1 className="font-serif text-2xl text-[#F0F6FC]">Promo Codes</h1>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<TicketPercent className="h-4 w-4 text-[#E8923A]" />}
            val={totals.seats}
            label="Total Seats"
          />
          <StatCard
            icon={<UsersIcon className="h-4 w-4 text-[#0BA5C7]" />}
            val={totals.redeemed}
            label="Redeemed"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4 text-[#2EA44F]" />}
            val={totals.active}
            label="Currently Pro"
            accent="text-[#2EA44F]"
          />
          <StatCard
            icon={<Clock className="h-4 w-4 text-[#A8B2BD]" />}
            val={totals.remaining}
            label="Remaining"
          />
        </div>

        {/* Codes table */}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A8B2BD] mb-3">
          Codes
        </h2>
        <div className="space-y-2 mb-8">
          {codes.length === 0 && (
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-8 text-center text-[#6E7681]">
              No promo codes yet. Seed one via SQL.
            </div>
          )}
          {codes.map((c) => {
            const pct = Math.min(
              100,
              Math.round((c.total_redeemed / Math.max(1, c.max_redemptions)) * 100)
            );
            return (
              <div
                key={c.id}
                className="bg-[#161B22] border border-[#21262D] rounded-xl p-4"
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[#E8923A]" />
                    <span className="font-mono text-lg font-bold text-[#F0F6FC]">
                      {c.code}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8923A]/10 text-[#E8923A]">
                    {c.campaign_source}
                  </span>
                  <span className="text-xs text-[#A8B2BD]">
                    {c.duration_days}d Pro
                  </span>
                  <Button
                    onClick={() => copyRedeemUrl(c.code)}
                    variant="outline"
                    size="sm"
                    icon={Copy}
                   
                    className="ml-auto"
                  >
                    {copied === c.code ? "Copied!" : "Copy redeem URL"}
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-3">
                  <MiniStat label="Total" val={c.max_redemptions} />
                  <MiniStat label="Redeemed" val={c.total_redeemed} />
                  <MiniStat
                    label="Active"
                    val={c.currently_active}
                    accent="text-[#2EA44F]"
                  />
                  <MiniStat
                    label="Remaining"
                    val={c.remaining}
                    accent="text-[#E8923A]"
                  />
                </div>

                {/* Progress */}
                <div className="h-1.5 w-full rounded-full bg-[#21262D]">
                  <div
                    className="h-1.5 rounded-full bg-[#E8923A]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#6E7681]">
                  <span>
                    Active from {fmtDate(c.active_from)}
                    {c.active_until ? ` → ${fmtDate(c.active_until)}` : " (open)"}
                  </span>
                  <span>{pct}% of seats used</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Redemption filters */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A8B2BD]">
            Redemptions ({filteredRedemptions.length})
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6E7681]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="email, name, id..."
                className="pl-8 pr-3 py-1.5 bg-[#161B22] border border-[#21262D] rounded-md text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]"
              />
            </div>
            <select
              value={filterCode}
              onChange={(e) => setFilterCode(e.target.value)}
              className="px-2 py-1.5 bg-[#161B22] border border-[#21262D] rounded-md text-xs text-[#F0F6FC]"
            >
              <option value="all">All codes</option>
              {codes.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <button
              onClick={() => setOnlyActive((v) => !v)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                onlyActive
                  ? "bg-[#2EA44F]/20 text-[#2EA44F] border border-[#2EA44F]/40"
                  : "bg-[#161B22] text-[#A8B2BD] border border-[#21262D]"
              }`}
            >
              Active only
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#21262D] bg-[#161B22]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#21262D] text-[11px] uppercase tracking-wider text-[#6E7681]">
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Redeemed</th>
                <th className="px-4 py-3 font-semibold">Expires</th>
                <th className="px-4 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262D]">
              {filteredRedemptions.map((r) => (
                <tr
                  key={r.id}
                  className="transition-colors hover:bg-[#21262D]/40"
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-[#E8923A]">
                    {r.code}
                  </td>
                  <td className="px-4 py-3 text-[#F0F6FC]">
                    {r.display_name || r.username || r.user_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#A8B2BD]">
                    {r.email || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#A8B2BD]">
                    {fmtDateTime(r.redeemed_at)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#A8B2BD]">
                    {fmtDate(r.premium_until)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2EA44F]/15 text-[#2EA44F]">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#21262D] text-[#6E7681]">
                        Expired
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRedemptions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-xs text-[#6E7681]"
                  >
                    No redemptions match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  val,
  label,
  accent = "text-[#F0F6FC]",
}: {
  icon: React.ReactNode;
  val: number;
  label: string;
  accent?: string;
}) {
  return (
    <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#6E7681] mb-1">
        {icon} {label}
      </div>
      <p className={`text-2xl font-bold font-mono ${accent}`}>
        {val.toLocaleString()}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  val,
  accent = "text-[#F0F6FC]",
}: {
  label: string;
  val: number;
  accent?: string;
}) {
  return (
    <div className="bg-[#0D1117] border border-[#21262D] rounded-lg p-2 text-center">
      <p className={`text-lg font-bold font-mono ${accent}`}>
        {val.toLocaleString()}
      </p>
      <p className="text-[9px] uppercase tracking-wider text-[#6E7681]">
        {label}
      </p>
    </div>
  );
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDateTime(d: string): string {
  const dt = new Date(d);
  return (
    dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " " +
    dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}
