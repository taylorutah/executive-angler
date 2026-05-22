/**
 * fly-v2.ts — façade module bridging legacy consumers to the unified Phase A
 * fly schema (`flies` + `user_fly_configurations` + `fly_box_entries_v3` +
 * `fly_boxes`).
 *
 * The exported function signatures and types match the pre-reset module so
 * existing pages compile unchanged. Internally everything reads/writes the
 * unified tables. The mapping is intentionally lossy in one direction —
 * legacy "Variant" colour columns are projected out of `slot_overrides` jsonb,
 * and per-variant photos collapse to the fly's hero image — but every
 * surface that the app still uses (boxes pages, dashboard tie-next, catch
 * logger, journal session detail) keeps working.
 *
 * Long-term: consumers migrate to `Fly` / `FlyConfiguration` types directly
 * (see `src/types/flies.ts`) and this file gets deleted. Until then it's the
 * one place that knows both shapes.
 */
import { createClient } from "@/lib/supabase/server";
import type {
  Pattern,
  Variant,
  VariantStock,
  VariantInBox,
  VariantPhoto,
  VariantRow,
  MaterialSlot,
  TyingStep,
  BeadMaterial,
} from "@/types/fly-v2";
import type { Fly, FlyConfiguration } from "@/types/flies";

// ────────────────────────────────────────────────────────────────────────────
// Mappers — Fly→Pattern, FlyConfiguration→(Variant, VariantStock)
// ────────────────────────────────────────────────────────────────────────────

function flyToPattern(f: Fly): Pattern {
  return {
    id: f.id,
    slug: f.slug,
    name: f.name,
    category: f.category as Pattern["category"],
    owner_user_id: f.submitted_by_user_id,
    forked_from_pattern_id: null,
    promoted_to_canonical_id: null,
    description: f.description,
    history: f.history,
    tying_overview: f.tying_overview,
    fishing_tips: f.fishing_tips,
    imitates: f.imitates ?? [],
    effective_species_ids: f.effective_species_ids ?? [],
    water_types: f.water_types ?? [],
    hook_style: null,
    base_materials: (f.materials_list as MaterialSlot[]) ?? [],
    tying_steps: [] as TyingStep[],
    hero_image_url: f.hero_image_url,
    gallery_image_urls: f.gallery_image_urls ?? [],
    video_url: f.video_url,
    visibility: f.status === "private" ? "private" : "public",
    shared_with_user_ids: [],
    contributed_by_user_id: null,
    origin_credit: f.origin_credit ?? null,
    is_featured: f.is_featured,
    active_variant_axes: null,
    created_at: f.created_at,
    updated_at: f.updated_at,
  };
}

type SlotMap = FlyConfiguration["slot_overrides"];
function slotColor(slots: SlotMap, slot: string): string | null {
  const v = slots?.[slot];
  return (typeof v?.color === "string" ? v.color : null);
}

