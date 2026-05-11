/**
 * GET /api/flies/variants?pattern_id=<uuid>
 *
 * Returns variants of a canonical pattern with a "stocked by user" flag so the
 * catch logger can surface the user's own variants first. Used by the
 * inline VariantQuickPick component below the FlyPicker.
 *
 *   Response: { variants: Array<{
 *     id, size, bead_material, bead_weight_mm, bead_color, body_color,
 *     rib_color, is_stocked, in_box_count
 *   }> }
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const patternId = req.nextUrl.searchParams.get("pattern_id");
  if (!patternId) {
    return NextResponse.json({ variants: [] });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: variants } = await supabase
    .from("fly_variants")
    .select(
      "id, size, bead_material, bead_weight_mm, bead_color, body_color, rib_color, sort_order, created_by_user_id",
    )
    .eq("pattern_id", patternId)
    .is("deleted_at", null)
    .order("sort_order");

  const list = (variants ?? []) as Array<{
    id: string;
    size: string;
    bead_material: string | null;
    bead_weight_mm: number | null;
    bead_color: string | null;
    body_color: string | null;
    rib_color: string | null;
    sort_order: number;
    created_by_user_id: string | null;
  }>;

  // Annotate with user's stock + box-membership counts so the UI can sort
  // "your variants" to the top.
  const stockSet = new Set<string>();
  const boxCount = new Map<string, number>();
  if (user && list.length > 0) {
    const ids = list.map((v) => v.id);
    const { data: stockRows } = await supabase
      .from("fly_variant_stock")
      .select("variant_id, tied_count, bought_count")
      .eq("user_id", user.id)
      .in("variant_id", ids);
    for (const s of (stockRows ?? []) as { variant_id: string; tied_count: number; bought_count: number }[]) {
      if ((s.tied_count ?? 0) + (s.bought_count ?? 0) > 0) stockSet.add(s.variant_id);
    }
    const { data: boxRows } = await supabase
      .from("fly_variant_in_box")
      .select("variant_id")
      .in("variant_id", ids);
    for (const r of (boxRows ?? []) as { variant_id: string }[]) {
      boxCount.set(r.variant_id, (boxCount.get(r.variant_id) ?? 0) + 1);
    }
  }

  return NextResponse.json({
    variants: list.map((v) => ({
      ...v,
      is_stocked: stockSet.has(v.id),
      in_box_count: boxCount.get(v.id) ?? 0,
    })),
  });
}
