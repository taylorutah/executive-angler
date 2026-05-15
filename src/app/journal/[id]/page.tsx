import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import SessionDetail from "./SessionDetail";
import { checkPremium, isAdmin } from "@/lib/admin";
import CatchLoggerEntry from "@/components/catch-logger/CatchLoggerEntry";
import { listMyBoxes, listVariantsInBox } from "@/lib/db/fly-v2";

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
    title: "Session | Executive Angler",
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

  // Post-flatten: every fly is its own canonical in fly_patterns_v2. Resolve
  // the display fly_pattern via variant_id → fly_variants.pattern_id →
  // fly_patterns_v2 (the single source of truth). The legacy fly_patterns
  // join is gone — its names drift on rename and we'd rather show the
  // denormalized fly_name snapshot than stale legacy data.
  type CatchRow = {
    fly_pattern_id?: string | null;
    fly_pattern?: { name: string; type?: string; image_url?: string } | null;
    variant_id?: string | null;
    fly_name?: string | null;
  };
  const catchesArr = (catches ?? []) as CatchRow[];
  const variantIds = catchesArr
    .map((c) => c.variant_id)
    .filter((v): v is string => !!v);
  // Post-Phase-C: fly_variants table is dropped. catches.fly_name
  // (denormalized snapshot) carries the fly name forward — no per-variant
  // lookup needed. Leave the map empty so the renderer falls back to fly_name.
  void variantIds;
  const patternByVariant = new Map<string, { name: string; type?: string; image_url?: string }>();
  if (false) {
    // Placeholder so subsequent for-loop type structure stays valid.
    type V = {
      id: string;
      pattern?: { name?: string; category?: string; hero_image_url?: string }
        | { name?: string; category?: string; hero_image_url?: string }[]
        | null;
    };
    const rows: V[] = [];
    for (const row of rows) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pat = row.pattern as any;
      const p = Array.isArray(pat) ? pat[0] : pat;
      if (p?.name) {
        patternByVariant.set(row.id, {
          name: p.name,
          type: p.category,
          image_url: p.hero_image_url,
        });
      }
    }
  }
  // Resolution order: live v2 pattern → denormalized fly_name snapshot.
  // The snapshot is refreshed by flatten-fly-forks-data.sql + the admin
  // rename action, so this stays consistent with the catalog.
  for (const c of catchesArr) {
    if (c.variant_id) {
      const synth = patternByVariant.get(c.variant_id);
      if (synth) {
        c.fly_pattern = synth;
        continue;
      }
    }
    if (c.fly_name) c.fly_pattern = { name: c.fly_name };
  }

  // Flies used in this session (from fly_patterns table, matched by catch)
  const flyPatternIds = catchesArr
    .map((c) => c.fly_pattern_id)
    .filter((v): v is string => !!v);

  const { data: flies } = flyPatternIds.length > 0
    ? await reader.from("fly_patterns").select("id, name, type, image_url").in("id", flyPatternIds)
    : { data: [] };

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

  return (
    <>
      {isOwner && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
          <CatchLoggerEntry
            sessionId={id}
            myBoxes={myBoxes}
            activeBoxId={(session as { active_box_id?: string | null }).active_box_id ?? null}
            activeBoxName={activeBoxName}
            activeBoxVariants={activeBoxVariants}
            lastCatch={lastCatch}
            defaultSpecies={lastCatch?.species ?? "Rainbow"}
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
        isPremium={user ? await checkPremium(supabase, user.id, user.email) : false}
      />
    </>
  );
}
