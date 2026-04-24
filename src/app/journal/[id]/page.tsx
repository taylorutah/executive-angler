import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SessionDetail from "./SessionDetail";
import { checkPremium } from "@/lib/admin";

// Never cache — always fetch fresh data from Supabase
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  // Keep private sessions out of search indexes. Public sessions are
  // shareable (Strava parity) so we leave robots at the default.
  const { data: session } = await supabase
    .from("fishing_sessions")
    .select("privacy")
    .eq("id", id)
    .maybeSingle();
  const isPublic = session?.privacy === "public";
  return {
    title: "Session | Executive Angler",
    description: `Fishing session ${id.slice(0, 8)}`,
    robots: isPublic
      ? undefined
      : { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the session first — RLS already filters private rows out for
  // non-owners (including the anon role), so a `maybeSingle()` that
  // returns null means "either doesn't exist or you aren't allowed to see
  // it." In either case the right response is 404.
  const { data: session, error } = await supabase
    .from("fishing_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !session) notFound();

  const isOwner = !!user && session.user_id === user.id;
  const isAnonymous = !user;

  // Belt & suspenders: RLS would have already filtered, but if anything
  // ever slips through, 404 rather than leak private data. This also
  // covers the anonymous-visitor case (user === null) when the link
  // points at a private session.
  if (!isOwner && session.privacy !== "public") {
    notFound();
  }

  // If the session owner has profile_visibility = 'private', even direct
  // session links are owner-only. RLS already blocks the DB read, but we
  // check explicitly here so we can 404 cleanly without leaking any info.
  // For 'followers_only', direct links remain accessible (Strava parity —
  // you can share a specific session URL with anyone).
  let ownerProfile: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    profile_visibility?: string;
  } | null = null;
  if (session.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, username, avatar_url, profile_visibility")
      .eq("user_id", session.user_id)
      .maybeSingle();
    ownerProfile = profile ?? null;
  }

  // Hard block: profile_visibility = 'private' means owner-only, even for
  // sessions that are marked 'public' at the session level.
  const ownerVisibility = ownerProfile?.profile_visibility ?? "public";
  if (!isOwner && ownerVisibility === "private") {
    notFound();
  }

  const { data: catches } = await supabase
    .from("catches")
    .select("*, fly_pattern:fly_patterns(name, type, image_url)")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  // Flies used in this session (from fly_patterns table, matched by catch)
  const flyPatternIds = (catches || [])
    .map((c: { fly_pattern_id?: string }) => c.fly_pattern_id)
    .filter(Boolean);

  const { data: flies } = flyPatternIds.length > 0
    ? await supabase.from("fly_patterns").select("id, name, type, image_url").in("id", flyPatternIds)
    : { data: [] };

  const { data: sessionPhotos } = await supabase
    .from("session_photos")
    .select("id, url, caption, created_at")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  // Normalise: strip profile_visibility from the ownerProfile shape
  // before passing to SessionDetail (it only needs display fields).
  const ownerProfileForDetail = ownerProfile
    ? {
        display_name: ownerProfile.display_name,
        username: ownerProfile.username,
        avatar_url: ownerProfile.avatar_url,
      }
    : null;

  return (
    <SessionDetail
      session={session}
      catches={(catches || []) as Parameters<typeof SessionDetail>[0]["catches"]}
      flies={(flies || []) as Parameters<typeof SessionDetail>[0]["flies"]}
      sessionPhotos={sessionPhotos ?? []}
      isOwner={isOwner}
      ownerProfile={ownerProfileForDetail}
      isAnonymous={isAnonymous}
      isPremium={user ? await checkPremium(supabase, user.id, user.email) : false}
    />
  );
}
