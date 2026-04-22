"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  UserPlus,
  UserCheck,
  Clock,
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

type FollowStatus = "not_following" | "pending" | "following";

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
}

export default function ProfileClient({
  profile,
  stats,
  sessions,
  kudosCounts,
  canSeeSessions,
  initialFollowStatus,
  isOwnProfile,
  viewerId,
}: ProfileClientProps) {
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
  const [unfollowOpen, setUnfollowOpen] = useState(false);
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
              <FollowActionButton
                targetUserId={profile.userId}
                status={followStatus}
                setStatus={(next) => {
                  // Keep follower count tracked client-side so the stats row
                  // is immediately consistent with the button.
                  setFollowStatus(next);
                  if (next === "following") {
                    setFollowerCount((c) => c + 1);
                  } else if (next === "not_following") {
                    setFollowerCount((c) =>
                      followStatus === "following" ? Math.max(0, c - 1) : c
                    );
                  }
                }}
                isPrivateTarget={profile.isPrivate}
                onRequestUnfollow={() => setUnfollowOpen(true)}
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

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-5 rounded-xl border border-[#21262D] bg-[#161B22] overflow-hidden">
          <StatCell value={stats.sessions} label="Sessions" />
          <StatDivider />
          <StatCell value={stats.fish} label="Fish" />
          <StatDivider />
          <StatCell value={stats.rivers} label="Rivers" />
          <StatDivider />
          <StatCell
            value={followerCount}
            label="Followers"
            onClick={() => setListMode("followers")}
          />
          <StatDivider />
          <StatCell
            value={stats.following}
            label="Following"
            onClick={() => setListMode("following")}
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

      {/* Unfollow confirm */}
      {unfollowOpen && (
        <ConfirmDialog
          title={`Unfollow ${displayName}?`}
          body="You will no longer see their sessions in your feed."
          confirmLabel="Unfollow"
          destructive
          onCancel={() => setUnfollowOpen(false)}
          onConfirm={async () => {
            setUnfollowOpen(false);
            const supabase = createClient();
            if (viewerId) {
              await supabase
                .from("follows")
                .delete()
                .eq("follower_id", viewerId)
                .eq("following_id", profile.userId);
            }
            setFollowStatus("not_following");
            setFollowerCount((c) =>
              Math.max(0, c - 1)
            );
          }}
        />
      )}

      {/* Report dialog */}
      {reportOpen && (
        <ConfirmDialog
          title="Report User"
          body="Report this user for inappropriate content? Our team will review."
          confirmLabel="Report"
          destructive
          onCancel={() => setReportOpen(false)}
          onConfirm={async () => {
            setReportOpen(false);
            try {
              await fetch("/api/moderation/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  type: "user",
                  targetId: profile.userId,
                  reason: "Reported by user",
                }),
              });
            } catch {
              /* swallow — show confirmation regardless */
            }
            setReportSubmitted(true);
          }}
        />
      )}
      {reportSubmitted && (
        <NoticeDialog
          title="Report submitted"
          body="Thank you. Our team will review this report."
          onClose={() => setReportSubmitted(false)}
        />
      )}

      {/* Block dialog */}
      {blockOpen && (
        <ConfirmDialog
          title="Block User"
          body="Block this user? You won't see their content and they won't be able to follow you."
          confirmLabel="Block"
          destructive
          onCancel={() => setBlockOpen(false)}
          onConfirm={async () => {
            setBlockOpen(false);
            try {
              await fetch("/api/moderation/block", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetId: profile.userId }),
              });
            } catch {
              /* swallow */
            }
            // Also drop any existing follow edge between viewer + target so
            // the UI state is consistent even without a server-side block
            // pipeline yet.
            if (viewerId) {
              const supabase = createClient();
              await supabase
                .from("follows")
                .delete()
                .or(
                  `and(follower_id.eq.${viewerId},following_id.eq.${profile.userId}),and(follower_id.eq.${profile.userId},following_id.eq.${viewerId})`
                );
            }
            setFollowStatus("not_following");
            setBlockedNotice(true);
          }}
        />
      )}
      {blockedNotice && (
        <NoticeDialog
          title="User blocked"
          body="You won't see their content in your feed anymore."
          onClose={() => setBlockedNotice(false)}
        />
      )}
    </div>
  );
}

/* ─────────────── Follow button ─────────────── */

function FollowActionButton({
  targetUserId,
  status,
  setStatus,
  isPrivateTarget,
  onRequestUnfollow,
}: {
  targetUserId: string;
  status: FollowStatus;
  setStatus: (s: FollowStatus) => void;
  isPrivateTarget: boolean;
  onRequestUnfollow: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;

    // Tapping "Following" prompts an unfollow confirm; parent handles it.
    if (status === "following") {
      onRequestUnfollow();
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    const me = auth.user?.id;
    if (!me) {
      setLoading(false);
      return;
    }

    if (status === "pending") {
      // Cancel pending request.
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", me)
        .eq("following_id", targetUserId);
      setStatus("not_following");
      setLoading(false);
      return;
    }

    // Fresh follow. Public → accepted immediately. Private → pending +
    // follow_request notification.
    const nextStatus: "accepted" | "pending" = isPrivateTarget
      ? "pending"
      : "accepted";

    const { error } = await supabase.from("follows").insert({
      follower_id: me,
      following_id: targetUserId,
      status: nextStatus,
    });

    if (error) {
      console.error("Follow insert error:", error);
      setLoading(false);
      return;
    }

    await supabase.from("notifications").insert({
      recipient_id: targetUserId,
      actor_id: me,
      type: nextStatus === "pending" ? "follow_request" : "follow_accepted",
    });

    // Fire-and-forget email notification — same contract as shared button.
    fetch("/api/notifications/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "follow",
        recipientId: targetUserId,
        actorId: me,
      }),
    }).catch(() => {});

    setStatus(nextStatus === "accepted" ? "following" : "pending");
    setLoading(false);
  }

  const config = {
    not_following: {
      icon: UserPlus,
      label: "Follow",
      className:
        "bg-[#E8923A] text-[#0D1117] hover:bg-[#F0A050] border border-transparent",
    },
    pending: {
      icon: Clock,
      label: "Requested",
      className:
        "bg-[#21262D] text-[#A8B2BD] hover:bg-[#2D333B] border border-[#21262D]",
    },
    following: {
      icon: UserCheck,
      label: "Following",
      className:
        "bg-transparent text-[#F0F6FC] hover:bg-[#21262D] border border-[#21262D]",
    },
  } as const;

  const { icon: Icon, label, className } = config[status];

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${className} ${
        loading ? "opacity-60" : ""
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

/* ─────────────── Stats row ─────────────── */

function StatCell({
  value,
  label,
  onClick,
}: {
  value: number;
  label: string;
  onClick?: () => void;
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

function StatDivider() {
  return <div className="w-px bg-[#21262D]" aria-hidden />;
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

/* ─────────────── Dialog primitives ─────────────── */

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  destructive,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-[#161B22] border border-[#21262D] p-5">
        <h3 className="text-base font-semibold text-[#F0F6FC]">{title}</h3>
        <p className="text-sm text-[#A8B2BD] mt-2">{body}</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#21262D] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              destructive
                ? "bg-red-900/40 border border-red-800/60 text-red-300 hover:bg-red-900/60"
                : "bg-[#E8923A] text-[#0D1117] hover:bg-[#F0A050]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

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
