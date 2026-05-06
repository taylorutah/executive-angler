/**
 * resolveFlyForViewer — the single merge layer for canonical fly + viewer
 * personalization. Every component that renders a fly should consume the
 * resolved view from this module rather than reaching into the raw canonical
 * + user_fly_box rows itself. That keeps "yours vs library" decisions in one
 * place and lets the canonical /flies/[slug] page swap views via a single
 * `viewMode` flag.
 */
import type { CanonicalFly } from "@/types/entities";
import type { RecipeIngredient, RecipeRole } from "@/types/materials";

export type ViewMode = "yours" | "library";

export interface FlyBoxRow {
  id: string;
  personalizations: Personalizations | null;
  preferred_sizes: string[] | null;
  preferred_colors?: string[] | null;
  personal_notes: string | null;
  custom_image_url: string | null;
  custom_name: string | null;
  is_favorite?: boolean | null;
  is_tie_next?: boolean | null;
  /** Variant identity (post-2026-05-07 multi-variant migration) */
  variant_label?: string | null;
  is_primary?: boolean | null;
  variant_sort_order?: number | null;
  tied_count?: number | null;
  tie_next_status?: string | null;
  tie_next_target_qty?: number | null;
  tie_next_notes?: string | null;
}

export interface Personalizations {
  [slot: string]: PersonalizationSlot | undefined;
}

export interface PersonalizationSlot {
  style?: string;
  size?: string;
  color?: string;
  brand?: string;
  denier?: string;
  model?: string;
  // Free-form extra keys are allowed; the UI displays them as "label: value".
  [key: string]: string | undefined;
}

export interface ResolvedField<T> {
  value: T;
  source: "canonical" | "yours";
  /** The canonical fallback — useful for "Reset to library" UI. */
  canonical?: T;
}

export interface ResolvedRecipeRow {
  /** Stable slot key — e.g. "hook", "bead", "thread". Lower-snake. */
  slot: string;
  /** Display label as it appears on the canonical (preserves casing). */
  label: string;
  /** Canonical default text — e.g. "Tungsten Slotted Bead 3.3mm Silver". */
  canonicalText: string;
  /** Resolved primary text — yours when overridden, otherwise canonical. */
  text: string;
  /** Optional structured ingredient data when the canonical has it. */
  ingredient?: RecipeIngredient;
  /** Whether the user has any override on this slot. */
  source: "canonical" | "yours";
  /** Detail bits the user supplied (brand/model/size/etc.). */
  yoursDetails?: PersonalizationSlot;
  /** Whether this row is optional in the canonical recipe. */
  isOptional?: boolean;
}

export interface ResolvedFly {
  id: string;
  slug: string;
  name: string;
  category: CanonicalFly["category"];
  tagline?: string;
  description: string;

  /** Hero image — yours if Pro user uploaded one, else canonical. */
  heroImageUrl: ResolvedField<string | undefined>;
  /** Display name — yours if user set custom_name, else canonical name. */
  displayName: ResolvedField<string>;

  /** Sizes the user actually ties; falls back to canonical.sizes. */
  sizes: ResolvedField<string[]>;
  /** Colors — canonical-only today (no `preferred_colors` UI yet). */
  colors: ResolvedField<string[]>;
  /** Bead options — canonical-only. */
  beadOptions: ResolvedField<string[]>;
  /** Hook styles — canonical-only. */
  hookStyles: ResolvedField<string[]>;

  /**
   * Recipe rows merged from canonical's structured ingredients (or the older
   * materials_list jsonb fallback) with viewer overrides applied per slot.
   */
  recipe: ResolvedRecipeRow[];

  /** Personal notes attached by the viewer. Canonical-only `tying_overview` separately. */
  personalNotes?: string;

  /** Whether the fly is in the viewer's box at all. */
  isInBox: boolean;
  /** The fly box row id — present when isInBox. */
  flyBoxId?: string;
  /** Whether the row is queued to tie. */
  isTieNext: boolean;
  /** Number of fields the viewer has overridden. Used to nudge the
   *  "promote to personal pattern" prompt. */
  deviationCount: number;
  /** The view mode the resolver was called with — passed through for
   *  components that conditionally render based on it. */
  viewMode: ViewMode;
}

const SLOT_ALIASES: Record<string, string> = {
  hook: "hook",
  bead: "bead",
  thread: "thread",
  body: "body",
  tail: "tail",
  wing: "wing",
  hackle: "hackle",
  rib: "rib",
  ribbing: "rib",
  tag: "tag",
  wingcase: "wingcase",
  "wing case": "wingcase",
  hotspot: "hotspot",
  "hot spot": "hotspot",
  collar: "collar",
  thorax: "thorax",
  abdomen: "abdomen",
  shellback: "shellback",
  legs: "legs",
  antennae: "antennae",
  post: "post",
  head: "head",
  eye: "eye",
  dubbing: "dubbing",
};

/**
 * Heuristic — pick a stable slot key from a free-form material label like
 * "BODY (Optional)" → "body". Falls back to a normalised first word so we
 * never collide unrelated slots even when canonical adds new ones.
 */
