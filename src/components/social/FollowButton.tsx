"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  UserPlus,
  UserCheck,
  Clock,
  UserX,
  Loader2,
} from "@/icons";
import { createClient } from "@/lib/supabase/client";

/**
 * Shared follow button — Strava-grade state machine.
 *
 * Four states, mirroring the iOS reference
 * (Sources/ExecutiveAngler/Views/Social/FollowButton.swift):
 *
 *   - not_following → tap sends follow (public: immediate; private: request)
 *   - pending       → tap no-ops (label is "Requested"); cancel via unfollow on
 *                     profile page instead, to match iOS
 *   - following     → tap opens inline unfollow confirm
 *   - blocked       → disabled
 *
 * Visual tokens match the in-app design language (copper follow, slate for
 * pending/following, red hover for the confirm state).
 */
export type FollowStatus =
  | "not_following"
  | "pending"
  | "following"
  | "blocked";

interface FollowButtonProps {
  targetUserId: string;
  /** If the caller already knows the target's privacy flag, pass it to avoid
   *  an extra network round-trip on mount. */
  targetIsPrivate?: boolean;
  compact?: boolean;
  /** Fired whenever the local follow status changes so parents (e.g. the
   *  profile header) can keep follower counts in sync. */
  onStatusChange?: (status: FollowStatus) => void;
}

