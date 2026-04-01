/**
 * Auth-aware hero image heights.
 *
 * Anonymous visitors see the full immersive hero.
 * Logged-in free users see a shorter hero (they've seen it before).
 * Pro users see a compact banner (they're here for data, not photos).
 */

export type HeroTier = "anonymous" | "free" | "pro";

/** Heights per page type and auth tier */
const HERO_HEIGHTS: Record<string, Record<HeroTier, string>> = {
  river: {
    anonymous: "h-[45vh]",
    free: "h-[28vh]",
    pro: "h-[18vh]",
  },
  species: {
    anonymous: "h-[60vh]",
    free: "h-[35vh]",
    pro: "h-[20vh]",
  },
  destination: {
    anonymous: "h-[65vh]",
    free: "h-[35vh]",
    pro: "h-[20vh]",
  },
};

export function getHeroHeight(
  pageType: "river" | "species" | "destination",
  tier: HeroTier
): string {
  return HERO_HEIGHTS[pageType][tier];
}
