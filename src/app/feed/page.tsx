import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ActivityFeed } from "@/components/feed/ActivityFeed";

export const metadata: Metadata = {
  title: "Activity Feed | Executive Angler",
  description:
    "See what the Executive Angler community is catching. Browse recent public fishing sessions, catches, and river reports from anglers everywhere.",
};

export interface FeedSession {
  id: string;
  river_name: string | null;
  section: string | null;
  location: string | null;
  date: string;
  total_fish: number;
  weather: string | null;
  water_temp_f: number | null;
  water_clarity: string | null;
  tags: string[] | null;
  trip_tags: string[] | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  created_at: string;
  catch_count: number;
  profile: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export default async function FeedPage() {
  const supabase = await createClient();

  // Fetch 30 most recent public sessions with profile data
  const { data: sessions, error } = await supabase
    .from("fishing_sessions")
    .select(
      `
      id,
      river_name,
      section,
      location,
      date,
      total_fish,
      weather,
      water_temp_f,
      water_clarity,
      tags,
      trip_tags,
      latitude,
      longitude,
      notes,
      created_at,
      profile:profiles!fishing_sessions_user_id_fkey(
        display_name,
        username,
        avatar_url
      )
    `
    )
    .eq("privacy", "public")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Error fetching feed:", error);
  }

  // Fetch catch counts per session
  const sessionIds = (sessions || []).map((s) => s.id);
  let catchCounts: Record<string, number> = {};

  if (sessionIds.length > 0) {
    const { data: counts } = await supabase
      .from("catches")
      .select("session_id")
      .in("session_id", sessionIds);

    if (counts) {
      catchCounts = counts.reduce<Record<string, number>>((acc, c) => {
        acc[c.session_id] = (acc[c.session_id] || 0) + 1;
        return acc;
      }, {});
    }
  }

  const feedSessions: FeedSession[] = (sessions || []).map((s) => ({
    id: s.id,
    river_name: s.river_name,
    section: s.section,
    location: s.location,
    date: s.date,
    total_fish: s.total_fish,
    weather: s.weather,
    water_temp_f: s.water_temp_f,
    water_clarity: s.water_clarity,
    tags: s.tags,
    trip_tags: s.trip_tags,
    latitude: s.latitude,
    longitude: s.longitude,
    notes: s.notes,
    created_at: s.created_at,
    catch_count: catchCounts[s.id] || 0,
    // Supabase returns joined single row as object, array, or null
    profile: Array.isArray(s.profile) ? s.profile[0] ?? null : s.profile ?? null,
  }));

  return (
    <main className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-[#F0F6FC] mb-1">
            Activity Feed
          </h1>
          <p className="text-sm text-[#8B949E]">
            Recent sessions from the Executive Angler community
          </p>
        </header>

        <ActivityFeed sessions={feedSessions} />
      </div>
    </main>
  );
}
