/**
 * Picker data bundle — the single round-trip the catch-logging fly picker uses
 * to render its chip bar (boxes), pattern-first row list, and RECENTS section.
 *
 * Reads ONLY the unified post-reset schema:
 *   - `flies`                     — fly identity (canonical + user-submitted)
 *   - `fly_boxes`                 — user's named boxes
 *   - `user_fly_configurations`   — per-user fly versions (size + slot overrides
 *                                   + tied/bought/target counts + tie-next state)
 *   - `fly_box_entries_v3`        — configurations ↔ boxes
 *   - `catches`                   — for RECENTS (last 14d)
 *
 * "Variant" in this module's public type names is preserved for picker-UI
 * stability — the underlying id is a `user_fly_configurations.id`.
 *
 * Mirrors the iOS FlyPickerSheet contract so behavior stays in lockstep.
 */
import { createClient } from "@/lib/supabase/server";
import type { Fly, FlyConfiguration } from "@/types/flies";

export interface PickerBox {
  id: string;
  name: string;
  tier: "kill" | "support" | "archive" | "custom";
  sort_order: number;
}

export interface PickerVariant {
  /** user_fly_configurations.id */
  variant_id: string;
  /** flies.id */
  pattern_id: string;
  pattern_name: string;
  pattern_category: string | null;
  pattern_owner_user_id: string | null;
  pattern_hero_image_url: string | null;
  size: string;
  bead_weight_mm: number | null;
  bead_material: string | null;
  /** Box memberships for this configuration. */
  box_ids: string[];
  /** True when the user has tied or bought ≥ 1 of this configuration. */
  is_stocked: boolean;
}

export interface PickerOrphanPattern {
  pattern_id: string;
  name: string;
  category: string | null;
  hero_image_url: string | null;
  owner_user_id: string;
}

export interface PickerLibraryPattern {
  pattern_id: string;
  name: string;
  category: string | null;
  hero_image_url: string | null;
}

export interface PickerRecent {
  pattern_id: string;
  /** user_fly_configurations.id when known. */
  variant_id: string | null;
  caught_at: number;
}

export interface PickerBundle {
  boxes: PickerBox[];
  variants: PickerVariant[];
  /** Flies the user created (status in [private, pending, approved]) that have
   *  no configurations yet — they should still be pickable. */
  orphanPatterns: PickerOrphanPattern[];
  /** Top approved flies from the canonical library. */
  libraryPatterns: PickerLibraryPattern[];
  recents: PickerRecent[];
}

const RECENTS_DAYS = 14;
const RECENTS_LIMIT = 50;
const LIBRARY_LIMIT = 200;

