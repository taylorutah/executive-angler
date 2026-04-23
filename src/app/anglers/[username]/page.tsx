import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

// Never cache — always fetch fresh follow state and sessions
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string }>;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const supabase = await createClient();

  // Peek at the profile so private + opted-out accounts stay out of search
  // indexes. We mirror Strava here: public, searchable profiles are
  // indexable; everyone else emits `noindex, nofollow` so crawlers skip
  // them entirely.
  //
  //   is_private  → sessions are hidden from non-followers; the profile
  //                 itself is still viewable but there's nothing useful to
  //                 index, so noindex.
  //   !searchable → user explicitly opted out of search indexing (Strava's
  //                 "Show profile in search results" toggle, off).
  const looksLikeUuid = UUID_RE.test(rawUsername);
  const profileQuery = supabase
    .from("profiles")
    .select("profile_visibility, searchable, username");
  const { data: profile } = looksLikeUuid
    ? await profileQuery.eq("user_id", rawUsername).maybeSingle()
    : await profileQuery
        .eq("username", rawUsername.toLowerCase())
        .maybeSingle();

  const displayHandle = profile?.username || rawUsername;
  // Only fully-public profiles are indexable; followers_only and private
  // both warrant noindex (nothing useful to index, and it respects the
  // intent of the visibility setting).
  const isSearchable = profile ? profile.searchable !== false : false;
  const blockIndex = (profile?.profile_visibility ?? "public") !== "public" || !isSearchable;

  return {
    title: `@${displayHandle} — Executive Angler`,
    description: `View @${displayHandle}'s fishing sessions and river reports on Executive Angler.`,
    robots: blockIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : undefined,
  };
}

export default async function AnglerProfilePage({ params }: Props) {
  const { username: rawUsername } = await params;
  const supabase = await createClient();

  // The route segment is usually a username, but AccountClient falls back to
  // user.id when the viewer has no handle set — so accept either shape.
  const looksLikeUuid = UUID_RE.test(rawUsername);
  const profileQuery = supabase
    .from("profiles")
    .select(
      "user_id, username, display_name, bio, avatar_url, home_location, is_private, profile_visibility"
    );

  const { data: profile } = looksLikeUuid
    ? await profileQuery.eq("user_id", rawUsername).maybeSingle()
    : await profileQuery
        .eq("username", rawUsername.toLowerCase())
        .maybeSingle();

  if (!profile) notFound();

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();

  const isOwnProfile = !!viewer && viewer.id === profile.user_id;
  const isAnonymous = !viewer;

  // Strava parity: anonymous visitors see a 3-session teaser before being
  // prompted to sign in for the full feed. Logged-in viewers see the normal
  // 10-session window.
  const SESSION_TEASER_LIMIT = 3;
  const SESSION_DEFAULT_LIMIT = 10;
  const visibleSessionLimit = isAnonymous
    ? SESSION_TEASER_LIMIT
    : SESSION_DEFAULT_LIMIT;

  // Follow status — only relevant when a viewer is signed in and it's not
  // their own profile.
  let followStatus: "not_following" | "pending" | "following" =
    "not_following";
  if (viewer && !isOwnProfile) {
    const { data: follow } = await supabase
      .from("follows")
      .select("status")
      .eq("follower_id", viewer.id)
      .eq("following_id", profile.user_id)
      .maybeSingle();

    if (follow?.status === "accepted") followStatus = "following";
    else if (follow?.status === "pending") followStatus = "pending";
  }

  // Follower/following counts
  const [{ count: followerCount }, { count: followingCount }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", profile.user_id)
        .eq("status", "accepted"),
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", profile.user_id)
        .eq("status", "accepted"),
    ]);

  // Resolve profile_visibility with a safe fallback for legacy rows.
  const visibility = (profile as { profile_visibility?: string }).profile_visibility ?? "public";

  // Three-way gate:
  //   public        → anyone can see sessions
  //   followers_only → only accepted followers (+ owner)
  //   private       → owner only
  const canSeeSessions =
    isOwnProfile ||
    visibility === "public" ||
    (visibility === "followers_only" && followStatus === "following");

  let sessions: Array<{
    id: string;
    river_name: string | null;
    date: string | null;
    total_fish: number | null;
    created_at: string | null;
  }> = [];
  let totalSessions = 0;
  let totalFish = 0;
  let totalRivers = 0;

  if (canSeeSessions) {
    // Pull the user's public sessions (viewing own profile sees all).
    const sessionQuery = supabase
      .from("fishing_sessions")
      .select("id, river_name, date, total_fish, created_at, privacy")
      .eq("user_id", profile.user_id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    const { data: sessionRows } = isOwnProfile
      ? await sessionQuery
      : await sessionQuery.eq("privacy", "public");

    const allSessions = sessionRows || [];
    sessions = allSessions.slice(0, visibleSessionLimit).map((s) => ({
      id: s.id,
      river_name: s.river_name,
      date: s.date,
      total_fish: s.total_fish,
      created_at: s.created_at,
    }));
    totalSessions = allSessions.length;
    totalFish = allSessions.reduce(
      (sum, s) => sum + (s.total_fish || 0),
      0
    );
    totalRivers = new Set(
      allSessions.map((s) => s.river_name).filter(Boolean)
    ).size;
  }

  // Kudos counts for the 10 most recent visible sessions.
  const sessionIds = sessions.map((s) => s.id);
  const kudosCounts: Record<string, number> = {};
  if (sessionIds.length > 0) {
    const { data: kudos } = await supabase
      .from("session_likes")
      .select("session_id")
      .in("session_id", sessionIds);
    (kudos || []).forEach((k) => {
      kudosCounts[k.session_id] =
        (kudosCounts[k.session_id] || 0) + 1;
    });
  }

  return (
    <ProfileClient
      profile={{
        userId: profile.user_id,
        username: profile.username,
        displayName: profile.display_name,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        homeLocation: profile.home_location,
        // isPrivate = true whenever the profile isn't fully public, so
        // ProfileClient shows the lock banner for both followers_only and private.
        isPrivate: visibility !== "public",
      }}
      stats={{
        sessions: totalSessions,
        fish: totalFish,
        rivers: totalRivers,
        followers: followerCount ?? 0,
        following: followingCount ?? 0,
      }}
      sessions={sessions}
      kudosCounts={kudosCounts}
      canSeeSessions={canSeeSessions}
      initialFollowStatus={followStatus}
      isOwnProfile={isOwnProfile}
      viewerId={viewer?.id ?? null}
      isAnonymous={isAnonymous}
      hasMoreSessions={totalSessions > sessions.length}
    />
  );
}
