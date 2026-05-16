/**
 * Single source of truth for converting between the three recipe shapes:
 *
 *   RecipeStep[]              — what the RecipeBuilder UI emits
 *   MaterialSlot[]            — what flies.materials_list (jsonb) stores
 *   fly_recipe_ingredients[]  — the structured row-per-slot table
 *
 * Used by:
 *   - FlyPatternForm (RecipeStep[] ↔ FormData)
 *   - PATCH /api/admin/flies/[id] (RecipeStep[] → ingredients + materials_list)
 *   - scripts/reconcile-recipe-stores (ingredients ↔ materials_list)
 *
 * Invariants:
 *   - MaterialSlot.material is the human-rendered spec ("Dohiku HDJ, #16")
 *   - MaterialSlot.brand is set ONLY for slots where the brand convention
 *     calls for it (hooks/threads/specialty dubbings); beads/CDC/hackle/
 *     generic wire stay spec-only per feedback_fly_recipe_conventions.md
 *   - Structured fields (color_choice, size_choice, material_type, finish,
 *     material_id, material_name) are preserved as extra keys on each slot
 *     so the round-trip materials_list → RecipeStep is lossless
 */
import type { RecipeStep } from "@/components/flies/RecipeBuilder";
import type { MaterialSlot } from "@/types/flies";
import type { RecipeRole } from "@/types/materials";

/** Minimal shape of a row from fly_recipe_ingredients (with material joined). */
export interface IngredientRow {
  id?: string;
  material_id?: string | null;
  material_name?: string | null;
  step_position?: number | null;
  role: string;
  quantity?: string | null;
  notes?: string | null;
  color_choice?: string | null;
  size_choice?: string | null;
  is_optional?: boolean | null;
  material?: {
    id?: string;
    name?: string | null;
    brand?: string | null;
    category?: string | null;
    material_type?: string | null;
    finish?: string | null;
  } | null;
}

/** Insert shape for fly_recipe_ingredients (canonical recipes). */
export interface IngredientInsert {
  canonical_fly_id: string;
  material_id: string | null;
  material_name: string;
  step_position: number;
  role: string;
  color_choice: string | null;
  size_choice: string | null;
  quantity: string | null;
  notes: string | null;
  is_optional: boolean;
}

/** RecipeBuilder uses "ribbing"; MaterialSlot uses "rib". */
const ROLE_TO_SLOT: Record<string, string> = {
  ribbing: "rib",
};
const SLOT_TO_ROLE: Record<string, RecipeRole> = {
  rib: "ribbing",
};

function roleToSlot(role: string): string {
  return ROLE_TO_SLOT[role] ?? role;
}