function configToVariant(c: FlyConfiguration): Variant {
  const s = c.slot_overrides ?? {};
  const bead = s.bead ?? {};
  const hook = s.hook ?? {};
  return {
    id: c.id,
    pattern_id: c.fly_id,
    created_by_user_id: c.user_id,
    slug: null,
    size: c.size ?? "",
    bead_material: (typeof bead.material === "string" ? bead.material : null) as Variant["bead_material"],
    bead_weight_mm: typeof bead.size_mm === "number" ? bead.size_mm : null,
    bead_color: typeof bead.color === "string" ? bead.color : null,
    body_color: slotColor(s, "body"),
    rib_color: slotColor(s, "rib"),
    tail_color: slotColor(s, "tail"),
    wing_color: slotColor(s, "wing"),
    thorax_color: slotColor(s, "thorax"),
    collar_color: slotColor(s, "collar"),
    hook_style: typeof hook.style === "string" ? hook.style : null,
    hook_brand: typeof hook.brand === "string" ? hook.brand : null,
    materials_override: {},
    display_name: c.nickname,
    notes: c.personal_notes,
    sort_order: 0,
    is_default_for_pattern: false,
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

function configToStock(c: FlyConfiguration): VariantStock {
  return {
    id: c.id,
    variant_id: c.id,
    user_id: c.user_id,
    tied_count: c.tied_count,
    bought_count: c.bought_count,
    target_count: c.target_count,
    is_favorite: c.is_favorite,
    tie_next_status: c.tie_next_status ?? "none",
    tie_next_target_qty: c.tie_next_target_qty,
    tie_next_notes: c.tie_next_notes,
    times_used: c.times_used,
    last_used_at: c.last_used_at,
    last_loss_at: c.last_loss_at,
    personal_notes: c.personal_notes,
    added_at: c.created_at,
    updated_at: c.updated_at,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Patterns
// ────────────────────────────────────────────────────────────────────────────

export async function listCanonicalPatterns(): Promise<Pattern[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flies")
    .select("*")
    .eq("status", "approved")
    .is("deleted_at", null)
    .order("name");
  if (error) {
    console.error("[listCanonicalPatterns]", error);
    return [];
  }
  return ((data ?? []) as Fly[]).map(flyToPattern);
}

export async function getCanonicalPatternBySlug(slug: string): Promise<Pattern | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("flies")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  return data ? flyToPattern(data as Fly) : null;
}

export async function getPatternById(id: string): Promise<Pattern | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("flies")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return data ? flyToPattern(data as Fly) : null;
}

export async function listMyPatterns(): Promise<Pattern[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("flies")
    .select("*")
    .eq("submitted_by_user_id", user.id)
    .is("deleted_at", null)
    .in("status", ["private", "pending", "approved"])
    .order("name");
  if (error) {
    console.error("[listMyPatterns]", error);
    return [];
  }
  return ((data ?? []) as Fly[]).map(flyToPattern);
}

// ────────────────────────────────────────────────────────────────────────────
// Variants (= user_fly_configurations)
// ────────────────────────────────────────────────────────────────────────────

export async function listVariantsForPattern(patternId: string): Promise<Variant[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("user_fly_configurations")
    .select("*")
    .eq("user_id", user.id)
    .eq("fly_id", patternId);
  if (error) {
    console.error("[listVariantsForPattern]", error);
    return [];
  }
  return ((data ?? []) as FlyConfiguration[]).map(configToVariant);
}

/** Build VariantRow[] from the user's configurations for a fly. */
export async function listVariantRowsForPattern(patternId: string): Promise<VariantRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: configs }, { data: flyRow }] = await Promise.all([
    supabase
      .from("user_fly_configurations")
      .select("*")
      .eq("user_id", user.id)
      .eq("fly_id", patternId),
    supabase
      .from("flies")
      .select("id, slug, name, category, hero_image_url")
      .eq("id", patternId)
      .maybeSingle(),
  ]);

  const fly = (flyRow ?? null) as Pick<Fly, "id" | "slug" | "name" | "category" | "hero_image_url"> | null;
  const cfgs = (configs ?? []) as FlyConfiguration[];
  if (cfgs.length === 0) return [];

  // Per-config box memberships.
  const cfgIds = cfgs.map((c) => c.id);
  const { data: entries } = await supabase
    .from("fly_box_entries_v3")
    .select("configuration_id, box_id, fly_boxes(name)")
    .in("configuration_id", cfgIds);

  type EntryJoin = {
    configuration_id: string;
    box_id: string;
    fly_boxes: { name: string | null } | { name: string | null }[] | null;
  };
  const membershipsByCfg = new Map<string, { box_id: string; box_name: string; quantity: number }[]>();
  const boxCountByCfg = new Map<string, number>();
  for (const e of (entries ?? []) as EntryJoin[]) {
    const name = Array.isArray(e.fly_boxes)
      ? e.fly_boxes[0]?.name ?? "Box"
      : e.fly_boxes?.name ?? "Box";
    const list = membershipsByCfg.get(e.configuration_id) ?? [];
    list.push({ box_id: e.box_id, box_name: name, quantity: 1 });
    membershipsByCfg.set(e.configuration_id, list);
    boxCountByCfg.set(e.configuration_id, (boxCountByCfg.get(e.configuration_id) ?? 0) + 1);
  }

  return cfgs.map<VariantRow>((c) => ({
    ...configToVariant(c),
    pattern: fly,
    stock: configToStock(c),
    primary_photo: null,
    box_count: boxCountByCfg.get(c.id) ?? 0,
    box_memberships: membershipsByCfg.get(c.id) ?? [],
    box_quantity: null,
    box_target_quantity: null,
  }));
}

