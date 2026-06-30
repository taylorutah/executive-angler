/**
 * Auth-aware hero image heights.
 *
 * Anonymous visitors see the full immersive hero.
 * Signed-in users see a shorter hero (they're here for data, not photos).
 */

export type HeroTier = "anonymous" | "authenticated";

/** Heights per page type and auth tier */
const HERO_HEIGHTS: Record<string, Record<HeroTier, string>> = {
  river: {
    anonymous: "h-[45vh]",
    authenticated: "h-[28vh]",
  },
  species: {
    anonymous: "h-[60vh]",
    authenticated: "h-[35vh]",
  },
  destination: {
    anonymous: "h-[65vh]",
    authenticated: "h-[35vh]",
  },
};

export function getHeroHeight(
  pageType: "river" | "species" | "destination",
  tier: HeroTier
): string {
  return HERO_HEIGHTS[pageType][tier];
}
