/**
 * Monthly editorial lines. Rewrite them with the photograph — they should
 * read like something a person said about this water this week, not a slogan.
 * Do not invent a reading; the eyebrow CFS comes off the gauge.
 */
export const HERO_HEADLINE =
  "Late August on the Madison — the water is low and the hoppers are up.";

export const HERO_DEK =
  "The photograph is Three Dollar Bridge. The number in the eyebrow is the gauge, not a guess.";

export const HERO_PLACE = "Montana";

export const WATER_JUDGEMENT = "low and clear; fish early";

export const HERO_IMAGE = {
  src: "/images/madison-river-three-dollar-bridge.jpg",
  alt: "The Madison River running low and clear below Three Dollar Bridge, Montana",
} as const;

export const SEARCH_PLACEHOLDER = "Search a river, a fly, a hatch, a destination.";

/** Date and place always; CFS only when the gauge answered. */
export function formatHeroEyebrow(cfs: number | null, now = new Date()): string {
  const month = now
    .toLocaleString("en-US", { month: "long", timeZone: "America/Denver" })
    .toUpperCase();
  const day = now.toLocaleString("en-US", { day: "numeric", timeZone: "America/Denver" });
  const place = HERO_PLACE.toUpperCase();
  if (cfs == null) return `${month} ${day} · ${place}`;
  return `${month} ${day} · ${place} · ${cfs.toLocaleString("en-US")} CFS`;
}