export async function listMyStockedVariants(): Promise<VariantRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: configs } = await supabase
    .from("user_fly_configurations")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  const cfgs = (configs ?? []) as FlyConfiguration[];
  if (cfgs.length === 0) return [];

  const flyIds = Array.from(new Set(cfgs.map((c) => c.fly_id)));
  const { data: flies } = await supabase
    .from("flies")
    .select("id, slug, name, category, hero_image_url")
    .in("id", flyIds);
  const flyById = new Map<string, Pick<Fly, "id" | "slug" | "name" | "category" | "hero_image_url">>();
  for (const f of (flies ?? []) as Pick<Fly, "id" | "slug" | "name" | "category" | "hero_image_url">[]) {
    flyById.set(f.id, f);
  }

  return cfgs.map<VariantRow>((c) => ({
    ...configToVariant(c),
    pattern: flyById.get(c.fly_id) ?? null,
    stock: configToStock(c),
    primary_photo: null,
    box_count: 0,
    box_memberships: [],
    box_quantity: null,
    box_target_quantity: null,
  }));
}

/** Tie-next deficits: configurations where target > tied + bought, OR
 *  with an explicit tie_next flag. */
export async function listDerivedTieNextShortages(): Promise<VariantRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: configs } = await supabase
    .from("user_fly_configurations")
    .select("*")
    .eq("user_id", user.id);
  const cfgs = (configs ?? []) as FlyConfiguration[];
  const shorted = cfgs.filter((c) => {
    if (c.is_tie_next) return true;
    const t = c.target_count ?? 0;
    if (t <= 0) return false;
    return t > (c.tied_count ?? 0) + (c.bought_count ?? 0);
  });
  if (shorted.length === 0) return [];

  const flyIds = Array.from(new Set(shorted.map((c) => c.fly_id)));
  const { data: flies } = await supabase
    .from("flies")
    .select("id, slug, name, category, hero_image_url")
    .in("id", flyIds);
  const flyById = new Map<string, Pick<Fly, "id" | "slug" | "name" | "category" | "hero_image_url">>();
  for (const f of (flies ?? []) as Pick<Fly, "id" | "slug" | "name" | "category" | "hero_image_url">[]) {
    flyById.set(f.id, f);
  }

  return shorted.map<VariantRow>((c) => ({
    ...configToVariant(c),
    pattern: flyById.get(c.fly_id) ?? null,
    stock: configToStock(c),
    primary_photo: null,
    box_count: 0,
    box_memberships: [],
    box_quantity: null,
    box_target_quantity: null,
  }));
}

/** Configurations inside a single box. */
export async function listVariantsInBox(boxId: string): Promise<VariantRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: entries } = await supabase
    .from("fly_box_entries_v3")
    .select("configuration_id, sort_order")
    .eq("box_id", boxId)
    .order("sort_order");
  const cfgIds = ((entries ?? []) as { configuration_id: string }[]).map((e) => e.configuration_id);
  if (cfgIds.length === 0) return [];

  const { data: configs } = await supabase
    .from("user_fly_configurations")
    .select("*")
    .in("id", cfgIds);
  const cfgs = (configs ?? []) as FlyConfiguration[];

  const flyIds = Array.from(new Set(cfgs.map((c) => c.fly_id)));
  const { data: flies } = await supabase
    .from("flies")
    .select("id, slug, name, category, hero_image_url")
    .in("id", flyIds);
  const flyById = new Map<string, Pick<Fly, "id" | "slug" | "name" | "category" | "hero_image_url">>();
  for (const f of (flies ?? []) as Pick<Fly, "id" | "slug" | "name" | "category" | "hero_image_url">[]) {
    flyById.set(f.id, f);
  }

  return cfgs.map<VariantRow>((c) => ({
    ...configToVariant(c),
    pattern: flyById.get(c.fly_id) ?? null,
    stock: configToStock(c),
    primary_photo: null,
    box_count: 1,
    box_memberships: [],
    box_quantity: 1,
    box_target_quantity: null,
  }));
}

