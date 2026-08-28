import { normalizeImageUrl } from "./image-url";

/**
 * Locally hosted hero photographs with pre-sized derivatives for mobile LCP.
 * Keys are the canonical /images/... path; values are the 828px-wide sibling.
 */
export const LOCAL_HERO_MOBILE: Record<string, string> = {
  "/images/home/madison-three-dollar-bridge.jpg":
    "/images/home/madison-three-dollar-bridge-828.jpg",
};

export function localHeroMobileSrc(src: string): string | undefined {
  const canonical = normalizeImageUrl(src) ?? src;
  return LOCAL_HERO_MOBILE[canonical];
}

/** WebP sibling for a local JPEG path (same basename, .webp extension). */
export function localHeroWebpSrc(src: string): string | undefined {
  const canonical = normalizeImageUrl(src) ?? src;
  if (!canonical.startsWith("/images/")) return undefined;
  if (canonical.endsWith(".webp")) return canonical;
  if (canonical.endsWith(".jpg")) return canonical.replace(/\.jpg$/, ".webp");
  return undefined;
}
