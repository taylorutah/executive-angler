/**
 * Lane Q catalog picks. Every slug is a live row — do not invent replacements.
 *
 * Flies: library fallback + essential-fly-box article (#1, #2, #6, #14, #11).
 *   parachute-adams  — not `adams` (exists, unfeatured). White post beginners can see.
 *   pheasant-tail-nymph — not `pheasant-tail` (exists, no hero image; the plate needs one).
 *
 * Rivers: `difficulty = beginner` in the live rivers table only.
 *   Default keep-five are a geographic spread so the list is useful without GPS.
 *   River Moy is beginner in the catalog (day-ticket salmon access) — shown in
 *   the full beginner list, not the default keep-five (not first-trout water).
 */

export const FIRST_FIVE_FLY_SLUGS = [
  "parachute-adams",
  "elk-hair-caddis",
  "pheasant-tail-nymph",
  "woolly-bugger",
  "rs2",
] as const;

/** Job line for each fly — paraphrased from `essential-fly-box-20-patterns`. */
export const FLY_JOBS: Record<(typeof FIRST_FIVE_FLY_SLUGS)[number], string> = {
  "parachute-adams":
    "Rises you cannot name. The first dry on when you do not know the insect.",
  "elk-hair-caddis":
    "Evenings and summer searching. The caddis counterpart to the Adams.",
  "pheasant-tail-nymph":
    "Under the surface, most days of the year. A mayfly nymph that covers a lot of water.",
  "woolly-bugger":
    "When nothing is hatching. Leech, crayfish, baitfish — the one streamer to carry.",
  rs2: "Trout rising but refusing the dry. A small emerger for the picky days.",
};

/**
 * Starter rivers when we do not have a location.
 * All five are `difficulty = beginner` in the live DB. Spread: OR, UT, MI, NC, GA.
 */
export const DEFAULT_KEEP_RIVER_SLUGS = [
  "mckenzie-river",
  "logan-river",
  "manistee-river",
  "tuckasegee-river",
  "chattahoochee-river-ga",
] as const;

export const GEAR_ITEMS = [
  {
    title: "A 9-foot 5-weight",
    body: "The first rod. Handles dries, nymphs, and small streamers, casts the distances you will actually use, and fights trout up to twenty inches. If you will own one rod, this is it.",
    sourceHref: "/articles/complete-guide-fly-rod-selection",
    sourceLabel: "Rod selection",
  },
  {
    title: "A reel that balances it, and a floating line to match",
    body: "The reel holds the line and balances the rod in the hand. A weight-forward floating line in the same weight as the rod covers almost every day you will fish as a beginner.",
  },
  {
    title: "A few 9-foot leaders, 4X and 5X",
    body: "Two diameters cover dries and moderate nymphs. Buy a handful and stop. Tippet spools can wait until you are burning through leaders.",
  },
  {
    title: "Nippers, hemostats, a rubber-mesh net",
    body: "Cut, unhook, land. A rubber-mesh bag does not strip slime the way knotted nylon does. That is the whole kit that earns its pocket.",
    sourceHref: "/articles/catch-and-release-best-practices",
    sourceLabel: "Why the net matters",
  },
  {
    title: "A stream thermometer",
    body: "Trout already struggle above 65°F. Stop fishing them above 68°F. The thermometer is the one instrument that tells you when to walk away.",
    sourceHref: "/articles/catch-and-release-best-practices",
    sourceLabel: "Temperature guide",
  },
] as const;

export const WATER_FEATURES = [
  {
    name: "Riffle",
    look: "Shallow, broken, fast.",
    hold: "Trout feed in the deeper slots. Short casts. The oxygen and the food start here.",
  },
  {
    name: "Run",
    look: "Moderate depth, steady current, a textured surface.",
    hold: "The all-day station. Food arrives without the fish burning energy.",
  },
  {
    name: "Pool",
    look: "Deep, slow, often glassy.",
    hold: "Rest and cover. Fish the head and the tailout, not the still middle.",
  },
  {
    name: "Seam",
    look: "The visible line where fast water meets slow.",
    hold: "The most reliable lie on any river. Food in the fast lane; the fish sit in the slow.",
  },
] as const;

export const ETIQUETTE = [
  {
    do: "Crush the barb before you tie the fly on.",
    dont: "Leave a barb because you are afraid of losing a fish.",
  },
  {
    do: "Wet your hands. Keep the fish in the water.",
    dont: "Hold it in dry hands, a towel, or grass.",
  },
  {
    do: "Land it quickly on tackle that matches the fish.",
    dont: "Play it to exhaustion on a rod that is too light.",
  },
  {
    do: "Net with rubber mesh. Unhook with hemostats, gripping the fly.",
    dont: "Use knotted nylon, or twist the hook out by the fish.",
  },
  {
    do: "Hold it upright in calm water and wait for it to kick away.",
    dont: "Pump it back and forth, or release it into the fastest current.",
  },
  {
    do: "Check the temperature. Stop for trout above 68°F.",
    dont: "Keep fishing a hot afternoon because the rises look good.",
  },
] as const;
