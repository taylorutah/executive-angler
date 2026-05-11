/**
 * Server-side auto-match: given a catch row that has a pattern + size + bead
 * spec but no `variant_id`, look up a `fly_variants` row whose recipe matches
 * exactly and attach it. The point is to never make the angler tap through a
 * variant chooser when their size/bead inputs already nail the configuration.
 *
 * Match rules (all must hold):
 *   - We have a canonical pattern id (from `canonical_fly_id`, or resolved via
 *     `fly_pattern_id → fly_patterns.promoted_to_canonical_id`)
 *   - `size` matches `fly_variants.size` exactly (string compare)
 *   - When `bead_size` is given, it parses to a number and equals
 *     `fly_variants.bead_weight_mm`. When omitted, we accept any bead.
 *   - Exactly ONE variant matches. Multiple matches → ambiguous, skip.
 *
 * Conservative on purpose: ambiguous matches stay null so historical catches
 * never get mis-aggregated. Users can still tap a chip on the web logger to
 * pick precisely.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CatchSpecForMatching {
  variant_id?: string | null;
  canonical_fly_id?: string | null;
  fly_pattern_id?: string | null;
  fly_size?: string | null;
  bead_size?: string | number | null;
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
 * Attach `variant_id` in place for a batch of catch payloads before insert.
 * Mutates each row that gets an unambiguous match.
 */
export async function attachVariantIdsInPlace(
  supabase: SupabaseClient,
  catches: CatchSpecForMatching[],
): Promise<void> {
  await Promise.all(
    catches.map(async (c) => {
      if (c.variant_id) return;
      const matched = await autoMatchVariantId(supabase, c);
      if (matched) c.variant_id = matched;
    }),
  );
}
