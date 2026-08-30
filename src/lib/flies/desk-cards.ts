import { formatHookSize } from "@/lib/flies/variant-format";
import { plateImageUrl } from "@/lib/media/image-url";
import type { CanonicalFly } from "@/types/entities";
import type { CardData } from "@/types/list-config";

export function sizeMeta(fly: Pick<CanonicalFly, "sizes">): string | undefined {
  const sizes = fly.sizes ?? [];
  if (sizes.length === 0) return undefined;
  if (sizes.length === 1) return formatHookSize(sizes[0]);
  return `${formatHookSize(sizes[0])}–${formatHookSize(sizes[sizes.length - 1])}`;
}

export function canonicalFlyToCard(fly: CanonicalFly): CardData {
  return {
    href: `/flies/${fly.slug}`,
    imageUrl: plateImageUrl(fly.heroImageUrl),
    imageAlt: `${fly.name} fly pattern`,
    title: fly.name,
    meta: sizeMeta(fly),
    featured: fly.featured,
    _filterValues: {
      category: fly.category || "",
    },
  };
}