export async function loadFlyPickerBundle(): Promise<PickerBundle> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { boxes: [], variants: [], orphanPatterns: [], libraryPatterns: [], recents: [] };
  }
  const userId = user.id;

  const boxesPromise = supabase
    .from("fly_boxes")
    .select("id, name, tier, sort_order")
    .eq("user_id", userId)
    .order("tier")
    .order("sort_order")
    .order("created_at");

  const configsPromise = supabase
    .from("user_fly_configurations")
    .select("*")
    .eq("user_id", userId);

  const createdFliesPromise = supabase
    .from("flies")
    .select("id, name, category, hero_image_url, submitted_by_user_id")
    .eq("submitted_by_user_id", userId)
    .in("status", ["private", "pending", "approved"])
    .is("deleted_at", null);

  const sinceIso = new Date(Date.now() - RECENTS_DAYS * 24 * 60 * 60 * 1000).toISOString();
  // Phase A: catches.configuration_id is the primary fly link. Legacy
  // catches predating the reset have configuration_id NULL, but still
  // carry fly_pattern_id / canonical_fly_id snapshots; surface those too.
  const recentsPromise = supabase
    .from("catches")
    .select("configuration_id, fly_pattern_id, canonical_fly_id, caught_at")
    .eq("user_id", userId)
    .gte("caught_at", sinceIso)
    .order("caught_at", { ascending: false })
    .limit(RECENTS_LIMIT);

  const libraryPromise = supabase
    .from("flies")
    .select("id, name, category, hero_image_url")
    .eq("status", "approved")
    .is("deleted_at", null)
    .order("is_featured", { ascending: false })
    .order("name")
    .limit(LIBRARY_LIMIT);

  const [boxesRes, configsRes, createdRes, recentsRes, libraryRes] = await Promise.all([
    boxesPromise,
    configsPromise,
    createdFliesPromise,
    recentsPromise,
    libraryPromise,
  ]);

  const boxes: PickerBox[] = (boxesRes.data ?? []).map((b) => ({
    id: b.id as string,
    name: (b.name as string) ?? "Box",
    tier: (b.tier as PickerBox["tier"]) ?? "custom",
    sort_order: (b.sort_order as number) ?? 0,
  }));

  const configs = (configsRes.data ?? []) as FlyConfiguration[];
  const createdFlies = (createdRes.data ?? []) as Array<{
    id: string;
    name: string;
    category: string | null;
    hero_image_url: string | null;
    submitted_by_user_id: string;
  }>;

  // Hydrate flies referenced by configurations (those not in `created`).
  const flyIdsFromConfigs = new Set(configs.map((c) => c.fly_id));
  const createdFlyIds = new Set(createdFlies.map((f) => f.id));
  const missingFlyIds = Array.from(flyIdsFromConfigs).filter((id) => !createdFlyIds.has(id));
  type FlyPickerRow = Pick<Fly, "id" | "name" | "category" | "hero_image_url" | "submitted_by_user_id">;
  let configuredFlies: FlyPickerRow[] = [];
  if (missingFlyIds.length > 0) {
    const { data } = await supabase
      .from("flies")
      .select("id, name, category, hero_image_url, submitted_by_user_id")
      .in("id", missingFlyIds)
      .is("deleted_at", null);
    configuredFlies = (data ?? []) as FlyPickerRow[];
  }
  const fliesById = new Map<string, FlyPickerRow>();
  for (const f of createdFlies) fliesById.set(f.id, f as FlyPickerRow);
  for (const f of configuredFlies) fliesById.set(f.id, f);

  // Box memberships for the user's configurations.
  const cfgIds = configs.map((c) => c.id);
  const boxIdsByCfg = new Map<string, string[]>();
  if (cfgIds.length > 0) {
    const { data: entries } = await supabase
      .from("fly_box_entries_v3")
      .select("configuration_id, box_id")
      .in("configuration_id", cfgIds);
    for (const e of (entries ?? []) as { configuration_id: string; box_id: string }[]) {
      const arr = boxIdsByCfg.get(e.configuration_id) ?? [];
      arr.push(e.box_id);
      boxIdsByCfg.set(e.configuration_id, arr);
    }
  }

  // One PickerVariant per (configuration, size). When a configuration has
  // no size set, fall back to a synthetic "—" row so it's still pickable.
  const variants: PickerVariant[] = [];
  for (const c of configs) {
    const fly = fliesById.get(c.fly_id);
    if (!fly) continue;
    const bead = c.slot_overrides?.bead;
    const beadMm = typeof bead?.size_mm === "number" ? bead.size_mm : null;
    const beadMaterial = typeof bead?.material === "string" ? bead.material : null;
    variants.push({
      variant_id: c.id,
      pattern_id: c.fly_id,
      pattern_name: fly.name,
      pattern_category: fly.category ?? null,
      pattern_owner_user_id: fly.submitted_by_user_id ?? null,
      pattern_hero_image_url: fly.hero_image_url ?? null,
      size: c.size ?? "—",
      bead_weight_mm: beadMm,
      bead_material: beadMaterial,
      box_ids: boxIdsByCfg.get(c.id) ?? [],
      is_stocked: (c.tied_count + c.bought_count) > 0,
    });
  }

  // Orphan patterns — flies the user created but have no configuration for.
  const patternIdsWithVariants = new Set<string>(variants.map((v) => v.pattern_id));
  const orphanPatterns: PickerOrphanPattern[] = createdFlies
    .filter((f) => !patternIdsWithVariants.has(f.id))
    .map((f) => ({
      pattern_id: f.id,
      name: f.name,
      category: f.category,
      hero_image_url: f.hero_image_url,
      owner_user_id: f.submitted_by_user_id,
    }));

  // Recents — collapse to one entry per fly_id (first/most-recent wins).
  const seenPatterns = new Set<string>();
  const recents: PickerRecent[] = [];
  // Build a configuration_id → fly_id lookup so configuration-id-only catches
  // (the new path) resolve to a pattern row.
  const flyIdByCfg = new Map<string, string>();
  for (const c of configs) flyIdByCfg.set(c.id, c.fly_id);
  for (const r of (recentsRes.data ?? []) as Array<{
    configuration_id: string | null;
    fly_pattern_id: string | null;
    canonical_fly_id: string | null;
    caught_at: string;
  }>) {
    let patternId: string | null = null;
    if (r.configuration_id) patternId = flyIdByCfg.get(r.configuration_id) ?? null;
    if (!patternId) patternId = r.fly_pattern_id ?? r.canonical_fly_id ?? null;
    if (!patternId || seenPatterns.has(patternId)) continue;
    seenPatterns.add(patternId);
    recents.push({
      pattern_id: patternId,
      variant_id: r.configuration_id,
      caught_at: Date.parse(r.caught_at),
    });
  }

  const libraryPatterns: PickerLibraryPattern[] = ((libraryRes.data ?? []) as Array<{
    id: string;
    name: string;
    category: string | null;
    hero_image_url: string | null;
  }>).map((p) => ({
    pattern_id: p.id,
    name: p.name,
    category: p.category,
    hero_image_url: p.hero_image_url,
  }));

  return { boxes, variants, orphanPatterns, libraryPatterns, recents };
}
