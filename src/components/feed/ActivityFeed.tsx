"use client";

import Image from "next/image";
import { Fish, MapPin, Cloud } from "lucide-react";
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
      <div className="text-center py-16">
        <Fish className="h-12 w-12 text-[var(--text-meta)] mx-auto mb-4" />
        <p className="text-[var(--text-body)] text-sm">
          No anglers on the water right now.
        </p>
        <p className="text-[var(--text-meta)] text-xs mt-2">
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
    <article className="bg-[var(--surface-raised)] rounded-lg border border-[var(--border-rule)] overflow-hidden hover:border-[var(--text-meta)] transition-colors duration-200">
      {/* User header — name/avatar only; public profiles are retired */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="h-9 w-9 rounded-full overflow-hidden bg-[var(--border-rule)] flex items-center justify-center flex-shrink-0">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-sm font-bold text-[var(--text-body)] font-['IBM_Plex_Mono']">
              {avatarInitials(
                profile?.display_name ?? null,
                profile?.username ?? null
              )}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {displayName}
            </span>
            {username && (
              <span className="text-xs text-[var(--text-meta)] truncate">
                @{username}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[var(--text-meta)]">
            {relativeTime(session.created_at || session.date)}
          </span>
        </div>
      </div>

      {/* Session content — presence only */}
      <div className="px-4 pb-4">
        {/* River name + section */}
        {session.river_name && (
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="h-3.5 w-3.5 text-[var(--action)] flex-shrink-0" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {session.river_name}
            </span>
            {session.section && (
              <span className="text-xs text-[var(--text-body)]">
                &middot; {session.section}
              </span>
            )}
          </div>
        )}

        {/* Weather only — no water temp, no clarity, no notes, no coords, no fish count */}
        {session.weather && (
          <div className="flex items-center gap-1 text-[11px] text-[var(--text-body)] mb-3">
            <Cloud className="h-3 w-3" />
            {session.weather}
          </div>
        )}

        {/* Kudos only — no comments (DMs exist for private convos) */}
        <div className="flex items-center gap-4 pt-2 border-t border-[var(--border-rule)]">
          <KudosButton
            sessionId={session.id}
            initialCount={session.like_count}
          />
        </div>
      </div>
    </article>
  );
}
