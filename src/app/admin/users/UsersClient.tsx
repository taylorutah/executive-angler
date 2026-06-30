"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft, Shield, Search, Ban,
  Loader2, Fish, Calendar, StickyNote,
  ChevronDown, ChevronUp, User, Feather, LogIn, Mail,
  MapPin, Camera, MessageSquare, TicketPercent, Activity,
  Trash2, Lock, Globe,
} from "lucide-react";
import DeleteUserModal from "@/components/admin/DeleteUserModal";
import AdminSessionDetailModal from "@/components/admin/AdminSessionDetailModal";
import { Button } from "@/components/ui/Button";

interface UserProfile {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_banned: boolean | null;
  ban_reason: string | null;
  banned_at: string | null;
  banned_by: string | null;
  created_at: string;
  home_state: string | null;
  home_location: string | null;
  email: string | null;
  last_sign_in_at: string | null;
  last_session_at: string | null;
  last_login_at: string | null;
  last_login_country: string | null;
  last_login_region: string | null;
  last_login_city: string | null;
  session_count: number;
  catch_count: number;
  fly_box_count: number;
  photo_count: number;
  review_count: number;
  active_promo: { code: string; until: string } | null;
  provider: string;
  email_confirmed: boolean;
}

interface SessionRow {
  id: string;
  date: string | null;
  river_name: string | null;
  total_fish: number | null;
  weather: string | null;
  water_temp_f: number | null;
  location: string | null;
  section: string | null;
  created_at: string | null;
  broadcast_presence: boolean | null;
}