function slotToRole(slot: string): RecipeRole {
  return (SLOT_TO_ROLE[slot] ?? slot) as RecipeRole;
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Build the rendered material display string for a slot. */
function composeDisplay(step: RecipeStep): string {
  // Bead slots use "Material size mm color shape" format.
  if (step.role === "bead") {
    const parts = [
      step.materialTypeChoice ? capitalize(step.materialTypeChoice) : "",
      step.sizeChoice ? `${step.sizeChoice}mm` : "",
      step.colorChoice || "",
      step.finishChoice || "",
    ].filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  // All other slots: material name + size + color.
  const parts = [
    step.materialName || step.material?.name || "",
    step.sizeChoice || "",
    step.colorChoice || "",
  ].filter(Boolean);
  return parts.join(" ").trim();
}

/**
 * Build a fresh empty RecipeStep — mirrors the shape the legacy-recipe-adapter
 * uses so the RecipeBuilder can hydrate without surprises.
 */
let stepCounter = 1;
function newStep(role: RecipeRole): RecipeStep {
  return {
    id: `step-canonical-${Date.now()}-${stepCounter++}`,
    role,
    material: null,
    materialName: "",
    colorChoice: "",
    sizeChoice: "",
    quantity: "",
    weightChoice: "",
    materialTypeChoice: "",
    finishChoice: "",
    brandChoice: "",
    notes: "",
    isOptional: false,
  };
}

/**
 * RecipeStep[] → MaterialSlot[]. Structured RecipeBuilder fields are
 * preserved as extra keys (size_choice, color_choice, material_type, finish,
 * brand_choice, role) so the canonical fly editor can round-trip.
 */
export function recipeStepsToMaterialSlots(
  steps: RecipeStep[],
): MaterialSlot[] {
  return steps.map((s) => {
    const slot = roleToSlot(s.role);
    const display = composeDisplay(s);
    const brand = (s.brandChoice || s.material?.brand || "").trim();
    const out: MaterialSlot & Record<string, unknown> = {
      slot,
      material: display,
      ...(brand ? { brand } : {}),
      ...(s.notes ? { description: s.notes } : {}),
      ...(s.isOptional ? { is_optional: true } : {}),
    };
    // Preserved structured fields — ignored by the renderer, used on edit.
    if (s.role !== roleToSlot(s.role)) out.role = s.role;
    if (s.colorChoice) out.color_choice = s.colorChoice;
    if (s.sizeChoice) out.size_choice = s.sizeChoice;
    if (s.materialTypeChoice) out.material_type = s.materialTypeChoice;
    if (s.finishChoice) out.finish = s.finishChoice;
    if (s.quantity) out.quantity = s.quantity;
    if (s.material?.id) out.material_id = s.material.id;
    if (s.materialName) out.material_name = s.materialName;
    return out;
  });
}

/**
 * IngredientRow[] → MaterialSlot[]. Used by the reconciliation script to
 * project fly_recipe_ingredients into the denormalized materials_list cache.
 *
 * Convention (per feedback_fly_recipe_conventions.md):
 *   - hook/thread/dubbing slots get brand surfaced when available
 *   - bead/CDC/hackle/wire slots stay spec-only
 */
const BRAND_VISIBLE_SLOTS = new Set([
  "hook",
  "thread",
  "dubbing",
  "body",
]);
const GENERIC_BRAND_VALUES = new Set([
  "generic",
  "",
]);

function isGenericBrand(b: string | null | undefined): boolean {
  if (!b) return true;
  return GENERIC_BRAND_VALUES.has(b.trim().toLowerCase());
}

export function ingredientsToMaterialSlots(
  ingredients: IngredientRow[] | null | undefined,
): MaterialSlot[] {
  if (!ingredients || ingredients.length === 0) return [];
  const sorted = [...ingredients].sort(
    (a, b) => (a.step_position ?? 0) - (b.step_position ?? 0),
  );
  return sorted.map((ing) => {
    const role = String(ing.role || "other");
    const slot = roleToSlot(role);

    // Prefer the curated material_name (free text the librarian set) over the
    // joined tying_materials.name. Falls back to the joined name if the row
    // was created without a custom display string.
    const display =
      (ing.material_name && ing.material_name.trim()) ||
      ing.material?.name ||
      "—";

    const brand = ing.material?.brand;
    const showBrand =
      BRAND_VISIBLE_SLOTS.has(slot) && !isGenericBrand(brand);

    const out: MaterialSlot & Record<string, unknown> = {
      slot,
      material: display,
    };
    if (showBrand && brand) out.brand = brand;
    if (ing.notes) out.description = ing.notes;
    if (ing.is_optional) out.is_optional = true;

    // Preserved structured fields (lossless round-trip)
    if (role !== slot) out.role = role;
    if (ing.material_id) out.material_id = ing.material_id;
    if (ing.material_name) out.material_name = ing.material_name;
    if (ing.color_choice) out.color_choice = ing.color_choice;
    if (ing.size_choice) out.size_choice = ing.size_choice;
    if (ing.material?.material_type) out.material_type = ing.material.material_type;
    if (ing.material?.finish) out.finish = ing.material.finish;
    if (ing.quantity) out.quantity = ing.quantity;
    return out;
  });
}

/**
 * MaterialSlot[] → IngredientInsert[]. Used by the reconciliation script to
 * backfill ingredient rows for canonicals that only have materials_list
 * data, and by the admin PATCH route to write new recipes.
 *
 * Note: this does NOT match material_name against tying_materials to set
 * material_id — that's a separate lookup the caller does because it needs
 * DB access. We leave material_id as null here and let the caller fill it.
 */
export function materialSlotsToIngredientInserts(
  slots: MaterialSlot[] | null | undefined,
  canonicalFlyId: string,
): IngredientInsert[] {
  if (!slots || slots.length === 0) return [];
  return slots.map((raw, i) => {
    const m = raw as MaterialSlot & Record<string, unknown>;
    const role = typeof m.role === "string" && m.role
      ? m.role
      : slotToRole(String(m.slot || "other"));
    return {
      canonical_fly_id: canonicalFlyId,
      material_id: typeof m.material_id === "string" ? m.material_id : null,
      material_name:
        (typeof m.material_name === "string" && m.material_name) ||
        m.material ||
        "—",
      step_position: i + 1,
      role,
      color_choice: typeof m.color_choice === "string" ? m.color_choice : null,
      size_choice: typeof m.size_choice === "string" ? m.size_choice : null,
      quantity: typeof m.quantity === "string" ? m.quantity : null,
      notes: typeof m.description === "string" ? m.description : null,
      is_optional: m.is_optional === true,
    };
  });
}

/** RecipeStep[] → IngredientInsert[]. Used by the admin PATCH route. */
export function recipeStepsToIngredientInserts(
  steps: RecipeStep[],
  canonicalFlyId: string,
): IngredientInsert[] {
  return steps.map((s, i) => ({
    canonical_fly_id: canonicalFlyId,
    material_id: s.material?.id || null,
    material_name:
      (s.materialName && s.materialName.trim()) || s.material?.name || "—",
    step_position: i + 1,
    role: s.role,
    color_choice: s.colorChoice || null,
    size_choice: s.sizeChoice || null,
    quantity: s.quantity || null,
    notes: s.notes || null,
    is_optional: s.isOptional === true,
  }));
}

/**
 * MaterialSlot[] → RecipeStep[]. Reads the structured fields when present
 * (slots written by this module round-trip cleanly). For legacy slots that
 * only have `material` + `brand`, drops everything into materialName.
 */
export function materialSlotsToRecipeSteps(
  slots: MaterialSlot[] | null | undefined,
): RecipeStep[] {
  if (!slots || slots.length === 0) return [];
  return slots.map((raw) => {
    const m = raw as MaterialSlot & Record<string, unknown>;
    const role = slotToRole(String(m.slot || "other"));
    const step = newStep(role);

    if (typeof m.material_name === "string") step.materialName = m.material_name;
    else if (typeof m.material === "string") step.materialName = m.material;

    if (typeof m.color_choice === "string") step.colorChoice = m.color_choice;
    if (typeof m.size_choice === "string") step.sizeChoice = m.size_choice;
    if (typeof m.material_type === "string") step.materialTypeChoice = m.material_type;
    if (typeof m.finish === "string") step.finishChoice = m.finish;
    if (typeof m.quantity === "string") step.quantity = m.quantity;
    if (typeof m.brand === "string") step.brandChoice = m.brand;
    if (typeof m.description === "string") step.notes = m.description;
    if (m.is_optional === true) step.isOptional = true;

    return step;
  });
}
