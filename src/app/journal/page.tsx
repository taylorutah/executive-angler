import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FishingSession, SessionRig, Catch } from "@/types/fishing-log";
import { JournalClient } from "./JournalClient";

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

  // Fetch catches with fish photos for feed collage
  const { data: catches } = await supabase
    .from("catches")
    .select("id, session_id, species, length_inches, quantities, fish_image_url, fly_pattern:fly_patterns(name)")
    .in("session_id", sessionIds);

  // Fetch feed display preference + profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("feed_display, display_name, avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  const { count: flyCount } = await supabase
    .from("fly_patterns")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

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
      email: user.email || "",
      avatarUrl: profile?.avatar_url || "",
    }}
    totalFlyPatterns={flyCount || 0}
  />;
}
