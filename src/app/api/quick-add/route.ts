/**
 * Quick-add endpoint for bulk-adding personal flies to a box (v2).
 *
 * For each entry: creates a fly_patterns_v2 row (owned by the user), one
 * fly_variants row per size, and a fly_variant_in_box membership in the
 * target box. Tied counts (from quantity_by_size) land in fly_variant_stock
 * per-variant. Bead spec is hoisted off the pattern onto every variant —
 * users can refine per-variant later via the PersonalizeSheet.
 *
 * POST /api/quick-add
 * Body: {
 *   box_id: string                 // target box
 *   entries: Array<{
 *     name: string                 // required
 *     type?: string                // "Nymph" → category="Nymph"
 *     hook?: string                // → variant.hook_style
 *     bead_size?: string           // numeric → variant.bead_weight_mm
 *     bead_color?: string          // → variant.bead_color
 *     fly_color?: string           // → variant.body_color
 *     description?: string         // → pattern.description
 *     sizes?: string[]             // ["14","16","18"] — one variant each
 *     quantity_by_size?: Record<string, number>  // → fly_variant_stock.tied_count
 *     personal_notes?: string      // → fly_variant_stock.personal_notes
 *   }>
 * }
 *
 * Response: { created: number, errors: Array<{index, name, error}>, ids: string[] }
 *   `ids` are fly_variant_in_box row ids (one per created variant placement).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface QuickAddEntry {
  name: string;
  type?: string;
  hook?: string;
  bead_size?: string;
  bead_color?: string;
  fly_color?: string;
  description?: string;
  sizes?: string[];
  quantity_by_size?: Record<string, number>;
  personal_notes?: string;
}

function parseBeadWeightMm(raw: string | undefined): number | null {
  if (!raw) return null;
  return /^[0-9]+(\.[0-9]+)?$/.test(raw.trim()) ? Number(raw.trim()) : null;
}

function cleanSize(raw: string): string {
  return raw.replace(/[\[\]"#\s]/g, "").trim();
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const boxId = typeof body.box_id === "string" ? body.box_id : null;
  const entriesRaw = Array.isArray(body.entries) ? (body.entries as unknown[]) : [];

  if (!boxId) {
    return NextResponse.json({ error: "box_id is required" }, { status: 400 });
  }
  if (entriesRaw.length === 0) {
    return NextResponse.json({ error: "At least one entry is required" }, { status: 400 });
  }
  if (entriesRaw.length > 200) {
    return NextResponse.json({ error: "Maximum 200 entries per call" }, { status: 400 });
  }

  // Verify box ownership
  const { data: box } = await supabase
    .from("fly_boxes")
    .select("id, user_id")
    .eq("id", boxId)
    .maybeSingle();
  if (!box || box.user_id !== user.id) {
    return NextResponse.json({ error: "Box not found" }, { status: 404 });
  }

  // Normalize entries
  const entries: QuickAddEntry[] = [];
  for (const raw of entriesRaw) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const name = typeof r.name === "string" ? r.name.trim() : "";
    if (!name) continue;
    const sizes = Array.isArray(r.sizes)
      ? (r.sizes.filter((s) => typeof s === "string") as string[])
      : undefined;
    const quantityBySize: Record<string, number> = {};
    if (r.quantity_by_size && typeof r.quantity_by_size === "object") {
      for (const [k, v] of Object.entries(r.quantity_by_size as Record<string, unknown>)) {
        if (typeof v === "number" && v > 0) quantityBySize[k] = Math.floor(v);
      }
    }
    entries.push({
      name,
      type: typeof r.type === "string" ? r.type.trim() || undefined : undefined,
      hook: typeof r.hook === "string" ? r.hook.trim() || undefined : undefined,
      bead_size: typeof r.bead_size === "string" ? r.bead_size.trim() || undefined : undefined,
      bead_color: typeof r.bead_color === "string" ? r.bead_color.trim() || undefined : undefined,
      fly_color: typeof r.fly_color === "string" ? r.fly_color.trim() || undefined : undefined,
      description: typeof r.description === "string" ? r.description.trim() || undefined : undefined,
      sizes,
      quantity_by_size: Object.keys(quantityBySize).length > 0 ? quantityBySize : undefined,
      personal_notes:
        typeof r.personal_notes === "string" ? r.personal_notes.trim() || undefined : undefined,
    });
  }

  if (entries.length === 0) {
    return NextResponse.json(
      { error: "No valid entries (each must have a non-empty name)" },
      { status: 400 },
    );
  }

  // Next sort_order on the target box, so new variants land at the end.
  let nextSort = 0;
  {
    const { data: existingMax } = await supabase
      .from("fly_variant_in_box")
      .select("sort_order")
      .eq("box_id", boxId)
      .order("sort_order", { ascending: false })
      .limit(1);
    nextSort = ((existingMax?.[0]?.sort_order as number | undefined) ?? -1) + 1;
  }

  const errors: Array<{ index: number; name: string; error: string }> = [];
  const createdInBoxIds: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];

    // 1. Insert v2 pattern (owned by the user).
    const { data: pattern, error: patternErr } = await supabase
      .from("fly_patterns_v2")
      .insert({
        owner_user_id: user.id,
        name: e.name,
        category: e.type ?? null,
        description: e.description ?? null,
        visibility: "private",
      })
      .select("id")
      .single();
    if (patternErr || !pattern) {
      errors.push({
        index: i,
        name: e.name,
        error: patternErr?.message ?? "Failed to create pattern",
      });
      continue;
    }

    // 2. Build one variant per size (or a single placeholder variant if no
    //    sizes were supplied — matches Phase 2 backfill behavior).
    const sizesClean = (e.sizes ?? [])
      .map(cleanSize)
      .filter((s) => s.length > 0);
    const sizesForVariants = sizesClean.length > 0 ? sizesClean : ["Standard"];

    const beadMm = parseBeadWeightMm(e.bead_size);
    const variantInserts = sizesForVariants.map((size, idx) => ({
      pattern_id: pattern.id,
      created_by_user_id: user.id,
      size,
      hook_style: e.hook ?? null,
      bead_weight_mm: beadMm,
      bead_color: e.bead_color ?? null,
      body_color: e.fly_color ?? null,
      sort_order: idx,
    }));

    const { data: variants, error: variantsErr } = await supabase
      .from("fly_variants")
      .insert(variantInserts)
      .select("id, size");
    if (variantsErr || !variants || variants.length === 0) {
      errors.push({
        index: i,
        name: e.name,
        error: variantsErr?.message ?? "Failed to create variants",
      });
      // Roll back the pattern row to avoid orphans.
      await supabase.from("fly_patterns_v2").delete().eq("id", pattern.id);
      continue;
    }

    // 3. Place each variant in the target box.
    const inBoxInserts = variants.map((v, idx) => ({
      box_id: boxId,
      variant_id: v.id as string,
      user_id: user.id,
      sort_order: nextSort + idx,
    }));
    const { data: inBoxRows, error: inBoxErr } = await supabase
      .from("fly_variant_in_box")
      .insert(inBoxInserts)
      .select("id");
    if (inBoxErr || !inBoxRows) {
      errors.push({
        index: i,
        name: e.name,
        error: inBoxErr?.message ?? "Variants created but not placed in box",
      });
      // Don't roll back — variants are still in the user's library, just
      // not in this box yet. They can add manually via the variant editor.
    } else {
      nextSort += inBoxRows.length;
      for (const r of inBoxRows) createdInBoxIds.push(r.id as string);
    }

    // 4. Optionally populate per-variant stock from quantity_by_size.
    if (e.quantity_by_size) {
      const stockRows: Array<{
        user_id: string;
        variant_id: string;
        tied_count: number;
        personal_notes: string | null;
      }> = [];
      for (const v of variants) {
        const qty = e.quantity_by_size[v.size as string];
        if (typeof qty === "number" && qty > 0) {
          stockRows.push({
            user_id: user.id,
            variant_id: v.id as string,
            tied_count: qty,
            personal_notes: e.personal_notes ?? null,
          });
        }
      }
      if (stockRows.length > 0) {
        const { error: stockErr } = await supabase
          .from("fly_variant_stock")
          .insert(stockRows);
        if (stockErr) {
          // Non-fatal — variants and box placement succeeded; stock is gravy.
          console.error(`[quick-add] stock insert failed for "${e.name}": ${stockErr.message}`);
        }
      }
    } else if (e.personal_notes) {
      // No quantity but user left a note — attach to every variant.
      const noteRows = variants.map((v) => ({
        user_id: user.id,
        variant_id: v.id as string,
        personal_notes: e.personal_notes!,
      }));
      await supabase.from("fly_variant_stock").insert(noteRows);
    }
  }

  return NextResponse.json({
    created: createdInBoxIds.length,
    errors,
    ids: createdInBoxIds,
  });
}
