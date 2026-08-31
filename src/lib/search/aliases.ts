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
  hopper: ["hoppers", "grasshopper", "grasshoppers"],
  hoppers: ["hopper", "grasshopper"],
  grasshopper: ["hopper", "hoppers"],
  stonefly: ["stoneflies", "stone fly"],
  stoneflies: ["stonefly", "stone fly"],
  "stone fly": ["stonefly", "stoneflies"],
  "golden stone": ["golden stones", "golden stonefly"],
  "golden stones": ["golden stone", "golden stonefly"],
  "golden stonefly": ["golden stone", "golden stones"],
  skwala: ["skwalas"],
  skwalas: ["skwala"],
  "march brown": ["march browns"],
  "march browns": ["march brown"],
  "mahogany dun": ["mahogany duns", "mahogany"],
  "mahogany duns": ["mahogany dun"],
  mahogany: ["mahogany dun"],
  trico: ["tricos", "tricorythodes"],
  tricos: ["trico", "tricorythodes"],
  tricorythodes: ["trico", "tricos"],
  spinner: ["spinners"],
  spinners: ["spinner"],
  emerger: ["emergers"],
  emergers: ["emerger"],
  nymph: ["nymphs"],
  nymphs: ["nymph"],
  dry: ["dry fly", "dries", "dry flies"],
  "dry fly": ["dry", "dries"],
  dries: ["dry", "dry fly"],
  streamer: ["streamers"],
  streamers: ["streamer"],

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
  cdc: ["cul de canard"],
  "cul de canard": ["cdc"],
  comparadun: ["comparaduns", "compara dun"],
  comparaduns: ["comparadun"],
  "compara dun": ["comparadun"],
  parachute: ["parachutes"],
  parachutes: ["parachute"],
  stimulator: ["stimulators", "stim"],
  stimulators: ["stimulator"],
  stim: ["stimulator"],
  chubby: ["chubby chernobyl", "chernobyl"],
  "chubby chernobyl": ["chubby", "chernobyl"],
  "copper john": ["copper johns"],
  "copper johns": ["copper john"],
  "zebra midge": ["zebra midges"],
  "zebra midges": ["zebra midge"],
  "san juan worm": ["sjw", "san juan"],
  sjw: ["san juan worm"],
  "san juan": ["san juan worm"],
  squirmy: ["squirmy worm", "squirmy wormy"],
  "squirmy worm": ["squirmy", "squirmy wormy"],
  "squirmy wormy": ["squirmy", "squirmy worm"],
  perdigon: ["perdigons"],
  perdigons: ["perdigon"],
  jig: ["jig nymph", "jigs"],
  jigs: ["jig", "jig nymph"],
  "jig nymph": ["jig", "jigs"],
  leech: ["leeches"],
  leeches: ["leech"],
  sculpin: ["sculpins"],
  sculpins: ["sculpin"],
  "sex dungeon": ["sex dungeons"],
  "sex dungeons": ["sex dungeon"],
  "circus peanut": ["circus peanuts"],
  "circus peanuts": ["circus peanut"],

  // Rivers / the-X convention
  mo: ["missouri", "missouri river"],
  "the mo": ["missouri", "missouri river"],
  missouri: ["the mo", "mo", "missouri river"],
  "missouri river": ["the mo", "mo"],
  "the bighorn": ["bighorn", "bighorn river"],
  bighorn: ["the bighorn", "bighorn river"],
  "bighorn river": ["the bighorn", "bighorn"],
  "the madison": ["madison", "madison river"],
  madison: ["the madison", "madison river"],
  "madison river": ["the madison", "madison"],
  "the deschutes": ["deschutes", "deschutes river"],
  deschutes: ["the deschutes", "deschutes river"],
  "deschutes river": ["the deschutes", "deschutes"],
  "henry's fork": ["henrys fork", "the fork", "henry fork", "henrys"],
  "henrys fork": ["henry's fork", "the fork", "henry fork", "henrys"],
  "henry fork": ["henry's fork", "henrys fork", "the fork", "henrys"],
  "the fork": ["henry's fork", "henrys fork", "henrys"],
  henrys: ["henry's fork", "henrys fork", "the fork"],
  "green river": ["the green", "green river utah"],
  "the green": ["green river", "green river utah"],
  "green river utah": ["green river", "the green"],
  snake: ["snake river", "the snake"],
  "snake river": ["snake", "the snake"],
  "the snake": ["snake", "snake river"],
  "south fork": ["south fork snake", "sf snake"],
  "south fork snake": ["south fork", "snake river"],
  "sf snake": ["south fork", "south fork snake"],
  provo: ["provo river", "the provo"],
  "provo river": ["provo", "the provo"],
  "the provo": ["provo", "provo river"],
  weezy: ["weiser", "weiser river"],
  weiser: ["weezy", "weiser river"],
  "weiser river": ["weezy", "weiser"],
  yellowstone: ["yellowstone river", "the yellowstone"],
  "yellowstone river": ["yellowstone", "the yellowstone"],
  "the yellowstone": ["yellowstone", "yellowstone river"],
  gallatin: ["gallatin river", "the gallatin"],
  "gallatin river": ["gallatin", "the gallatin"],
  "the gallatin": ["gallatin", "gallatin river"],
  firehole: ["firehole river", "the firehole"],
  "firehole river": ["firehole", "the firehole"],
  "the firehole": ["firehole", "firehole river"],
  gibbon: ["gibbon river", "the gibbon"],
  "gibbon river": ["gibbon", "the gibbon"],
  "the gibbon": ["gibbon", "gibbon river"],
  lamar: ["lamar river", "the lamar"],
  "lamar river": ["lamar", "the lamar"],
  "the lamar": ["lamar", "lamar river"],

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
  madision: ["madison", "madison river"],
  missourri: ["missouri", "missouri river"],
  deschuttes: ["deschutes", "deschutes river"],
  dechutes: ["deschutes", "deschutes river"],
  deshutes: ["deschutes", "deschutes river"],
  caddus: ["caddis"],
  cadis: ["caddis"],
  caddiss: ["caddis"],
  caddes: ["caddis"],
  nymf: ["nymph"],
  nympth: ["nymph"],
  nymp: ["nymph"],
  ninph: ["nymph"],
  wooly: ["woolly", "woolly bugger"],
  woolly: ["wooly", "woolly bugger"],

  // Hook / size vocabulary
  "size 12": ["12", "hook 12", "#12"],
  "hook 12": ["size 12", "12"],
  "#12": ["size 12", "hook 12"],
  "size 14": ["14", "hook 14", "#14"],
  "hook 14": ["size 14", "14"],
  "#14": ["size 14", "hook 14"],
  "size 16": ["16", "hook 16", "#16"],
  "hook 16": ["size 16", "16"],
  "#16": ["size 16", "hook 16"],
  "size 18": ["18", "hook 18", "#18"],
  "hook 18": ["size 18", "18"],
  "#18": ["size 18", "hook 18"],
  "size 20": ["20", "hook 20", "#20"],
  "hook 20": ["size 20", "20"],
  "#20": ["size 20", "hook 20"],
  "size 22": ["22", "hook 22", "#22"],
  "hook 22": ["size 22", "22"],
  "#22": ["size 22", "hook 22"],
  "2xl": ["2x long", "2x-long"],
  "2x long": ["2xl"],
  "3xl": ["3x long", "3x-long"],
  "3x long": ["3xl"],
  "4xl": ["4x long", "4x-long"],
  "4x long": ["4xl"],
  std: ["standard", "standard length"],
  standard: ["std", "standard length"],
  "1x fine": ["1xf", "1x-fine"],
  "1xf": ["1x fine"],
  "2x heavy": ["2xh", "2x-heavy"],
  "2xh": ["2x heavy"],
  barbless: ["barbless hook"],
  "barbless hook": ["barbless"],
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
