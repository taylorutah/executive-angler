import { GazetteClock } from "@/lib/gazette/date";

/**
 * Monthly editorial lines. Rewrite them with the photograph — they should
 * read like something a person said about this water this week, not a slogan.
 * Do not invent a reading; the CFS in the caption comes off the gauge.
 */
export const HERO_HEADLINE_LEAD = "Late August on the Madison";
export const HERO_HEADLINE_CLOSE = "the water is low and the hoppers are up.";
export const HERO_HEADLINE = `${HERO_HEADLINE_LEAD} — ${HERO_HEADLINE_CLOSE}`;

export const HERO_DEK =
  "The photograph is Three Dollar Bridge. The number in the caption is the gauge, not a guess.";

export const HERO_DEK_QUIET =
  "The photograph is Three Dollar Bridge. The gauge is quiet; we are not guessing a number.";

export const HERO_PLACE = "Montana";

export const WATER_JUDGEMENT = "low and clear; fish early";

export const HERO_IMAGE = {
  src: "/images/madison-river-three-dollar-bridge.jpg",
  alt: "The Madison River running low and clear below Three Dollar Bridge, Montana",
  width: 1920,
  height: 736,
} as const;

export const SEARCH_PLACEHOLDER = "Search a river, a fly, a hatch, a destination.";

/** Date and place always; CFS only when the gauge answered. */
export function formatHeroEyebrow(cfs: number | null, now?: Date): string {
  const place = HERO_PLACE.toUpperCase();
  if (cfs == null) return `${GazetteClock.photoDay(now)} · ${place}`;
  return `${GazetteClock.photoDay(now)} · ${place} · ${cfs.toLocaleString("en-US")} CFS`;
}

/** Never claim a number that is not on the page. */
export function heroDek(cfs: number | null): string {
  return cfs == null ? HERO_DEK_QUIET : HERO_DEK;
}

/** Photograph caption: SEPTEMBER 1 · MONTANA · {CFS} CFS */
export function formatHeroCaption(cfs: number | null, now?: Date): string {
  return formatHeroEyebrow(cfs, now);
}
