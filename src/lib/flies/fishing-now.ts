/**
 * "Fishing now on" — rivers whose *current-month* hatch chart names this
 * pattern. River name + hook sizes only. Never catch counts, never another
 * angler's log, never river_fly_pulse.
 */
import { createStaticClient } from "@/lib/supabase/static";
import type { HatchMonth } from "@/types/entities";

export type FishingNowRiver = {
  slug: string;
  name: string;
  sizes: string[];
};

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(s: string): string[] {
  return norm(s).split(" ").filter((w) => w.length > 2);
}

/** Pattern-name match only. Imitation-only hits are too broad for "now". */
export function scorePatternOnHatch(name: string, pattern: string): number {
  const n = norm(name);
  const p = norm(pattern);
  if (!n || !p) return 0;
  if (n === p || n.includes(p) || p.includes(n)) return 6;
  const nameTok = new Set(tokens(name));
  const pTok = tokens(pattern);
  const overlap = pTok.filter((t) => nameTok.has(t)).length;
  if (pTok.length && overlap >= Math.min(2, pTok.length)) return 4 + overlap;
  return 0;
}

export function currentHatchMonth(now = new Date()): string {
  return now.toLocaleString("en-US", { month: "long", timeZone: "America/Denver" });
}

export function fishingNowFromCharts(
  flyName: string,
  rivers: Array<{ slug: string; name: string; hatchChart?: HatchMonth[] | null }>,
  month: string,
): FishingNowRiver[] {
  const out: FishingNowRiver[] = [];
  const monthNorm = month.toLowerCase();

  for (const river of rivers) {
    const sizes = new Set<string>();
    let best = 0;
    for (const entry of river.hatchChart ?? []) {
      if ((entry.month ?? "").toLowerCase() !== monthNorm) continue;
      for (const h of entry.hatches ?? []) {
        const score = scorePatternOnHatch(flyName, h.pattern ?? "");
        if (score < 4) continue;
        best = Math.max(best, score);
        const size = (h.size ?? "").trim();
        if (size) sizes.add(size);
      }
    }
    if (best >= 4) {
      out.push({
        slug: river.slug,
        name: river.name,
        sizes: [...sizes],
      });
    }
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getFishingNowRivers(flyName: string): Promise<FishingNowRiver[]> {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("rivers")
      .select("slug, name, hatch_chart");
    if (error || !data) {
      if (error) console.error("[getFishingNowRivers]", error);
      return [];
    }
    const rivers = (data as Array<{ slug: string; name: string; hatch_chart?: HatchMonth[] | null }>).map(
      (row) => ({
        slug: row.slug,
        name: row.name,
        hatchChart: row.hatch_chart ?? [],
      }),
    );
    return fishingNowFromCharts(flyName, rivers, currentHatchMonth());
  } catch (err) {
    console.error("[getFishingNowRivers]", err);
    return [];
  }
}
