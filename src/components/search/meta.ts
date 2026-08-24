import type { SearchType } from "@/lib/search";

/** Presentation cap. Ranker default stays 5; the page asks for three. */
export const PAGE_GROUP_CAP = 3;

/** Flagship slugs — the three rivers people actually look up. */
export const MOST_READ_RIVER_SLUGS = [
  "madison-river",
  "green-river",
  "henrys-fork",
] as const;

export const EXAMPLE_QUERIES = [
  "Madison River",
  "Pheasant Tail",
  "PMD hatch",
  "New Zealand",
  "brown trout",
  "when to fish a streamer",
] as const;

export const TYPE_LABELS: Record<SearchType, string> = {
  river: "Rivers",
  fly: "Flies",
  hatch: "Hatches",
  destination: "Places",
  article: "Field notes",
  species: "Species",
  lodge: "Lodges",
  guide: "Guides",
  "fly-shop": "Fly shops",
};

export function isSearchType(value: string | null): value is SearchType {
  return value != null && value in TYPE_LABELS;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function currentMonthName(now = new Date()): string {
  return MONTHS[now.getMonth()];
}

export function monthMatches(entry: string, month: string): boolean {
  const a = entry.toLowerCase();
  const b = month.toLowerCase();
  return a === b || a.startsWith(b.slice(0, 3));
}
