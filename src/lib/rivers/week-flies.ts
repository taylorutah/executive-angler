import { shortInsect } from "@/lib/browse/river-items";
import { scorePatternOnHatch } from "@/lib/flies/fishing-now";
import type { CanonicalFly, HatchEntry } from "@/types/entities";

export type WeekFlyChip = {
  key: string;
  name: string;
  size?: string;
  hint?: string;
  href?: string;
  imageUrl?: string;
};

function patternParts(pattern?: string): string[] {
  return (pattern ?? "")
    .split(/[,;/]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function bestFlyForHatch(hatch: HatchEntry, flies: CanonicalFly[]): CanonicalFly | undefined {
  let best: { fly: CanonicalFly; score: number } | undefined;
  const needles = [...patternParts(hatch.pattern), hatch.pattern || hatch.insect].filter(Boolean);
  for (const fly of flies) {
    let score = 0;
    for (const needle of needles) {
      score = Math.max(score, scorePatternOnHatch(fly.name, needle ?? ""));
    }
    if (!hatch.pattern) {
      score = Math.max(score, scorePatternOnHatch(fly.name, hatch.insect));
    }
    if (score < 4) continue;
    if (!best || score > best.score) best = { fly, score };
  }
  return best?.fly;
}

export type HatchPlate = {
  name: string;
  href?: string;
  imageUrl?: string;
  insect: string;
  size?: string;
};

/**
 * Catalog fly for a hatch-chart row. Prefers a named pattern that has a
 * tied-fly photograph. Never invents a plate when the library has no still.
 */
export function matchHatchPlate(hatch: HatchEntry, flies: CanonicalFly[]): HatchPlate {
  const withPhoto = flies.filter((f) => Boolean(f.heroImageUrl));
  for (const part of patternParts(hatch.pattern)) {
    const hit = withPhoto.find((f) => scorePatternOnHatch(f.name, part) >= 6);
    if (hit) {
      return {
        name: hit.name,
        href: `/flies/${hit.slug}`,
        imageUrl: hit.heroImageUrl,
        insect: hatch.insect,
        size: hatch.size || undefined,
      };
    }
  }
  const fly = bestFlyForHatch(hatch, withPhoto) ?? bestFlyForHatch(hatch, flies);
  const fallback = patternParts(hatch.pattern)[0] || shortInsect(hatch.insect) || hatch.pattern;
  return {
    name: fly?.name || fallback,
    href: fly ? `/flies/${fly.slug}` : undefined,
    imageUrl: fly?.heroImageUrl || undefined,
    insect: hatch.insect,
    size: hatch.size || undefined,
  };
}

/** This month's chart rows as week chips. Library match only — no invented names. */
export function weekFliesFromChart(
  hatches: HatchEntry[],
  flies: CanonicalFly[],
  limit = 3,
): WeekFlyChip[] {
  const out: WeekFlyChip[] = [];
  for (const [i, hatch] of hatches.entries()) {
    if (out.length >= limit) break;
    const fly = bestFlyForHatch(hatch, flies);
    const name = fly?.name || shortInsect(hatch.insect) || hatch.pattern;
    if (!name) continue;
    out.push({
      key: `${hatch.insect}-${hatch.pattern}-${i}`,
      name,
      size: hatch.size || undefined,
      hint: hatch.timeOfDay || undefined,
      href: fly ? `/flies/${fly.slug}` : undefined,
      imageUrl: fly?.heroImageUrl || undefined,
    });
  }
  return out;
}

export type HatchRailRow = {
  insect: string;
  detail?: string;
};

export function hatchRailFromChart(hatches: HatchEntry[]): HatchRailRow[] {
  return hatches
    .map((h) => ({
      insect: shortInsect(h.insect),
      detail: h.timeOfDay || h.size || undefined,
    }))
    .filter((row) => row.insect);
}
