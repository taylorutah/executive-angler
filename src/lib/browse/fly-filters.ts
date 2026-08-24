import { parseSizes } from "./match";

const HATCH_FAMILIES = [
  "mayfly",
  "caddis",
  "midge",
  "stonefly",
  "terrestrial",
  "baitfish",
  "attractor",
  "worm",
  "egg",
] as const;

const HATCH_ALIASES: Record<string, (typeof HATCH_FAMILIES)[number]> = {
  mayfly: "mayfly",
  baetis: "mayfly",
  bwo: "mayfly",
  "blue-winged": "mayfly",
  pmd: "mayfly",
  "pale-morning": "mayfly",
  trico: "mayfly",
  sulphur: "mayfly",
  hex: "mayfly",
  drake: "mayfly",
  caddis: "caddis",
  sedge: "caddis",
  midge: "midge",
  chironomid: "midge",
  stonefly: "stonefly",
  stone: "stonefly",
  salmonfly: "stonefly",
  skwala: "stonefly",
  terrestrial: "terrestrial",
  hopper: "terrestrial",
  ant: "terrestrial",
  beetle: "terrestrial",
  cricket: "terrestrial",
  baitfish: "baitfish",
  minnow: "baitfish",
  sculpin: "baitfish",
  attractor: "attractor",
  worm: "worm",
  egg: "egg",
};

function firstWord(value: string): string {
  return value.trim().toLowerCase().split(/[\s/]+/)[0] ?? "";
}

function familyFromLabel(value: string): string | undefined {
  const slug = value.trim().toLowerCase().replace(/\s+/g, "-");
  if ((HATCH_FAMILIES as readonly string[]).includes(slug)) return slug;
  if (HATCH_ALIASES[slug]) return HATCH_ALIASES[slug];
  const word = firstWord(value);
  if (HATCH_ALIASES[word]) return HATCH_ALIASES[word];
  for (const part of value.toLowerCase().split(/[\s/-]+/)) {
    if (HATCH_ALIASES[part]) return HATCH_ALIASES[part];
  }
  for (const [alias, family] of Object.entries(HATCH_ALIASES)) {
    if (alias.length >= 3 && slug.includes(alias)) return family;
  }
  return undefined;
}

/**
 * Hatch chips come from stored `hatchAssociations` and `imitates`.
 * We only map labels we already store — no invented hatches.
 */
export function hatchTokens(input: {
  imitates?: string[];
  hatchAssociations?: { insect: string }[];
}): string[] {
  const tokens = new Set<string>();
  for (const label of input.imitates ?? []) {
    const family = familyFromLabel(label);
    if (family) tokens.add(family);
  }
  for (const row of input.hatchAssociations ?? []) {
    const family = familyFromLabel(row.insect);
    if (family) tokens.add(family);
  }
  return [...tokens];
}

export function sizeListValue(sizes: string[]): string {
  return (sizes ?? []).join(",");
}

export function flyHasSizeInRange(sizes: string[], range: string): boolean {
  const parsed = parseSizes(sizeListValue(sizes));
  const [lo, hi] = range.split("-").map(Number);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return false;
  const min = Math.min(lo, hi);
  const max = Math.max(lo, hi);
  return parsed.some((n) => n >= min && n <= max);
}

export const HATCH_FILTER_OPTIONS = [
  { value: "mayfly", label: "Mayfly" },
  { value: "caddis", label: "Caddis" },
  { value: "midge", label: "Midge" },
  { value: "stonefly", label: "Stonefly" },
  { value: "terrestrial", label: "Terrestrial" },
  { value: "baitfish", label: "Baitfish" },
  { value: "attractor", label: "Attractor" },
  { value: "egg", label: "Egg" },
] as const;

export const SIZE_RANGE_OPTIONS = [
  { value: "18-22", label: "#18–22" },
  { value: "14-16", label: "#14–16" },
  { value: "10-12", label: "#10–12" },
  { value: "4-8", label: "#4–8" },
] as const;
