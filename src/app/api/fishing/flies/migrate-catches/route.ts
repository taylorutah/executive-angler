/**
 * GET  ?pattern_id=X — count of the user's catches that reference the
 *                      pattern's parent canonical, eligible for migration.
 * POST ?pattern_id=X — migrate eligible catches (sets fly_pattern_id, nulls
 *                      canonical_fly_id) so stats credit the personal pattern.
 *
 * Forward-only operation: there is no "undo" button. Confirmed in the UI.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const patternId = req.nextUrl.searchParams.get("pattern_id");
  if (!patternId) return NextResponse.json({ error: "Missing pattern_id" }, { status: 400 });

  const { data: pat, error: pErr } = await supabase
    .from("fly_patterns")
    .select("id, parent_canonical_id")
    .eq("id", patternId)
    .eq("user_id", user.id)
    .single();
  if (pErr || !pat) return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
  if (!pat.parent_canonical_id) {
    return NextResponse.json({ count: 0, eligible: false });
  }

  const { count } = await supabase
    .from("catches")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("canonical_fly_id", pat.parent_canonical_id)
    .is("fly_pattern_id", null);

  return NextResponse.json({ count: count ?? 0, eligible: (count ?? 0) > 0, parent_canonical_id: pat.parent_canonical_id });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const patternId = req.nextUrl.searchParams.get("pattern_id");
  if (!patternId) return NextResponse.json({ error: "Missing pattern_id" }, { status: 400 });

  const { data: pat, error: pErr } = await supabase
    .from("fly_patterns")
    .select("id, parent_canonical_id")
    .eq("id", patternId)
    .eq("user_id", user.id)
    .single();
  if (pErr || !pat) return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
  if (!pat.parent_canonical_id) {
    return NextResponse.json({ migrated: 0 });
  }

  const { data, error } = await supabase
    .from("catches")
    .update({ fly_pattern_id: patternId, canonical_fly_id: null })
    .eq("user_id", user.id)
    .eq("canonical_fly_id", pat.parent_canonical_id)
    .is("fly_pattern_id", null)
    .select("id");

  if (error) {
    console.error("[migrate-catches] update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ migrated: data?.length ?? 0 });
}
