import type { CanonicalFly, River } from "@/types/entities";
import type { SearchDocument } from "./types";
import { SEARCH_ALIASES, expandTerm } from "./aliases";
import { normalizeText } from "./normalize";

export function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface HatchAgg {
  name: string;
  slug: string;
  months: Set<string>;
  rivers: Set<string>;
  aliases: Set<string>;
}

export function canonicalHatchName(raw: string): string {
  const n = normalizeText(raw);
  if (!n) return raw.trim();
  const extras = SEARCH_ALIASES[n];
  if (extras && extras.length > 0) {
    const longer = [...extras].sort((a, b) => b.length - a.length)[0];
    if (longer && longer.length > n.length) {
      return longer.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }
  return raw.trim();
}

/** Every slug that should resolve to this insect (raw, canonical, aliases). */
export function hatchSlugsFor(name: string): string[] {
  const slugs = new Set<string>();
  const add = (v: string) => {
    const s = slugifyName(v);
    if (s) slugs.add(s);
  };
  add(name);
  add(canonicalHatchName(name));
  for (const v of expandTerm(normalizeText(name))) add(v);
  return [...slugs];
}

export function hatchMatchesSlug(name: string, slug: string): boolean {
  return hatchSlugsFor(name).includes(slug);
}

/**
 * Derived hatch documents. No table — union of river hatch charts + fly `imitates`.
 * Chart-only insects still get a `/flies/hatch/[slug]` URL.
 */
export function buildHatchDocuments(
  rivers: River[],
  flies: CanonicalFly[],
): SearchDocument[] {
  const bySlug = new Map<string, HatchAgg>();

  const bump = (raw: string, extra?: { month?: string; river?: string }) => {
    const name = canonicalHatchName(raw);
    if (!name) return;
    const slug = slugifyName(name);
    if (!slug) return;
    let row = bySlug.get(slug);
    if (!row) {
      row = {
        name,
        slug,
        months: new Set(),
        rivers: new Set(),
        aliases: new Set([normalizeText(raw), normalizeText(name)]),
      };
      bySlug.set(slug, row);
    }
    row.aliases.add(normalizeText(raw));
    if (extra?.month) row.months.add(extra.month);
    if (extra?.river) row.rivers.add(extra.river);
  };

  for (const river of rivers) {
    for (const month of river.hatchChart ?? []) {
      for (const h of month.hatches ?? []) {
        if (h.insect) bump(h.insect, { month: month.month, river: river.name });
      }
    }
  }

  for (const fly of flies) {
    for (const im of fly.imitates ?? []) bump(im);
  }

  const docs: SearchDocument[] = [];
  for (const row of bySlug.values()) {
    const months = [...row.months];
    const riverCount = row.rivers.size;
    const subtitleParts = [
      months.length ? months.slice(0, 4).join(", ") : null,
      riverCount ? `${riverCount} river${riverCount === 1 ? "" : "s"}` : null,
    ].filter(Boolean);
    docs.push({
      type: "hatch",
      slug: row.slug,
      title: row.name,
      subtitle: subtitleParts.join(" · ") || "Hatch",
      href: `/flies/hatch/${row.slug}`,
      keywords: [...row.aliases, "hatch", "hatches"].join(" "),
      months,
      riverCount,
    });
  }
  return docs.sort((a, b) => a.title.localeCompare(b.title));
}
