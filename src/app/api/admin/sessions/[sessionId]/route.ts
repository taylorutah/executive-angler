import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";

function getAdminSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/admin/sessions/[sessionId]
 * Returns a single fishing session with catches, photos, rigs, owner profile.
 * Service-role read so admins bypass owner-only RLS on fishing_sessions.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const { data: session, error: sessionError } = await admin
    .from("fishing_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const [
    { data: catches },
    { data: photos },
    { data: rigs },
    { data: owner },
  ] = await Promise.all([
    admin
      .from("catches")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true }),
    admin
      .from("session_photos")
      .select("id, url, caption, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true }),
    admin
      .from("session_rigs")
      .select("id, fly_pattern_id, position, fly_name")
      .eq("session_id", sessionId)
      .order("position", { ascending: true }),
    admin
      .from("profiles")
      .select("user_id, display_name, username, avatar_url")
      .eq("user_id", session.user_id)
      .maybeSingle(),
  ]);

  // Resolve fly names for catches: variant_id → fly_variants → fly_patterns_v2,
  // fallback to denormalized fly_name snapshot. Mirrors journal/[id]/page.tsx.
  type CatchRow = {
    variant_id?: string | null;
    fly_pattern_id?: string | null;
    fly_name?: string | null;
    fly_pattern?: { name: string; type?: string; image_url?: string } | null;
  };
  const catchesArr = (catches ?? []) as CatchRow[];
  const variantIds = catchesArr
    .map((c) => c.variant_id)
    .filter((v): v is string => !!v);

  if (variantIds.length > 0) {
    const { data: variantPatterns } = await admin
      .from("user_fly_configurations")
      .select("id, pattern:fly_patterns_v2(name, category, hero_image_url)")
      .in("id", variantIds);
    type V = {
      id: string;
      pattern?:
        | { name?: string; category?: string; hero_image_url?: string }
        | { name?: string; category?: string; hero_image_url?: string }[]
        | null;
    };
    const map = new Map<string, { name: string; type?: string; image_url?: string }>();
    for (const row of (variantPatterns ?? []) as V[]) {
      const p = Array.isArray(row.pattern) ? row.pattern[0] : row.pattern;
      if (p?.name) {
        map.set(row.id, {
          name: p.name,
          type: p.category,
          image_url: p.hero_image_url,
        });
      }
    }
    for (const c of catchesArr) {
      if (c.variant_id) {
        const synth = map.get(c.variant_id);
        if (synth) {
          c.fly_pattern = synth;
          continue;
        }
      }
      if (c.fly_name) c.fly_pattern = { name: c.fly_name };
    }
  } else {
    for (const c of catchesArr) {
      if (c.fly_name) c.fly_pattern = { name: c.fly_name };
    }
  }

  return NextResponse.json({
    session,
    catches: catchesArr,
    photos: photos ?? [],
    rigs: rigs ?? [],
    owner: owner ?? null,
  });
}
