import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /flies/by-id/<pattern_id>
 *
 * Resolver redirect — looks up a pattern by id and 302s to its public URL:
 *   canonical → /flies/<slug>
 *   personal  → /anglers/<username>/flies/<slug>
 *
 * Used by surfaces (e.g. box variant table) that have the pattern_id but
 * not the slug. Avoids dead Fly-name cells when the joined pattern row is
 * missing from the snapshot (RLS, stale cache, etc.) — the user can still
 * navigate.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_patterns_v2")
    .select("slug, owner_user_id, contributed_by_user_id")
    .eq("id", id)
    .maybeSingle();
  if (error || !data?.slug) {
    return NextResponse.redirect(new URL("/flies", _req.url), 302);
  }

  if (data.owner_user_id == null) {
    return NextResponse.redirect(new URL(`/flies/${data.slug}`, _req.url), 302);
  }

  const { data: profile } = await supabase
    .from("angler_profiles")
    .select("username")
    .eq("user_id", data.owner_user_id)
    .maybeSingle();
  const username = (profile?.username as string | undefined) ?? null;
  if (!username) {
    return NextResponse.redirect(new URL("/flies", _req.url), 302);
  }
  return NextResponse.redirect(new URL(`/anglers/${username}/flies/${data.slug}`, _req.url), 302);
}
