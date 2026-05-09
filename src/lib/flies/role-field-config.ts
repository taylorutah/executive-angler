import type { MaterialCategory, RecipeRole } from "@/types/materials";

export type RoleField =
  | "size"
  | "color"
  | "quantity"
  | "weight"
  | "materialType"
  | "finish"
  | "length";

export interface RoleFieldConfig {
  label: string;
  /** Which tying_materials.category to filter the picker to. */
  materialCategory?: MaterialCategory;
  /** Which inputs to render, in display order. */
  fields: RoleField[];
  /** Default value for quantity when not user-editable (e.g. "1" for hook). */
  quantityDefault?: string;
  /** Per-field placeholder hints. */
  placeholders?: Partial<Record<RoleField, string>>;
}

/**
 * Single source of truth for which fields a recipe step should render given
 * its role. Used by the recipe builder on the New/Edit Fly page, the variant
 * editor, and the workbench so every material-editing surface stays in sync.
 *
 * Rationale: a hook has no color, thread has no quantity, dubbing has no size,
 * etc. Showing every input on every row was wasted space and forced users to
 * mentally filter "which of these fields is relevant for this material?".
 */
export const ROLE_FIELDS: Record<RecipeRole, RoleFieldConfig> = {
  hook: {
    label: "Hook",
    materialCategory: "hook",
    fields: ["size", "finish"],
    quantityDefault: "1",
    placeholders: { size: "#16", finish: "barbless" },
  },
  bead: {
    label: "Bead",
    materialCategory: "bead",
    fields: ["size", "materialType", "color"],
    quantityDefault: "1",
    placeholders: { size: "3.2mm", materialType: "tungsten", color: "copper" },
  },
  thread: {
    label: "Thread",
    materialCategory: "thread",
    fields: ["weight", "color"],
    placeholders: { weight: "8/0", color: "olive" },
  },
  tail: {
    label: "Tail",
    materialCategory: "tail",
    fields: ["color", "size"],
    placeholders: { color: "pheasant", size: "match hook" },
  },
  abdomen: {
    label: "Abdomen",
    materialCategory: "dubbing",
    fields: ["color"],
    placeholders: { color: "olive" },
  },
  thorax: {
    label: "Thorax",
    materialCategory: "dubbing",
    fields: ["color"],
    placeholders: { color: "black" },
  },
  body: {
    label: "Body",
    materialCategory: "body",
    fields: ["color"],
    placeholders: { color: "olive" },
  },
  ribbing: {
    label: "Ribbing",
    materialCategory: "ribbing",
    fields: ["color"],
    placeholders: { color: "copper" },
  },
  shellback: {
    label: "Shellback / Wing Case",
    fields: ["color"],
    placeholders: { color: "black" },
  },
  wing: {
    label: "Wing",
    materialCategory: "wing",
    fields: ["color", "size"],
    placeholders: { color: "white", size: "shank" },
  },
  hackle: {
    label: "Hackle",
    materialCategory: "feather",
    fields: ["color", "size"],
    placeholders: { color: "grizzly", size: "match hook" },
  },
  collar: {
    label: "Collar",
    materialCategory: "feather",
    fields: ["color"],
    placeholders: { color: "partridge" },
  },
  legs: {
    label: "Legs",
    materialCategory: "rubber",
    fields: ["color"],
    placeholders: { color: "barred ginger" },
  },
  head: {
    label: "Head",
    fields: ["color"],
    placeholders: { color: "black" },
  },
  hotspot: {
    label: "Hotspot",
    materialCategory: "dubbing",
    fields: ["color"],
    placeholders: { color: "fl. orange" },
  },
  tag: {
    label: "Tag",
    fields: ["color"],
    placeholders: { color: "fl. green" },
  },
  eye: {
    label: "Eyes",
    materialCategory: "eye",
    fields: ["size", "color"],
    quantityDefault: "pair",
    placeholders: { size: "small", color: "silver" },
  },
  post: {
    label: "Post",
    materialCategory: "synthetic",
    fields: ["color"],
    placeholders: { color: "white" },
  },
  antennae: {
    label: "Antennae",
    fields: ["color"],
    placeholders: { color: "black" },
  },
};

export const RECIPE_ROLES: RecipeRole[] = Object.keys(ROLE_FIELDS) as RecipeRole[];

export function getRoleFields(role: RecipeRole): RoleFieldConfig {
  return ROLE_FIELDS[role] ?? { label: role, fields: ["color"] };
}

/** Field-label override per role (optional). */
export function getFieldLabel(field: RoleField): string {
  switch (field) {
    case "size":
      return "Size";
    case "color":
      return "Color";
    case "quantity":
      return "Qty";
    case "weight":
      return "Weight";
    case "materialType":
      return "Material";
    case "finish":
      return "Finish";
    case "length":
      return "Length";
  }
}
