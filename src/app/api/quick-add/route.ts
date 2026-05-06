/**
 * Quick-add endpoint for bulk-adding personal flies to a box.
 *
 * The user has hundreds of flies in their physical boxes that aren't in the
 * canonical library. This endpoint creates each as a personal fly_patterns
 * row + a user_fly_box stock entry + a fly_box_membership in the chosen box.
 * The user can later link any of them to a canonical fly via parent_canonical_id
 * or submit them to the library.
 *
 * POST /api/quick-add
 * Body: {
 *   box_id: string                 // target box to add memberships to
 *   entries: Array<{
 *     name: string                 // required
 *     type?: string                // "Nymph", "Dry Fly", etc.
 *     hook?: string
 *     bead_size?: string
 *     bead_color?: string
 *     fly_color?: string
 *     description?: string
 *     sizes?: string[]             // ["14", "16", "18"]
 *     quantity_by_size?: Record<string, number>  // { "16": 4, "18": 4 }
 *     personal_notes?: string
 *   }>
 * }
 *
 * Response: { created: number, errors: Array<{ index, name, error }>, ids: string[] }
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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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
    return NextResponse.json(
      { error: "Maximum 200 entries per call" },
      { status: 400 },
    );
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
      for (const [k, v] of Object.entries(
        r.quantity_by_size as Record<string, unknown>,
      )) {
        if (typeof v === "number" && v > 0) quantityBySize[k] = Math.floor(v);
      }
    }
    entries.push({
      name,
      type: typeof r.type === "string" ? r.type.trim() || undefined : undefined,
      hook: typeof r.hook === "string" ? r.hook.trim() || undefined : undefined,
      bead_size:
        typeof r.bead_size === "string" ? r.bead_size.trim() || undefined : undefined,
      bead_color:
        typeof r.bead_color === "string"
          ? r.bead_color.trim() || undefined
          : undefined,
      fly_color:
        typeof r.fly_color === "string" ? r.fly_color.trim() || undefined : undefined,
      description:
        typeof r.description === "string"
          ? r.description.trim() || undefined
          : undefined,
      sizes,
      quantity_by_size:
        Object.keys(quantityBySize).length > 0 ? quantityBySize : undefined,
      personal_notes:
        typeof r.personal_notes === "string"
          ? r.personal_notes.trim() || undefined
          : undefined,
    });
  }

  if (entries.length === 0) {
    return NextResponse.json(
      { error: "No valid entries (each must have a non-empty name)" },
      { status: 400 },
    );
  }

  // Per-row creation: fly_patterns → user_fly_box → fly_box_membership.
  // Sequential to keep slug uniqueness simple; n is at most 200.
  const errors: Array<{ index: number; name: string; error: string }> = [];
  const createdEntryIds: string[] = [];
  let nextSort = 0;
  {
    const { data: existingMax } = await supabase
      .from("fly_box_membership")
      .select("sort_order")
      .eq("box_id", boxId)
      .order("sort_order", { ascending: false })
      .limit(1);
    nextSort = ((existingMax?.[0]?.sort_order as number | undefined) ?? -1) + 1;
  }

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];

    // 1. Insert fly_pattern
    let baseSlug = slugify(e.name) || `pattern-${Date.now()}-${i}`;
    // We could collide on (user_id, slug); add a numeric suffix if needed.
    // Simplest robust approach: probe for clashes once then increment.
    let slug = baseSlug;
    let suffix = 1;
    while (suffix < 50) {
      const { data: existing } = await supabase
        .from("fly_patterns")
        .select("id")
        .eq("user_id", user.id)
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }
    if (suffix >= 50) {
      slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;
    }
    void baseSlug; // baseSlug used for slug derivation

    const patternRow = {
      user_id: user.id,
      name: e.name,
      slug,
      type: e.type ?? null,
      hook: e.hook ?? null,
      bead_size: e.bead_size ?? null,
      bead_color: e.bead_color ?? null,
      fly_color: e.fly_color ?? null,
      description: e.description ?? null,
      visibility: "private",
    };
    const { data: pattern, error: patternErr } = await supabase
      .from("fly_patterns")
      .insert(patternRow)
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

    // 2. Insert user_fly_box (linked to the new pattern, no canonical_fly_id)
    const ufbRow: Record<string, unknown> = {
      user_id: user.id,
      fly_pattern_id: pattern.id,
      preferred_sizes: e.sizes ?? null,
      personal_notes: e.personal_notes ?? null,
      is_primary: true, // first entry per pattern is primary by definition
    };
    if (e.quantity_by_size) {
      ufbRow.quantity_by_size = e.quantity_by_size;
      ufbRow.tied_count = Object.values(e.quantity_by_size).reduce(
        (sum, n) => sum + n,
        0,
      );
    }
    const { data: ufb, error: ufbErr } = await supabase
      .from("user_fly_box")
      .insert(ufbRow)
      .select("id")
      .single();
    if (ufbErr || !ufb) {
      errors.push({
        index: i,
        name: e.name,
        error: ufbErr?.message ?? "Failed to create box entry",
      });
      // Roll back the pattern row to avoid orphans.
      await supabase.from("fly_patterns").delete().eq("id", pattern.id);
      continue;
    }

    // 3. Insert membership in target box
    const { error: memErr } = await supabase.from("fly_box_membership").insert({
      box_id: boxId,
      user_fly_box_id: ufb.id,
      sort_order: nextSort++,
    });
    if (memErr) {
      errors.push({
        index: i,
        name: e.name,
        error: `Created but not added to box: ${memErr.message}`,
      });
      // Don't roll back — entry exists in My Flies; user can manually add later.
    }

    createdEntryIds.push(ufb.id);
  }

  return NextResponse.json({
    created: createdEntryIds.length,
    errors,
    ids: createdEntryIds,
  });
}