export default function UsersClient({ users: initialUsers, adminId, adminEmail }: { users: UserProfile[]; adminId: string; adminEmail: string }) {
  void adminEmail;
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "banned" | "promo" | "active" | "inactive" | "unverified">("all");
  const [sortBy, setSortBy] = useState<"recent" | "activity" | "power">("recent");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [noteText, setNoteText] = useState<Record<string, string>>({});
  const [banReason, setBanReason] = useState<Record<string, string>>({});
  const [sessionsByUser, setSessionsByUser] = useState<Record<string, SessionRow[] | "loading" | "error">>({});
  const fetchedSessions = useRef<Set<string>>(new Set());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  const THIRTY_DAYS = 30 * 86400000;

  const filtered = users.filter(u => {
    if (filter === "banned" && !u.is_banned) return false;
    if (filter === "promo" && !u.active_promo) return false;
    if (filter === "active" && !(u.last_session_at && Date.now() - new Date(u.last_session_at).getTime() < THIRTY_DAYS)) return false;
    if (filter === "inactive" && u.last_session_at && Date.now() - new Date(u.last_session_at).getTime() < THIRTY_DAYS) return false;
    if (filter === "unverified" && u.email_confirmed) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.username?.toLowerCase().includes(q) ||
        u.display_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.home_state?.toLowerCase().includes(q) ||
        u.home_location?.toLowerCase().includes(q) ||
        u.user_id.includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "activity") {
      const aT = a.last_session_at ? new Date(a.last_session_at).getTime() : 0;
      const bT = b.last_session_at ? new Date(b.last_session_at).getTime() : 0;
      return bT - aT;
    }
    if (sortBy === "power") {
      const score = (u: UserProfile) =>
        u.session_count + u.catch_count + u.fly_box_count * 2 + u.photo_count * 3 + u.review_count * 2;
      return score(b) - score(a);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalUsers = users.length;
  const bannedUsers = users.filter(u => u.is_banned).length;
  const newThisWeek = users.filter(u => (Date.now() - new Date(u.created_at).getTime()) < 7 * 86400000).length;
  const activeThisMonth = users.filter(u => u.last_session_at && (Date.now() - new Date(u.last_session_at).getTime()) < THIRTY_DAYS).length;
  const promoUsers = users.filter(u => u.active_promo).length;

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

  useEffect(() => {
    if (!expandedUser) return;
    if (fetchedSessions.current.has(expandedUser)) return;
    const uid = expandedUser;
    fetchedSessions.current.add(uid);
    setSessionsByUser(prev => ({ ...prev, [uid]: "loading" }));
    fetch(`/api/admin/users/${uid}`)
      .then(async res => {
        if (!res.ok) {
          setSessionsByUser(prev => ({ ...prev, [uid]: "error" }));
          fetchedSessions.current.delete(uid);
          return;
        }
        const json = await res.json();
        setSessionsByUser(prev => ({ ...prev, [uid]: (json.sessions || []) as SessionRow[] }));
      })
      .catch(() => {
        setSessionsByUser(prev => ({ ...prev, [uid]: "error" }));
        fetchedSessions.current.delete(uid);
      });
  }, [expandedUser]);

  function handleUserDeleted(userId: string) {
    setUsers(prev => prev.filter(u => u.user_id !== userId));
    setDeletingUser(null);
    setExpandedUser(null);
    setMessage({ type: "success", text: "User deleted" });
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
          <Link href="/admin" className="text-[#A8B2BD] hover:text-[#F0F6FC]"><ChevronLeft className="h-5 w-5" /></Link>
          <Shield className="h-5 w-5 text-[#E8923A]" />
          <h1 className="font-serif text-2xl text-[#F0F6FC]">User Management</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {[
            { val: totalUsers, label: "Total", color: "text-[#F0F6FC]" },
            { val: activeThisMonth, label: "Active 30d", color: "text-[#2EA44F]" },
            { val: newThisWeek, label: "New 7d", color: "text-[#0BA5C7]" },
            { val: promoUsers, label: "Promo", color: "text-[#E8923A]" },
            { val: bannedUsers, label: "Banned", color: "text-red-400" },
          ].map(s => (
            <div key={s.label} className="bg-[#161B22] border border-[#21262D] rounded-xl p-3 text-center">
              <p className={`text-xl font-bold font-mono ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-[#A8B2BD] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg border text-sm ${message.type === "success" ? "bg-green-950/30 border-green-800 text-green-400" : "bg-red-950/30 border-red-800 text-red-400"}`}>
            {message.text}
          </div>
        )}

        {/* Search + filter */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6E7681]" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, state, or ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#161B22] border border-[#21262D] rounded-lg text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]" />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as "recent" | "activity" | "power")}
              className="px-3 py-2 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#F0F6FC] focus:outline-none focus:border-[#E8923A]"
            >
              <option value="recent">Newest signup</option>
              <option value="activity">Last activity</option>
              <option value="power">Power users</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-1">
            {(["all", "promo", "active", "inactive", "unverified", "banned"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === f ? "bg-[#E8923A] text-white" : "bg-[#161B22] text-[#A8B2BD]"}`}>
                {f === "all" ? "All" :
                 f === "promo" ? "Promo" :
                 f === "active" ? "Active 30d" :
                 f === "inactive" ? "Lapsed" :
                 f === "unverified" ? "Unverified" :
                 "Banned"}
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
                      <Image src={u.avatar_url} alt={`${u.display_name || u.username || "User"} avatar`} width={40} height={40} className="w-10 h-10 rounded-full object-cover" unoptimized />
                    ) : (
                      <User className="h-5 w-5 text-[#E8923A]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#F0F6FC] truncate">{u.display_name || u.username || "No name"}</span>
                      <ProviderBadge provider={u.provider} verified={u.email_confirmed} />
                      {u.is_banned && <Ban className="h-3.5 w-3.5 text-red-400" />}
                      {u.active_promo && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8923A]/15 text-[#E8923A]">
                          <TicketPercent className="h-2.5 w-2.5" /> {u.active_promo.code}
                        </span>
                      )}
                      {u.fly_box_count > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0BA5C7]/15 text-[#0BA5C7]">
                          <Feather className="h-2.5 w-2.5" /> {u.fly_box_count}
                        </span>
                      )}
                      {u.home_state && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#A8B2BD]">
                          <MapPin className="h-2.5 w-2.5" /> {u.home_state}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6E7681] truncate">
                      @{u.username || "—"}{u.email ? ` · ${u.email}` : ""}
                    </p>
                    <p className="text-[11px] text-[#6E7681] mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> joined {formatDate(u.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <LogIn className="h-3 w-3" /> {u.last_sign_in_at ? `last login ${formatRelative(u.last_sign_in_at)}` : "never signed in"}
                      </span>
                      {formatLoginLocation(u) && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {formatLoginLocation(u)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Activity className="h-3 w-3" /> {u.last_session_at ? `fished ${formatRelative(u.last_session_at)}` : "no sessions"}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#6E7681] mt-0.5">
                      <span>{u.session_count} sessions</span>
                      <span> · {u.catch_count} catches</span>
                      <span> · {u.fly_box_count} flies</span>
                      {u.photo_count > 0 && <span> · {u.photo_count} photos</span>}
                      {u.review_count > 0 && <span> · {u.review_count} reviews</span>}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-[#6E7681]" /> : <ChevronDown className="h-4 w-4 text-[#6E7681]" />}
                </div>

                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-[#21262D] pt-4 space-y-3">
                    <div className="space-y-1 text-xs text-[#A8B2BD]">
                      <p className="font-mono break-all text-[#6E7681]">ID: {u.user_id}</p>
                      {u.email && (
                        <p className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-[#6E7681]" />
                          <span className="break-all">{u.email}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-[#6E7681]" />
                        Signed up {formatDate(u.created_at)}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <LogIn className="h-3 w-3 text-[#6E7681]" />
                        Last sign-in {u.last_sign_in_at ? formatDateTime(u.last_sign_in_at) : "never"}
                      </p>
                      {formatLoginLocation(u) && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-[#6E7681]" />
                          Login from {formatLoginLocation(u)}
                          {u.last_login_at ? ` · ${formatDateTime(u.last_login_at)}` : ""}
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <Activity className="h-3 w-3 text-[#6E7681]" />
                        Last session {u.last_session_at ? formatDate(u.last_session_at) : "none logged"}
                      </p>
                      {(u.home_state || u.home_location) && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-[#6E7681]" />
                          {u.home_location || u.home_state}
                        </p>
                      )}
                      {u.active_promo && (
                        <p className="flex items-center gap-1.5">
                          <TicketPercent className="h-3 w-3 text-[#E8923A]" />
                          Promo <span className="font-mono text-[#E8923A]">{u.active_promo.code}</span> — expires {formatDate(u.active_promo.until)}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      <div className="bg-[#0D1117] rounded-lg p-3 text-center border border-[#21262D]">
                        <Calendar className="h-4 w-4 text-[#E8923A] mx-auto mb-1" />
                        <p className="text-lg font-bold text-[#F0F6FC] font-mono">{u.session_count}</p>
                        <p className="text-[9px] text-[#6E7681] uppercase">Sessions</p>
                      </div>
                      <div className="bg-[#0D1117] rounded-lg p-3 text-center border border-[#21262D]">
                        <Fish className="h-4 w-4 text-[#0BA5C7] mx-auto mb-1" />
                        <p className="text-lg font-bold text-[#F0F6FC] font-mono">{u.catch_count}</p>
                        <p className="text-[9px] text-[#6E7681] uppercase">Catches</p>
                      </div>
                      <div className="bg-[#0D1117] rounded-lg p-3 text-center border border-[#21262D]">
                        <Feather className="h-4 w-4 text-[#0BA5C7] mx-auto mb-1" />
                        <p className={`text-lg font-bold font-mono ${u.fly_box_count > 0 ? "text-[#0BA5C7]" : "text-[#6E7681]"}`}>{u.fly_box_count}</p>
                        <p className="text-[9px] text-[#6E7681] uppercase">Fly Box</p>
                      </div>
                      <div className="bg-[#0D1117] rounded-lg p-3 text-center border border-[#21262D]">
                        <Camera className="h-4 w-4 text-[#2EA44F] mx-auto mb-1" />
                        <p className={`text-lg font-bold font-mono ${u.photo_count > 0 ? "text-[#2EA44F]" : "text-[#6E7681]"}`}>{u.photo_count}</p>
                        <p className="text-[9px] text-[#6E7681] uppercase">Photos</p>
                      </div>
                      <div className="bg-[#0D1117] rounded-lg p-3 text-center border border-[#21262D]">
                        <MessageSquare className="h-4 w-4 text-[#A8B2BD] mx-auto mb-1" />
                        <p className={`text-lg font-bold font-mono ${u.review_count > 0 ? "text-[#F0F6FC]" : "text-[#6E7681]"}`}>{u.review_count}</p>
                        <p className="text-[9px] text-[#6E7681] uppercase">Reviews</p>
                      </div>
                    </div>

                    {/* Sessions panel */}
                    <SessionsPanel
                      state={sessionsByUser[u.user_id]}
                      userId={u.user_id}
                      onOpenSession={(id) => setActiveSessionId(id)}
                    />

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {u.is_banned && (
                        <Button
                          onClick={() => adminAction("unban", u.user_id)}
                          disabled={!!actionLoading}
                          variant="outline"
                          size="sm"
                          icon={Ban}
                          loading={actionLoading === `unban-${u.user_id}`}
                         
                        >
                          Unban
                        </Button>
                      )}

                      <Button
                        onClick={() => setDeletingUser(u)}
                        disabled={!!actionLoading || u.user_id === adminId}
                        title={u.user_id === adminId ? "You cannot delete your own admin account from here" : "Permanently delete user"}
                        variant="destructive"
                        size="sm"
                        icon={Trash2}
                       
                      >
                        Delete user
                      </Button>
                    </div>

                    {/* Ban with reason */}
                    {!u.is_banned && (
                      <div className="flex gap-2">
                        <input type="text" value={banReason[u.user_id] || ""} onChange={e => setBanReason(prev => ({ ...prev, [u.user_id]: e.target.value }))}
                          placeholder="Ban reason (required)..."
                          className="flex-1 px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-red-400" />
                        <Button
                          onClick={() => adminAction("ban", u.user_id, { reason: banReason[u.user_id] || "" })}
                          disabled={!!actionLoading || !banReason[u.user_id]?.trim()}
                          variant="destructive"
                          size="sm"
                         
                        >
                          Ban
                        </Button>
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
                        className="flex-1 px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-lg text-xs text-[#F0F6FC] placeholder-[#6E7681] focus:outline-none focus:border-[#E8923A]" />
                      <button onClick={() => addNote(u.user_id)} disabled={!!actionLoading || !noteText[u.user_id]?.trim()}
                        className="px-3 py-2 bg-[#21262D] text-[#A8B2BD] rounded-lg text-xs font-bold hover:text-[#F0F6FC] disabled:opacity-50">
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
            <p className="text-[#6E7681]">No users match</p>
          </div>
        )}
      </div>

      {activeSessionId && (
        <AdminSessionDetailModal
          sessionId={activeSessionId}
          onClose={() => setActiveSessionId(null)}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          userId={deletingUser.user_id}
          username={deletingUser.username}
          displayName={deletingUser.display_name}
          email={deletingUser.email}
          sessionCount={deletingUser.session_count}
          catchCount={deletingUser.catch_count}
          flyBoxCount={deletingUser.fly_box_count}
          photoCount={deletingUser.photo_count}
          onCancel={() => setDeletingUser(null)}
          onDeleted={handleUserDeleted}
        />
      )}
    </div>
  );
}

function SessionsPanel({
  state,
  userId,
  onOpenSession,
}: {
  state: SessionRow[] | "loading" | "error" | undefined;
  userId: string;
  onOpenSession: (id: string) => void;
}) {
  if (state === undefined || state === "loading") {
    return (
      <div className="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex items-center justify-center">
        <Loader2 className="h-4 w-4 text-[#E8923A] animate-spin" />
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className="bg-red-950/15 border border-red-900/40 rounded-lg p-3 text-xs text-red-400">
        Failed to load sessions
      </div>
    );
  }
  if (state.length === 0) {
    return (
      <div className="bg-[#0D1117] border border-[#21262D] rounded-lg p-3 text-xs text-[#6E7681]">
        No fishing sessions logged.
      </div>
    );
  }
  const shown = state.slice(0, 10);
  return (
    <div className="bg-[#0D1117] border border-[#21262D] rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-[#21262D] flex items-center justify-between">
        <p className="text-[10px] font-bold text-[#A8B2BD] uppercase tracking-wider">Sessions ({state.length})</p>
        {state.length > 10 && (
          <Link href={`/admin/users/${userId}`} className="text-[10px] text-[#E8923A] hover:underline">
            View all →
          </Link>
        )}
      </div>
      <div className="divide-y divide-[#21262D]/50">
        {shown.map((s) => (
          <button
            key={s.id}
            onClick={() => onOpenSession(s.id)}
            className="w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-[#161B22] transition-colors"
          >
            <Calendar className="h-3.5 w-3.5 text-[#6E7681] shrink-0" />
            <span className="text-xs text-[#A8B2BD] w-20 shrink-0 font-mono">
              {s.date ? formatDate(s.date) : "—"}
            </span>
            <span className="text-xs text-[#F0F6FC] flex-1 truncate">
              {s.river_name || s.location || "Unknown water"}
            </span>
            {s.total_fish != null && s.total_fish > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#0BA5C7] shrink-0">
                <Fish className="h-3 w-3" /> {s.total_fish}
              </span>
            )}
            {s.broadcast_presence ? (
              <Globe className="h-3 w-3 text-[#6E7681] shrink-0" />
            ) : (
              <Lock className="h-3 w-3 text-[#6E7681] shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProviderBadge({ provider, verified }: { provider: string; verified: boolean }) {
  const map: Record<string, { label: string; bg: string; fg: string }> = {
    google:  { label: "Google", bg: "bg-[#4285F4]/15", fg: "text-[#8AB4F8]" },
    apple:   { label: "Apple",  bg: "bg-[#F0F6FC]/10", fg: "text-[#F0F6FC]" },
    email:   { label: "Email",  bg: "bg-[#6E7681]/15", fg: "text-[#A8B2BD]" },
  };
  const cfg = map[provider] || { label: provider, bg: "bg-[#6E7681]/15", fg: "text-[#A8B2BD]" };
  return (
    <span
      title={`Signed up via ${cfg.label}${verified ? "" : " · email NOT confirmed"}`}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.fg}`}
    >
      {cfg.label}
      {!verified && <span className="text-red-400">●</span>}
    </span>
  );
}

function formatLoginLocation(u: {
  last_login_city: string | null;
  last_login_region: string | null;
  last_login_country: string | null;
}): string | null {
  const parts = [u.last_login_city, u.last_login_region, u.last_login_country]
    .map((p) => (p && p.trim() ? p.trim() : null))
    .filter((p): p is string => !!p);
  if (parts.length === 0) return null;
  return parts.join(", ");
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(d: string): string {
  const dt = new Date(d);
  return (
    dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " " +
    dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

function formatRelative(d: string): string {
  const diffMs = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}