export function FollowButton({
  targetUserId,
  targetIsPrivate,
  compact = false,
  onStatusChange,
}: FollowButtonProps) {
  const [status, setStatus] = useState<FollowStatus>("not_following");
  const [isPrivate, setIsPrivate] = useState<boolean | undefined>(
    targetIsPrivate
  );
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [confirmingUnfollow, setConfirmingUnfollow] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dismiss the unfollow confirm when the user clicks outside it.
  const confirmRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!confirmingUnfollow) return;
    function onDocClick(e: MouseEvent) {
      if (
        confirmRef.current &&
        !confirmRef.current.contains(e.target as Node)
      ) {
        setConfirmingUnfollow(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [confirmingUnfollow]);

  // Clear transient error after 4s.
  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(null), 4000);
    return () => clearTimeout(t);
  }, [errorMessage]);

  // Notify parent on status change.
  const updateStatus = useCallback(
    (next: FollowStatus) => {
      setStatus(next);
      onStatusChange?.(next);
    },
    [onStatusChange]
  );

  // Bootstrap: viewer id + current follow/block state + private flag.
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const me = auth.user?.id ?? null;
      if (cancelled) return;
      setUserId(me);

      if (!me || me === targetUserId) {
        setInitialized(true);
        return;
      }

      // 1. Block detection. Prefer a user_blocks table if it exists; otherwise
      //    fall back to a follows row with status='blocked'. Either direction
      //    of the block is enough to disable the button.
      let blocked = false;
      try {
        const { data: blocks, error: blocksErr } = await supabase
          .from("user_blocks")
          .select("blocker_id, blocked_id")
          .or(
            `and(blocker_id.eq.${me},blocked_id.eq.${targetUserId}),` +
              `and(blocker_id.eq.${targetUserId},blocked_id.eq.${me})`
          )
          .limit(1);
        if (!blocksErr && blocks && blocks.length > 0) blocked = true;
      } catch {
        // Table may not exist yet in this environment — fall through.
      }

      // 2. Existing follow edge.
      const { data: follow } = await supabase
        .from("follows")
        .select("status")
        .eq("follower_id", me)
        .eq("following_id", targetUserId)
        .maybeSingle();

      if (cancelled) return;

      if (blocked || follow?.status === "blocked") {
        updateStatus("blocked");
      } else if (follow?.status === "accepted") {
        updateStatus("following");
      } else if (follow?.status === "pending") {
        updateStatus("pending");
      } else {
        updateStatus("not_following");
      }

      // 3. Privacy flag — only fetch if the caller didn't provide it.
      if (typeof targetIsPrivate !== "boolean") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_private")
          .eq("user_id", targetUserId)
          .maybeSingle();
        if (!cancelled) {
          setIsPrivate(Boolean(profile?.is_private));
        }
      }

      if (!cancelled) setInitialized(true);
    })();

    return () => {
      cancelled = true;
    };
    // We intentionally exclude updateStatus here to avoid re-running on every
    // render — bootstrap is one-shot per target.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId, targetIsPrivate]);

  // Self / unauthenticated → render nothing (matches iOS + previous behavior).
  if (!userId || userId === targetUserId) return null;

  async function handleFollow() {
    if (loading || !userId) return;
    const supabase = createClient();
    const targetPrivate = Boolean(isPrivate);
    const nextDb: "accepted" | "pending" = targetPrivate
      ? "pending"
      : "accepted";
    const optimistic: FollowStatus = targetPrivate ? "pending" : "following";
    const previous = status;

    // Optimistic flip.
    updateStatus(optimistic);
    setLoading(true);

    const { error } = await supabase.from("follows").insert({
      follower_id: userId,
      following_id: targetUserId,
      status: nextDb,
    });

    if (error) {
      // Roll back — most likely cause is RLS (target blocked us) or a unique
      // constraint race. Show a neutral message.
      console.error("Follow insert error:", error);
      updateStatus(previous);
      setErrorMessage("Unable to follow");
      setLoading(false);
      return;
    }

    // Fire-and-forget notification + email. Failures here are non-fatal — the
    // follow edge is already persisted.
    supabase
      .from("notifications")
      .insert({
        recipient_id: targetUserId,
        actor_id: userId,
        type: nextDb === "pending" ? "follow_request" : "follow_accepted",
      })
      .then(() => {});

    fetch("/api/notifications/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "follow",
        recipientId: targetUserId,
        actorId: userId,
      }),
    }).catch(() => {});

    setLoading(false);
  }

  async function handleUnfollow() {
    if (loading || !userId) return;
    const previous = status;
    const supabase = createClient();

    // Optimistic flip.
    updateStatus("not_following");
    setConfirmingUnfollow(false);
    setLoading(true);

    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", userId)
      .eq("following_id", targetUserId);

    if (error) {
      console.error("Unfollow delete error:", error);
      updateStatus(previous);
      setErrorMessage("Unable to unfollow");
    }
    setLoading(false);
  }

  function handleClick() {
    if (loading) return;
    switch (status) {
      case "not_following":
        void handleFollow();
        break;
      case "pending":
        // No-op, matches iOS "Requested" behavior. Cancel-pending is handled
        // elsewhere (profile menu / future follow-requests UI).
        break;
      case "following":
        setConfirmingUnfollow(true);
        break;
      case "blocked":
        // Disabled.
        break;
    }
  }

  // --- Visual config --------------------------------------------------------

  const sizeClasses = compact
    ? "px-2.5 py-1 text-xs gap-1"
    : "px-3 py-1.5 text-sm gap-1.5";
  const iconSize = compact ? "h-3 w-3" : "h-3.5 w-3.5";

  const config: Record<
    FollowStatus,
    { Icon: typeof UserPlus; label: string; className: string }
  > = {
    not_following: {
      Icon: UserPlus,
      label: "Follow",
      className: "bg-[var(--action)] text-[var(--surface-page)] hover:bg-[#F0A050]",
    },
    pending: {
      Icon: Clock,
      label: "Requested",
      className:
        "bg-[var(--border-rule)] text-[var(--text-body)] border border-[var(--border-rule)] cursor-default",
    },
    following: {
      Icon: UserCheck,
      label: "Following",
      className:
        "bg-transparent text-[var(--text-primary)] border border-[var(--border-rule)] hover:border-[var(--state-negative)]/60 hover:text-[var(--text-primary)]",
    },
    blocked: {
      Icon: UserX,
      label: "Blocked",
      className:
        "bg-[var(--border-rule)] text-[var(--text-body)] border border-[var(--border-rule)] opacity-70 cursor-not-allowed",
    },
  };

  // Show a neutral placeholder during bootstrap so we don't flicker from
  // "Follow" → "Following".
  if (!initialized) {
    return (
      <button
        type="button"
        disabled
        aria-label="Loading follow state"
        className={`inline-flex items-center rounded-lg font-semibold opacity-60 bg-[var(--border-rule)] text-[var(--text-body)] ${sizeClasses}`}
      >
        <Loader2 className={`${iconSize} animate-spin`} />
      </button>
    );
  }

  const { Icon, label, className } = config[status];
  const disabled = loading || status === "blocked" || status === "pending";

  return (
    <div className="relative inline-flex flex-col items-stretch">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled && status !== "pending"}
        aria-label={label}
        aria-busy={loading}
        className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-150 ${className} ${sizeClasses} ${
          loading ? "opacity-60" : ""
        }`}
      >
        {loading ? (
          <Loader2 className={`${iconSize} animate-spin`} />
        ) : (
          <Icon className={iconSize} />
        )}
        <span>{label}</span>
      </button>

      {/* Inline unfollow confirm — anchored under the button so it doesn't
          need a global modal layer. Clicking outside dismisses. */}
      {confirmingUnfollow && (
        <div
          ref={confirmRef}
          role="dialog"
          aria-label="Confirm unfollow"
          className="absolute top-full right-0 mt-2 z-30 w-60 rounded-lg border border-[var(--border-rule)] bg-[var(--surface-raised)] shadow-xl p-3"
        >
          <p className="text-sm text-[var(--text-primary)] font-semibold">Unfollow?</p>
          <p className="text-xs text-[var(--text-body)] mt-1">
            You will no longer see their sessions in your feed.
          </p>
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmingUnfollow(false)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-[var(--text-body)] hover:text-[var(--text-primary)] hover:bg-[var(--border-rule)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleUnfollow()}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-900/40 border border-red-800/60 text-red-300 hover:bg-red-900/60 transition-colors"
            >
              Unfollow
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <p
          role="status"
          className="absolute top-full right-0 mt-1 text-[10px] text-red-400 whitespace-nowrap"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
