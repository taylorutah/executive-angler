/**
 * Homepage hero copy. CFS never appears unless the gauge answered.
 * Headline and dek are the Water Desk fold lines; the number is live.
 */

export const HERO_HEADLINE_LEAD = "The Madison";
export const HERO_HEADLINE_CLOSE = "is coming up.";
export const HERO_HEADLINE = `${HERO_HEADLINE_LEAD} ${HERO_HEADLINE_CLOSE}`;

export const HERO_DEK =
  "Pale Morning Duns still on the water. Flow bumped overnight. Fish the banks before noon.";

export const HERO_DEK_QUIET =
  "Pale Morning Duns still on the water. The gauge is quiet; we are not guessing a number.";

export const HERO_PLACE = "Madison";
export const HERO_STRETCH = "Three Dollar Bridge";

/**
 * Homepage hero photograph. Swap this file for a 2880×1688 later —
 * dimensions update here, nowhere else.
 */
export const HERO_IMAGE = {
  src: "/images/home/madison-three-dollar-bridge.jpg",
  mobileSrc: "/images/home/madison-three-dollar-bridge-828.jpg",
  webp: "/images/home/madison-three-dollar-bridge.webp",
  mobileWebp: "/images/home/madison-three-dollar-bridge-828.webp",
  alt: "The Madison River at Three Dollar Bridge, Montana",
  width: 1792,
  height: 1008,
} as const;

export const SEARCH_PLACEHOLDER = "Search a river, a fly, a stretch of water";

export function formatHeroDay(now = new Date()): string {
  const day = now.toLocaleString("en-US", { day: "numeric", timeZone: "America/Denver" });
  const month = now
    .toLocaleString("en-US", { month: "short", timeZone: "America/Denver" })
    .toUpperCase();
  return `${day} ${month}`;
}

export function formatHeroCaptionDate(now = new Date()): string {
  return now.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Denver",
  });
}

/** Eyebrow without the live number — CFS is rendered in teal by the hero. */
export function formatHeroEyebrow(cfs: number | null, now = new Date()): string {
  const date = formatHeroDay(now);
  if (cfs == null) return `${HERO_STRETCH.toUpperCase()}  ·  ${HERO_PLACE.toUpperCase()}  ·  ${date}`;
  return `${HERO_STRETCH.toUpperCase()}  ·  ${HERO_PLACE.toUpperCase()}  ·  ${cfs.toLocaleString("en-US")} CFS  ·  ${date}`;
}

export function heroDek(cfs: number | null): string {
  return cfs == null ? HERO_DEK_QUIET : HERO_DEK;
}

/** Field-note caption. CFS only when the gauge answered. */
export function formatHeroCaption(cfs: number | null, now = new Date()): string {
  const date = formatHeroCaptionDate(now);
  if (cfs == null) return `Madison River  ·  ${HERO_STRETCH}  ·  ${date}`;
  return `Madison River  ·  ${HERO_STRETCH}  ·  ${cfs.toLocaleString("en-US")} cfs  ·  ${date}`;
}
