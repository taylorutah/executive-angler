"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft, Shield, Crown, Ban, CheckCircle, XCircle,
  Fish, Calendar, Feather, Users, Clock, StickyNote,
  AlertTriangle, Sparkles, UserX, UserCheck, Loader2
} from "lucide-react";

interface UserData {
  profile: {
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    created_at: string | null;
    is_premium: boolean;
    is_banned: boolean;
    ban_reason: string | null;
    banned_at: string | null;
    premium_granted_by: string | null;
    premium_granted_at: string | null;
  } | null;
  sessions: { id: string; date: string; river_name: string | null; total_fish: number | null; is_private: boolean }[];
  catches: { id: string; species: string | null; length_inches: number | null }[];
  flies: { id: string; name: string | null }[];
  followers: number;
  following: number;
  auditLog: { id: string; action: string; admin_email: string; details: Record<string, unknown>; created_at: string }[];
}

export default function UserDetailClient({ userId }: { userId: string }) {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [noteText, setNoteText] = useState("");
  const [proReason, setProReason] = useState("");
  const [banReason, setBanReason] = useState("");
  const [showBanConfirm, setShowBanConfirm] = useState(false);

  useEffect(() => { loadUser(); }, [userId]);

  async function loadUser() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error("Failed to load user");
      setData(await res.json());
    } catch (e) {
      setMessage({ type: "error", text: "Failed to load user data" });
    }
    setLoading(false);
  }

  async function adminAction(action: string, extra: Record<string, unknown> = {}) {
    setActionLoading(action);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: result.message });
        await loadUser(); // Refresh data
      } else {
        setMessage({ type: "error", text: result.error || "Action failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#E8923A] animate-spin" />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <p className="text-[#A8B2BD]">User not found</p>
      </div>
    );
  }

  const p = data.profile;
  const totalFish = data.sessions.reduce((sum, s) => sum + (s.total_fish || 0), 0);
  const species = [...new Set(data.catches.map(c => c.species).filter(Boolean))];
  const lengths = data.catches.map(c => c.length_inches).filter((l): l is number => l != null && l > 0);
  const biggestFish = lengths.length > 0 ? Math.max(...lengths) : null;
  const lastSession = data.sessions[0];

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/users" className="text-[#A8B2BD] hover:text-[#F0F6FC] transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Shield className="h-5 w-5 text-[#E8923A]" />
          <h1 className="font-serif text-xl text-[#F0F6FC]">User Detail</h1>
        </div>

        {/* Status message */}
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg border text-sm ${
            message.type === "success"
              ? "bg-green-950/30 border-green-800 text-green-400"
              : "bg-red-950/30 border-red-800 text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        {/* User header card */}
        <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#E8923A]/15 flex items-center justify-center shrink-0">
              {p.avatar_url ? (
                <Image src={p.avatar_url} alt="" width={64} height={64} className="object-cover w-16 h-16" unoptimized />
              ) : (
                <span className="text-2xl font-bold text-[#E8923A]">
                  {(p.display_name || p.username || "?")[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-[#F0F6FC]">{p.display_name || "No name"}</h2>
                {p.username && <span className="text-sm text-[#E8923A]">@{p.username}</span>}
                {p.is_premium && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#E8923A]/15 text-[#E8923A] rounded-full text-[10px] font-bold uppercase">
                    <Crown className="h-3 w-3" /> PRO
                  </span>
                )}
                {p.is_banned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-950/50 text-red-400 rounded-full text-[10px] font-bold uppercase">
                    <Ban className="h-3 w-3" /> BANNED
                  </span>
                )}
              </div>
              {p.bio && <p className="text-sm text-[#A8B2BD] mt-1 line-clamp-2">{p.bio}</p>}
              <div className="flex items-center gap-4 mt-2 text-xs text-[#6E7681]">
                <span>ID: <code className="text-[#A8B2BD]">{p.user_id.slice(0, 12)}...</code></span>
                <span>Joined {formatDate(p.created_at)}</span>
                {p.premium_granted_by && (
                  <span>Pro granted by {p.premium_granted_by} on {formatDate(p.premium_granted_at)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Ban notice */}
          {p.is_banned && p.ban_reason && (
            <div className="mt-4 px-4 py-3 bg-red-950/20 border border-red-900/50 rounded-lg">
              <p className="text-sm text-red-400"><strong>Ban reason:</strong> {p.ban_reason}</p>
              <p className="text-xs text-red-500/60 mt-1">Banned {formatDate(p.banned_at)}</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Stats + Actions */}
          <div className="lg:col-span-1 space-y-4">
            {/* Stats */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
              <h3 className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider mb-3">Stats</h3>
              <div className="space-y-3">
                <StatRow icon={<Calendar className="h-4 w-4 text-[#E8923A]" />} label="Sessions" value={String(data.sessions.length)} />
                <StatRow icon={<Fish className="h-4 w-4 text-[#0BA5C7]" />} label="Total Fish" value={String(totalFish)} />
                <StatRow icon={<Fish className="h-4 w-4 text-yellow-400" />} label="Species" value={String(species.length)} />
                <StatRow icon={<Feather className="h-4 w-4 text-purple-400" />} label="Fly Patterns" value={String(data.flies.length)} />
                <StatRow icon={<Users className="h-4 w-4 text-[#E8923A]" />} label="Followers" value={String(data.followers)} />
                <StatRow icon={<Users className="h-4 w-4 text-[#A8B2BD]" />} label="Following" value={String(data.following)} />
                {biggestFish && <StatRow icon={<Fish className="h-4 w-4 text-green-400" />} label="Biggest Fish" value={`${biggestFish.toFixed(1)}"`} />}
                <StatRow icon={<Clock className="h-4 w-4 text-[#6E7681]" />} label="Last Session" value={lastSession ? formatDate(lastSession.date) : "Never"} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
              <h3 className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider mb-3">Actions</h3>
              <div className="space-y-2">
                {/* Pro toggle */}
                {!p.is_premium ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={proReason}
                      onChange={e => setProReason(e.target.value)}
                      placeholder="Reason (optional)"
                      className="w-full px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]"
                    />
                    <button
                      onClick={() => adminAction("grant_pro", { reason: proReason })}
                      disabled={actionLoading === "grant_pro"}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#E8923A]/15 text-[#E8923A] rounded-lg text-sm font-semibold hover:bg-[#E8923A]/25 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === "grant_pro" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Grant Pro Access
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => adminAction("revoke_pro")}
                    disabled={actionLoading === "revoke_pro"}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#21262D] text-[#A8B2BD] rounded-lg text-sm font-semibold hover:bg-[#2D333B] transition-colors disabled:opacity-50"
                  >
                    {actionLoading === "revoke_pro" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Revoke Pro Access
                  </button>
                )}

                {/* Ban toggle */}
                {!p.is_banned ? (
                  showBanConfirm ? (
                    <div className="space-y-2 p-3 bg-red-950/20 border border-red-900/50 rounded-lg">
                      <p className="text-xs text-red-400 font-semibold">Confirm ban</p>
                      <input
                        type="text"
                        value={banReason}
                        onChange={e => setBanReason(e.target.value)}
                        placeholder="Ban reason (required)"
                        className="w-full px-3 py-2 bg-[#0D1117] border border-red-900/50 rounded-lg text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-red-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => { if (banReason.trim()) adminAction("ban", { reason: banReason }); }}
                          disabled={!banReason.trim() || actionLoading === "ban"}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500 disabled:opacity-50"
                        >
                          {actionLoading === "ban" ? "Banning..." : "Confirm Ban"}
                        </button>
                        <button
                          onClick={() => { setShowBanConfirm(false); setBanReason(""); }}
                          className="px-3 py-2 bg-[#21262D] text-[#A8B2BD] rounded-lg text-xs hover:bg-[#2D333B]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowBanConfirm(true)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-950/30 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-950/50 transition-colors"
                    >
                      <UserX className="h-4 w-4" />
                      Ban User
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => adminAction("unban")}
                    disabled={actionLoading === "unban"}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-green-950/30 text-green-400 rounded-lg text-sm font-semibold hover:bg-green-950/50 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === "unban" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                    Unban User
                  </button>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
              <h3 className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider mb-3">Add Note</h3>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Internal note about this user..."
                rows={3}
                className="w-full px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A] resize-none"
              />
              <button
                onClick={() => { if (noteText.trim()) { adminAction("add_note", { note: noteText }); setNoteText(""); } }}
                disabled={!noteText.trim() || actionLoading === "add_note"}
                className="mt-2 w-full px-3 py-2 bg-[#21262D] text-[#F0F6FC] rounded-lg text-xs font-semibold hover:bg-[#2D333B] disabled:opacity-50"
              >
                <StickyNote className="h-3 w-3 inline mr-1" />
                Save Note
              </button>
            </div>
          </div>

          {/* Right: Sessions + Audit Log */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Sessions */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#21262D]">
                <h3 className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider">Recent Sessions ({data.sessions.length})</h3>
              </div>
              {data.sessions.length === 0 ? (
                <p className="px-5 py-6 text-sm text-[#6E7681] text-center">No sessions</p>
              ) : (
                <div className="divide-y divide-[#21262D]">
                  {data.sessions.slice(0, 20).map(s => (
                    <div key={s.id} className="px-5 py-3 flex items-center justify-between hover:bg-[#1F2937]/30 transition-colors">
                      <div>
                        <p className="text-sm text-[#F0F6FC] font-medium">{s.river_name || "Unknown"}</p>
                        <p className="text-xs text-[#6E7681]">{formatDate(s.date)} {s.is_private ? "· 🔒 Private" : ""}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-[#E8923A]">{s.total_fish || 0} fish</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Species caught */}
            {species.length > 0 && (
              <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-5">
                <h3 className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider mb-3">Species Caught ({species.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {species.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-[#0D1117] text-[#F0F6FC] rounded-full text-xs">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Log */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#21262D]">
                <h3 className="text-xs font-bold text-[#A8B2BD] uppercase tracking-wider">Audit Log</h3>
              </div>
              {data.auditLog.length === 0 ? (
                <p className="px-5 py-6 text-sm text-[#6E7681] text-center">No admin actions on this user</p>
              ) : (
                <div className="divide-y divide-[#21262D]">
                  {data.auditLog.map(log => (
                    <div key={log.id} className="px-5 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AuditIcon action={log.action} />
                          <span className="text-sm text-[#F0F6FC] font-medium">{formatAction(log.action)}</span>
                        </div>
                        <span className="text-xs text-[#6E7681]">{formatDateTime(log.created_at)}</span>
                      </div>
                      <p className="text-xs text-[#6E7681] mt-1">by {log.admin_email}</p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <p className="text-xs text-[#A8B2BD] mt-1 font-mono bg-[#0D1117] px-2 py-1 rounded">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-[#A8B2BD]">{label}</span>
      </div>
      <span className="text-sm font-mono text-[#F0F6FC]">{value}</span>
    </div>
  );
}

function AuditIcon({ action }: { action: string }) {
  switch (action) {
    case "grant_pro": return <Sparkles className="h-3.5 w-3.5 text-[#E8923A]" />;
    case "revoke_pro": return <XCircle className="h-3.5 w-3.5 text-[#A8B2BD]" />;
    case "ban_user": return <Ban className="h-3.5 w-3.5 text-red-400" />;
    case "unban_user": return <UserCheck className="h-3.5 w-3.5 text-green-400" />;
    case "add_note": return <StickyNote className="h-3.5 w-3.5 text-blue-400" />;
    case "kill_session": return <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />;
    default: return <Shield className="h-3.5 w-3.5 text-[#6E7681]" />;
  }
}

function formatAction(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d.includes("T") ? d : d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(d: string): string {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
