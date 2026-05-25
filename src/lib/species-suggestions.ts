// Ordered list of species shown as autocomplete suggestions in the catch
// logger and session editor. Names MUST match the canonical species table's
// common_name field so catches link cleanly to species pages.
// To add a species: append it here (and ensure it exists in src/data/species.ts).
export const COMMON_SPECIES = [
  "Rainbow Trout",
  "Brown Trout",
  "Cutthroat Trout",
  "Brook Trout",
  "Tiger Trout",
  "Bull Trout",
  "Mountain Whitefish",
  "Arctic Grayling",
  "Smallmouth Bass",
  "Largemouth Bass",
  "Bluegill",
] as const;

export type CommonSpecies = (typeof COMMON_SPECIES)[number];
