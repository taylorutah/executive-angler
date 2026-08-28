import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ActivityFeed } from "@/components/feed/ActivityFeed";
import Link from "next/link";
import { APP_STORE_URL } from "@/lib/constants";
import { getBannedUserIds } from "@/lib/db/banned-users";
import { getUntrustedUserIds } from "@/lib/db/trust";
import { BookOpen, Feather, TrendingUp, Waves, Users } from "@/icons";

export const metadata: Metadata = {
  title: "On The Water",
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

const ACCOUNT_PERKS = [
  {
    Icon: BookOpen,
    text: "Private fishing journal — your sessions, catches, GPS, and notes stay yours",
  },
  {
    Icon: Feather,
    text: "Fly tying workbench with 500+ materials and recipe matcher",
  },
  {
    Icon: TrendingUp,
    text: "Personal stats, trophy wall, and trends across your seasons",
  },
  {
    Icon: Waves,
    text: "Browse rivers, hatch charts, regulations, and access points",
  },
  {
    Icon: Users,
    text: "Optional: appear on the presence feed when you head out (river + weather only)",
  },
];

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* ── Unauthenticated gate ── */
  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--paper)]">
        <div className="mx-auto max-w-[var(--prose)] px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="font-display text-2xl font-semibold text-[var(--text-1)] sm:text-3xl">
            On The Water
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-[var(--text-2)]">
            See who&apos;s fishing right now — river, section, and weather only.
          </p>
          <p className="mt-2 text-sm text-[var(--text-3)]">
            We never publish locations or fish counts. That&apos;s between you and the river.
          </p>

          {/* Sign-in CTA */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login?redirect=/feed" className="ea-btn ea-btn-primary">
              Sign In
            </Link>
            <Link href="/signup" className="ea-btn ea-btn-secondary">
              Create Free Account
            </Link>
          </div>

          {/* What you get */}
          <div className="ea-card mt-8">
            <h2 className="ea-overline">
              What you get with an account
            </h2>
            <ul className="mt-4 space-y-3">
              {ACCOUNT_PERKS.map(({ Icon, text }) => (
                <li
                  key={text}
                  className="flex items-start gap-3 text-sm text-[var(--text-2)]"
                >
                  <Icon className="h-4 w-4 shrink-0 mt-0.5 text-[var(--text-3)]" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* App download */}
          <div className="ea-card mt-6">
            <p>
              <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] px-3 py-1 text-xs font-medium text-[var(--success)]">
                Live on the App Store
              </span>
            </p>
            <h2 className="mt-3 font-display text-xl font-semibold text-[var(--text-1)]">
              Get the iPhone App
            </h2>
            <p className="mt-1 text-sm text-[var(--text-2)]">
              Log fish on-stream, track GPS sessions, and sync everything to your account.
            </p>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ea-btn ea-btn-primary mt-4 w-full"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Download for iPhone
            </a>
            <p className="mt-3 text-xs text-[var(--text-3)]">
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

  const [bannedUserIds, untrustedUserIds] = await Promise.all([
    getBannedUserIds(),
    getUntrustedUserIds(),
  ]);

  // New accounts (< 7 days old) don't appear in the public presence feed —
  // gives bots no surface to inflate, gives real new users a quiet ramp-in.
  const hiddenUserIds = Array.from(new Set([...bannedUserIds, ...untrustedUserIds]));

  let presenceQuery = supabase
    .from("session_presence")
    .select(
      `id, user_id, river_name, section, date, weather, created_at, username, display_name, avatar_url`
    );

  if (hiddenUserIds.length > 0) {
    presenceQuery = presenceQuery.not(
      "user_id",
      "in",
      `(${hiddenUserIds.join(",")})`
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
    <main className="min-h-screen bg-[var(--paper)]">
      <div className="mx-auto max-w-[var(--prose)] px-4 pt-6 pb-16">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-[var(--text-1)] sm:text-3xl">
            On The Water
          </h1>
          <p className="mt-1 text-sm text-[var(--text-2)]">
            Anglers currently fishing — river, section, and weather only.
          </p>
          <p className="mt-1 text-xs text-[var(--text-3)]">
            We never publish locations or fish counts. That&apos;s between you and the river.
          </p>
        </header>

        <ActivityFeed sessions={feedSessions} />
      </div>
    </main>
  );
}
