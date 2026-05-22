/**
 * Legacy variant auto-matcher — NO-OP post-reset.
 *
 * Before the May-14 unified-fly migration, this scanned `fly_variants`
 * (since dropped) to back-fill `catches.variant_id` from pattern + size +
 * bead. The unified schema replaces variants with `user_fly_configurations`
 * and routes catch identity through `catches.configuration_id`; the picker
 * emits the configuration id directly, so server-side matching is no longer
 * needed.
 *
 * File preserved as a no-op for import compatibility (session/route.ts,
 * action handlers). Safe to delete once those call sites are migrated to
 * configuration_id throughout.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CatchSpecForMatching {
  variant_id?: string | null;
  configuration_id?: string | null;
  canonical_fly_id?: string | null;
  fly_pattern_id?: string | null;
  fly_size?: string | null;
  bead_size?: string | number | null;
  personalization_snapshot?: Record<string, unknown> | null;
}

export type CatchVariantSnapshot = Record<string, unknown>;

export async function autoMatchVariantId(
  _supabase: SupabaseClient,
  _c: CatchSpecForMatching,
): Promise<string | null> {
  return null;
}

export async function attachVariantIdsInPlace(
  _supabase: SupabaseClient,
  _catches: CatchSpecForMatching[],
): Promise<void> {
  // intentional no-op
}
