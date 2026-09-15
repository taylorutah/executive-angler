/** Retired public paths that still appear in seed / DB rows. */
const RETIRED_STILLS: Record<string, string> = {
  "/images/madison-river-three-dollar-bridge.jpg":
    "/images/home/madison-three-dollar-bridge.jpg",
};

/** Stale storage URLs replaced by in-repo stills. */
const HOSTED_FLY_SLUGS = [
  "barrs-emerger",
  "bead-head-caddis-pupa",
  "blue-dun",
  "blue-winged-olive-comparadun",
  "bwo-loop-wing-emerger",
  "bwo-parachute",
  "bwo-sparkle-dun",
  "callibaetis-cripple",
  "cdc-emerger",
  "comparadun",
  "daves-hopper",
  "flying-ant",
  "goddard-caddis",
  "henrys-fork-hopper",
  "humpy",
  "klinkhammer-special",
  "letort-cricket",
  "matthews-sparkle-emerger",
  "midge-larva",
  "olive-bugger",
  "olive-thorax-dun",
  "parachute-hopper",
  "pmd-emerger",
  "quigley-cripple",
  "snowshoe-emerger",
  "thread-midge",
  "top-secret-midge",
  "x-caddis",
] as const;

const HOSTED_FLY_STILLS: Record<string, string> = Object.fromEntries(
  HOSTED_FLY_SLUGS.flatMap((slug) => {
    const hosted = `/images/flies/${slug}.jpg`;
    return [
      [
        `https://qlasxtfbodyxbcuchvxz.supabase.co/storage/v1/object/public/fly-pattern-images/${slug}.jpg`,
        hosted,
      ],
      [
        `https://api.executiveangler.com/storage/v1/object/public/fly-pattern-images/${slug}.jpg`,
        hosted,
      ],
    ];
  }),
);

/** Treat null, blank, and whitespace-only as missing. */
export function normalizeImageUrl(
  value: string | null | undefined,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  return HOSTED_FLY_STILLS[trimmed] ?? RETIRED_STILLS[trimmed] ?? trimmed;
}

export function isUsableImageUrl(
  value: string | null | undefined,
): value is string {
  return normalizeImageUrl(value) !== undefined;
}

/** Plate / bench stills only — icons and leftover submission paths stay empty. */
export function plateImageUrl(
  value: string | null | undefined,
): string | undefined {
  const href = normalizeImageUrl(value);
  if (!href) return undefined;
  if (href.includes("/fly-icons/") || href.includes("/community-images/submissions/")) {
    return undefined;
  }
  return href;
}

/** Leftover public templates: hosted stills only. No Unsplash. */
export function hostedStillUrl(
  value: string | null | undefined,
): string | undefined {
  const href = plateImageUrl(value);
  if (!href) return undefined;
  if (/unsplash\.com/i.test(href)) return undefined;
  return href;
}
