import { excerptBrief, titleCaseToken, type HoverChip } from "./hover-panel";
import type { Species } from "@/types/entities";
import type { CardData } from "@/types/list-config";

export type SpeciesBrowseItem = CardData & {
  _filterValues: Record<string, string>;
};

/** First clause of a stored size string — "12-20 inches, 1-5 lbs" → "12-20 inches". */
export function sizeChipValue(averageSize: string): string | undefined {
  const raw = (averageSize ?? "").trim();
  if (!raw) return undefined;
  return raw.split(",")[0].trim() || raw;
}

/** Drop trailing hook-size tokens so the footer stays one line. */
export function flyDisplayName(raw: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";
  return trimmed.replace(/\s*#[\d].*$/, "").trim() || trimmed;
}

export function topFliesLine(flies: string[]): string {
  const names = (flies ?? []).map(flyDisplayName).filter(Boolean).slice(0, 3);
  return names.length ? `Top flies: ${names.join(", ")}` : "";
}

export function speciesHoverChips(
  species: Pick<Species, "family" | "averageSize">,
): HoverChip[] {
  const chips: HoverChip[] = [];
  const family = titleCaseToken(species.family ?? "");
  const size = sizeChipValue(species.averageSize ?? "");
  if (family) chips.push({ label: "Family", value: family });
  if (size) chips.push({ label: "Size", value: size });
  return chips;
}

export function toSpeciesBrowseItem(sp: Species): SpeciesBrowseItem {
  return {
    href: `/species/${sp.slug}`,
    imageUrl: sp.imageUrl || sp.illustrationUrl || undefined,
    imageAlt: `${sp.commonName} — ${sp.scientificName || "fly fishing species"}`,
    title: sp.commonName,
    subtitle: sp.scientificName,
    meta: [sp.family, sp.conservationStatus].filter(Boolean).join(" · ") || undefined,
    badges: sp.family ? [sp.family] : undefined,
    featured: sp.featured,
    description: sp.description?.substring(0, 150),
    imageContain: true,
    hoverPanel: {
      chips: speciesHoverChips(sp),
      brief: excerptBrief(sp.description ?? ""),
      footer: topFliesLine(sp.preferredFlies ?? []) || undefined,
    },
    _filterValues: {
      family: sp.family || "",
    },
  };
}
