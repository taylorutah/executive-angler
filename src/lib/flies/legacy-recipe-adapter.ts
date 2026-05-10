/**
 * Legacy recipe adapter — bridges the older fly_patterns column-per-slot model
 * (hook, bead_*, body_*, tail_*, etc.) into the structured fly_recipe_ingredients
 * model used by the RecipeBuilder.
 *
 * Two responsibilities:
 *  1. synthesizeStepsFromLegacy(pattern) — when a pattern has no ingredient
 *     rows yet, build initial recipe steps from the legacy columns so the user
 *     sees their existing data on first open. The next save persists them
 *     into fly_recipe_ingredients, completing the migration.
 *  2. ingredientsToSteps / hydrateBeadStep — convert API-shaped
 *     RecipeIngredient rows into the RecipeBuilder's step shape, and split
 *     the composed bead encoding (`material:shape`) back into separate
 *     fields for the bead row.
 */
import type { RecipeStep } from "@/components/flies/RecipeBuilder";
import type { RecipeIngredient, RecipeRole } from "@/types/materials";

let counter = 1;
function genId() {
  return `step-legacy-${Date.now()}-${counter++}`;
}

interface LegacyPatternFields {
  hook?: string | null;
  bead_material?: string | null;
  bead_size?: string | null;
  bead_size_mm?: number | string | null;
  bead_color?: string | string[] | null;
  body_color?: string | null;
  body_material?: string | null;
  tail_color?: string | null;
  thorax_color?: string | null;
  collar_color?: string | null;
  rib_material?: string | null;
  wing_material?: string | null;
  thread_color?: string | null;
}

