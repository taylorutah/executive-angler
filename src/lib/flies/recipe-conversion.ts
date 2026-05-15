/**
 * Convert between the RecipeBuilder's RecipeStep[] (used by FlyPatternForm /
 * personal patterns) and the canonical fly's materials_list (MaterialSlot[]
 * in the `flies` table).
 *
 * The canonical table only stores MaterialSlot fields (slot, material, brand,
 * description, is_optional), but we preserve the structured RecipeBuilder
 * fields (color_choice, size_choice, etc.) as extra keys on each slot so the
 * editor round-trips losslessly. The renderer at /flies/[slug] reads only
 * material / brand / description, so the extra keys are inert there.
 */
import type { RecipeStep } from "@/components/flies/RecipeBuilder";
import type { MaterialSlot } from "@/types/flies";
import type { RecipeRole } from "@/types/materials";

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
