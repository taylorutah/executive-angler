/**
 * POST /api/flies/v2/patterns/[patternId]/apply-bead
 *
 * Bulk-applies a bead spec to every variant of `patternId` owned by the
 * caller whose `bead_weight_mm` is currently NULL. Intended for the migrated
 * personal patterns whose legacy `fly_patterns.bead_size` was empty — sets
 * the same bead on every size in one round trip.
 *
 *   Request body: { mm: number; material: 'tungsten'|'brass'|'glass'|'none' }
 *   Response:     { updated: number }
 *
 * Variants that already have a bead set are left alone (override is a per-
 * variant edit via the existing PersonalizeSheet flow).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_MATERIALS = new Set(["tungsten", "brass", "glass", "none"]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ patternId: string }> },
) {
  const { patternId } = await params;
  if (!patternId) {
    return NextResponse.json({ error: "patternId required" }, { status: 400 });
  }
  const body = (await req.json().catch(() => null)) as
    | { mm?: number; material?: string }
    | null;
  const mm = typeof body?.mm === "number" ? body.mm : NaN;
  const material = body?.material ?? "";
  if (!Number.isFinite(mm) || mm <= 0 || mm > 10) {
    return NextResponse.json({ error: "mm must be a positive number ≤ 10" }, { status: 400 });
  }
  if (!VALID_MATERIALS.has(material)) {
    return NextResponse.json({ error: "material must be tungsten|brass|glass|none" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  // Only update variants the caller created on this pattern, and only ones
  // that don't already have a bead. RLS belt-and-suspenders the
  // created_by_user_id check.
  const { data, error } = await supabase
    .from("fly_variants")
    .update({ bead_weight_mm: mm, bead_material: material })
    .eq("pattern_id", patternId)
    .eq("created_by_user_id", user.id)
    .is("bead_weight_mm", null)
    .select("id");
  if (error) {
    console.error("[apply-bead] update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ updated: data?.length ?? 0 });
}