// ────────────────────────────────────────────────────────────────────────────
// Boxes
// ────────────────────────────────────────────────────────────────────────────

export type FlyBoxTier = "kill" | "support" | "archive" | "custom";

export interface FlyBoxV2 {
  id: string;
  user_id: string;
  name: string;
  tier: FlyBoxTier;
  description: string | null;
  icon: string | null;
  cover_image_url: string | null;
  sort_order: number;
  is_default: boolean;
  total_capacity: number | null;
  created_at: string;
  updated_at: string;
}

export async function listMyBoxes(): Promise<FlyBoxV2[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("fly_boxes")
    .select("*")
    .eq("user_id", user.id)
    .order("tier")
    .order("sort_order")
    .order("created_at");
  if (error) {
    console.error("[listMyBoxes]", error);
    return [];
  }
  return (data ?? []) as FlyBoxV2[];
}

export async function getBoxById(id: string): Promise<FlyBoxV2 | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fly_boxes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getBoxById]", error);
    return null;
  }
  return (data ?? null) as FlyBoxV2 | null;
}

export interface BoxStats {
  total: number;
  byCategory: Record<string, number>;
}

/** Per-box counts grouped by fly category. */
export async function listBoxStats(boxIds: string[]): Promise<Record<string, BoxStats>> {
  if (boxIds.length === 0) return {};
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("fly_box_entries_v3")
    .select("box_id, configuration_id")
    .in("box_id", boxIds);
  if (!entries || entries.length === 0) return {};
  const rows = entries as { box_id: string; configuration_id: string }[];

  const cfgIds = Array.from(new Set(rows.map((r) => r.configuration_id)));
  const { data: configs } = await supabase
    .from("user_fly_configurations")
    .select("id, fly_id")
    .in("id", cfgIds);
  const cfgToFly = new Map<string, string>();
  for (const c of (configs ?? []) as { id: string; fly_id: string }[]) {
    cfgToFly.set(c.id, c.fly_id);
  }

  const flyIds = Array.from(new Set(Array.from(cfgToFly.values())));
  const { data: flies } = await supabase
    .from("flies")
    .select("id, category")
    .in("id", flyIds);
  const flyCat = new Map<string, string>();
  for (const f of (flies ?? []) as { id: string; category: string | null }[]) {
    if (f.category) flyCat.set(f.id, f.category);
  }

  const result: Record<string, BoxStats> = {};
  for (const r of rows) {
    if (!result[r.box_id]) result[r.box_id] = { total: 0, byCategory: {} };
    result[r.box_id].total += 1;
    const flyId = cfgToFly.get(r.configuration_id);
    const cat = flyId ? (flyCat.get(flyId) ?? "other") : "other";
    result[r.box_id].byCategory[cat] = (result[r.box_id].byCategory[cat] ?? 0) + 1;
  }
  return result;
}

export async function getDefaultFlyBoxId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("fly_boxes")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .maybeSingle();
  if (data?.id) return data.id as string;
  const { data: created, error } = await supabase
    .from("fly_boxes")
    .insert({ user_id: user.id, name: "My Fly Box", tier: "custom", is_default: true })
    .select("id")
    .single();
  if (error) {
    console.error("[getDefaultFlyBoxId] create", error);
    return null;
  }
  return (created?.id ?? null) as string | null;
}

// ────────────────────────────────────────────────────────────────────────────
// Mutations — configurations + box membership
// ────────────────────────────────────────────────────────────────────────────

