import { normalizeImageUrl } from "@/lib/media/image-url";

/** In-repo stills that should win over a stale `flies.hero_image_url`. */
export const HOSTED_FLY_HERO_BY_SLUG: Record<string, string> = {
  "blue-winged-olive-comparadun":
    "/images/flies/blue-winged-olive-comparadun.jpg",
};

export function hostedFlyHeroUrl(slug: string): string | undefined {
  return HOSTED_FLY_HERO_BY_SLUG[slug];
}

export function flyHeroSrc(fly: {
  slug: string;
  hero_image_url?: string | null;
}): string | undefined {
  return hostedFlyHeroUrl(fly.slug) ?? normalizeImageUrl(fly.hero_image_url);
}

export function withHostedFlyHero<
  T extends { slug: string; hero_image_url?: string | null },
>(fly: T): T {
  const hosted = hostedFlyHeroUrl(fly.slug);
  if (!hosted || fly.hero_image_url === hosted) return fly;
  return { ...fly, hero_image_url: hosted };
}
