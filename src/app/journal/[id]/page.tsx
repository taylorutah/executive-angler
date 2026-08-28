import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import SessionDetail from "./SessionDetail";
import { isAdmin } from "@/lib/admin";
import CatchLoggerEntry from "@/components/catch-logger/CatchLoggerEntry";
import { listMyBoxes, listVariantsInBox } from "@/lib/db/fly-v2";
import DayFlowTrace from "./DayFlowTrace";
import { fetchDayFlow, catchMinutes } from "@/lib/journal/day-flow";

// Never cache — always fetch fresh data from Supabase
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  // Privacy overhaul 2026-05-04: session detail pages are owner-only by RLS.
  // Even broadcast-presence sessions don't have a public detail view (presence
  // is feed-only — river/section/weather, not catches/notes/GPS). So robots
  // get noindex regardless.
  const { data: session } = await supabase
    .from("fishing_sessions")
    .select("broadcast_presence")
    .eq("id", id)
    .maybeSingle();
  void session; // schema sanity check; we always noindex now
  return {
    title: "Session",
    description: `Fishing session ${id.slice(0, 8)}`,
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const viewerIsAdmin = isAdmin(user?.email);

  // Admins get a service-role read client so they can view any session —
  // including private sessions owned by other users. RLS on fishing_sessions
  // is `auth.uid() = user_id`, so the cookie-bound client would return null
  // for non-owners. Non-admins continue to use the cookie client which
  // respects RLS exactly as before.
  const reader = viewerIsAdmin && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
    : supabase;

  // Fetch the session first — for non-admins, RLS filters private rows out,
  // so null means "doesn't exist or not allowed." For admins we used the
  // service-role client, so null genuinely means "doesn't exist."
  const { data: session, error } = await reader
    .from("fishing_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !session) notFound();

  const isOwner = !!user && session.user_id === user.id;
  const isAnonymous = !user;

  // Privacy overhaul 2026-05-04: session detail is owner-only by design.
  // RLS on fishing_sessions is `auth.uid() = user_id` — non-owners receive
  // null at the SELECT above and 404 at line 50. Admins bypass this check
  // so they can view any user's session for moderation/support.
  if (!isOwner && !viewerIsAdmin) {
    notFound();
  }

  // If the session owner has profile_visibility = 'private', even direct
  // session links are owner-only. Admins bypass this gate so they can see
  // private profiles' sessions during moderation.
  let ownerProfile: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    profile_visibility?: string;
  } | null = null;
  if (session.user_id) {
    const { data: profile } = await reader
      .from("profiles")
      .select("display_name, username, avatar_url, profile_visibility")
      .eq("user_id", session.user_id)
      .maybeSingle();
    ownerProfile = profile ?? null;
  }

  const ownerVisibility = ownerProfile?.profile_visibility ?? "public";
  if (!isOwner && !viewerIsAdmin && ownerVisibility === "private") {
    notFound();
  }

  const { data: catches } = await reader
    .from("catches")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  type CatchRow = {
    fly_pattern_id?: string | null;
    canonical_fly_id?: string | null;
    fly_pattern?: { name: string; type?: string; image_url?: string } | null;
    variant_id?: string | null;
    fly_name?: string | null;
  };
  const catchesArr = (catches ?? []) as CatchRow[];

  // Fetch live fly rows for every fly id referenced by any catch — both
  // `fly_pattern_id` (personal patterns) and `canonical_fly_id` (library
  // patterns) live in the same unified `flies` table post Phase A. The
  // catch editor sets exactly one of these depending on which source the
  // angler picked from; the display must resolve either. Without including
  // canonical_fly_id here, catches edited to a library fly would only
  // surface their live name through the denormalized fly_name snapshot —
  // which falls behind whenever a server PATCH path forgets to rewrite it.
  const flyIds = Array.from(
    new Set(
      catchesArr
        .flatMap((c) => [c.fly_pattern_id, c.canonical_fly_id])
        .filter((v): v is string => !!v)
    )
  );

  const { data: rawFlies } = flyIds.length > 0
    ? await reader
        .from("flies")
        .select("id, name, category, hero_image_url")
        .in("id", flyIds)
        .is("deleted_at", null)
    : { data: [] };
  const flies = (rawFlies ?? []).map((f) => ({
    id: f.id as string,
    name: f.name as string,
    type: (f.category as string | null) ?? null,
    image_url: (f.hero_image_url as string | null) ?? null,
  }));
  const flyById = new Map(flies.map((f) => [f.id, f]));

  // Resolution order: live fly (by fly_pattern_id, then canonical_fly_id)
  // → denormalized fly_name snapshot. The live row is authoritative; the
  // snapshot is only a fallback for catches with neither FK set (CSV
  // import / freehand quick-add).
  for (const c of catchesArr) {
    const fkId = c.fly_pattern_id || c.canonical_fly_id;
    if (fkId) {
      const live = flyById.get(fkId);
      if (live) {
        c.fly_pattern = {
          name: live.name,
          type: live.type ?? undefined,
          image_url: live.image_url ?? undefined,
        };
        continue;
      }
    }
    if (c.fly_name) c.fly_pattern = { name: c.fly_name };
  }

  const { data: sessionPhotos } = await reader
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

  // Phase 3 catch logger data — only fetched for owners.
  let myBoxes: { id: string; name: string; tier: string; is_default: boolean }[] = [];
  let activeBoxVariants: Awaited<ReturnType<typeof listVariantsInBox>> = [];
  let activeBoxName: string | null = null;
  let lastCatch: Parameters<typeof CatchLoggerEntry>[0]["lastCatch"] = null;
  if (isOwner) {
    const allBoxes = await listMyBoxes();
    myBoxes = allBoxes.map((b) => ({ id: b.id, name: b.name, tier: b.tier, is_default: b.is_default }));
    const activeId = (session as { active_box_id?: string | null }).active_box_id ?? null;
    if (activeId) {
      activeBoxVariants = await listVariantsInBox(activeId);
      activeBoxName = allBoxes.find((b) => b.id === activeId)?.name ?? null;
    } else {
      // Fall back to default box if no explicit active_box_id set.
      const def = allBoxes.find((b) => b.is_default);
      if (def) {
        activeBoxVariants = await listVariantsInBox(def.id);
        activeBoxName = def.name;
      }
    }
    if (catches && catches.length > 0) {
      const last = catches[catches.length - 1] as {
        variant_id?: string | null;
        fly_name?: string | null;
        fly_size?: string | null;
        species?: string | null;
        length_inches?: number | null;
      };
      lastCatch = {
        variant_id: last.variant_id ?? null,
        fly_name: last.fly_name ?? null,
        fly_size: last.fly_size ?? null,
        species: last.species ?? null,
        length_inches: last.length_inches ?? null,
      };
    }
  }

  // Right-rail day context. All of it is owner-scoped: the neighbouring days
  // are queried through `reader` (RLS-bound for non-admins) and the flow trace
  // is only fetched inside this branch, so a non-owner request never issues it.
  let prevDay: { id: string; date: string } | null = null;
  let nextDay: { id: string; date: string } | null = null;
  let flowTrace: React.ReactNode = null;

  if (isOwner) {
    const [prevRes, nextRes] = await Promise.all([
      reader
        .from("fishing_sessions")
        .select("id, date")
        .eq("user_id", session.user_id)
        .lt("date", session.date)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      reader
        .from("fishing_sessions")
        .select("id, date")
        .eq("user_id", session.user_id)
        .gt("date", session.date)
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);
    prevDay = prevRes.data ?? null;
    nextDay = nextRes.data ?? null;

    let gaugeConfig: string | null = null;
    if (session.river_id) {
      const { data: river } = await reader
        .from("rivers")
        .select("usgs_gauge_id")
        .eq("id", session.river_id)
        .maybeSingle();
      gaugeConfig = (river?.usgs_gauge_id as string | null) ?? null;
    }
    const dayFlow = await fetchDayFlow(gaugeConfig, session.date, session.section);
    flowTrace = (
      <DayFlowTrace
        flow={dayFlow}
        catchMinutes={catchesArr
          .map((c) => catchMinutes((c as { time_caught?: string | null; time?: string | null }).time_caught
            ?? (c as { time?: string | null }).time))
          .filter((m): m is number => m !== null)}
      />
    );
  }

  return (
    <>
      {isOwner && (
        <div className="mx-auto max-w-[var(--container)] px-4 sm:px-6 pt-6">
          <CatchLoggerEntry
            sessionId={id}
            myBoxes={myBoxes}
            activeBoxId={(session as { active_box_id?: string | null }).active_box_id ?? null}
            activeBoxName={activeBoxName}
            activeBoxVariants={activeBoxVariants}
            lastCatch={lastCatch}
            defaultSpecies={lastCatch?.species ?? "Rainbow Trout"}
          />
        </div>
      )}
      <SessionDetail
        session={session}
        catches={(catches || []) as Parameters<typeof SessionDetail>[0]["catches"]}
        flies={(flies || []) as Parameters<typeof SessionDetail>[0]["flies"]}
        sessionPhotos={sessionPhotos ?? []}
        isOwner={isOwner}
        ownerProfile={ownerProfileForDetail}
        isAnonymous={isAnonymous}
        flowTrace={flowTrace}
        prevDay={prevDay}
        nextDay={nextDay}
      />
    </>
  );
}