/** Build a `slot_overrides` jsonb from legacy column fields. */
function legacySpecToSlots(input: {
  bead_material?: Variant["bead_material"];
  bead_weight_mm?: number;
  bead_color?: string;
  body_color?: string;
  rib_color?: string;
  tail_color?: string;
  wing_color?: string;
  thorax_color?: string;
  collar_color?: string;
  hook_style?: string;
  hook_brand?: string;
}): Record<string, Record<string, unknown>> {
  const slots: Record<string, Record<string, unknown>> = {};
  const beadObj: Record<string, unknown> = {};
  if (input.bead_material) beadObj.material = input.bead_material;
  if (input.bead_weight_mm != null) beadObj.size_mm = input.bead_weight_mm;
  if (input.bead_color) beadObj.color = input.bead_color;
  if (Object.keys(beadObj).length) slots.bead = beadObj;
  for (const [legacy, slot] of [
    ["body_color", "body"],
    ["rib_color", "rib"],
    ["tail_color", "tail"],
    ["wing_color", "wing"],
    ["thorax_color", "thorax"],
    ["collar_color", "collar"],
  ] as const) {
    const v = (input as Record<string, unknown>)[legacy];
    if (typeof v === "string" && v) slots[slot] = { color: v };
  }
  const hookObj: Record<string, unknown> = {};
  if (input.hook_style) hookObj.style = input.hook_style;
  if (input.hook_brand) hookObj.brand = input.hook_brand;
  if (Object.keys(hookObj).length) slots.hook = hookObj;
  return slots;
}

export async function createUserVariantWithError(input: Parameters<typeof createUserVariant>[0]): Promise<{ ok: true; variant: Variant } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const { data, error } = await supabase
    .from("user_fly_configurations")
    .insert({
      user_id: user.id,
      fly_id: input.pattern_id,
      size: input.size,
      nickname: input.display_name ?? null,
      personal_notes: input.notes ?? null,
      slot_overrides: legacySpecToSlots(input),
    })
    .select()
    .single();
  if (error) {
    const detail = [error.code, error.message, error.details, error.hint]
      .filter(Boolean)
      .join(" · ");
    return { ok: false, error: detail || "Insert failed." };
  }
  return { ok: true, variant: configToVariant(data as FlyConfiguration) };
}

export async function createUserVariant(input: {
  pattern_id: string;
  size: string;
  bead_material?: Variant["bead_material"];
  bead_weight_mm?: number;
  bead_color?: string;
  body_color?: string;
  rib_color?: string;
  tail_color?: string;
  wing_color?: string;
  thorax_color?: string;
  collar_color?: string;
  display_name?: string;
  notes?: string;
  hook_style?: string;
  hook_brand?: string;
  materials_override?: Record<string, string>;
  /** Canonical variants are not a concept in the new schema; flag ignored. */
  as_canonical?: boolean;
}): Promise<Variant | null> {
  const r = await createUserVariantWithError(input);
  return r.ok ? r.variant : null;
}

export async function cloneVariant(
  sourceVariantId: string,
): Promise<{ ok: true; variant: Variant } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: src, error: srcErr } = await supabase
    .from("user_fly_configurations")
    .select("*")
    .eq("id", sourceVariantId)
    .maybeSingle();
  if (srcErr) return { ok: false, error: `Read source failed: ${srcErr.message}` };
  if (!src) return { ok: false, error: "Source configuration not found." };
  const cfg = src as FlyConfiguration;
  return createUserVariantWithError({
    pattern_id: cfg.fly_id,
    size: cfg.size ?? "",
    bead_material: (cfg.slot_overrides?.bead?.material as Variant["bead_material"]) ?? undefined,
    bead_weight_mm: typeof cfg.slot_overrides?.bead?.size_mm === "number"
      ? (cfg.slot_overrides.bead.size_mm as number)
      : undefined,
    bead_color: typeof cfg.slot_overrides?.bead?.color === "string"
      ? (cfg.slot_overrides.bead.color as string)
      : undefined,
    body_color: typeof cfg.slot_overrides?.body?.color === "string"
      ? (cfg.slot_overrides.body.color as string)
      : undefined,
    display_name: cfg.nickname ?? undefined,
    notes: cfg.personal_notes ?? undefined,
  });
}

