import { DESTINATION_STATE_MAP } from "@/lib/destination-state-map";
import { currentHatchMonth } from "@/lib/flies/fishing-now";
import { normalizeImageUrl } from "@/lib/media/image-url";
import { excerptBrief, formatBestMonthsLine } from "./hover-panel";
import { speciesTokens } from "./species-tokens";
import type { River } from "@/types/entities";
import type { CardData } from "@/types/list-config";

export { excerptBrief as excerptRiverBrief, formatBestMonthsLine } from "./hover-panel";

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
  | "hatchChart"
  | "bestMonths"
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

/** Chart insect only — drop the scientific parenthetical, do not invent a nickname. */
export function shortInsect(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function hatchThisMonth(hatchChart: River["hatchChart"], month: string): string {
  const entry = (hatchChart ?? []).find((m) => m?.month === month);
  const insect = (entry?.hatches ?? []).map((h) => h.insect).find(Boolean);
  return insect ? shortInsect(insect) : "";
}

/** Title-case a stored water-type string. Does not invent a type. */
export function waterTypeLabel(flowType: string): string | undefined {
  const raw = (flowType ?? "").trim();
  if (!raw) return undefined;
  return raw
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Access chip from `wadingType` only.
 * wade → Wade, float → Boat, both → Wade / boat. Unknown values are dropped.
 */
export function accessLabel(wadingType: string): string | undefined {
  const key = (wadingType ?? "").trim().toLowerCase();
  if (key === "wade") return "Wade";
  if (key === "float") return "Boat";
  if (key === "both") return "Wade / boat";
  return undefined;
}

export function difficultyLabel(difficulty: string): string | undefined {
  const raw = (difficulty ?? "").trim();
  if (!raw) return undefined;
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function hoverChips(
  river: RiverBrowseSource,
  hatch: string,
): { label: string; value: string }[] {
  const chips: { label: string; value: string }[] = [];
  const water = waterTypeLabel(river.flowType);
  const access = accessLabel(river.wadingType);
  const difficulty = difficultyLabel(river.difficulty);
  if (water) chips.push({ label: "Water", value: water });
  if (access) chips.push({ label: "Access", value: access });
  if (difficulty) chips.push({ label: "Difficulty", value: difficulty });
  if (hatch) chips.push({ label: "Hatch", value: hatch });
  return chips;
}

export function toRiverBrowseItem(
  river: RiverBrowseSource,
  month = currentHatchMonth(),
): RiverBrowseItem {
  const states = statesForRiver(river);
  const water = waterTypeKey(river.flowType);
  const species = speciesTokens(river.primarySpecies ?? []);
  const hatch = hatchThisMonth(river.hatchChart, month);
  const state = states[0] ?? "";
  const best = formatBestMonthsLine(river.bestMonths ?? []);
  return {
    riverId: river.id,
    href: `/rivers/${river.slug}`,
    imageUrl: normalizeImageUrl(river.heroImageUrl),
    imageAlt: river.name,
    title: river.name,
    kicker: state || undefined,
    group: state || undefined,
    subtitle: [state, river.flowType].filter(Boolean).join(" · "),
    meta: hatch || river.flowType || undefined,
    badges: undefined,
    featured: river.featured,
    description: river.description?.slice(0, 150),
    hoverPanel: {
      chips: hoverChips(river, hatch),
      brief: excerptBrief(river.description ?? ""),
      footer: best ? `Best: ${best}` : undefined,
    },
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
