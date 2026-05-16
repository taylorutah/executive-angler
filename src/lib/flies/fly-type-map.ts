/**
 * Canonical flies store `category` in lowercase ("dry", "nymph", "wet").
 * FlyPatternForm uses display labels ("Dry Fly", "Nymph", "Wet Fly") so
 * the same form can serve both canonical and personal pattern flows.
 *
 * These helpers bridge the two formats at the canonical-edit boundary.
 */

const CATEGORY_TO_FORM_TYPE: Record<string, string> = {
  dry: "Dry Fly",
  nymph: "Nymph",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet Fly",
  terrestrial: "Terrestrial",
  egg: "Egg",
  midge: "Midge",
  other: "Other",
};

const FORM_TYPE_TO_CATEGORY: Record<string, string> = {
  "Dry Fly": "dry",
  "Nymph": "nymph",
  "Streamer": "streamer",
  "Emerger": "emerger",
  "Wet Fly": "wet",
  "Terrestrial": "terrestrial",
  "Egg": "egg",
  "Midge": "midge",
  "Other": "other",
};

export function canonicalCategoryToFormType(
  category: string | null | undefined,
): string {
  if (!category) return "";
  const key = category.trim().toLowerCase();
  return CATEGORY_TO_FORM_TYPE[key] ?? key.replace(/^./, (c) => c.toUpperCase());
}

export function formTypeToCanonicalCategory(
  formType: string | null | undefined,
): string {
  if (!formType) return "";
  const v = formType.trim();
  if (FORM_TYPE_TO_CATEGORY[v]) return FORM_TYPE_TO_CATEGORY[v];
  return v.toLowerCase().replace(/ fly$/, "");
}