export async function upsertVariantStock(input: {
  variant_id: string;
  tied_count?: number;
  bought_count?: number;
  target_count?: number;
  is_favorite?: boolean;
  personal_notes?: string;
}): Promise<VariantStock | null> {
  const supabase = await createClient();
  const updates: Record<string, unknown> = {};
  if (input.tied_count !== undefined) updates.tied_count = input.tied_count;
  if (input.bought_count !== undefined) updates.bought_count = input.bought_count;
  if (input.target_count !== undefined) updates.target_count = input.target_count;
  if (input.is_favorite !== undefined) updates.is_favorite = input.is_favorite;
  if (input.personal_notes !== undefined) updates.personal_notes = input.personal_notes;
  const { data, error } = await supabase
    .from("user_fly_configurations")
    .update(updates)
    .eq("id", input.variant_id)
    .select()
    .single();
  if (error) {
    console.error("[upsertVariantStock]", error);
    return null;
  }
  return configToStock(data as FlyConfiguration);
}

export async function addVariantsToBox(
  boxId: string,
  variantIds: string[],
): Promise<number | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  if (variantIds.length === 0) return 0;
  const rows = variantIds.map((cfgId) => ({
    box_id: boxId,
    configuration_id: cfgId,
    user_id: user.id,
    sort_order: 0,
    added_at: new Date().toISOString(),
  }));
  const { error, count } = await supabase
    .from("fly_box_entries_v3")
    .upsert(rows, { onConflict: "box_id,configuration_id", count: "exact" });
  if (error) {
    console.error("[addVariantsToBox]", error);
    return null;
  }
  return count ?? variantIds.length;
}

export async function removeVariantsFromBox(
  boxId: string,
  variantIds: string[],
): Promise<{ removed: number; error?: string }> {
  if (variantIds.length === 0) return { removed: 0, error: "No configurations supplied." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { removed: 0, error: "You must be signed in." };
  const { error, count } = await supabase
    .from("fly_box_entries_v3")
    .delete({ count: "exact" })
    .eq("box_id", boxId)
    .eq("user_id", user.id)
    .in("configuration_id", variantIds);
  if (error) return { removed: 0, error: error.message };
  return { removed: count ?? 0 };
}

export async function removeVariantFromBox(boxId: string, variantId: string): Promise<boolean> {
  const r = await removeVariantsFromBox(boxId, [variantId]);
  return !r.error;
}

/** Per-box quantity is not a concept on Phase A — no-op for back-compat. */
export async function updateBoxVariantQuantity(
  _boxId: string,
  _variantId: string,
  _quantity: number,
): Promise<boolean> {
  return true;
}

export async function updateBoxVariantTargetQuantity(
  _boxId: string,
  _variantId: string,
  _targetQuantity: number | null,
): Promise<boolean> {
  return true;
}

export async function updateVariant(
  variantId: string,
  fields: {
    size?: string;
    bead_material?: Variant["bead_material"] | null;
    bead_weight_mm?: number | null;
    bead_color?: string | null;
    body_color?: string | null;
    rib_color?: string | null;
    hook_style?: string | null;
    hook_brand?: string | null;
    display_name?: string | null;
    notes?: string | null;
  },
): Promise<{ ok: true; variant: Variant } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("user_fly_configurations")
    .select("*")
    .eq("id", variantId)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Configuration not found." };
  const cfg = existing as FlyConfiguration;
  const slots = { ...(cfg.slot_overrides ?? {}) };
  const beadSlot = { ...(slots.bead ?? {}) };
  if (fields.bead_material !== undefined) beadSlot.material = fields.bead_material ?? undefined;
  if (fields.bead_weight_mm !== undefined) beadSlot.size_mm = fields.bead_weight_mm ?? undefined;
  if (fields.bead_color !== undefined) beadSlot.color = fields.bead_color ?? undefined;
  if (Object.keys(beadSlot).length) slots.bead = beadSlot;
  if (fields.body_color !== undefined) slots.body = { ...(slots.body ?? {}), color: fields.body_color ?? undefined };
  if (fields.rib_color !== undefined) slots.rib = { ...(slots.rib ?? {}), color: fields.rib_color ?? undefined };
  const hookSlot = { ...(slots.hook ?? {}) };
  if (fields.hook_style !== undefined) hookSlot.style = fields.hook_style ?? undefined;
  if (fields.hook_brand !== undefined) hookSlot.brand = fields.hook_brand ?? undefined;
  if (Object.keys(hookSlot).length) slots.hook = hookSlot;

  const updates: Record<string, unknown> = {};
  if (fields.size !== undefined) updates.size = fields.size;
  if (fields.display_name !== undefined) updates.nickname = fields.display_name;
  if (fields.notes !== undefined) updates.personal_notes = fields.notes;
  updates.slot_overrides = slots;

  const { data: updated, error } = await supabase
    .from("user_fly_configurations")
    .update(updates)
    .eq("id", variantId)
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, variant: configToVariant(updated as FlyConfiguration) };
}

