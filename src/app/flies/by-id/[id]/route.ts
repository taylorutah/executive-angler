import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /flies/by-id/<id>
 *
 * One-stop resolver: redirect any fly-ish id to its public detail page.
 * Accepts v2 pattern ids, legacy canonical_flies ids, and legacy
 * fly_patterns (personal) ids — every internal link can use this and never
 * end up on a dead page just because the joined row was missing or the
 * caller had the "wrong" id type.
 *
 * Resolution order (first hit wins):
 *   1. fly_patterns_v2 by id
 *      - owner null + slug → /flies/<slug>
 *      - owner set + slug  → /anglers/<username>/flies/<slug>
 *   2. canonical_flies by id (legacy canonical) → mirror lookup
 *      → /flies/<slug>
 *   3. fly_patterns by id (legacy personal)
 *      → if promoted_to_canonical_id → recurse via canonical
 *      → if owner is current user → /journal/flies/<id>/edit
 *      → else /anglers/<username>/flies/<slug>
 *
 * Falls back to /flies on a complete miss so we never throw at the user.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, req.url), 302);

  // 1. fly_patterns_v2 (canonical or personal)
  const { data: v2 } = await supabase
    .from("fly_patterns_v2")
    .select("slug, owner_user_id")
    .eq("id", id)
    .maybeSingle();

  if (v2?.slug) {
    if (v2.owner_user_id == null) return redirectTo(`/flies/${v2.slug}`);
    const username = await usernameFor(supabase, v2.owner_user_id as string);
    if (username) return redirectTo(`/anglers/${username}/flies/${v2.slug}`);
    // Owner has no public username — best we can do is canonical.
    return redirectTo(`/flies/${v2.slug}`);
  }

  // 2. canonical_flies (legacy mirror — same id as v2 row when present)
  const { data: legacyCanonical } = await supabase
    .from("canonical_flies")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  if (legacyCanonical?.slug) return redirectTo(`/flies/${legacyCanonical.slug}`);

  // 3. fly_patterns (legacy personal) — may be promoted or unpromoted
  const { data: legacyPersonal } = await supabase
    .from("fly_patterns")
    .select("slug, user_id, promoted_to_canonical_id")
    .eq("id", id)
    .maybeSingle();
  if (legacyPersonal) {
    if (legacyPersonal.promoted_to_canonical_id) {
      const { data: promoted } = await supabase
        .from("canonical_flies")
        .select("slug")
        .eq("id", legacyPersonal.promoted_to_canonical_id as string)
        .maybeSingle();
      if (promoted?.slug) return redirectTo(`/flies/${promoted.slug}`);
    }
    if (user && legacyPersonal.user_id === user.id) {
      return redirectTo(`/journal/flies/${id}/edit`);
    }
    if (legacyPersonal.slug) {
      const username = await usernameFor(supabase, legacyPersonal.user_id as string);
      if (username) return redirectTo(`/anglers/${username}/flies/${legacyPersonal.slug}`);
    }
  }

  return redirectTo("/flies");
}

async function usernameFor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("angler_profiles")
    .select("username")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.username as string | null) ?? null;
}