export function deriveSlotKey(materialLabel: string): string {
  const normalised = (materialLabel || "")
    .toLowerCase()
    .replace(/\(optional\)/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim();
  if (!normalised) return "material";

  // First check exact alias matches (most specific).
  if (SLOT_ALIASES[normalised]) return SLOT_ALIASES[normalised];

  // Then try partial matches — multi-word ones first so "wing case"
  // isn't shadowed by "wing".
  const sortedKeys = Object.keys(SLOT_ALIASES).sort(
    (a, b) => b.length - a.length,
  );
  for (const alias of sortedKeys) {
    if (normalised.includes(alias)) return SLOT_ALIASES[alias];
  }

  return normalised.split(/\s+/)[0];
}

function nonEmptyArray<T>(arr: T[] | null | undefined): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

function joinDetails(slot: PersonalizationSlot): string {
  const ordered = [
    slot.style,
    slot.size,
    slot.color,
    slot.brand,
    slot.denier,
    slot.model,
  ].filter((s): s is string => Boolean(s && s.trim()));
  // Append any free-form extra keys not in the standard set.
  const extras = Object.entries(slot)
    .filter(
      ([k, v]) =>
        v &&
        !["style", "size", "color", "brand", "denier", "model"].includes(k),
    )
    .map(([, v]) => v as string);
  return [...ordered, ...extras].join(" ").trim();
}

function formatIngredientCanonical(ing: RecipeIngredient): string {
  // Reproduce the canonical "Tungsten Slotted Bead 3.3mm Silver" style label.
  const name = ing.material?.name || ing.material_name || "";
  const brand = ing.material?.brand;
  const size = ing.size_choice;
  const color = ing.color_choice;
  return [name, brand, size, color]
    .filter((v): v is string => Boolean(v && String(v).trim()))
    .join(" ")
    .trim();
}

interface ResolveInput {
  canonical: CanonicalFly;
  flyBox: FlyBoxRow | null;
  ingredients?: RecipeIngredient[];
  viewMode?: ViewMode;
}

/**
 * Pure function. No DB access — caller pre-fetches and passes in.
 * `viewMode` defaults to "yours" when the fly is in the box, "library" otherwise.
 */
export function resolveFlyForViewer(input: ResolveInput): ResolvedFly {
  const { canonical, flyBox, ingredients } = input;
  const isInBox = !!flyBox;
  const personalizations = (flyBox?.personalizations ?? {}) as Personalizations;

  const resolvedView: ViewMode =
    input.viewMode ?? (isInBox ? "yours" : "library");
  const showYours = resolvedView === "yours" && isInBox;

  // Hero image — yours if user uploaded a custom image AND we're in yours view.
  const heroImageUrl: ResolvedField<string | undefined> = (() => {
    if (showYours && flyBox?.custom_image_url) {
      return {
        value: flyBox.custom_image_url,
        source: "yours",
        canonical: canonical.heroImageUrl,
      };
    }
    return {
      value: canonical.heroImageUrl,
      source: "canonical",
      canonical: canonical.heroImageUrl,
    };
  })();

  // Display name — yours if custom_name set.
  const displayName: ResolvedField<string> = (() => {
    if (showYours && flyBox?.custom_name && flyBox.custom_name.trim()) {
      return {
        value: flyBox.custom_name.trim(),
        source: "yours",
        canonical: canonical.name,
      };
    }
    return {
      value: canonical.name,
      source: "canonical",
      canonical: canonical.name,
    };
  })();

  // Sizes — yours if preferred_sizes is non-empty.
  const sizes: ResolvedField<string[]> = (() => {
    if (showYours && nonEmptyArray(flyBox?.preferred_sizes)) {
      return {
        value: flyBox!.preferred_sizes!,
        source: "yours",
        canonical: canonical.sizes,
      };
    }
    return {
      value: canonical.sizes,
      source: "canonical",
      canonical: canonical.sizes,
    };
  })();

  // Colors / bead / hook style — canonical-only today; we surface them as
  // ResolvedField so future personalisation can plug in cleanly.
  const colors: ResolvedField<string[]> = {
    value: canonical.colors,
    source: "canonical",
    canonical: canonical.colors,
  };
  const beadOptions: ResolvedField<string[]> = {
    value: canonical.beadOptions,
    source: "canonical",
    canonical: canonical.beadOptions,
  };
  const hookStyles: ResolvedField<string[]> = {
    value: canonical.hookStyles,
    source: "canonical",
    canonical: canonical.hookStyles,
  };

  // Build the recipe rows from whichever canonical source is available.
  const recipe = buildResolvedRecipe({
    canonical,
    ingredients,
    personalizations,
    showYours,
  });

  // Deviation count — number of personalised slots + (preferred_sizes ? 1 : 0)
  // + (custom_image_url ? 1 : 0) + (custom_name ? 1 : 0).
  const personalisedSlotCount = Object.values(personalizations).filter(
    (slot) =>
      slot && Object.values(slot).some((v) => v && String(v).trim() !== ""),
  ).length;
  const deviationCount =
    personalisedSlotCount +
    (nonEmptyArray(flyBox?.preferred_sizes) ? 1 : 0) +
    (flyBox?.custom_image_url ? 1 : 0) +
    (flyBox?.custom_name ? 1 : 0);

  return {
    id: canonical.id,
    slug: canonical.slug,
    name: canonical.name,
    category: canonical.category,
    tagline: canonical.tagline,
    description: canonical.description,
    heroImageUrl,
    displayName,
    sizes,
    colors,
    beadOptions,
    hookStyles,
    recipe,
    personalNotes:
      showYours && flyBox?.personal_notes ? flyBox.personal_notes : undefined,
    isInBox,
    flyBoxId: flyBox?.id,
    isTieNext: !!flyBox?.is_tie_next,
    deviationCount,
    viewMode: resolvedView,
  };
}

interface BuildRecipeInput {
  canonical: CanonicalFly;
  ingredients?: RecipeIngredient[];
  personalizations: Personalizations;
  showYours: boolean;
}

function buildResolvedRecipe(input: BuildRecipeInput): ResolvedRecipeRow[] {
  const { canonical, ingredients, personalizations, showYours } = input;

  // Prefer structured fly_recipe_ingredients when present — that's the
  // source of truth for the canonical recipe shown in the screenshot.
  if (nonEmptyArray(ingredients)) {
    const sorted = [...ingredients].sort(
      (a, b) => a.step_position - b.step_position,
    );
    const seen = new Set<string>();
    return sorted.map((ing) => {
      const slot = (ing.role as RecipeRole) || deriveSlotKey(ing.material_name || "");
      // Dedupe by slot only when role isn't a useful disambiguator
      // (we don't dedupe — recipe rows are already step-positioned).
      const slotKey = String(slot);
      seen.add(slotKey);
      const canonicalText = formatIngredientCanonical(ing);
      const personal = personalizations[slotKey];
      const yoursDetails =
        personal &&
        Object.values(personal).some((v) => v && String(v).trim() !== "")
          ? personal
          : undefined;
      const yoursText = yoursDetails ? joinDetails(yoursDetails) : "";
      const useYours = showYours && yoursText.length > 0;
      return {
        slot: slotKey,
        label: ing.role.toUpperCase(),
        canonicalText,
        text: useYours ? yoursText : canonicalText,
        ingredient: ing,
        source: useYours ? "yours" : "canonical",
        yoursDetails,
        isOptional: ing.is_optional,
      };
    });
  }

  // Fallback: build rows from the older materials_list jsonb on canonical.
  const list = canonical.materialsList ?? [];
  if (list.length === 0) {
    // Final fallback skeleton so the UI has something to render.
    const skeleton = ["Hook", "Bead", "Thread", "Body"];
    return skeleton.map((label) => {
      const slot = deriveSlotKey(label);
      const personal = personalizations[slot];
      const yoursText = personal ? joinDetails(personal) : "";
      const useYours = showYours && yoursText.length > 0;
      return {
        slot,
        label: label.toUpperCase(),
        canonicalText: "",
        text: useYours ? yoursText : "",
        source: useYours ? "yours" : "canonical",
        yoursDetails: useYours ? personal : undefined,
      };
    });
  }

  return list.map((m) => {
    const slot = deriveSlotKey(m.material);
    const personal = personalizations[slot];
    const yoursDetails =
      personal &&
      Object.values(personal).some((v) => v && String(v).trim() !== "")
        ? personal
        : undefined;
    const yoursText = yoursDetails ? joinDetails(yoursDetails) : "";
    const useYours = showYours && yoursText.length > 0;
    return {
      slot,
      label: m.material.toUpperCase(),
      canonicalText: m.description ?? "",
      text: useYours ? yoursText : (m.description ?? ""),
      source: useYours ? "yours" : "canonical",
      yoursDetails,
    };
  });
}

/**
 * Quick summary string for the "In your fly box" badge.
 * "20, 18, 16 · hook Eupheng 9230 · bead Tungsten 3.3mm copper · thread 8/0 black"
 */
export function summarizePersonalization(
  personalizations: Personalizations,
  preferredSizes: string[] | null,
): string {
  const parts: string[] = [];
  if (nonEmptyArray(preferredSizes)) parts.push(preferredSizes.join(", "));
  const order = ["hook", "bead", "thread", "body", "tail", "wing", "hackle"];
  for (const slot of order) {
    const v = personalizations[slot];
    if (!v) continue;
    const detail = joinDetails(v);
    if (detail) parts.push(`${slot} ${detail}`);
  }
  // Append any non-standard slots so power users can see them.
  for (const [slot, v] of Object.entries(personalizations)) {
    if (order.includes(slot)) continue;
    if (!v) continue;
    const detail = joinDetails(v);
    if (detail) parts.push(`${slot} ${detail}`);
  }
  return parts.join(" · ");
}
