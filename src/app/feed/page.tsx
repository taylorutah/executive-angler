import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ActivityFeed } from "@/components/feed/ActivityFeed";
import Link from "next/link";
import { APP_STORE_URL } from "@/lib/constants";
import { getBannedUserIds } from "@/lib/db/banned-users";

export const metadata: Metadata = {
  title: "On The Water | Executive Angler",
  description:
    "Anglers currently on the water. Locations and fish counts stay private — only general river, section, and weather are shown.",
};

export interface FeedSession {
  id: string;
  user_id: string;
  river_name: string | null;
  section: string | null;
  date: string;
  weather: string | null;
  created_at: string;
  like_count: number;
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
            On The Water
          </h1>
          <p className="text-[#A8B2BD] text-lg mb-3 max-w-md mx-auto">
            See who&apos;s fishing right now — river, section, and weather only.
          </p>
          <p className="text-[#6E7681] text-sm mb-10 max-w-md mx-auto">
            We never publish locations or fish counts. That&apos;s between you and the river.
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
                  icon: "📓",
                  text: "Private fishing journal — your sessions, catches, GPS, and notes stay yours",
                },
                {
                  icon: "🪶",
                  text: "Fly tying workbench with 500+ materials and recipe matcher",
                },
                {
                  icon: "📊",
                  text: "Personal stats, trophy wall, and trends across your seasons",
                },
                {
                  icon: "🌊",
                  text: "Browse rivers, hatch charts, regulations, and access points",
                },
                {
                  icon: "👥",
                  text: "Optional: appear on the presence feed when you head out (river + weather only)",
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

          {/* App download */}
          <div className="rounded-xl border border-[#21262D] bg-[#161B22] p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full bg-[#2EA44F]/10 px-3 py-1 text-xs font-medium text-[#2EA44F] border border-[#2EA44F]/20">
                Live on the App Store
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#F0F6FC] mb-1">
              Get the iPhone App
            </h2>
            <p className="text-sm text-[#A8B2BD] mb-4">
              Log fish on-stream, track GPS sessions, and sync everything to your account.
            </p>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-7 py-3 bg-[#E8923A] text-white font-semibold rounded-xl hover:bg-[#d17d28] transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Download for iPhone
            </a>
            <p className="font-['IBM_Plex_Mono'] text-[#6E7681] text-xs mt-3 text-center">
              Android coming soon
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ── Authenticated: presence feed ──
     Reads from session_presence VIEW, not fishing_sessions table.
     The view is the only path that exposes other users' sessions and
     it projects only safe columns (river, section, weather, profile).
     Catches and counts are unreachable from this surface by design. */

  const bannedUserIds = await getBannedUserIds();

  let presenceQuery = supabase
    .from("session_presence")
    .select(
      `id, user_id, river_name, section, date, weather, created_at, username, display_name, avatar_url`
    );

  if (bannedUserIds.length > 0) {
    presenceQuery = presenceQuery.not(
      "user_id",
      "in",
      `(${bannedUserIds.join(",")})`
    );
  }

  const { data: rows, error } = await presenceQuery
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Error fetching presence feed:", error);
  }

  const sessionIds = (rows || []).map((r) => r.id);
  let likeCounts: Record<string, number> = {};

  if (sessionIds.length > 0) {
    const { data: likes } = await supabase
      .from("session_likes")
      .select("session_id")
      .in("session_id", sessionIds);

    if (likes) {
      likeCounts = likes.reduce<Record<string, number>>((acc, l) => {
        acc[l.session_id] = (acc[l.session_id] || 0) + 1;
        return acc;
      }, {});
    }
  }

  const feedSessions: FeedSession[] = (rows || []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    river_name: r.river_name,
    section: r.section,
    date: r.date,
    weather: r.weather,
    created_at: r.created_at,
    like_count: likeCounts[r.id] || 0,
    profile: {
      display_name: r.display_name,
      username: r.username,
      avatar_url: r.avatar_url,
    },
  }));

  return (
    <main className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-2xl px-4 pt-6 pb-16">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-[#F0F6FC] mb-1">
            On The Water
          </h1>
          <p className="text-sm text-[#A8B2BD] mb-1">
            Anglers currently fishing — river, section, and weather only.
          </p>
          <p className="text-xs text-[#6E7681]">
            We never publish locations or fish counts. That&apos;s between you and the river.
          </p>
        </header>

        <ActivityFeed sessions={feedSessions} />
      </div>
    </main>
  );
}
