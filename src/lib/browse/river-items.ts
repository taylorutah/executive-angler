import { DESTINATION_STATE_MAP } from "@/lib/destination-state-map";
import { speciesTokens } from "./species-tokens";
import type { River } from "@/types/entities";
import type { CardData } from "@/types/list-config";

export type RiverBrowseSource = Pick<
  River,
  | "id"
  | "slug"
  | "name"
  | "destinationId"
  | "additionalDestinationIds"
  | "description"
  | "heroImageUrl"
  | "primarySpecies"
  | "flowType"
  | "difficulty"
  | "wadingType"
  | "latitude"
  | "longitude"
  | "featured"
  | "usgsGaugeId"
>;

export type RiverBrowseItem = CardData & {
  riverId: string;
  latitude: number;
  longitude: number;
  usgsGaugeId?: string | null;
};

export function statesForRiver(river: Pick<River, "destinationId" | "additionalDestinationIds">): string[] {
  const ids = [river.destinationId, ...(river.additionalDestinationIds ?? [])];
  return [...new Set(ids.map((id) => DESTINATION_STATE_MAP[id ?? ""]).filter(Boolean))];
}

export function waterTypeKey(flowType: string): string {
  return (flowType ?? "").trim().toLowerCase();
}

export function toRiverBrowseItem(river: RiverBrowseSource): RiverBrowseItem {
  const states = statesForRiver(river);
  const water = waterTypeKey(river.flowType);
  const species = speciesTokens(river.primarySpecies ?? []);
  return {
    riverId: river.id,
    href: `/rivers/${river.slug}`,
    imageUrl: river.heroImageUrl,
    imageAlt: river.name,
    title: river.name,
    subtitle: [states[0], river.flowType].filter(Boolean).join(" · "),
    meta: [
      (river.primarySpecies ?? []).slice(0, 2).join(", "),
      river.difficulty,
      river.wadingType,
    ]
      .filter(Boolean)
      .join(" · "),
    badges: undefined,
    featured: river.featured,
    description: river.description?.slice(0, 150),
    tags: undefined,
    latitude: Number(river.latitude) || 0,
    longitude: Number(river.longitude) || 0,
    usgsGaugeId: river.usgsGaugeId,
    _filterValues: {
      state: states[0] ?? "",
      waterType: water,
      species: species.join(","),
      difficulty: river.difficulty,
      flow: "",
      near: "0",
    },
  };
}
