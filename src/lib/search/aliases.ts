import { normalizeText } from "./normalize";

/**
 * Bidirectional search aliases.
 *
 * Format: each key maps to one or more expansions. Matching is case-insensitive
 * and punctuation-stripped (see normalize.ts). Adding a row in either direction
 * is enough — the index is built both ways at load.
 *
 * Keep this list about language (nicknames, abbreviations, misspellings).
 * Ranking lives in score.ts.
 *
 * Non-engineers: add a line like `bwo: ["blue winged olive"]` and you're done.
 */

export const SEARCH_ALIASES: Record<string, string[]> = {
  // Hatches / insects
  pmd: ["pale morning dun", "pale morning duns", "ephemerella"],
  "pale morning dun": ["pmd"],
  "pale morning duns": ["pmd", "pale morning dun"],
  bwo: ["blue winged olive", "blue winged olives", "baetis"],
  "blue winged olive": ["bwo", "baetis"],
  "blue winged olives": ["bwo", "blue winged olive"],
  baetis: ["bwo", "blue winged olive"],
  "green drake": ["drunella"],
  salmonfly: ["pteronarcys", "salmon fly"],
  "salmon fly": ["salmonfly", "pteronarcys"],
  caddis: ["sedge", "trichoptera"],
  midge: ["chironomid", "chironomids"],

  // Flies
  pt: ["pheasant tail", "pheasant tail nymph"],
  "pheasant tail": ["pt", "pheasant tail nymph"],
  "pheasant tail nymph": ["pt", "pheasant tail"],
  grhe: ["gold ribbed hares ear", "hares ear", "hare's ear"],
  "gold ribbed hares ear": ["grhe", "hares ear"],
  "hares ear": ["grhe", "hare's ear", "gold ribbed hares ear"],
  ehc: ["elk hair caddis"],
  "elk hair caddis": ["ehc"],
  rs2: ["rs 2"],
  wd40: ["wd 40", "wd-40"],
  "wd 40": ["wd40"],
  "jj special": ["jj"],
  adams: ["parachute adams"],
  "parachute adams": ["adams"],
  "woolly bugger": ["wooly bugger", "bugger"],
  "wooly bugger": ["woolly bugger"],

  // Rivers / the-X convention
  mo: ["missouri", "missouri river"],
  "the mo": ["missouri", "missouri river"],
  missouri: ["the mo", "mo", "missouri river"],
  "missouri river": ["the mo", "mo"],
  "the bighorn": ["bighorn", "bighorn river"],
  bighorn: ["the bighorn", "bighorn river"],
  "the madison": ["madison", "madison river"],
  madison: ["the madison", "madison river"],
  "the deschutes": ["deschutes", "deschutes river"],
  deschutes: ["the deschutes", "deschutes river"],
  "henry's fork": ["henrys fork", "the fork"],
  "henrys fork": ["henry's fork", "the fork"],
  "the fork": ["henry's fork", "henrys fork"],
  "green river": ["the green"],
  "the green": ["green river"],

  // Species nicknames
  brookie: ["brook trout"],
  brookies: ["brook trout"],
  "brook trout": ["brookie", "brookies"],
  cutty: ["cutthroat", "cutthroat trout"],
  cutt: ["cutthroat", "cutthroat trout"],
  cutthroat: ["cutty", "cutt", "cutthroat trout"],
  bow: ["rainbow", "rainbow trout"],
  bows: ["rainbow trout"],
  "rainbow trout": ["bow", "bows"],
  brown: ["brown trout"],
  browns: ["brown trout"],
  "brown trout": ["brown", "browns"],

  // Water / hydrology
  cfs: ["flow", "discharge", "streamflow"],
  flow: ["cfs", "discharge", "streamflow"],
  discharge: ["cfs", "flow", "streamflow"],
  streamflow: ["cfs", "flow", "discharge"],
  tailwater: ["tailwaters"],
  tailwaters: ["tailwater"],
  freestone: ["freestones"],
  "spring creek": ["spring creeks", "limestone"],
  "spring creeks": ["spring creek"],

  // Common misspellings
  pheasent: ["pheasant", "pheasant tail"],
  caddus: ["caddis"],
  nymf: ["nymph"],
};

const INDEX: Map<string, Set<string>> = (() => {
  const map = new Map<string, Set<string>>();
  const add = (from: string, to: string) => {
    const a = normalizeText(from);
    const b = normalizeText(to);
    if (!a || !b || a === b) return;
    if (!map.has(a)) map.set(a, new Set());
    map.get(a)!.add(b);
  };
  for (const [key, values] of Object.entries(SEARCH_ALIASES)) {
    for (const v of values) {
      add(key, v);
      add(v, key);
    }
  }
  return map;
})();

/** Original token plus every alias (does not recurse). */
export function expandTerm(term: string): string[] {
  const t = normalizeText(term);
  if (!t) return [];
  const extra = INDEX.get(t);
  if (!extra) return [t];
  return [t, ...extra];
}

/** Alias keys, longest first — used for phrase matching in the query. */
export const ALIAS_PHRASES: string[] = [...INDEX.keys()].sort(
  (a, b) => b.length - a.length,
);
