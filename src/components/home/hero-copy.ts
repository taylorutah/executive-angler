/**
 * Monthly editorial lines. Rewrite them with the photograph — they should
 * read like something a person said about this water this week, not a slogan.
 * Do not invent a reading; the eyebrow CFS comes off the gauge.
 */
export const HERO_HEADLINE_LEAD = "Late August on the Madison";
export const HERO_HEADLINE_CLOSE = "the water is low and the hoppers are up.";
export const HERO_HEADLINE = `${HERO_HEADLINE_LEAD} — ${HERO_HEADLINE_CLOSE}`;

export const HERO_DEK =
  "The photograph is Three Dollar Bridge. The number in the eyebrow is the gauge, not a guess.";

export const HERO_DEK_QUIET =
  "The photograph is Three Dollar Bridge. The gauge is quiet; we are not guessing a number.";

export const HERO_PLACE = "Montana";

export const WATER_JUDGEMENT = "low and clear; fish early";

export const HERO_IMAGE = {
  src: "/images/madison-river-three-dollar-bridge.jpg",
  /** Same photograph, 828px wide — Slow-4G LCP on mobile without touching the master. */
  mobileSrc: "/images/madison-river-three-dollar-bridge-828.jpg",
  webp: "/images/madison-river-three-dollar-bridge.webp",
  mobileWebp: "/images/madison-river-three-dollar-bridge-828.webp",
  alt: "The Madison River running low and clear below Three Dollar Bridge, Montana",
  width: 1920,
  height: 736,
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

/** Never claim a number that is not on the page. */
export function heroDek(cfs: number | null): string {
  return cfs == null ? HERO_DEK_QUIET : HERO_DEK;
}

/** Field-note caption: place · CFS · date. CFS only when the gauge answered. */
export function formatHeroCaption(cfs: number | null, now = new Date()): string {
  const date = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/Denver",
  });
  if (cfs == null) return `Three Dollar Bridge · ${date}`;
  return `Three Dollar Bridge · ${cfs.toLocaleString("en-US")} CFS · ${date}`;
}
