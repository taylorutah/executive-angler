/**
 * Server-side variant resolution for catches.
 *
 * Two passes per catch:
 *   1. Auto-match — when a catch has a pattern + size + bead but no
 *      `variant_id`, look up `fly_variants` row(s) that match exactly.
 *      Attach `variant_id` only on an unambiguous (exactly one) match.
 *   2. Snapshot — when a catch ends up with a `variant_id` (manual chip pick
 *      or auto-match), freeze the resolved recipe into
 *      `catches.personalization_snapshot`. The snapshot preserves the spec
 *      the fish was caught on so historical aggregations stay accurate even
 *      if the variant is later edited or soft-deleted.
 *
 * Manual chip picks (caller already set `variant_id`) skip the matching step
 * but still get a fresh snapshot.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CatchSpecForMatching {
  variant_id?: string | null;
  canonical_fly_id?: string | null;
  fly_pattern_id?: string | null;
  fly_size?: string | null;
  bead_size?: string | number | null;
  personalization_snapshot?: Record<string, unknown> | null;
}

/** Shape of the frozen snapshot written to `catches.personalization_snapshot`. */
export interface CatchVariantSnapshot {
  variant_id: string;
  pattern_id: string | null;
  pattern_name: string | null;
  size: string;
  bead_material: string | null;
  bead_weight_mm: number | null;
  bead_color: string | null;
  body_color: string | null;
  rib_color: string | null;
  tail_color: string | null;
  wing_color: string | null;
  thorax_color: string | null;
  collar_color: string | null;
  /** ISO timestamp when the snapshot was taken (i.e. catch save time). */
  snapshotted_at: string;
}

function parseBeadMm(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n = typeof raw === "number" ? raw : parseFloat(String(raw));
  return Number.isFinite(n) ? n : null;
}

async function resolvePatternId(
  supabase: SupabaseClient,
  c: CatchSpecForMatching,
): Promise<string | null> {
  if (c.canonical_fly_id) return c.canonical_fly_id;
  if (!c.fly_pattern_id) return null;
  // Legacy personal pattern — only matches a canonical when promoted.
  const { data } = await supabase
    .from("fly_patterns")
    .select("promoted_to_canonical_id")
    .eq("id", c.fly_pattern_id)
    .maybeSingle();
  return (data?.promoted_to_canonical_id as string | null) ?? null;
}

/**
 * Returns the variant_id to attach to this catch, or null when no unambiguous
 * match exists. Skip behaviors:
 *   - variant_id already set → leave it (caller's choice wins)
 *   - no pattern or no size → null (not enough to match)
 *   - 0 matches → null
 *   - 2+ matches → null (ambiguous — e.g. different body colors)
 */
export async function autoMatchVariantId(
  supabase: SupabaseClient,
  c: CatchSpecForMatching,
): Promise<string | null> {
  if (c.variant_id) return c.variant_id;
  const size = c.fly_size?.trim();
  if (!size) return null;
  const patternId = await resolvePatternId(supabase, c);
  if (!patternId) return null;

  let q = supabase
    .from("fly_variants")
    .select("id, bead_weight_mm")
    .eq("pattern_id", patternId)
    .eq("size", size)
    .is("deleted_at", null);

  const beadMm = parseBeadMm(c.bead_size);
  if (beadMm != null) {
    q = q.eq("bead_weight_mm", beadMm);
  }

  const { data, error } = await q.limit(2);
  if (error || !data || data.length !== 1) return null;
  return data[0].id as string;
}

/**
 * Build a frozen snapshot of the variant's spec at catch-save time. Returns
 * null when the variant lookup fails (deleted, RLS-hidden, bad id).
 */
async function buildVariantSnapshot(
  supabase: SupabaseClient,
  variantId: string,
): Promise<CatchVariantSnapshot | null> {
  const { data } = await supabase
    .from("fly_variants")
    .select(
      "id, pattern_id, size, bead_material, bead_weight_mm, bead_color, body_color, rib_color, tail_color, wing_color, thorax_color, collar_color, fly_patterns_v2(name)",
    )
    .eq("id", variantId)
    .maybeSingle();
  if (!data) return null;
  const patternJoin = (data as { fly_patterns_v2?: { name?: string } | { name?: string }[] | null }).fly_patterns_v2;
  const pattern_name = Array.isArray(patternJoin)
    ? patternJoin[0]?.name ?? null
    : patternJoin?.name ?? null;
  return {
    variant_id: data.id as string,
    pattern_id: (data.pattern_id as string | null) ?? null,
    pattern_name,
    size: (data.size as string | null) ?? "",
    bead_material: (data.bead_material as string | null) ?? null,
    bead_weight_mm: (data.bead_weight_mm as number | null) ?? null,
    bead_color: (data.bead_color as string | null) ?? null,
    body_color: (data.body_color as string | null) ?? null,
    rib_color: (data.rib_color as string | null) ?? null,
    tail_color: (data.tail_color as string | null) ?? null,
    wing_color: (data.wing_color as string | null) ?? null,
    thorax_color: (data.thorax_color as string | null) ?? null,
    collar_color: (data.collar_color as string | null) ?? null,
    snapshotted_at: new Date().toISOString(),
  };
}

/**
 * For each catch in the batch:
 *   1. Auto-match `variant_id` when missing.
 *   2. Build & attach a `personalization_snapshot` when `variant_id` is set
 *      and no snapshot is already present (caller's snapshot wins).
 * Mutates rows in place.
 */
export async function attachVariantIdsInPlace(
  supabase: SupabaseClient,
  catches: CatchSpecForMatching[],
): Promise<void> {
  await Promise.all(
    catches.map(async (c) => {
      if (!c.variant_id) {
        const matched = await autoMatchVariantId(supabase, c);
        if (matched) c.variant_id = matched;
      }
      if (c.variant_id && !c.personalization_snapshot) {
        const snap = await buildVariantSnapshot(supabase, c.variant_id);
        if (snap) c.personalization_snapshot = snap as unknown as Record<string, unknown>;
      }
    }),
  );
}