export async function softDeleteVariants(
  variantIds: string[],
): Promise<{ deleted: number; error?: string }> {
  if (variantIds.length === 0) return { deleted: 0, error: "No configurations supplied." };
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("user_fly_configurations")
    .delete({ count: "exact" })
    .in("id", variantIds);
  if (error) return { deleted: 0, error: error.message };
  return { deleted: count ?? 0 };
}

// ────────────────────────────────────────────────────────────────────────────
// Pattern editing — proxies the `flies` row
// ────────────────────────────────────────────────────────────────────────────

export async function getPatternForEdit(patternId: string): Promise<Pattern | null> {
  return getPatternById(patternId);
}

export interface PatternUpdateFields {
  name?: string;
  slug?: string | null;
  category?: string | null;
  hook_style?: string | null;
  description?: string | null;
  history?: string | null;
  tying_overview?: string | null;
  fishing_tips?: string | null;
  base_materials?: MaterialSlot[];
  tying_steps?: TyingStep[];
  hero_image_url?: string | null;
  active_variant_axes?: string[] | null;
}

export async function updatePattern(
  patternId: string,
  fields: PatternUpdateFields,
): Promise<
  | { ok: true; pattern: Pattern; slugChanged: boolean; oldSlug: string | null }
  | { ok: false; error: string; status: 401 | 403 | 404 | 500 }
> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("flies")
    .select("id, slug")
    .eq("id", patternId)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Pattern not found.", status: 404 };
  const oldSlug = (existing as { slug: string | null }).slug;

  const updates: Record<string, unknown> = {};
  if (fields.name !== undefined) updates.name = fields.name;
  if (fields.slug !== undefined) updates.slug = fields.slug;
  if (fields.category !== undefined) updates.category = fields.category;
  if (fields.description !== undefined) updates.description = fields.description;
  if (fields.history !== undefined) updates.history = fields.history;
  if (fields.tying_overview !== undefined) updates.tying_overview = fields.tying_overview;
  if (fields.fishing_tips !== undefined) updates.fishing_tips = fields.fishing_tips;
  if (fields.base_materials !== undefined) updates.materials_list = fields.base_materials;
  if (fields.hero_image_url !== undefined) updates.hero_image_url = fields.hero_image_url;

  if (Object.keys(updates).length === 0) {
    const p = await getPatternById(patternId);
    return p
      ? { ok: true, pattern: p, slugChanged: false, oldSlug }
      : { ok: false, error: "Pattern vanished.", status: 404 };
  }

  const { data, error } = await supabase
    .from("flies")
    .update(updates)
    .eq("id", patternId)
    .select()
    .single();
  if (error) return { ok: false, error: error.message, status: 500 };
  const fly = data as Fly;

  if (fields.name !== undefined) {
    await supabase
      .from("catches")
      .update({ fly_name: fields.name }, { count: "exact" })
      .or(`canonical_fly_id.eq.${patternId},fly_pattern_id.eq.${patternId}`)
      .neq("fly_name", fields.name);
  }

  return {
    ok: true,
    pattern: flyToPattern(fly),
    slugChanged: fields.slug !== undefined && fields.slug !== oldSlug,
    oldSlug,
  };
}

export interface BulkCreateVariantsInput {
  pattern_id: string;
  sizes: string[];
  bead_colors?: string[];
  body_colors?: string[];
  bead_weights_mm?: number[];
  bead_materials?: BeadMaterial[];
  as_canonical?: boolean;
}

export async function bulkCreateVariants(
  input: BulkCreateVariantsInput,
): Promise<
  | { ok: true; variants: Variant[] }
  | { ok: false; error: string; status: 400 | 401 | 403 | 404 | 500 }
