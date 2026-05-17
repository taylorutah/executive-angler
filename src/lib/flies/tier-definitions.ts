/**
 * Per-user fly_box tier list. Persisted on profiles.tier_definitions (jsonb).
 *
 * The original 4 tiers (kill/support/archive/custom) seed every account; users
 * can rename them, edit their description, and append additional tiers. Keys
 * are stable slugs — they're written into fly_boxes.tier, so renaming a label
 * leaves existing boxes intact.
 */

export interface TierDefinition {
  key: string;
  label: string;
  description: string;
}

export const DEFAULT_TIER_DEFINITIONS: TierDefinition[] = [
  { key: "kill", label: "Kill", description: "Chest-worn, 12–20 highest-confidence flies" },
  { key: "support", label: "Support", description: "Pack/vest variations and situational patterns" },
  { key: "archive", label: "Archive", description: "Truck/garage modular inserts" },
  { key: "custom", label: "Custom", description: "Trip-specific, regional, themed" },
];

export const TIER_KEY_PATTERN = /^[a-z0-9][a-z0-9_-]{0,39}$/;
export const TIER_LABEL_MAX = 40;
export const TIER_DESCRIPTION_MAX = 200;
export const MAX_TIERS = 24;
export const DEFAULT_TIER_KEYS = new Set(DEFAULT_TIER_DEFINITIONS.map((t) => t.key));

/** Slug a free-form label into a tier key candidate. */
export function slugifyTierKey(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * Resolve the effective ordered tier list for a user. Falls back to defaults
 * (optionally overlaid with the legacy `tier_descriptions` map) when the user
 * hasn't customized their list yet.
 */
export function resolveTierDefinitions(
  stored: unknown,
  legacyDescriptions?: Record<string, string> | null,
): TierDefinition[] {
  if (Array.isArray(stored) && stored.length > 0) {
    const cleaned: TierDefinition[] = [];
    const seenKeys = new Set<string>();
    for (const raw of stored) {
      if (!raw || typeof raw !== "object") continue;
      const r = raw as Record<string, unknown>;
      const key = typeof r.key === "string" ? r.key.trim() : "";
      const label = typeof r.label === "string" ? r.label.trim() : "";
      const description = typeof r.description === "string" ? r.description : "";
      if (!key || !label || seenKeys.has(key)) continue;
      seenKeys.add(key);
      cleaned.push({ key, label, description });
    }
    // Always ensure the 4 defaults remain reachable so existing boxes don't orphan.
    for (const def of DEFAULT_TIER_DEFINITIONS) {
      if (!seenKeys.has(def.key)) cleaned.push(def);
    }
    return cleaned;
  }

  // No stored list — derive from defaults + legacy descriptions overrides.
  const overrides = (legacyDescriptions ?? {}) as Record<string, string>;
  return DEFAULT_TIER_DEFINITIONS.map((d) => ({
    ...d,
    description:
      typeof overrides[d.key] === "string" && overrides[d.key].trim()
        ? overrides[d.key]
        : d.description,
  }));
}
