/**
 * Per-category defaults for which variant option columns to show on a pattern.
 *
 * The DB column `fly_patterns_v2.active_variant_axes` (migration
 * 20260511_active_variant_axes.sql) lets admins override these per-pattern via
 * the CMS. Until that column lands or for any pattern that hasn't been
 * customized, these defaults apply.
 *
 * Rationale: a Perdigon has no rib, so showing an empty Rib column is noise.
 * Each fly category has a different set of meaningful axes — encoding that
 * here keeps the table dense and meaningful without requiring admin work on
 * every pattern.
 */
export type VariantAxis =
  | "size"
  | "hook"
  | "bead"
  | "body"
  | "rib"
  | "tail"
  | "wing"
  | "thorax"
  | "collar"
  | "hackle";

const ALWAYS_SHOWN: VariantAxis[] = ["size"];

const DEFAULTS_BY_CATEGORY: Record<string, VariantAxis[]> = {
  nymph: ["size", "bead", "body", "rib"],
  dry: ["size", "body", "wing", "hackle"],
  streamer: ["size", "bead", "body", "tail", "wing"],
  emerger: ["size", "body", "wing", "collar"],
  wet: ["size", "body", "wing"],
  terrestrial: ["size", "body"],
  egg: ["size", "body"],
  midge: ["size", "body"],
};

const FALLBACK: VariantAxis[] = ["size", "bead", "body"];

/**
 * Resolve which axes (columns) should be visible for a pattern.
 *
 *   1. If pattern.active_variant_axes is set, use it (admin override).
 *   2. Else fall back to the per-category default.
 *   3. Else fall back to {size, bead, body}.
 *
 * `size` is always included regardless of input — every variant has a size.
 */
export function resolveVariantAxes(pattern: {
  category?: string | null;
  active_variant_axes?: string[] | null;
}): VariantAxis[] {
  const override = pattern.active_variant_axes;
  if (override && override.length > 0) {
    const merged = new Set<VariantAxis>(ALWAYS_SHOWN);
    for (const a of override) {
      if (isVariantAxis(a)) merged.add(a);
    }
    return Array.from(merged);
  }
  const def = pattern.category ? DEFAULTS_BY_CATEGORY[pattern.category] : null;
  return def ?? FALLBACK;
}

function isVariantAxis(s: string): s is VariantAxis {
  return (
    s === "size" ||
    s === "hook" ||
    s === "bead" ||
    s === "body" ||
    s === "rib" ||
    s === "tail" ||
    s === "wing" ||
    s === "thorax" ||
    s === "collar" ||
    s === "hackle"
  );
}
