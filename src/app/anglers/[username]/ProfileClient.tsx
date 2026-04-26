"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  UserPlus,
  MoreHorizontal,
  Flag,
  Ban,
  X,
  MapPin,
  ChevronRight,
  Heart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/date";
import {
  FollowButton,
  type FollowStatus,
} from "@/components/social/FollowButton";

interface ProfileClientProps {
  profile: {
    userId: string;
    username: string | null;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    homeLocation: string | null;
    isPrivate: boolean;
  };
  stats: {
    sessions: number;
    fish: number;
    rivers: number;
    followers: number;
    following: number;
  };
  sessions: Array<{
    id: string;
    river_name: string | null;
    date: string | null;
    total_fish: number | null;
    created_at: string | null;
  }>;
  kudosCounts: Record<string, number>;
  canSeeSessions: boolean;
  initialFollowStatus: FollowStatus;
  isOwnProfile: boolean;
  viewerId: string | null;
  /**
   * True when no viewer is signed in. Strava parity: anonymous visitors can
   * see the profile header + 3-session teaser but every interactive control
   * (follow, report, block, followers/following drill-in) routes to login.
   */
  isAnonymous: boolean;
  /**
   * True when the server truncated the session list (typically because the
   * viewer is anonymous and hit the 3-session teaser cap). Controls whether
   * we render the "Sign in to see more" CTA.
   */
  hasMoreSessions: boolean;
}

type ReportReason =
  | "spam"
  | "harassment"
  | "inappropriate"
  | "impersonation"
  | "off_topic"
  | "other";

const REPORT_REASONS: Array<{ value: ReportReason; label: string; hint: string }> = [
  { value: "spam", label: "Spam", hint: "Repetitive or promotional content" },
  {
    value: "harassment",
    label: "Harassment or bullying",
    hint: "Targeting or threatening another angler",
  },
  {
    value: "inappropriate",
    label: "Inappropriate content",
    hint: "Explicit, hateful, or unsafe material",
  },
  {
    value: "impersonation",
    label: "Impersonation",
    hint: "Pretending to be someone else",
  },
  { value: "off_topic", label: "Off-topic", hint: "Not about fishing" },
  { value: "other", label: "Something else", hint: "Describe below" },
];

