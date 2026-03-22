"use client";

import Image from "next/image";
import {
  Fish,
  MapPin,
  Thermometer,
  Droplets,
  Cloud,
  Navigation,
} from "lucide-react";
import type { FeedSession } from "@/app/feed/page";
import { KudosButton } from "@/components/social/KudosButton";
import { CommentsSection } from "@/components/social/CommentsSection";

interface Props {
  sessions: FeedSession[];
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  // Parse as local noon to avoid timezone shift for date-only strings
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
        <Fish className="h-12 w-12 text-[#6E7681] mx-auto mb-4" />
        <p className="text-[#A8B2BD] text-sm">
          No public sessions yet. Be the first to share a session!
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
  const tags = session.trip_tags || session.tags || [];
  const fishCount = session.total_fish || session.catch_count;
  const hasConditions =
    session.water_temp_f != null ||
    session.water_clarity != null ||
    session.weather != null;
  const hasCoords = session.latitude != null && session.longitude != null;

  return (
    <article className="bg-[#161B22] rounded-lg border border-[#21262D] overflow-hidden hover:border-[#6E7681] transition-colors duration-200">
      {/* User header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="h-9 w-9 rounded-full overflow-hidden bg-[#21262D] flex items-center justify-center flex-shrink-0">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-sm font-bold text-[#A8B2BD] font-['IBM_Plex_Mono']">
              {avatarInitials(
                profile?.display_name ?? null,
                profile?.username ?? null
              )}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[#F0F6FC] truncate">
              {displayName}
            </span>
            {username && (
              <span className="text-xs text-[#6E7681] truncate">
                @{username}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#6E7681]">
            {relativeTime(session.date)}
          </span>
        </div>

        {/* Fish count badge */}
        {fishCount > 0 && (
          <span className="flex items-center gap-1 bg-[#E8923A]/15 text-[#E8923A] rounded-full px-2.5 py-1 text-sm font-semibold font-['IBM_Plex_Mono'] flex-shrink-0">
            <Fish className="h-3.5 w-3.5" />
            {fishCount}
          </span>
        )}
      </div>

      {/* Session content */}
      <div className="px-4 pb-4">
        {/* River name + section */}
        {session.river_name && (
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="h-3.5 w-3.5 text-[#E8923A] flex-shrink-0" />
            <span className="text-sm font-medium text-[#F0F6FC]">
              {session.river_name}
            </span>
            {session.section && (
              <span className="text-xs text-[#A8B2BD]">
                &middot; {session.section}
              </span>
            )}
          </div>
        )}

        {/* Location fallback if no river name */}
        {!session.river_name && session.location && (
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="h-3.5 w-3.5 text-[#E8923A] flex-shrink-0" />
            <span className="text-sm text-[#F0F6FC]">{session.location}</span>
          </div>
        )}

        {/* Notes excerpt */}
        {session.notes && (
          <p className="text-xs text-[#A8B2BD] leading-relaxed line-clamp-2 mb-3">
            {session.notes}
          </p>
        )}

        {/* Conditions row */}
        {hasConditions && (
          <div className="flex flex-wrap gap-3 text-[11px] text-[#A8B2BD] mb-3">
            {session.weather != null && (
              <span className="flex items-center gap-1">
                <Cloud className="h-3 w-3" />
                {session.weather}
              </span>
            )}
            {session.water_temp_f != null && (
              <span className="flex items-center gap-1 font-['IBM_Plex_Mono']">
                <Thermometer className="h-3 w-3" />
                {session.water_temp_f}&deg;F
              </span>
            )}
            {session.water_clarity != null && (
              <span className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                {session.water_clarity}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-[#21262D] text-[#A8B2BD] rounded-full px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Coordinates indicator */}
        {hasCoords && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#6E7681] mb-3">
            <Navigation className="h-3 w-3" />
            <span className="font-['IBM_Plex_Mono']">
              {session.latitude!.toFixed(2)}, {session.longitude!.toFixed(2)}
            </span>
          </div>
        )}

        {/* Social interaction bar */}
        <div className="flex items-center gap-4 pt-2 border-t border-[#21262D]">
          <KudosButton
            sessionId={session.id}
            initialCount={session.like_count}
          />
          <CommentsSection
            sessionId={session.id}
            initialCount={session.comment_count}
          />
        </div>
      </div>
    </article>
  );
}
