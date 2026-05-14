import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FishingSession, SessionRig, Catch } from "@/types/fishing-log";
import { getMyFliesCounts } from "@/lib/db/fly-patterns";
import { JournalClient } from "./JournalClient";

// Never cache — always fetch fresh session data
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Fishing Journal | Executive Angler",
  description: "Your personal fishing log with sessions, catches, and river reports.",
};

export default async function JournalPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/journal");
  }

  // Fetch user's fishing sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from("fishing_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (sessionsError) {
    console.error("Error fetching sessions:", sessionsError);
  }

  // Fetch all rigs for these sessions
  const sessionIds = sessions?.map((s) => s.id) || [];
  const { data: rigs, error: rigsError } = await supabase
    .from("session_rigs")
    .select("*, fly_pattern:fly_patterns(*)")
    .in("session_id", sessionIds)
    .order("position", { ascending: true });

  if (rigsError) {
    console.error("Error fetching rigs:", rigsError);
  }

  // Fetch catches with fish photos for feed collage. Use the denormalized
  // fly_name snapshot (kept current by the v2 catch logger + admin rename)
  // rather than the legacy fly_patterns join, which goes null for catches
  // logged through the post-flatten variant_id flow.
  const { data: catches } = await supabase
    .from("catches")
    .select("id, session_id, species, length_inches, quantities, fish_image_url, fly_name")
    .in("session_id", sessionIds);

  // Fetch social engagement counts (kudos + comments per session)
  const { data: likes } = sessionIds.length > 0
    ? await supabase.from("session_likes").select("session_id").in("session_id", sessionIds)
    : { data: [] };
  const { data: comments } = sessionIds.length > 0
    ? await supabase.from("session_comments").select("session_id").in("session_id", sessionIds)
    : { data: [] };

  const likeCounts: Record<string, number> = {};
  (likes || []).forEach((l) => { likeCounts[l.session_id] = (likeCounts[l.session_id] || 0) + 1; });
  const commentCounts: Record<string, number> = {};
  (comments || []).forEach((c) => { commentCounts[c.session_id] = (commentCounts[c.session_id] || 0) + 1; });

  // Fetch feed display preference + profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("feed_display, display_name, avatar_url, username")
    .eq("user_id", user.id)
    .maybeSingle();

  // Source of truth for the "Fly Box" label everywhere (dashboard card +
  // /flies hub badge + this sidebar count) — distinct canonical patterns +
  // personal patterns. Without this the same label shows two different
  // numbers depending on which screen you're on.
  const { box: flyCount } = await getMyFliesCounts(user.id);

  const sessionsData = (sessions || []) as FishingSession[];
  const rigsData = (rigs || []) as SessionRig[];
  const catchesData = (catches || []) as unknown as Catch[];
  const feedDisplay = (profile?.feed_display as "collage" | "map") || "collage";

  return <JournalClient
    sessions={sessionsData}
    rigs={rigsData}
    catches={catchesData}
    feedDisplay={feedDisplay}
    userProfile={{
      displayName: profile?.display_name || user.user_metadata?.display_name || "",
      username: profile?.username || "",
      email: user.email || "",
      avatarUrl: profile?.avatar_url || "",
    }}
    totalFlyPatterns={flyCount ?? 0}
    likeCounts={likeCounts}
    commentCounts={commentCounts}
  />;
}
