/**
 * Locally hosted hero photographs with pre-sized derivatives for mobile LCP.
 * Keys are the canonical /images/... path; values are the 828px-wide sibling.
 */
export const LOCAL_HERO_MOBILE: Record<string, string> = {
  "/images/home/madison-three-dollar-bridge.jpg":
    "/images/home/madison-three-dollar-bridge-828.jpg",
  "/images/madison-river-three-dollar-bridge.jpg":
    "/images/home/madison-three-dollar-bridge-828.jpg",
};

export function localHeroMobileSrc(src: string): string | undefined {
  return LOCAL_HERO_MOBILE[src];
}

/** WebP sibling for a local JPEG path (same basename, .webp extension). */
export function localHeroWebpSrc(src: string): string | undefined {
  if (!src.startsWith("/images/")) return undefined;
  if (src.endsWith(".webp")) return src;
  if (src.endsWith(".jpg")) return src.replace(/\.jpg$/, ".webp");
  return undefined;
}
