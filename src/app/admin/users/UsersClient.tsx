"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, Shield, Search, Crown, Ban,
  Loader2, Fish, Calendar, StickyNote,
  ChevronDown, ChevronUp, User
} from "lucide-react";

interface UserProfile {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_premium: boolean | null;
  is_banned: boolean | null;
  ban_reason: string | null;
  premium_granted_by: string | null;
  premium_granted_at: string | null;
  banned_at: string | null;
  banned_by: string | null;
  created_at: string;
  session_count: number;
  catch_count: number;
}

export default function UsersClient({ users, adminId, adminEmail }: { users: UserProfile[]; adminId: string; adminEmail: string }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "premium" | "banned">("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [noteText, setNoteText] = useState<Record<string, string>>({});
  const [banReason, setBanReason] = useState<Record<string, string>>({});

  const filtered = users.filter(u => {
    if (filter === "premium" && !u.is_premium) return false;
    if (filter === "banned" && !u.is_banned) return false;
    if (search) {
      const q = search.toLowerCase();
      return (u.username?.toLowerCase().includes(q) || u.display_name?.toLowerCase().includes(q) || u.user_id.includes(q));
    }
    return true;
  });

  const totalUsers = users.length;
  const proUsers = users.filter(u => u.is_premium).length;
  const bannedUsers = users.filter(u => u.is_banned).length;
  const newThisWeek = users.filter(u => (Date.now() - new Date(u.created_at).getTime()) < 7 * 86400000).length;

  async function adminAction(action: string, userId: string, extra: Record<string, string> = {}) {
    setActionLoading(`${action}-${userId}`);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, action, ...extra }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: result.message || `${action} successful` });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ type: "error", text: result.error || "Failed" });
      }
    } catch { setMessage({ type: "error", text: "Network error" }); }
    setActionLoading(null);
  }

  async function addNote(userId: string) {
    const note = noteText[userId]?.trim();
    if (!note) return;
    setActionLoading(`note-${userId}`);
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, note }),
      });
      setMessage({ type: "success", text: "Note added" });
      setNoteText(prev => ({ ...prev, [userId]: "" }));
    } catch { setMessage({ type: "error", text: "Failed" }); }
    setActionLoading(null);
  }

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-[#8B949E] hover:text-[#F0F6FC]"><ChevronLeft className="h-5 w-5" /></Link>
          <Shield className="h-5 w-5 text-[#E8923A]" />
          <h1 className="font-serif text-2xl text-[#F0F6FC]">User Management</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { val: totalUsers, label: "Total", color: "text-[#F0F6FC]" },
            { val: proUsers, label: "Pro", color: "text-[#E8923A]" },
            { val: bannedUsers, label: "Banned", color: "text-red-400" },
            { val: newThisWeek, label: "New (7d)", color: "text-[#2EA44F]" },
          ].map(s => (
            <div key={s.label} className="bg-[#161B22] border border-[#21262D] rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-[#8B949E] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg border text-sm ${message.type === "success" ? "bg-green-950/30 border-green-800 text-green-400" : "bg-red-950/30 border-red-800 text-red-400"}`}>
            {message.text}
          </div>
        )}

        {/* Search + filter */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#484F58]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search username, name, or ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#161B22] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#484F58] focus:outline-none focus:border-[#E8923A]" />
          </div>
          <div className="flex gap-1">
            {(["all", "premium", "banned"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold ${filter === f ? "bg-[#E8923A] text-white" : "bg-[#161B22] text-[#8B949E]"}`}>
                {f === "all" ? "All" : f === "premium" ? "Pro" : "Banned"}
              </button>
            ))}
          </div>
        </div>

        {/* User rows */}
        <div className="space-y-2">
          {filtered.map(u => {
            const isExpanded = expandedUser === u.user_id;
            return (
              <div key={u.user_id} className="bg-[#161B22] border border-[#21262D] rounded-xl overflow-hidden">
                <div className="px-5 py-3 flex items-center gap-3 cursor-pointer" onClick={() => setExpandedUser(isExpanded ? null : u.user_id)}>
                  <div className="w-10 h-10 rounded-full bg-[#E8923A]/15 flex items-center justify-center shrink-0 overflow-hidden">
                    {u.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-[#E8923A]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#F0F6FC] truncate">{u.display_name || u.username || "No name"}</span>
                      {u.is_premium && <Crown className="h-3.5 w-3.5 text-[#E8923A]" />}
                      {u.is_banned && <Ban className="h-3.5 w-3.5 text-red-400" />}
                    </div>
                    <p className="text-xs text-[#484F58]">
                      @{u.username || "—"} · {u.session_count}s · {u.catch_count}f · {formatDate(u.created_at)}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-[#484F58]" /> : <ChevronDown className="h-4 w-4 text-[#484F58]" />}
                </div>

                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-[#21262D] pt-4 space-y-3">
                    <p className="text-xs text-[#484F58] font-mono break-all">ID: {u.user_id}</p>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#0D1117] rounded-lg p-3 text-center border border-[#21262D]">
                        <Calendar className="h-4 w-4 text-[#E8923A] mx-auto mb-1" />
                        <p className="text-lg font-bold text-[#F0F6FC] font-mono">{u.session_count}</p>
                        <p className="text-[9px] text-[#484F58] uppercase">Sessions</p>
                      </div>
                      <div className="bg-[#0D1117] rounded-lg p-3 text-center border border-[#21262D]">
                        <Fish className="h-4 w-4 text-[#0BA5C7] mx-auto mb-1" />
                        <p className="text-lg font-bold text-[#F0F6FC] font-mono">{u.catch_count}</p>
                        <p className="text-[9px] text-[#484F58] uppercase">Catches</p>
                      </div>
                      <div className="bg-[#0D1117] rounded-lg p-3 text-center border border-[#21262D]">
                        <Crown className="h-4 w-4 text-[#E8923A] mx-auto mb-1" />
                        <p className="text-lg font-bold text-[#F0F6FC] font-mono">{u.is_premium ? "Pro" : "Free"}</p>
                        <p className="text-[9px] text-[#484F58] uppercase">Tier</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => adminAction(u.is_premium ? "revoke_premium" : "grant_premium", u.user_id)}
                        disabled={!!actionLoading}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50 ${u.is_premium ? "bg-[#E8923A]/15 text-[#E8923A]" : "bg-[#2EA44F]/15 text-[#2EA44F]"}`}>
                        {actionLoading === `${u.is_premium ? "revoke_premium" : "grant_premium"}-${u.user_id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crown className="h-3.5 w-3.5" />}
                        {u.is_premium ? "Revoke Pro" : "Grant Pro"}
                      </button>

                      {u.is_banned && (
                        <button onClick={() => adminAction("unban", u.user_id)} disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#2EA44F]/15 text-[#2EA44F] disabled:opacity-50">
                          {actionLoading === `unban-${u.user_id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                          Unban
                        </button>
                      )}
                    </div>

                    {/* Ban with reason */}
                    {!u.is_banned && (
                      <div className="flex gap-2">
                        <input type="text" value={banReason[u.user_id] || ""} onChange={e => setBanReason(prev => ({ ...prev, [u.user_id]: e.target.value }))}
                          placeholder="Ban reason (required)..."
                          className="flex-1 px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-xs text-[#F0F6FC] placeholder-[#484F58] focus:outline-none focus:border-red-400" />
                        <button onClick={() => adminAction("ban", u.user_id, { reason: banReason[u.user_id] || "" })}
                          disabled={!!actionLoading || !banReason[u.user_id]?.trim()}
                          className="px-3 py-2 bg-red-950/30 text-red-400 rounded-lg text-xs font-bold disabled:opacity-50">
                          Ban
                        </button>
                      </div>
                    )}

                    {u.is_banned && u.ban_reason && (
                      <div className="px-3 py-2 bg-red-400/5 border border-red-400/20 rounded-lg">
                        <p className="text-xs text-red-400"><strong>Banned:</strong> {u.ban_reason}</p>
                        {u.banned_at && <p className="text-[10px] text-red-400/60 mt-1">{formatDate(u.banned_at)} by {u.banned_by || "admin"}</p>}
                      </div>
                    )}

                    {/* Note */}
                    <div className="flex gap-2">
                      <input type="text" value={noteText[u.user_id] || ""} onChange={e => setNoteText(prev => ({ ...prev, [u.user_id]: e.target.value }))}
                        placeholder="Add internal note..."
                        className="flex-1 px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-xs text-[#F0F6FC] placeholder-[#484F58] focus:outline-none focus:border-[#E8923A]" />
                      <button onClick={() => addNote(u.user_id)} disabled={!!actionLoading || !noteText[u.user_id]?.trim()}
                        className="px-3 py-2 bg-[#21262D] text-[#8B949E] rounded-lg text-xs font-bold hover:text-[#F0F6FC] disabled:opacity-50">
                        <StickyNote className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-[#161B22] border border-[#21262D] rounded-xl p-12 text-center">
            <p className="text-[#484F58]">No users match</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
