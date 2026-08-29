import { destinationRegionGroups } from "@/lib/list-configs";
import { seasonsFromBestMonths, tripLengthFromPlace } from "./place-filters";
import { speciesTokens } from "./species-tokens";
import { formatBestMonthsLine, type HoverChip } from "./hover-panel";
import type { Destination } from "@/types/entities";
import type { CardData } from "@/types/list-config";

export type DestinationBrowseItem = CardData & {
  _filterValues: Record<string, string>;
};

function regionGroup(region: string): string {
  for (const [group, regions] of Object.entries(destinationRegionGroups)) {
    if (regions.includes(region)) return group;
  }
  return "north-america";
}

function nameAlreadyHas(name: string, token: string): boolean {
  const n = name.trim().toLowerCase();
  const t = token.trim().toLowerCase();
  if (!n || !t) return false;
  return n === t || n.includes(t);
}

/**
 * Region is already the card badge; state/country only when they add
 * a place the title does not already name.
 */
export function destinationFooterGeo(
  dest: Pick<Destination, "name" | "region" | "country" | "state">,
): string {
  const parts: string[] = [];
  const state = dest.state?.trim() ?? "";
  const country = dest.country?.trim() ?? "";
  if (state && !nameAlreadyHas(dest.name, state)) parts.push(state);
  if (
    country &&
    country !== "United States" &&
    !nameAlreadyHas(dest.name, country) &&
    country !== state
  ) {
    parts.push(country);
  }
  return parts.join(" · ");
}

export function destinationSpeciesChips(names: string[]): HoverChip[] {
  return (names ?? [])
    .map((n) => n.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((name) => {
      const parts = name.split(/\s+/);
      if (parts.length >= 2) {
        return { label: parts[parts.length - 1], value: parts.slice(0, -1).join(" ") };
      }
      return { label: "Species", value: name };
    });
}

function hoverFooter(dest: Destination): string {
  const best = formatBestMonthsLine(dest.bestMonths ?? []);
  const geo = destinationFooterGeo(dest);
  return [geo, best ? `Best: ${best}` : ""].filter(Boolean).join(" · ");
}

export function toDestinationBrowseItem(dest: Destination): DestinationBrowseItem {
  return {
    href: `/destinations/${dest.slug}`,
    imageUrl: dest.heroImageUrl,
    imageAlt: `Fly fishing in ${dest.name}`,
    title: dest.name,
    subtitle: dest.tagline,
    meta: dest.primarySpecies.slice(0, 3).join(" · "),
    badges: [dest.region],
    featured: dest.featured,
    description: dest.description?.substring(0, 150),
    hoverPanel: {
      chips: destinationSpeciesChips(dest.primarySpecies),
      brief: dest.tagline?.trim() || undefined,
      footer: hoverFooter(dest) || undefined,
    },
    _filterValues: {
      region: regionGroup(dest.region),
      season: seasonsFromBestMonths(dest.bestMonths).join(","),
      species: speciesTokens(dest.primarySpecies).join(","),
      tripLength: tripLengthFromPlace({
        country: dest.country,
        state: dest.state,
      }),
    },
  };
}
