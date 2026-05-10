import type { SupabaseClient } from "@supabase/supabase-js";

const TYPE_TO_CATEGORY: Record<string, string> = {
  "Dry Fly": "dry",
  "Nymph": "nymph",
  "Streamer": "streamer",
  "Emerger": "emerger",
  "Wet Fly": "wet",
  "Terrestrial": "terrestrial",
  "Egg": "egg",
  "Midge": "midge",
};

export function mapTypeToCategory(type: string | null | undefined): string | null {
  if (!type) return null;
  return TYPE_TO_CATEGORY[type] ?? type.toLowerCase();
}

export function slugifyFlyName(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "fly"
  );
}

export async function ensureUniqueCanonicalSlug(
  serviceClient: SupabaseClient,
  baseSlug: string
): Promise<string> {
  const base = baseSlug || "fly";
  for (let i = 1; i < 100; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    const { data } = await serviceClient
      .from("canonical_flies")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export type PromoteInput = {
  /** Personal fly_patterns row id; gets back-linked via promoted_to_canonical_id. */
  sourcePatternId: string | null;
  proposed: {
    name: string;
    /** Personal pattern type label (e.g. "Nymph") — mapped to canonical category. */
    type?: string | null;
    /** Or pass the canonical category directly (e.g. "nymph"). Wins over `type`. */
    category?: string | null;
    description?: string | null;
    tagline?: string | null;
    history?: string | null;
    tyingOverview?: string | null;
    fishingTips?: string | null;
    materials?: string | null;
    videoUrl?: string | null;
    heroImageUrl?: string | null;
    sizes?: string[] | null;
    beadOptions?: string[] | null;
    colors?: string[] | null;
    imitates?: string[] | null;
    effectiveSpecies?: string[] | null;
    waterTypes?: string[] | null;
    tyingSteps?: unknown;
    materialsList?: unknown;
    originCredit?: string | null;
    parentCanonicalId?: string | null;
  };
};

export type PromoteResult =
  | { ok: true; canonicalId: string }
  | { ok: false; error: string };

/**
 * Insert a new row into canonical_flies from a proposed pattern (admin-direct
 * or approved submission). Optionally back-links the source personal pattern
 * via fly_patterns.promoted_to_canonical_id so the user's pattern detail page
 * can show "this fly is in the library now."
 */
export async function promoteToCanonical(
  serviceClient: SupabaseClient,
  input: PromoteInput
): Promise<PromoteResult> {
  const slug = await ensureUniqueCanonicalSlug(serviceClient, slugifyFlyName(input.proposed.name));
  const category =
    input.proposed.category ??
    mapTypeToCategory(input.proposed.type ?? null) ??
    "nymph";

  const insertRow: Record<string, unknown> = {
    slug,
    name: input.proposed.name,
    category,
    description: input.proposed.description || "Submitted by community.",
    tagline: input.proposed.tagline ?? null,
    history: input.proposed.history ?? null,
    tying_overview: input.proposed.tyingOverview ?? null,
    fishing_tips: input.proposed.fishingTips ?? null,
    sizes:
      input.proposed.sizes && input.proposed.sizes.length > 0
        ? input.proposed.sizes
        : ["14", "16", "18"],
    colors: input.proposed.colors ?? null,
    bead_options: input.proposed.beadOptions ?? null,
    imitates: input.proposed.imitates ?? null,
    effective_species: input.proposed.effectiveSpecies ?? null,
    water_types: input.proposed.waterTypes ?? null,
    hero_image_url: input.proposed.heroImageUrl ?? null,
    video_url: input.proposed.videoUrl ?? null,
    tying_steps: input.proposed.tyingSteps ?? null,
    materials_list:
      input.proposed.materialsList ??
      (input.proposed.materials ? [{ material: input.proposed.materials }] : null),
    origin_credit: input.proposed.originCredit ?? null,
    related_fly_ids: input.proposed.parentCanonicalId
      ? [input.proposed.parentCanonicalId]
      : null,
  };
  Object.keys(insertRow).forEach((k) => insertRow[k] === null && delete insertRow[k]);

  const { data, error } = await serviceClient
    .from("canonical_flies")
    .insert(insertRow)
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: error?.message ?? "Insert failed" };

  if (input.sourcePatternId) {
    await serviceClient
      .from("fly_patterns")
      .update({ promoted_to_canonical_id: data.id })
      .eq("id", input.sourcePatternId);
  }

  return { ok: true, canonicalId: data.id as string };
}