function emptyStep(role: RecipeRole): RecipeStep {
  return {
    id: genId(),
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

function firstString(value: string | string[] | null | undefined): string {
  if (!value) return "";
  if (Array.isArray(value)) return value[0] ?? "";
  return value;
}

/**
 * Build initial recipe steps from a fly_patterns row's legacy columns.
 * Returns an empty array if no legacy data is present so the caller can fall
 * back to the default 3-step starter.
 */
export function synthesizeStepsFromLegacy(p: LegacyPatternFields): RecipeStep[] {
  const steps: RecipeStep[] = [];

  if (p.hook && p.hook.trim()) {
    const s = emptyStep("hook");
    s.materialName = p.hook.trim();
    steps.push(s);
  }

  const beadColor = firstString(p.bead_color);
  const beadSize = (p.bead_size_mm != null && String(p.bead_size_mm).trim())
    ? String(p.bead_size_mm).trim()
    : (p.bead_size ? String(p.bead_size).trim() : "");
  const beadMaterial = (p.bead_material || "").trim();

  if (beadColor || beadSize || beadMaterial) {
    const s = emptyStep("bead");
    s.colorChoice = beadColor;
    s.sizeChoice = beadSize;
    s.materialTypeChoice = beadMaterial.replace(/^slotted_/, "");
    s.finishChoice = beadMaterial.startsWith("slotted_") ? "slotted" : "";
    s.materialName = composeBeadName(s);
    steps.push(s);
  }

  if (p.thread_color && p.thread_color.trim()) {
    const s = emptyStep("thread");
    s.colorChoice = p.thread_color.trim();
    steps.push(s);
  }

  if (p.body_color || p.body_material) {
    const s = emptyStep("body");
    s.colorChoice = (p.body_color || "").trim();
    s.materialName = (p.body_material || "").trim();
    steps.push(s);
  }

  if (p.tail_color && p.tail_color.trim()) {
    const s = emptyStep("tail");
    s.colorChoice = p.tail_color.trim();
    steps.push(s);
  }

  if (p.thorax_color && p.thorax_color.trim()) {
    const s = emptyStep("thorax");
    s.colorChoice = p.thorax_color.trim();
    steps.push(s);
  }

  if (p.collar_color && p.collar_color.trim()) {
    const s = emptyStep("collar");
    s.colorChoice = p.collar_color.trim();
    steps.push(s);
  }

  if (p.rib_material && p.rib_material.trim()) {
    const s = emptyStep("ribbing");
    s.materialName = p.rib_material.trim();
    steps.push(s);
  }

  if (p.wing_material && p.wing_material.trim()) {
    const s = emptyStep("wing");
    s.materialName = p.wing_material.trim();
    steps.push(s);
  }

  return steps;
}

/**
 * Compose a display string for a bead step — used as material_name when there
 * is no underlying tying_materials row. Encodes material+shape so it round-
 * trips even though the schema doesn't have dedicated columns.
 *
 * Format: "{material}:{shape}|{display}" — e.g. "tungsten:slotted|Tungsten 3.2mm copper slotted"
 * The pipe-separated display half is purely decorative; only the prefix is
 * authoritative for splitting.
 */
export function composeBeadName(step: RecipeStep): string {
  const material = (step.materialTypeChoice || "").trim().toLowerCase();
  const shape = (step.finishChoice || "").trim().toLowerCase();
  if (!material && !shape) {
    // Fall back to the user-typed materialName (legacy free-text)
    return step.materialName || "";
  }
  const code = `${material}:${shape}`;
  const parts = [
    material ? capitalize(material) : "",
    step.sizeChoice ? `${step.sizeChoice}mm` : "",
    step.colorChoice || "",
    shape ? shape : "",
  ].filter(Boolean);
  const display = parts.join(" ");
  return display ? `${code}|${display}` : code;
}

/** Inverse of composeBeadName — split the prefix back into material + shape. */
export function parseBeadName(name: string | null | undefined): {
  material: string;
  shape: string;
  display: string;
} {
  if (!name) return { material: "", shape: "", display: "" };
  const [code, ...rest] = name.split("|");
  const display = rest.join("|") || code;
  if (code.includes(":")) {
    const [material, shape] = code.split(":");
    return {
      material: (material || "").trim(),
      shape: (shape || "").trim(),
      display,
    };
  }
  // Legacy bead with no encoded prefix — treat the whole thing as display.
  return { material: "", shape: "", display: name };
}

function capitalize(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

/**
 * Convert API ingredient rows into RecipeBuilder steps. Sorts by step_position
 * and applies the bead-name decoding so material/shape land in the right
 * fields.
 */
export function ingredientsToSteps(
  ingredients: RecipeIngredient[] | null | undefined,
): RecipeStep[] {
  if (!ingredients || ingredients.length === 0) return [];
  const sorted = [...ingredients].sort(
    (a, b) => (a.step_position ?? 0) - (b.step_position ?? 0),
  );
  return sorted.map((ing) => {
    const base: RecipeStep = {
      id: ing.id,
      role: ing.role,
      material: ing.material ?? null,
      materialName: ing.material_name ?? ing.material?.name ?? "",
      colorChoice: ing.color_choice ?? "",
      sizeChoice: ing.size_choice ?? "",
      quantity: ing.quantity ?? "",
      weightChoice: "",
      materialTypeChoice: "",
      finishChoice: "",
      brandChoice: ing.material?.brand ?? "",
      notes: ing.notes ?? "",
      isOptional: ing.is_optional ?? false,
    };
    if (ing.role === "bead") {
      const parsed = parseBeadName(ing.material_name);
      base.materialTypeChoice = parsed.material;
      base.finishChoice = parsed.shape;
      // If the linked tying_materials row has material_type/finish, prefer
      // them over the parsed prefix.
      if (ing.material) {
        if (ing.material.material_type) base.materialTypeChoice = ing.material.material_type.toLowerCase();
        if (ing.material.finish) base.finishChoice = ing.material.finish.toLowerCase();
      }
      // Drop the brand link so the bead row renders the simplified picker
      // and the next save commits the conversion.
      base.material = null;
    }
    return base;
  });
}
