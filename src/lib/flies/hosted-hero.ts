import { normalizeImageUrl } from "@/lib/media/image-url";

/** In-repo stills that should win over a stale `flies.hero_image_url`. */
export const HOSTED_FLY_HERO_BY_SLUG: Record<string, string> = {
  "barrs-emerger": "/images/flies/barrs-emerger.jpg",
  "bead-head-caddis-pupa": "/images/flies/bead-head-caddis-pupa.jpg",
  "blue-dun": "/images/flies/blue-dun.jpg",
  "blue-winged-olive-comparadun":
    "/images/flies/blue-winged-olive-comparadun.jpg",
  "bwo-loop-wing-emerger": "/images/flies/bwo-loop-wing-emerger.jpg",
  "bwo-parachute": "/images/flies/bwo-parachute.jpg",
  "bwo-sparkle-dun": "/images/flies/bwo-sparkle-dun.jpg",
  "callibaetis-cripple": "/images/flies/callibaetis-cripple.jpg",
  "cdc-emerger": "/images/flies/cdc-emerger.jpg",
  comparadun: "/images/flies/comparadun.jpg",
  "daves-hopper": "/images/flies/daves-hopper.jpg",
  "flying-ant": "/images/flies/flying-ant.jpg",
  "goddard-caddis": "/images/flies/goddard-caddis.jpg",
  "henrys-fork-hopper": "/images/flies/henrys-fork-hopper.jpg",
  humpy: "/images/flies/humpy.jpg",
  "klinkhammer-special": "/images/flies/klinkhammer-special.jpg",
  "letort-cricket": "/images/flies/letort-cricket.jpg",
  "matthews-sparkle-emerger": "/images/flies/matthews-sparkle-emerger.jpg",
  "midge-larva": "/images/flies/midge-larva.jpg",
  "olive-bugger": "/images/flies/olive-bugger.jpg",
  "olive-thorax-dun": "/images/flies/olive-thorax-dun.jpg",
  "parachute-hopper": "/images/flies/parachute-hopper.jpg",
  "pmd-emerger": "/images/flies/pmd-emerger.jpg",
  "quigley-cripple": "/images/flies/quigley-cripple.jpg",
  "snowshoe-emerger": "/images/flies/snowshoe-emerger.jpg",
  "thread-midge": "/images/flies/thread-midge.jpg",
  "top-secret-midge": "/images/flies/top-secret-midge.jpg",
  "x-caddis": "/images/flies/x-caddis.jpg",
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
