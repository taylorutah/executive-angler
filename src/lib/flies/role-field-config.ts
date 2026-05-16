import type { MaterialCategory, RecipeRole } from "@/types/materials";

/**
 * The recipe builder renders rows in a fixed Salesforce-style table layout
 * with three meaningful column slots: SIZE, COLOR, DETAIL. Each role
 * declares which of the three columns it uses and what that column's input
 * actually represents (e.g. "weight" for thread, "materialType" for bead,
 * "finish" for hook).
 *
 * Rules of thumb (from the brief):
 *   - Hook → size + finish, no color, no qty
 *   - Bead → size + color + materialType (tungsten/brass/glass), no qty
 *   - Thread → weight + color, no size, no qty
 *   - Dubbing / abdomen / thorax / body → color only, no size, no qty
 *   - Tail / wing / hackle → color + size (size = match hook), no qty
 *   - Wire / ribbing / flash → color only
 *   - Eyes → size + color, qty defaults to "pair"
 */

export type DetailField = "weight" | "materialType" | "finish" | "quantity" | "length";

export interface RoleFieldConfig {
  label: string;
  /** tying_materials.category to filter the picker to (undefined = no filter). */
  materialCategory?: MaterialCategory;
  /** Show the SIZE input on this role? */
  showSize: boolean;
  /** Show the COLOR input on this role? */
  showColor: boolean;
  /** Which (if any) detail input fills the third column. */
  detail?: DetailField;
  /** Default value for the detail field when it's `quantity` (e.g. "1", "pair"). */
  quantityDefault?: string;
  /** Per-column placeholders. */
  placeholders?: { size?: string; color?: string; detail?: string };
}

export const ROLE_FIELDS: Record<RecipeRole, RoleFieldConfig> = {
  hook: {
    label: "Hook",
    materialCategory: "hook",
    showSize: true,
    showColor: false,
    detail: "finish",
    placeholders: { size: "16", detail: "barbless" },
  },
  bead: {
    // Bead uses a custom renderer in RecipeBuilder — no MaterialAutocomplete,
    // no branded picker. Just Material / Color / Size (mm) / Shape. The
    // showSize/showColor flags below aren't read for the bead row, but are
    // kept truthy for any defensive fallback path.
    label: "Bead",
    showSize: true,
    showColor: true,
    placeholders: { size: "3.2", color: "copper" },
  },
  thread: {
    label: "Thread",
    materialCategory: "thread",
    showSize: false,
    showColor: true,
    detail: "weight",
    placeholders: { color: "olive", detail: "8/0" },
  },
  tail: {
    label: "Tail",
    materialCategory: "tail",
    showSize: true,
    showColor: true,
    placeholders: { size: "match hook", color: "pheasant" },
  },
  abdomen: {
    label: "Abdomen",
    materialCategory: "dubbing",
    showSize: false,
    showColor: true,
    placeholders: { color: "olive" },
  },
  thorax: {
    label: "Thorax",
    materialCategory: "dubbing",
    showSize: false,
    showColor: true,
    placeholders: { color: "black" },
  },
  body: {
    label: "Body",
    materialCategory: "body",
    showSize: false,
    showColor: true,
    placeholders: { color: "olive" },
  },
  ribbing: {
    label: "Ribbing",
    materialCategory: "ribbing",
    showSize: false,
    showColor: true,
    placeholders: { color: "copper" },
  },
  shellback: {
    label: "Shellback / Wing Case",
    showSize: false,
    showColor: true,
    placeholders: { color: "black" },
  },
  wing: {
    label: "Wing",
    materialCategory: "wing",
    showSize: true,
    showColor: true,
    placeholders: { size: "shank", color: "white" },
  },
  hackle: {
    label: "Hackle",
    materialCategory: "feather",
    showSize: true,
    showColor: true,
    placeholders: { size: "match hook", color: "grizzly" },
  },
  collar: {
    label: "Collar",
    materialCategory: "feather",
    showSize: false,
    showColor: true,
    placeholders: { color: "partridge" },
  },
  legs: {
    label: "Legs",
    materialCategory: "rubber",
    showSize: false,
    showColor: true,
    placeholders: { color: "barred ginger" },
  },
  head: {
    label: "Head",
    showSize: false,
    showColor: true,
    placeholders: { color: "black" },
  },
  hotspot: {
    label: "Hotspot",
    materialCategory: "dubbing",
    showSize: false,
    showColor: true,
    placeholders: { color: "fl. orange" },
  },
  tag: {
    label: "Tag",
    showSize: false,
    showColor: true,
    placeholders: { color: "fl. green" },
  },
  eye: {
    label: "Eyes",
    materialCategory: "eye",
    showSize: true,
    showColor: true,
    detail: "quantity",
    quantityDefault: "pair",
    placeholders: { size: "small", color: "silver", detail: "pair" },
  },
  post: {
    label: "Post",
    materialCategory: "synthetic",
    showSize: false,
    showColor: true,
    placeholders: { color: "white" },
  },
  antennae: {
    label: "Antennae",
    showSize: false,
    showColor: true,
    placeholders: { color: "black" },
  },
};

export const RECIPE_ROLES: RecipeRole[] = Object.keys(ROLE_FIELDS) as RecipeRole[];

export function getRoleFields(role: RecipeRole): RoleFieldConfig {
  return (
    ROLE_FIELDS[role] ?? {
      label: role,
      showSize: false,
      showColor: true,
    }
  );
}

/** Detail-column header label given the detail field type. */
export function detailLabel(detail: DetailField | undefined): string {
  switch (detail) {
    case "weight":
      return "Weight";
    case "materialType":
      return "Material";
    case "finish":
      return "Finish";
    case "quantity":
      return "Qty";
    case "length":
      return "Length";
    default:
      return "Detail";
  }
}
