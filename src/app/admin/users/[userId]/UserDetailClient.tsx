"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Shield, Ban,
  Fish, Calendar, Feather, Users, Clock, StickyNote,
  AlertTriangle, UserX, UserCheck, Loader2, Trash2, Lock,
} from "@/icons";
import DeleteUserModal from "@/components/admin/DeleteUserModal";
import AdminSessionDetailModal from "@/components/admin/AdminSessionDetailModal";
import { Button } from "@/components/ui/Button";

interface UserData {
  profile: {
    user_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    created_at: string | null;
    is_banned: boolean;
    ban_reason: string | null;
    banned_at: string | null;
  } | null;
  sessions: { id: string; date: string; river_name: string | null; total_fish: number | null; broadcast_presence: boolean | null }[];
  catches: { id: string; species: string | null; length_inches: number | null }[];
  flies: { id: string; name: string | null }[];
  followers: number;
  following: number;
  auditLog: { id: string; action: string; admin_email: string; details: Record<string, unknown>; created_at: string }[];
}

export default function UserDetailClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [noteText, setNoteText] = useState("");
  const [banReason, setBanReason] = useState("");
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <p className="text-[var(--text-2)]">User not found</p>
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
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/users" className="text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors duration-150 ease-standard">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Shield className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--text-1)]">User Detail</h1>
        </div>

        {/* Status message */}
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-[var(--radius-md)] border text-sm ${
            message.type === "success"
              ? "bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)]"
              : "bg-[var(--danger)]/10 border-[var(--danger)]/30 text-[var(--danger)]"
          }`}>
            {message.text}
          </div>
        )}

        {/* User header card */}
        <div className="ea-card mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
              {p.avatar_url ? (
                <Image src={p.avatar_url} alt={p.display_name || "User avatar"} width={64} height={64} className="object-cover w-16 h-16" />
              ) : (
                <span className="font-display text-2xl font-semibold text-[var(--accent)]">
                  {(p.display_name || p.username || "?")[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-xl font-semibold text-[var(--text-1)]">{p.display_name || "No name"}</h2>
                {p.username && <span className="text-sm text-[var(--accent)]">@{p.username}</span>}
                {p.is_banned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] rounded-full text-xs font-medium uppercase">
                    <Ban className="h-3 w-3" /> BANNED
                  </span>
                )}
              </div>
              {p.bio && <p className="text-sm text-[var(--text-2)] mt-1 line-clamp-2">{p.bio}</p>}
              <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-3)]">
                <span>ID: <code className="num text-[var(--text-2)]">{p.user_id.slice(0, 12)}...</code></span>
                <span>Joined {formatDate(p.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Ban notice */}
          {p.is_banned && p.ban_reason && (
            <div className="mt-4 px-4 py-3 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-md)]">
              <p className="text-sm text-[var(--danger)]"><strong>Ban reason:</strong> {p.ban_reason}</p>
              <p className="text-xs text-[var(--danger)]/70 mt-1">Banned {formatDate(p.banned_at)}</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Stats + Actions */}
          <div className="lg:col-span-1 space-y-4">
            {/* Stats */}
            <div className="ea-card">
              <h3 className="ea-overline mb-3">Stats</h3>
              <div className="space-y-3">
                <StatRow icon={<Calendar className="h-4 w-4 text-[var(--accent)]" />} label="Sessions" value={String(data.sessions.length)} />
                <StatRow icon={<Fish className="h-4 w-4 text-[var(--accent)]" />} label="Total Fish" value={String(totalFish)} />
                <StatRow icon={<Fish className="h-4 w-4 text-[var(--warning)]" />} label="Species" value={String(species.length)} />
                <StatRow icon={<Feather className="h-4 w-4 text-[var(--accent)]" />} label="Fly Patterns" value={String(data.flies.length)} />
                <StatRow icon={<Users className="h-4 w-4 text-[var(--accent)]" />} label="Followers" value={String(data.followers)} />
                <StatRow icon={<Users className="h-4 w-4 text-[var(--text-2)]" />} label="Following" value={String(data.following)} />
                {biggestFish && <StatRow icon={<Fish className="h-4 w-4 text-[var(--success)]" />} label="Biggest Fish" value={`${biggestFish.toFixed(1)}"`} />}
                <StatRow icon={<Clock className="h-4 w-4 text-[var(--text-3)]" />} label="Last Session" value={lastSession ? formatDate(lastSession.date) : "Never"} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="ea-card">
              <h3 className="ea-overline mb-3">Actions</h3>
              <div className="space-y-2">
                {/* Ban toggle */}
                {!p.is_banned ? (
                  showBanConfirm ? (
                    <div className="space-y-2 p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-[var(--radius-md)]">
                      <p className="text-xs text-[var(--danger)] font-semibold">Confirm ban</p>
                      <input
                        type="text"
                        value={banReason}
                        onChange={e => setBanReason(e.target.value)}
                        placeholder="Ban reason (required)"
                        className="ea-input text-xs"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => { if (banReason.trim()) adminAction("ban", { reason: banReason }); }}
                          disabled={!banReason.trim() || actionLoading === "ban"}
                          variant="destructive"
                          size="sm"
                          loading={actionLoading === "ban"}
                          fullWidth
                         
                        >
                          {actionLoading === "ban" ? "Banning..." : "Confirm Ban"}
                        </Button>
                        <Button
                          onClick={() => { setShowBanConfirm(false); setBanReason(""); }}
                          variant="outline"
                          size="sm"
                         
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowBanConfirm(true)}
                      variant="destructive"
                      size="sm"
                      icon={UserX}
                      fullWidth
                     
                    >
                      Ban User
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={() => adminAction("unban")}
                    disabled={actionLoading === "unban"}
                    variant="outline"
                    size="sm"
                    icon={UserCheck}
                    loading={actionLoading === "unban"}
                    fullWidth
                   
                  >
                    Unban User
                  </Button>
                )}

                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="destructive"
                  size="sm"
                  icon={Trash2}
                  fullWidth
                 
                >
                  Delete User
                </Button>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="ea-card">
              <h3 className="ea-overline mb-3">Add Note</h3>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Internal note about this user..."
                rows={3}
                className="ea-input text-xs resize-none"
              />
              <Button
                onClick={() => { if (noteText.trim()) { adminAction("add_note", { note: noteText }); setNoteText(""); } }}
                disabled={!noteText.trim() || actionLoading === "add_note"}
                variant="outline"
                size="sm"
                icon={StickyNote}
                loading={actionLoading === "add_note"}
                fullWidth
               
                className="mt-2"
              >
                Save Note
              </Button>
            </div>
          </div>

          {/* Right: Sessions + Audit Log */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Sessions */}
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--border)]">
                <h3 className="ea-overline">Recent Sessions ({data.sessions.length})</h3>
              </div>
              {data.sessions.length === 0 ? (
                <p className="px-5 py-6 text-sm text-[var(--text-3)] text-center">No sessions</p>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {data.sessions.slice(0, 20).map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSessionId(s.id)}
                      className="w-full text-left px-5 py-3 flex items-center justify-between hover:bg-[var(--paper-deep)] transition-colors duration-150 ease-standard"
                    >
                      <div>
                        <p className="text-sm text-[var(--text-1)] font-medium">{s.river_name || "Unknown"}</p>
                        <p className="text-xs text-[var(--text-3)] flex items-center gap-1">
                          {formatDate(s.date)}
                          {!s.broadcast_presence && (
                            <>
                              · <Lock className="h-3 w-3" /> Private
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm num text-[var(--accent)]">{s.total_fish || 0} fish</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Species caught */}
            {species.length > 0 && (
              <div className="ea-card">
                <h3 className="ea-overline mb-3">Species Caught ({species.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {species.map(s => (
                    <span key={s} className="ea-chip">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Log */}
            <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--border)]">
                <h3 className="ea-overline">Audit Log</h3>
              </div>
              {data.auditLog.length === 0 ? (
                <p className="px-5 py-6 text-sm text-[var(--text-3)] text-center">No admin actions on this user</p>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {data.auditLog.map(log => (
                    <div key={log.id} className="px-5 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AuditIcon action={log.action} />
                          <span className="text-sm text-[var(--text-1)] font-medium">{formatAction(log.action)}</span>
                        </div>
                        <span className="text-xs num text-[var(--text-3)]">{formatDateTime(log.created_at)}</span>
                      </div>
                      <p className="text-xs text-[var(--text-3)] mt-1">by {log.admin_email}</p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <p className="text-xs text-[var(--text-2)] mt-1 font-mono bg-[var(--paper-deep)] px-2 py-1 rounded-[var(--radius-sm)]">
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

      {activeSessionId && (
        <AdminSessionDetailModal
          sessionId={activeSessionId}
          onClose={() => setActiveSessionId(null)}
        />
      )}

      {showDeleteModal && data?.profile && (
        <DeleteUserModal
          userId={userId}
          username={data.profile.username}
          displayName={data.profile.display_name}
          email={null}
          sessionCount={data.sessions.length}
          catchCount={data.catches.length}
          flyBoxCount={data.flies.length}
          photoCount={0}
          onCancel={() => setShowDeleteModal(false)}
          onDeleted={() => {
            setShowDeleteModal(false);
            router.push("/admin/users");
          }}
        />
      )}
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-[var(--text-2)]">{label}</span>
      </div>
      <span className="text-sm num text-[var(--text-1)]">{value}</span>
    </div>
  );
}

function AuditIcon({ action }: { action: string }) {
  switch (action) {
    case "ban_user": return <Ban className="h-3.5 w-3.5 text-[var(--danger)]" />;
    case "unban_user": return <UserCheck className="h-3.5 w-3.5 text-[var(--success)]" />;
    case "add_note": return <StickyNote className="h-3.5 w-3.5 text-[var(--accent)]" />;
    case "kill_session": return <AlertTriangle className="h-3.5 w-3.5 text-[var(--warning)]" />;
    default: return <Shield className="h-3.5 w-3.5 text-[var(--text-3)]" />;
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