export default function ProfileClient({
  profile,
  stats,
  sessions,
  kudosCounts,
  canSeeSessions,
  initialFollowStatus,
  isOwnProfile,
  viewerId,
  isAnonymous,
  hasMoreSessions,
}: ProfileClientProps) {
  // Every "sign in" CTA on this page routes the angler back to the profile
  // they were looking at — matches iOS's "continue where you were" behavior
  // after auth and the generic Strava pattern.
  const loginHref = `/login?redirect=/anglers/${
    profile.username || profile.userId
  }`;
  const [followStatus, setFollowStatus] = useState<FollowStatus>(
    initialFollowStatus
  );
  const [followerCount, setFollowerCount] = useState(stats.followers);
  const [menuOpen, setMenuOpen] = useState(false);
  const [listMode, setListMode] = useState<"followers" | "following" | null>(
    null
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [blockedNotice, setBlockedNotice] = useState(false);

  const displayName =
    profile.displayName || profile.username || "Angler";
  const initial = (
    profile.displayName?.[0] ||
    profile.username?.[0] ||
    "A"
  ).toUpperCase();

  const sessionsVisible =
    canSeeSessions &&
    (!profile.isPrivate || isOwnProfile || followStatus === "following");

  // Keep the Followers count in sync with the button. We use the *previous*
  // status to decide the delta so flipping pending ⇄ following doesn't
  // double-count.
  const handleStatusChange = useCallback(
    (next: FollowStatus) => {
      setFollowStatus((prev) => {
        if (prev !== "following" && next === "following") {
          setFollowerCount((c) => c + 1);
        } else if (prev === "following" && next !== "following") {
          setFollowerCount((c) => Math.max(0, c - 1));
        }
        return next;
      });
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Top bar w/ overflow menu */}
      <div className="bg-[#161B22] border-b border-[#21262D]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/anglers"
            className="text-sm text-[#A8B2BD] hover:text-[#E8923A] transition-colors"
          >
            ← All anglers
          </Link>

          {!isOwnProfile && viewerId && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Profile actions"
                className="p-2 rounded-lg text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-hidden
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-20 w-52 rounded-lg border border-[#21262D] bg-[#161B22] shadow-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setReportOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-950/40 transition-colors"
                    >
                      <Flag className="h-4 w-4" />
                      Report User
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setBlockOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-950/40 transition-colors border-t border-[#21262D]"
                    >
                      <Ban className="h-4 w-4" />
                      Block User
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-[#E8923A]/10 border-2 border-[#21262D] shadow-lg flex items-center justify-center">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={displayName}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-3xl font-bold text-[#E8923A]">
                {initial}
              </span>
            )}
          </div>

          <h1 className="font-heading text-2xl font-bold text-[#F0F6FC] mt-4">
            {displayName}
          </h1>
          {profile.username && (
            <p className="text-sm text-[#A8B2BD] mt-0.5 font-mono">
              @{profile.username}
            </p>
          )}

          {profile.homeLocation && (
            <p className="flex items-center gap-1 text-xs text-[#6E7681] mt-1.5">
              <MapPin className="h-3 w-3" />
              {profile.homeLocation}
            </p>
          )}

          {profile.bio && (
            <p className="text-sm text-[#A8B2BD] mt-3 max-w-md whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}

          {profile.isPrivate && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#21262D] px-3 py-1">
              <Lock className="h-3 w-3 text-[#A8B2BD]" />
              <span className="text-xs text-[#A8B2BD]">Private profile</span>
            </div>
          )}

          {/* Action row */}
          <div className="mt-5 flex items-center gap-3">
            {isOwnProfile ? (
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#21262D] bg-[#161B22] px-4 py-2 text-sm font-semibold text-[#F0F6FC] hover:border-[#E8923A]/40 transition-colors"
              >
                Edit profile
              </Link>
            ) : viewerId ? (
              <FollowButton
                targetUserId={profile.userId}
                targetIsPrivate={profile.isPrivate}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <Link
                href={`/login?redirect=/anglers/${
                  profile.username || profile.userId
                }`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8923A] px-4 py-2 text-sm font-semibold text-[#0D1117] hover:bg-[#F0A050] transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Sign in to follow
              </Link>
            )}
          </div>
        </div>

        {/* Stats row — primary */}
        <div className="mt-8 grid grid-cols-3 rounded-xl border border-[#21262D] bg-[#161B22] divide-x divide-[#21262D] overflow-hidden">
          <StatCell value={stats.sessions} label="Sessions" />
          <StatCell value={stats.fish} label="Fish" />
          <StatCell value={stats.rivers} label="Rivers" />
        </div>

        {/* Stats row — social */}
        <div className="mt-3 grid grid-cols-2 rounded-xl border border-[#21262D] bg-[#161B22] divide-x divide-[#21262D] overflow-hidden">
          <StatCell
            value={followerCount}
            label="Followers"
            href={isAnonymous ? loginHref : undefined}
            onClick={isAnonymous ? undefined : () => setListMode("followers")}
          />
          <StatCell
            value={stats.following}
            label="Following"
            href={isAnonymous ? loginHref : undefined}
            onClick={isAnonymous ? undefined : () => setListMode("following")}
          />
        </div>

        {/* Recent Sessions */}
        <div className="mt-10">
          <h2 className="text-base font-semibold text-[#F0F6FC] mb-4">
            Recent Sessions
          </h2>

          {!sessionsVisible ? (
            <div className="rounded-xl bg-[#161B22] border border-[#21262D] py-10 px-6 flex flex-col items-center text-center">
              <Lock className="h-7 w-7 text-[#6E7681] mb-3" />
              <p className="text-sm font-medium text-[#A8B2BD]">
                This profile is private
              </p>
              <p className="text-xs text-[#6E7681] mt-1">
                Follow this angler to see their sessions
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-xl bg-[#161B22] border border-[#21262D] py-10 px-6 text-center">
              <p className="text-sm text-[#A8B2BD]">
                No public sessions yet
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-2">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/journal/${s.id}`}
                      className="flex items-center gap-3 rounded-xl bg-[#161B22] border border-[#21262D] px-4 py-3 hover:border-[#E8923A]/40 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#F0F6FC] truncate">
                          {s.river_name || "Unknown river"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6E7681]">
                          {s.date && <span>{formatDate(s.date)}</span>}
                          {s.total_fish != null && s.total_fish > 0 && (
                            <>
                              <span>·</span>
                              <span className="text-[#E8923A] font-mono">
                                {s.total_fish} fish
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {(kudosCounts[s.id] ?? 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs text-[#6E7681]">
                          <Heart className="h-3.5 w-3.5" />
                          <span className="font-mono">
                            {kudosCounts[s.id]}
                          </span>
                        </div>
                      )}
                      <ChevronRight className="h-4 w-4 text-[#6E7681]" />
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Strava-style teaser CTA for anonymous viewers. Only renders
                  when the feed was truncated by the teaser cap — logged-in
                  users already see the full window. */}
              {isAnonymous && hasMoreSessions && (
                <Link
                  href={loginHref}
                  className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#161B22] border border-[#E8923A]/40 px-4 py-4 hover:bg-[#E8923A]/10 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#F0F6FC]">
                      Sign in to see every session
                    </p>
                    <p className="text-xs text-[#A8B2BD] mt-0.5">
                      Unlock the full feed, kudos, comments, and follow {displayName}.
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#E8923A]" />
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Followers / Following sheet */}
      {listMode && (
        <FollowListDialog
          targetUserId={profile.userId}
          mode={listMode}
          onClose={() => setListMode(null)}
        />
      )}

      {/* Report dialog — Strava-style reason categories */}
      {reportOpen && (
        <ReportDialog
          targetName={displayName}
          onCancel={() => setReportOpen(false)}
          onSubmitted={() => {
            setReportOpen(false);
            setReportSubmitted(true);
          }}
          onSubmit={async (reasonCategory, reasonText) => {
            const res = await fetch("/api/moderation/report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contentType: "user",
                targetId: profile.userId,
                reasonCategory,
                reasonText: reasonText || null,
              }),
            });
            if (!res.ok) {
              const { error } = await res
                .json()
                .catch(() => ({ error: "Report failed" }));
              throw new Error(error || "Report failed");
            }
          }}
        />
      )}
      {reportSubmitted && (
        <NoticeDialog
          title="Report submitted"
          body="Thank you. Our team will review this report within 24 hours."
          onClose={() => setReportSubmitted(false)}
        />
      )}

      {/* Block dialog — calls the real API and surfaces errors */}
      {blockOpen && (
        <BlockDialog
          targetName={displayName}
          onCancel={() => setBlockOpen(false)}
          onBlocked={() => {
            setBlockOpen(false);
            setFollowStatus("not_following");
            setBlockedNotice(true);
          }}
          onBlock={async () => {
            const res = await fetch("/api/moderation/block", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ targetId: profile.userId }),
            });
            if (!res.ok) {
              const { error } = await res
                .json()
                .catch(() => ({ error: "Block failed" }));
              throw new Error(error || "Block failed");
            }
          }}
        />
      )}
      {blockedNotice && (
        <NoticeDialog
          title="User blocked"
          body={`${displayName} is blocked. You won't see their content in your feed anymore.`}
          onClose={() => setBlockedNotice(false)}
        />
      )}
    </div>
  );
}

/* ─────────────── Stats row ─────────────── */

function StatCell({
  value,
  label,
  onClick,
  href,
}: {
  value: number;
  label: string;
  onClick?: () => void;
  /**
   * When set, the cell renders as a link instead of a button. Used to route
   * anonymous viewers to /login rather than opening an interactive dialog.
   */
  href?: string;
}) {
  const inner = (
    <div className="flex flex-col items-center py-3">
      <span className="text-lg font-semibold text-[#E8923A] font-['IBM_Plex_Mono']">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-[#6E7681] mt-0.5">
        {label}
      </span>
    </div>
  );
  if (href) {
    return (
      <Link
        href={href}
        className="hover:bg-[#21262D]/60 transition-colors"
      >
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="hover:bg-[#21262D]/60 transition-colors"
      >
        {inner}
      </button>
    );
  }
  return inner;
}

/* ─────────────── Follow list dialog ─────────────── */

interface FollowListUser {
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

function FollowListDialog({
  targetUserId,
  mode,
  onClose,
}: {
  targetUserId: string;
  mode: "followers" | "following";
  onClose: () => void;
}) {
  const [users, setUsers] = useState<FollowListUser[] | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    // Fetch the edges first; join separately so the select stays simple
    // and avoids relying on a specific foreign-key relationship name.
    const edgeCol = mode === "followers" ? "following_id" : "follower_id";
    const targetCol = mode === "followers" ? "follower_id" : "following_id";

    const { data: edges } = await supabase
      .from("follows")
      .select(`${targetCol}`)
      .eq(edgeCol, targetUserId)
      .eq("status", "accepted");

    const userIds = ((edges as Array<Record<string, string>>) || [])
      .map((row) => row[targetCol])
      .filter(Boolean);

    if (userIds.length === 0) {
      setUsers([]);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .in("user_id", userIds);

    setUsers((profiles as FollowListUser[]) || []);
  }, [mode, targetUserId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[80vh] flex flex-col rounded-xl bg-[#161B22] border border-[#21262D] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262D]">
          <h3 className="text-sm font-semibold text-[#F0F6FC] capitalize">
            {mode}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#A8B2BD] hover:text-[#F0F6FC]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users === null ? (
            <p className="p-6 text-sm text-[#6E7681] text-center">Loading…</p>
          ) : users.length === 0 ? (
            <p className="p-6 text-sm text-[#6E7681] text-center">
              Nobody here yet.
            </p>
          ) : (
            <ul>
              {users.map((u) => {
                const href = u.username
                  ? `/anglers/${u.username}`
                  : `/anglers/${u.user_id}`;
                const initial = (
                  u.display_name?.[0] ||
                  u.username?.[0] ||
                  "A"
                ).toUpperCase();
                return (
                  <li
                    key={u.user_id}
                    className="border-b border-[#21262D] last:border-0"
                  >
                    <Link
                      href={href}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#0D1117] transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full overflow-hidden bg-[#E8923A]/10 flex items-center justify-center flex-shrink-0">
                        {u.avatar_url ? (
                          <Image
                            src={u.avatar_url}
                            alt=""
                            width={36}
                            height={36}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-sm font-bold text-[#E8923A]">
                            {initial}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#F0F6FC] truncate">
                          {u.display_name || u.username || "Angler"}
                        </p>
                        {u.username && (
                          <p className="text-xs text-[#6E7681] truncate">
                            @{u.username}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Report dialog ─────────────── */

function ReportDialog({
  targetName,
  onSubmit,
  onSubmitted,
  onCancel,
}: {
  targetName: string;
  onSubmit: (reason: ReportReason, text: string) => Promise<void>;
  onSubmitted: () => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState<ReportReason>("spam");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setErr(null);
    try {
      await onSubmit(reason, text.trim());
      onSubmitted();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Report failed";
      setErr(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-[#161B22] border border-[#21262D] p-5 max-h-[90vh] overflow-y-auto">
        <h3 className="text-base font-semibold text-[#F0F6FC]">
          Report {targetName}
        </h3>
        <p className="text-xs text-[#A8B2BD] mt-1">
          Only our moderators see this. Reports are anonymous.
        </p>

        <fieldset className="mt-4 space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wider text-[#6E7681] mb-2">
            Reason
          </legend>
          {REPORT_REASONS.map((opt) => {
            const selected = reason === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selected
                    ? "border-[#E8923A]/60 bg-[#E8923A]/10"
                    : "border-[#21262D] bg-[#0D1117] hover:border-[#21262D]/70"
                }`}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={opt.value}
                  checked={selected}
                  onChange={() => setReason(opt.value)}
                  className="mt-0.5 accent-[#E8923A]"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#F0F6FC]">
                    {opt.label}
                  </p>
                  <p className="text-xs text-[#A8B2BD] mt-0.5">{opt.hint}</p>
                </div>
              </label>
            );
          })}
        </fieldset>

        <label className="block mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6E7681]">
            Details {reason === "other" ? "(required)" : "(optional)"}
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Anything else our team should know?"
            className="mt-1.5 w-full rounded-lg bg-[#0D1117] border border-[#21262D] p-2.5 text-sm text-[#F0F6FC] placeholder-[#6E7681] focus:border-[#E8923A]/60 focus:outline-none resize-none"
          />
          <span className="mt-1 block text-[10px] text-[#6E7681] text-right">
            {text.length}/500
          </span>
        </label>

        {err && (
          <p role="alert" className="mt-3 text-xs text-red-400">
            {err}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              submitting || (reason === "other" && text.trim().length === 0)
            }
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-900/40 border border-red-800/60 text-red-300 hover:bg-red-900/60 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Block dialog ─────────────── */

function BlockDialog({
  targetName,
  onBlock,
  onBlocked,
  onCancel,
}: {
  targetName: string;
  onBlock: () => Promise<void>;
  onBlocked: () => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setErr(null);
    try {
      await onBlock();
      onBlocked();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Block failed";
      setErr(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-[#161B22] border border-[#21262D] p-5">
        <h3 className="text-base font-semibold text-[#F0F6FC]">
          Block {targetName}?
        </h3>
        <ul className="text-xs text-[#A8B2BD] mt-2 space-y-1 list-disc pl-4">
          <li>They won&apos;t be able to follow you or see your sessions</li>
          <li>You won&apos;t see their content anywhere in the app</li>
          <li>Any existing follow between you will be removed</li>
          <li>You can unblock from Settings</li>
        </ul>

        {err && (
          <p role="alert" className="mt-3 text-xs text-red-400">
            {err}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-900/40 border border-red-800/60 text-red-300 hover:bg-red-900/60 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Blocking…" : "Block"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Notice dialog ─────────────── */

function NoticeDialog({
  title,
  body,
  onClose,
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-[#161B22] border border-[#21262D] p-5">
        <h3 className="text-base font-semibold text-[#F0F6FC]">{title}</h3>
        <p className="text-sm text-[#A8B2BD] mt-2">{body}</p>
        <div className="mt-5 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#E8923A] text-[#0D1117] hover:bg-[#F0A050] transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
