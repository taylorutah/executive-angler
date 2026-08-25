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
    <div className="min-h-screen bg-[var(--surface-page)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-[var(--text-body)] hover:text-[var(--text-primary)]"><ChevronLeft className="h-5 w-5" /></Link>
          <Shield className="h-5 w-5 text-[var(--action)]" />
          <h1 className="font-serif text-2xl text-[var(--text-primary)]">User Management</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {[
            { val: totalUsers, label: "Total", color: "text-[var(--text-primary)]" },
            { val: activeThisMonth, label: "Active 30d", color: "text-[var(--state-positive)]" },
            { val: newThisWeek, label: "New 7d", color: "text-[var(--signal-live)]" },
            { val: promoUsers, label: "Promo", color: "text-[var(--action)]" },
            { val: bannedUsers, label: "Banned", color: "text-red-400" },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-xl p-3 text-center">
              <p className={`text-xl font-bold font-mono ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-[var(--text-body)] uppercase tracking-wider">{s.label}</p>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-meta)]" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, state, or ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[#6E7681] focus:outline-none focus:border-[var(--action)]" />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as "recent" | "activity" | "power")}
              className="px-3 py-2 bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--action)]"
            >
              <option value="recent">Newest signup</option>
              <option value="activity">Last activity</option>
              <option value="power">Power users</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-1">
            {(["all", "promo", "active", "inactive", "unverified", "banned"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === f ? "bg-[var(--action)] text-white" : "bg-[var(--surface-raised)] text-[var(--text-body)]"}`}>
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
              <div key={u.user_id} className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-xl overflow-hidden">
                <div className="px-5 py-3 flex items-center gap-3 cursor-pointer" onClick={() => setExpandedUser(isExpanded ? null : u.user_id)}>
                  <div className="w-10 h-10 rounded-full bg-[var(--action)]/15 flex items-center justify-center shrink-0 overflow-hidden">
                    {u.avatar_url ? (
                      <Image src={u.avatar_url} alt={`${u.display_name || u.username || "User"} avatar`} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-[var(--action)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[var(--text-primary)] truncate">{u.display_name || u.username || "No name"}</span>
                      <ProviderBadge provider={u.provider} verified={u.email_confirmed} />
                      {u.is_banned && <Ban className="h-3.5 w-3.5 text-red-400" />}
                      {u.active_promo && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--action)]/15 text-[var(--action)]">
                          <TicketPercent className="h-2.5 w-2.5" /> {u.active_promo.code}
                        </span>
                      )}
                      {u.fly_box_count > 0 && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--signal-live)]/15 text-[var(--signal-live)]">
                          <Feather className="h-2.5 w-2.5" /> {u.fly_box_count}
                        </span>
                      )}
                      {u.home_state && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-body)]">
                          <MapPin className="h-2.5 w-2.5" /> {u.home_state}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-meta)] truncate">
                      @{u.username || "—"}{u.email ? ` · ${u.email}` : ""}
                    </p>
                    <p className="text-[11px] text-[var(--text-meta)] mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
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
                    <p className="text-[11px] text-[var(--text-meta)] mt-0.5">
                      <span>{u.session_count} sessions</span>
                      <span> · {u.catch_count} catches</span>
                      <span> · {u.fly_box_count} flies</span>
                      {u.photo_count > 0 && <span> · {u.photo_count} photos</span>}
                      {u.review_count > 0 && <span> · {u.review_count} reviews</span>}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-[var(--text-meta)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-meta)]" />}
                </div>

                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-[var(--border-rule)] pt-4 space-y-3">
                    <div className="space-y-1 text-xs text-[var(--text-body)]">
                      <p className="font-mono break-all text-[var(--text-meta)]">ID: {u.user_id}</p>
                      {u.email && (
                        <p className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-[var(--text-meta)]" />
                          <span className="break-all">{u.email}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-[var(--text-meta)]" />
                        Signed up {formatDate(u.created_at)}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <LogIn className="h-3 w-3 text-[var(--text-meta)]" />
                        Last sign-in {u.last_sign_in_at ? formatDateTime(u.last_sign_in_at) : "never"}
                      </p>
                      {formatLoginLocation(u) && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-[var(--text-meta)]" />
                          Login from {formatLoginLocation(u)}
                          {u.last_login_at ? ` · ${formatDateTime(u.last_login_at)}` : ""}
                        </p>
                      )}
                      <p className="flex items-center gap-1.5">
                        <Activity className="h-3 w-3 text-[var(--text-meta)]" />
                        Last session {u.last_session_at ? formatDate(u.last_session_at) : "none logged"}
                      </p>
                      {(u.home_state || u.home_location) && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-[var(--text-meta)]" />
                          {u.home_location || u.home_state}
                        </p>
                      )}
                      {u.active_promo && (
                        <p className="flex items-center gap-1.5">
                          <TicketPercent className="h-3 w-3 text-[var(--action)]" />
                          Promo <span className="font-mono text-[var(--action)]">{u.active_promo.code}</span> — expires {formatDate(u.active_promo.until)}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      <div className="bg-[var(--surface-page)] rounded-lg p-3 text-center border border-[var(--border-rule)]">
                        <Calendar className="h-4 w-4 text-[var(--action)] mx-auto mb-1" />
                        <p className="text-lg font-bold text-[var(--text-primary)] font-mono">{u.session_count}</p>
                        <p className="text-[9px] text-[var(--text-meta)] uppercase">Sessions</p>
                      </div>
                      <div className="bg-[var(--surface-page)] rounded-lg p-3 text-center border border-[var(--border-rule)]">
                        <Fish className="h-4 w-4 text-[var(--signal-live)] mx-auto mb-1" />
                        <p className="text-lg font-bold text-[var(--text-primary)] font-mono">{u.catch_count}</p>
                        <p className="text-[9px] text-[var(--text-meta)] uppercase">Catches</p>
                      </div>
                      <div className="bg-[var(--surface-page)] rounded-lg p-3 text-center border border-[var(--border-rule)]">
                        <Feather className="h-4 w-4 text-[var(--signal-live)] mx-auto mb-1" />
                        <p className={`text-lg font-bold font-mono ${u.fly_box_count > 0 ? "text-[var(--signal-live)]" : "text-[var(--text-meta)]"}`}>{u.fly_box_count}</p>
                        <p className="text-[9px] text-[var(--text-meta)] uppercase">Fly Box</p>
                      </div>
                      <div className="bg-[var(--surface-page)] rounded-lg p-3 text-center border border-[var(--border-rule)]">
                        <Camera className="h-4 w-4 text-[var(--state-positive)] mx-auto mb-1" />
                        <p className={`text-lg font-bold font-mono ${u.photo_count > 0 ? "text-[var(--state-positive)]" : "text-[var(--text-meta)]"}`}>{u.photo_count}</p>
                        <p className="text-[9px] text-[var(--text-meta)] uppercase">Photos</p>
                      </div>
                      <div className="bg-[var(--surface-page)] rounded-lg p-3 text-center border border-[var(--border-rule)]">
                        <MessageSquare className="h-4 w-4 text-[var(--text-body)] mx-auto mb-1" />
                        <p className={`text-lg font-bold font-mono ${u.review_count > 0 ? "text-[var(--text-primary)]" : "text-[var(--text-meta)]"}`}>{u.review_count}</p>
                        <p className="text-[9px] text-[var(--text-meta)] uppercase">Reviews</p>
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
                          className="flex-1 px-3 py-2 bg-[var(--surface-page)] border border-[var(--border-rule)] rounded-lg text-xs text-[var(--text-primary)] placeholder-[#6E7681] focus:outline-none focus:border-red-400" />
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
                        className="flex-1 px-3 py-2 bg-[var(--surface-page)] border border-[var(--border-rule)] rounded-lg text-xs text-[var(--text-primary)] placeholder-[#6E7681] focus:outline-none focus:border-[var(--action)]" />
                      <button onClick={() => addNote(u.user_id)} disabled={!!actionLoading || !noteText[u.user_id]?.trim()}
                        className="px-3 py-2 bg-[var(--border-rule)] text-[var(--text-body)] rounded-lg text-xs font-bold hover:text-[var(--text-primary)] disabled:opacity-50">
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
          <div className="bg-[var(--surface-raised)] border border-[var(--border-rule)] rounded-xl p-12 text-center">
            <p className="text-[var(--text-meta)]">No users match</p>
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
      <div className="bg-[var(--surface-page)] border border-[var(--border-rule)] rounded-lg p-4 flex items-center justify-center">
        <Loader2 className="h-4 w-4 text-[var(--action)] animate-spin" />
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
      <div className="bg-[var(--surface-page)] border border-[var(--border-rule)] rounded-lg p-3 text-xs text-[var(--text-meta)]">
        No fishing sessions logged.
      </div>
    );
  }
  const shown = state.slice(0, 10);
  return (
    <div className="bg-[var(--surface-page)] border border-[var(--border-rule)] rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-[var(--border-rule)] flex items-center justify-between">
        <p className="text-[10px] font-bold text-[var(--text-body)] uppercase tracking-wider">Sessions ({state.length})</p>
        {state.length > 10 && (
          <Link href={`/admin/users/${userId}`} className="text-[10px] text-[var(--action)] hover:underline">
            View all →
          </Link>
        )}
      </div>
      <div className="divide-y divide-[#21262D]/50">
        {shown.map((s) => (
          <button
            key={s.id}
            onClick={() => onOpenSession(s.id)}
            className="w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-[var(--surface-raised)] transition-colors"
          >
            <Calendar className="h-3.5 w-3.5 text-[var(--text-meta)] shrink-0" />
            <span className="text-xs text-[var(--text-body)] w-20 shrink-0 font-mono">
              {s.date ? formatDate(s.date) : "—"}
            </span>
            <span className="text-xs text-[var(--text-primary)] flex-1 truncate">
              {s.river_name || s.location || "Unknown water"}
            </span>
            {s.total_fish != null && s.total_fish > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--signal-live)] shrink-0">
                <Fish className="h-3 w-3" /> {s.total_fish}
              </span>
            )}
            {s.broadcast_presence ? (
              <Globe className="h-3 w-3 text-[var(--text-meta)] shrink-0" />
            ) : (
              <Lock className="h-3 w-3 text-[var(--text-meta)] shrink-0" />
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
    apple:   { label: "Apple",  bg: "bg-[var(--text-primary)]/10", fg: "text-[var(--text-primary)]" },
    email:   { label: "Email",  bg: "bg-[var(--text-meta)]/15", fg: "text-[var(--text-body)]" },
  };
  const cfg = map[provider] || { label: provider, bg: "bg-[var(--text-meta)]/15", fg: "text-[var(--text-body)]" };
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
