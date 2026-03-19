import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — Executive Angler",
  description: "Your personalized fly fishing dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  // Fetch user favorites (rivers, destinations, etc.)
  const { data: favorites } = await supabase
    .from("user_favorites")
    .select("entity_type, entity_id")
    .eq("user_id", user.id);

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, home_location")
    .eq("user_id", user.id)
    .single();

  // Fetch user own sessions (last 5)
  const { data: mySessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, river_name, total_fish, notes, privacy")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch river details for favorited rivers
  const favRiverIds = (favorites || [])
    .filter((f) => f.entity_type === "river")
    .map((f) => f.entity_id);

  const { data: favRivers } = favRiverIds.length > 0
    ? await supabase
        .from("rivers")
        .select("id, name, slug, hero_image_url, primary_species")
        .in("id", favRiverIds)
    : { data: [] };

  // Fetch destination details for favorited destinations
  const favDestIds = (favorites || [])
    .filter((f) => f.entity_type === "destination")
    .map((f) => f.entity_id);

  const { data: favDests } = favDestIds.length > 0
    ? await supabase
        .from("destinations")
        .select("id, name, slug, hero_image_url")
        .in("id", favDestIds)
    : { data: [] };

  // Following feed — public sessions from people you follow (last 10)
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id)
    .eq("status", "active");

  const followingIds = (follows || []).map((f) => f.following_id);

  const { data: followingFeed } = followingIds.length > 0
    ? await supabase
        .from("fishing_sessions")
        .select("id, date, river_name, total_fish, notes, privacy, user_id, profiles(username, avatar_url)")
        .in("user_id", followingIds)
        .eq("privacy", "public")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] };

  // River activity intel for favorited rivers (recent catch stats)
  const riverIntel: Record<string, { lastDate: string | null; sessions30d: number; topFly: string | null }> = {};
  if (favRiverIds.length > 0) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    const { data: riverSessions } = await supabase
      .from("fishing_sessions")
      .select("river_id, date, id")
      .in("river_id", favRiverIds)
      .eq("privacy", "public")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    favRiverIds.forEach((rid) => {
      const rs = (riverSessions || []).filter((s) => s.river_id === rid);
      const recent = rs.filter((s) => s.date >= thirtyDaysAgo);
      riverIntel[rid] = {
        lastDate: rs[0]?.date ?? null,
        sessions30d: recent.length,
        topFly: null,
      };
    });
  }

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email ?? "" }}
      profile={profile}
      mySessions={mySessions || []}
      favRivers={favRivers || []}
      favDests={favDests || []}
      followingFeed={(followingFeed || []) as any}
      riverIntel={riverIntel}
      totalFavorites={(favorites || []).length}
    />
  );
}
