import type { River } from "@/types/entities";

/**
 * The six rivers on the conditions rail. Slugs are real rows in `rivers`;
 * the label is a short display name for a 40px rail, not a second source of
 * truth for the river's name.
 */
export const FLAGSHIP_RIVERS: { slug: string; label: string }[] = [
  { slug: "madison-river", label: "Madison" },
  { slug: "green-river", label: "Green" },
  { slug: "henrys-fork", label: "Henry's Fork" },
  { slug: "yellowstone-river", label: "Yellowstone" },
  { slug: "snake-river-wyoming", label: "Snake" },
  { slug: "missouri-river", label: "Missouri" },
];

export interface FlagshipRiver {
  id: string;
  slug: string;
  label: string;
  name: string;
  heroImageUrl?: string;
  hatchChart: River["hatchChart"];
  gauge: GaugeConfig | null;
}

export interface GaugeConfig {
  siteId: string;
  name: string;
  section: string;
}

export interface GaugeSnapshot {
  cfs: number | null;
  /** Change in cfs across the last 24 hours of readings. */
  deltaCfs: number | null;
  waterTempF: number | null;
  observedAt: string | null;
}

const PARAM_DISCHARGE = "00060";
const PARAM_WATER_TEMP = "00010";

/**
 * `usgs_gauge_id` holds either a JSON array of gauge configs or a bare site id.
 * The rail shows one number per river, so we take the first configured gauge.
 */
export function primaryGauge(raw: string | null | undefined, riverName: string): GaugeConfig | null {
  const value = raw?.trim();
  if (!value) return null;
  if (!value.startsWith("[")) {
    return { siteId: value, name: riverName, section: "Main" };
  }
  try {
    const parsed = JSON.parse(value) as Array<{ site_id?: string; name?: string; section?: string }>;
    const first = parsed.find((g) => g?.site_id);
    if (!first?.site_id) return null;
    return {
      siteId: first.site_id,
      name: first.name ?? riverName,
      section: first.section ?? "Main",
    };
  } catch {
    return null;
  }
}

export function selectFlagshipRivers(rivers: River[]): FlagshipRiver[] {
  const bySlug = new Map(rivers.map((r) => [r.slug, r]));
  return FLAGSHIP_RIVERS.flatMap(({ slug, label }) => {
    const river = bySlug.get(slug);
    if (!river) return [];
    return [
      {
        id: river.id,
        slug: river.slug,
        label,
        name: river.name,
        heroImageUrl: river.heroImageUrl,
        hatchChart: river.hatchChart,
        gauge: primaryGauge(river.usgsGaugeId, river.name),
      },
    ];
  });
}

interface USGSPoint {
  value: string;
  dateTime: string;
}

interface USGSTimeSeries {
  sourceInfo?: { siteCode?: { value: string }[] };
  variable?: { variableCode?: { value: string }[] };
  values?: { value?: USGSPoint[] }[];
}

function usablePoints(series: USGSTimeSeries): USGSPoint[] {
  return (series.values?.[0]?.value ?? []).filter(
    (p) => p.value !== "" && p.value !== "-999999" && Number.isFinite(parseFloat(p.value)),
  );
}

/**
 * One batched USGS instantaneous-values request for every flagship gauge.
 * A failed or unreachable gauge service is not an error state for the page —
 * the rail falls back to names and links.
 */
export async function getGaugeSnapshots(
  rivers: FlagshipRiver[],
): Promise<Map<string, GaugeSnapshot>> {
  const bySite = new Map<string, string[]>();
  for (const river of rivers) {
    if (!river.gauge) continue;
    const existing = bySite.get(river.gauge.siteId) ?? [];
    existing.push(river.id);
    bySite.set(river.gauge.siteId, existing);
  }

  const snapshots = new Map<string, GaugeSnapshot>();
  if (bySite.size === 0) return snapshots;

  const url =
    "https://waterservices.usgs.gov/nwis/iv/?format=json" +
    `&sites=${[...bySite.keys()].join(",")}` +
    `&parameterCd=${PARAM_DISCHARGE},${PARAM_WATER_TEMP}` +
    "&period=P1D&siteStatus=all";

  let timeSeries: USGSTimeSeries[] = [];
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
    });
    if (!res.ok) return snapshots;
    const json = (await res.json()) as { value?: { timeSeries?: USGSTimeSeries[] } };
    timeSeries = json?.value?.timeSeries ?? [];
  } catch {
    return snapshots;
  }

  for (const series of timeSeries) {
    const siteId = series.sourceInfo?.siteCode?.[0]?.value;
    const paramCode = series.variable?.variableCode?.[0]?.value;
    const riverIds = siteId ? bySite.get(siteId) : undefined;
    if (!riverIds || !paramCode) continue;

    const points = usablePoints(series);
    if (points.length === 0) continue;
    const latest = points[points.length - 1];
    const latestValue = parseFloat(latest.value);

    for (const riverId of riverIds) {
      const snapshot: GaugeSnapshot = snapshots.get(riverId) ?? {
        cfs: null,
        deltaCfs: null,
        waterTempF: null,
        observedAt: null,
      };

      if (paramCode === PARAM_DISCHARGE) {
        snapshot.cfs = Math.round(latestValue);
        snapshot.deltaCfs = Math.round(latestValue - parseFloat(points[0].value));
      } else if (paramCode === PARAM_WATER_TEMP) {
        snapshot.waterTempF = Math.round((latestValue * 9) / 5 + 32);
      }
      if (!snapshot.observedAt || latest.dateTime > snapshot.observedAt) {
        snapshot.observedAt = latest.dateTime;
      }
      snapshots.set(riverId, snapshot);
    }
  }

  return snapshots;
}

export function formatObservedAt(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Denver",
  });
}

export function formatDelta(delta: number | null): string | null {
  if (delta === null) return null;
  if (delta === 0) return "±0";
  return `${delta > 0 ? "+" : "−"}${Math.abs(delta)}`;
}

/** Insects the river's own hatch chart lists for the given month. */
export function hatchesForMonth(
  hatchChart: River["hatchChart"],
  month: string,
): string[] {
  const entry = (hatchChart ?? []).find((m) => m?.month === month);
  return (entry?.hatches ?? []).map((h) => h.insect).filter(Boolean);
}
