"use client";

import Image from "next/image";
import { Fish, MapPin, Cloud } from "@/icons";
import type { FeedSession } from "@/app/feed/page";
import { KudosButton } from "@/components/social/KudosButton";

interface Props {
  sessions: FeedSession[];
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = dateStr.includes("T")
    ? new Date(dateStr)
    : new Date(dateStr + "T12:00:00");
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function avatarInitials(
  displayName: string | null,
  username: string | null
): string {
  const name = displayName || username || "A";
  return name.charAt(0).toUpperCase();
}

export function ActivityFeed({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <div className="ea-empty">
        <Fish className="h-12 w-12 text-[var(--text-3)]" />
        <p className="text-sm text-[var(--text-2)]">
          No anglers on the water right now.
        </p>
        <p className="text-xs text-[var(--text-3)]">
          Logging a session? Toggle &ldquo;Show me on the feed&rdquo; to appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <FeedCard key={session.id} session={session} />
      ))}
    </div>
  );
}

function FeedCard({ session }: { session: FeedSession }) {
  const profile = session.profile;
  const displayName = profile?.display_name || profile?.username || "Angler";
  const username = profile?.username;

  return (
    <article className="ea-card card-hover overflow-hidden p-0">
      {/* User header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="h-9 w-9 rounded-[var(--radius-card)] overflow-hidden border border-[var(--border)] bg-[var(--accent-soft)] flex items-center justify-center flex-shrink-0">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              width={36}
              height={36}
              className="ea-photo object-cover w-full h-full"
            />
          ) : (
            <span className="font-display text-sm font-semibold text-[var(--accent)]">
              {avatarInitials(
                profile?.display_name ?? null,
                profile?.username ?? null
              )}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-[var(--text-1)] truncate">
              {displayName}
            </span>
            {username && (
              <span className="text-xs text-[var(--text-3)] truncate">
                @{username}
              </span>
            )}
          </div>
          <span className="text-xs text-[var(--text-3)]">
            {relativeTime(session.created_at || session.date)}
          </span>
        </div>
      </div>

      {/* Session content — presence only */}
      <div className="px-4 pb-4">
        {/* River name + section */}
        {session.river_name && (
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="h-3.5 w-3.5 text-[var(--accent)] flex-shrink-0" />
            <span className="text-sm font-medium text-[var(--text-1)]">
              {session.river_name}
            </span>
            {session.section && (
              <span className="text-xs text-[var(--text-2)]">
                &middot; {session.section}
              </span>
            )}
          </div>
        )}

        {/* Weather only — no water temp, no clarity, no notes, no coords, no fish count */}
        {session.weather && (
          <div className="flex items-center gap-1 text-xs text-[var(--text-2)] mb-3">
            <Cloud className="h-3.5 w-3.5" />
            {session.weather}
          </div>
        )}

        {/* Kudos only — no comments (DMs exist for private convos) */}
        <div className="flex items-center gap-4 pt-2 border-t border-[var(--border)]">
          <KudosButton
            sessionId={session.id}
            initialCount={session.like_count}
          />
        </div>
      </div>
    </article>
  );
}
