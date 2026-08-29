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

function bestFlyForHatch(hatch: HatchEntry, flies: CanonicalFly[]): CanonicalFly | undefined {
  let best: { fly: CanonicalFly; score: number } | undefined;
  const needle = hatch.pattern || hatch.insect;
  for (const fly of flies) {
    const score = Math.max(
      scorePatternOnHatch(fly.name, needle),
      hatch.pattern ? 0 : scorePatternOnHatch(fly.name, hatch.insect),
    );
    if (score < 4) continue;
    if (!best || score > best.score) best = { fly, score };
  }
  return best?.fly;
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
