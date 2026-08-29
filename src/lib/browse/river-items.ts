import { DESTINATION_STATE_MAP } from "@/lib/destination-state-map";
import { currentHatchMonth } from "@/lib/flies/fishing-now";
import { normalizeImageUrl } from "@/lib/media/image-url";
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

const MONTH_INDEX: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

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
 * wade → Wade, float → Boat, both → Mixed. Unknown values are dropped.
 */
export function accessLabel(wadingType: string): string | undefined {
  const key = (wadingType ?? "").trim().toLowerCase();
  if (key === "wade") return "Wade";
  if (key === "float") return "Boat";
  if (key === "both") return "Mixed";
  return undefined;
}

export function difficultyLabel(difficulty: string): string | undefined {
  const raw = (difficulty ?? "").trim();
  if (!raw) return undefined;
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

/** Collapse stored month names into "Apr–Jun, Sep–Oct". Drops unparseable tokens. */
export function formatBestMonthsLine(months: string[]): string {
  const idxs = [
    ...new Set(
      (months ?? [])
        .map((m) => MONTH_INDEX[m.trim().toLowerCase()])
        .filter((n): n is number => n !== undefined),
    ),
  ].sort((a, b) => a - b);
  if (idxs.length === 0) return "";

  const ranges: [number, number][] = [];
  let start = idxs[0];
  let prev = idxs[0];
  for (let i = 1; i < idxs.length; i++) {
    if (idxs[i] === prev + 1) {
      prev = idxs[i];
      continue;
    }
    ranges.push([start, prev]);
    start = idxs[i];
    prev = idxs[i];
  }
  ranges.push([start, prev]);

  return ranges
    .map(([a, b]) => (a === b ? MONTH_ABBR[a] : `${MONTH_ABBR[a]}–${MONTH_ABBR[b]}`))
    .join(", ");
}

/** First 2–3 sentences of a river description, clamped at a word boundary. */
export function excerptRiverBrief(description: string, maxChars = 280): string {
  const text = (description ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const sentences =
    text.match(/[^.!?]+[.!?]+(?:\s|$)/g)?.map((s) => s.trim()) ?? (text ? [text] : []);
  let out = "";
  for (let i = 0; i < sentences.length && i < 3; i++) {
    const next = out ? `${out} ${sentences[i]}` : sentences[i];
    if (next.length > maxChars) {
      if (!out) {
        const cut = next.slice(0, maxChars);
        const space = cut.lastIndexOf(" ");
        return `${(space > 80 ? cut.slice(0, space) : cut).replace(/[.,;:]+$/, "")}…`;
      }
      break;
    }
    out = next;
  }
  return out;
}

function hoverChips(river: RiverBrowseSource): { label: string; value: string }[] {
  const chips: { label: string; value: string }[] = [];
  const water = waterTypeLabel(river.flowType);
  const access = accessLabel(river.wadingType);
  const difficulty = difficultyLabel(river.difficulty);
  if (water) chips.push({ label: "Water", value: water });
  if (access) chips.push({ label: "Access", value: access });
  if (difficulty) chips.push({ label: "Difficulty", value: difficulty });
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
      chips: hoverChips(river),
      brief: excerptRiverBrief(river.description ?? ""),
      bestMonths: formatBestMonthsLine(river.bestMonths ?? []),
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
