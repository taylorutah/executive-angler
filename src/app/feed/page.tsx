import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ActivityFeed } from "@/components/feed/ActivityFeed";
import Link from "next/link";
import WaitlistForm from "@/components/sections/WaitlistForm";

export const metadata: Metadata = {
  title: "Activity Feed | Executive Angler",
  description:
    "See what the Executive Angler community is catching. Browse recent public fishing sessions, catches, and river reports from anglers everywhere.",
};

export interface FeedSession {
  id: string;
  user_id: string;
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
  like_count: number;
  comment_count: number;
  profile: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* ── Unauthenticated gate ── */
  if (!user) {
    return (
      <main className="min-h-screen bg-[#0D1117]">
        <div className="mx-auto max-w-xl px-4 pt-12 pb-24 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#161B22] border border-[#21262D]">
            <svg
              className="h-8 w-8 text-[#E8923A]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-[#F0F6FC] mb-3">
            Community Feed
          </h1>
          <p className="text-[#8B949E] text-lg mb-10 max-w-md mx-auto">
            Sign in to see what anglers are catching, share your own sessions,
            and connect with the community.
          </p>

          {/* Sign-in CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link
              href="/login?redirect=/feed"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E8923A] px-6 py-3 text-sm font-semibold text-[#0D1117] hover:bg-[#D4812E] transition-colors w-full sm:w-auto"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#21262D] bg-[#161B22] px-6 py-3 text-sm font-semibold text-[#F0F6FC] hover:bg-[#1F2937] transition-colors w-full sm:w-auto"
            >
              Create Free Account
            </Link>
          </div>

          {/* What you get */}
          <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-6 text-left mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#E8923A] mb-4">
              What you get with an account
            </h2>
            <ul className="space-y-3">
              {[
                {
                  icon: "📍",
                  text: "Live activity feed — see sessions, catches, and river reports from anglers worldwide",
                },
                {
                  icon: "🐟",
                  text: "Log every fish with species, size, fly pattern, and GPS coordinates",
                },
                {
                  icon: "📊",
                  text: "Personal dashboard with stats, personal bests, and achievement badges",
                },
                {
                  icon: "💬",
                  text: "Comment on sessions, give kudos, and direct message other anglers",
                },
                {
                  icon: "🗺️",
                  text: "Explore 1,000+ rivers, fly shops, guides, and lodges",
                },
                {
                  icon: "📓",
                  text: "Private fishing journal — your complete catch history in one place",
                },
              ].map((item) => (
                <li
                  key={item.text}
                  className="flex items-start gap-3 text-[#C9D1D9] text-sm"
                >
                  <span className="text-base leading-5 shrink-0">
                    {item.icon}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* App waitlist */}
          <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full bg-[#E8923A]/10 px-3 py-1 text-xs font-medium text-[#E8923A] border border-[#E8923A]/20">
                Coming to iOS + Apple Watch
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#F0F6FC] mb-1">
              Get the App
            </h2>
            <p className="text-sm text-[#8B949E] mb-4">
              Log fish on-stream, track GPS sessions, and sync everything
              automatically. Join the waitlist for early access.
            </p>
            <WaitlistForm />
          </div>
        </div>
      </main>
    );
  }

  /* ── Authenticated: show the feed ── */

  // Fetch 30 most recent public sessions with profile data
  const { data: sessions, error } = await supabase
    .from("fishing_sessions")
    .select(
      `
      id,
      user_id,
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
      profile:profiles!fishing_sessions_user_id_profiles_fkey(
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

  // Fetch like counts per session
  let likeCounts: Record<string, number> = {};
  let commentCounts: Record<string, number> = {};

  if (sessionIds.length > 0) {
    const [likesRes, commentsRes] = await Promise.all([
      supabase
        .from("session_likes")
        .select("session_id")
        .in("session_id", sessionIds),
      supabase
        .from("session_comments")
        .select("session_id")
        .in("session_id", sessionIds),
    ]);

    if (likesRes.data) {
      likeCounts = likesRes.data.reduce<Record<string, number>>((acc, l) => {
        acc[l.session_id] = (acc[l.session_id] || 0) + 1;
        return acc;
      }, {});
    }
    if (commentsRes.data) {
      commentCounts = commentsRes.data.reduce<Record<string, number>>(
        (acc, c) => {
          acc[c.session_id] = (acc[c.session_id] || 0) + 1;
          return acc;
        },
        {}
      );
    }
  }

  const feedSessions: FeedSession[] = (sessions || []).map((s) => ({
    id: s.id,
    user_id: s.user_id,
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
    like_count: likeCounts[s.id] || 0,
    comment_count: commentCounts[s.id] || 0,
    // Supabase returns joined single row as object, array, or null
    profile: Array.isArray(s.profile)
      ? s.profile[0] ?? null
      : s.profile ?? null,
  }));

  return (
    <main className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-2xl px-4 pt-6 pb-16">
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