> {
  if (input.sizes.length === 0) return { ok: false, error: "At least one size is required.", status: 400 };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in.", status: 401 };

  const beadColors = input.bead_colors?.length ? input.bead_colors : [undefined];
  const bodyColors = input.body_colors?.length ? input.body_colors : [undefined];
  const beadWeights = input.bead_weights_mm?.length ? input.bead_weights_mm : [undefined];
  const beadMaterials = input.bead_materials?.length ? input.bead_materials : [undefined];

  const rows: Record<string, unknown>[] = [];
  for (const size of input.sizes) {
    for (const beadColor of beadColors) {
      for (const bodyColor of bodyColors) {
        for (const beadWeight of beadWeights) {
          for (const beadMaterial of beadMaterials) {
            rows.push({
              user_id: user.id,
              fly_id: input.pattern_id,
              size,
              slot_overrides: legacySpecToSlots({
                bead_color: beadColor,
                body_color: bodyColor,
                bead_weight_mm: beadWeight,
                bead_material: beadMaterial,
              }),
            });
          }
        }
      }
    }
  }

  const { data, error } = await supabase
    .from("user_fly_configurations")
    .insert(rows)
    .select();
  if (error) return { ok: false, error: error.message, status: 500 };
  return { ok: true, variants: ((data ?? []) as FlyConfiguration[]).map(configToVariant) };
}

export async function addVariantsToBoxWithQty(
  boxId: string,
  items: { variant_id: string; quantity: number }[],
): Promise<
  | { ok: true; addedToBox: number; stockRows: number }
  | { ok: false; error: string }
> {
  if (items.length === 0) return { ok: true, addedToBox: 0, stockRows: 0 };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const rows = items.map((i) => ({
    box_id: boxId,
    configuration_id: i.variant_id,
    user_id: user.id,
    sort_order: 0,
    added_at: new Date().toISOString(),
  }));
  const { error, count } = await supabase
    .from("fly_box_entries_v3")
    .upsert(rows, { onConflict: "box_id,configuration_id", count: "exact" });
  if (error) return { ok: false, error: error.message };

  // Optional target_count seed.
  for (const i of items) {
    if (i.quantity > 0) {
      await supabase
        .from("user_fly_configurations")
        .update({ target_count: Math.max(0, Math.floor(i.quantity)) })
        .eq("id", i.variant_id);
    }
  }
  return { ok: true, addedToBox: count ?? items.length, stockRows: items.length };
}

// ────────────────────────────────────────────────────────────────────────────
// Slug redirects — fly_slug_redirects (new table replaces fly_pattern_redirects)
// ────────────────────────────────────────────────────────────────────────────

export interface PatternRedirectHit {
  pattern_id: string;
  current_slug: string | null;
}

export async function lookupPatternRedirect(slug: string): Promise<PatternRedirectHit | null> {
  const supabase = await createClient();
  const { data: red } = await supabase
    .from("fly_slug_redirects")
    .select("to_slug")
    .eq("from_slug", slug)
    .maybeSingle();
  if (!red) return null;
  const toSlug = (red as { to_slug: string | null }).to_slug;
  if (!toSlug) return null;
  const { data: fly } = await supabase
    .from("flies")
    .select("id, slug")
    .eq("slug", toSlug)
    .maybeSingle();
  if (!fly) return null;
  return {
    pattern_id: (fly as { id: string }).id,
    current_slug: (fly as { slug: string | null }).slug,
  };
}

export async function insertPatternRedirect(oldSlug: string, patternId: string): Promise<boolean> {
  if (!oldSlug) return true;
  const supabase = await createClient();
  const { data: fly } = await supabase
    .from("flies")
    .select("slug")
    .eq("id", patternId)
    .maybeSingle();
  const toSlug = (fly as { slug: string | null } | null)?.slug;
  if (!toSlug) return false;
  const { error } = await supabase
    .from("fly_slug_redirects")
    .upsert({ from_slug: oldSlug, to_slug: toSlug }, { onConflict: "from_slug" });
  return !error;
}
