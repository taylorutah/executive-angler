import { unstable_noStore as noStore } from "next/cache";
import type { River } from "@/types/entities";

/**
 * The six rivers on the conditions rail. Slugs are real rows in `rivers`;
 * the label is a short display name for a 40px rail, not a second source of
 * truth for the river's name.
 */
export const FLAGSHIP_RIVERS: { slug: string; label: string }[] = [
  { slug: "madison-river", label: "Madison" },
  { slug: "green-river", label: "Green" },
  { slug: "arkansas-river-colorado", label: "Arkansas" },
  { slug: "bighorn-river", label: "Bighorn" },
  { slug: "henrys-fork", label: "Henry's Fork" },
  { slug: "south-platte-river", label: "South Platte" },
];

export interface FlagshipRiver {
  id: string;
  slug: string;
  label: string;
  name: string;
  destinationId: string;
  state?: string;
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
  /** True when the number is a last-seen daily mean, not a live IV reading. */
  stale: boolean;
}

export interface DailyReading {
  date: string;
  discharge: number;
}

const PARAM_DISCHARGE = "00060";
const PARAM_WATER_TEMP = "00010";
const STALE_AFTER_MS = 2 * 60 * 60 * 1000;

type GaugeRecord = { site_id?: string; siteId?: string; name?: string; section?: string };

export function siteIdOf(record: GaugeRecord | null | undefined): string | null {
  const id = record?.site_id ?? record?.siteId;
  return id ? String(id).trim() : null;
}

function fromList(list: GaugeRecord[], riverName: string): GaugeConfig | null {
  const first = list.find((g) => siteIdOf(g));
  const id = siteIdOf(first);
  if (!first || !id) return null;
  return {
    siteId: id,
    name: first.name ?? riverName,
    section: first.section ?? "Main",
  };
}

/**
 * `usgs_gauge_id` is a bare site id, a JSON array, or (from PostgREST) the
 * already-parsed array. Accept `site_id` and `siteId`.
 */
export function primaryGauge(raw: unknown, riverName: string): GaugeConfig | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) return fromList(raw as GaugeRecord[], riverName);
  if (typeof raw === "object") return fromList([raw as GaugeRecord], riverName);
  const value = String(raw).trim();
  if (!value) return null;
  if (!value.startsWith("[")) {
    return { siteId: value, name: riverName, section: "Main" };
  }
  try {
    const parsed = JSON.parse(value) as GaugeRecord[];
    return fromList(parsed, riverName);
  } catch {
    return null;
  }
}

const FLAGSHIP_FALLBACK: { slug: string; label: string }[] = [
  { slug: "yellowstone-river", label: "Yellowstone" },
  { slug: "snake-river-wyoming", label: "Snake" },
  { slug: "missouri-river", label: "Missouri" },
  { slug: "gallatin-river", label: "Gallatin" },
];

function toFlagship(
  river: River,
  label: string,
): FlagshipRiver {
  return {
    id: river.id,
    slug: river.slug,
    label,
    name: river.name,
    destinationId: river.destinationId,
    heroImageUrl: river.heroImageUrl,
    hatchChart: river.hatchChart,
    gauge: primaryGauge(river.usgsGaugeId, river.name),
  };
}

export function selectFlagshipRivers(rivers: River[]): FlagshipRiver[] {
  const bySlug = new Map(rivers.map((r) => [r.slug, r]));
  const picked: FlagshipRiver[] = [];
  const used = new Set<string>();
  for (const { slug, label } of [...FLAGSHIP_RIVERS, ...FLAGSHIP_FALLBACK]) {
    if (picked.length === 6) break;
    const river = bySlug.get(slug);
    if (!river || used.has(river.slug)) continue;
    used.add(river.slug);
    picked.push(toFlagship(river, label));
  }
  return picked;
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

/** Current values only — the working `/api/river-conditions` shape. Never P1D. */
export function instantaneousUrl(siteIds: string[]): string {
  return (
    "https://waterservices.usgs.gov/nwis/iv/?format=json" +
    `&sites=${siteIds.join(",")}` +
    `&parameterCd=${PARAM_DISCHARGE},${PARAM_WATER_TEMP}` +
    "&siteStatus=all"
  );
}

export function dailyUrl(siteIds: string[], start: string, end: string): string {
  return (
    "https://waterservices.usgs.gov/nwis/dv/?format=json" +
    `&sites=${siteIds.join(",")}` +
    `&parameterCd=${PARAM_DISCHARGE}` +
    `&statCd=00003&startDT=${start}&endDT=${end}`
  );
}

export function applyIvSeries(
  timeSeries: USGSTimeSeries[],
  bySite: Map<string, string[]>,
  into: Map<string, GaugeSnapshot>,
): void {
  for (const series of timeSeries) {
    const siteId = series.sourceInfo?.siteCode?.[0]?.value;
    const paramCode = series.variable?.variableCode?.[0]?.value;
    const riverIds = siteId ? bySite.get(siteId) : undefined;
    if (!riverIds || !paramCode) continue;

    const points = usablePoints(series);
    if (points.length === 0) continue;
    const latest = points[points.length - 1];
    const latestValue = parseFloat(latest.value);
    const age = Date.now() - new Date(latest.dateTime).getTime();

    for (const riverId of riverIds) {
      const snapshot: GaugeSnapshot = into.get(riverId) ?? {
        cfs: null,
        deltaCfs: null,
        waterTempF: null,
        observedAt: null,
        stale: false,
      };

      if (paramCode === PARAM_DISCHARGE) {
        snapshot.cfs = Math.round(latestValue);
        if (points.length > 1) {
          snapshot.deltaCfs = Math.round(latestValue - parseFloat(points[0].value));
        }
        snapshot.stale = Number.isFinite(age) && age > STALE_AFTER_MS;
      } else if (paramCode === PARAM_WATER_TEMP) {
        snapshot.waterTempF = Math.round((latestValue * 9) / 5 + 32);
      }
      if (!snapshot.observedAt || latest.dateTime > snapshot.observedAt) {
        snapshot.observedAt = latest.dateTime;
      }
      into.set(riverId, snapshot);
    }
  }
}

export function applyDvSeries(
  timeSeries: USGSTimeSeries[],
  bySite: Map<string, string[]>,
  into: Map<string, GaugeSnapshot>,
): void {
  for (const series of timeSeries) {
    const siteId = series.sourceInfo?.siteCode?.[0]?.value;
    const paramCode = series.variable?.variableCode?.[0]?.value;
    const riverIds = siteId ? bySite.get(siteId) : undefined;
    if (!riverIds || paramCode !== PARAM_DISCHARGE) continue;
    const points = usablePoints(series);
    if (points.length === 0) continue;
    const latest = points[points.length - 1];
    const previous = points.length > 1 ? points[points.length - 2] : null;
    const latestValue = parseFloat(latest.value);

    for (const riverId of riverIds) {
      const existing = into.get(riverId);
      if (existing?.cfs != null && !existing.stale) continue;
      into.set(riverId, {
        cfs: Math.round(latestValue),
        deltaCfs: previous ? Math.round(latestValue - parseFloat(previous.value)) : null,
        waterTempF: existing?.waterTempF ?? null,
        observedAt: latest.dateTime,
        stale: true,
      });
    }
  }
}

async function readUsgs(url: string): Promise<USGSTimeSeries[]> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { value?: { timeSeries?: USGSTimeSeries[] } };
  return json?.value?.timeSeries ?? [];
}

export function applyDvHistory(
  timeSeries: USGSTimeSeries[],
  bySite: Map<string, string[]>,
  into: Map<string, DailyReading[]>,
): void {
  for (const series of timeSeries) {
    const siteId = series.sourceInfo?.siteCode?.[0]?.value;
    const paramCode = series.variable?.variableCode?.[0]?.value;
    const riverIds = siteId ? bySite.get(siteId) : undefined;
    if (!riverIds || (paramCode && paramCode !== PARAM_DISCHARGE)) continue;
    const points = usablePoints(series);
    if (points.length === 0) continue;
    const readings: DailyReading[] = points.map((p) => ({
      date: p.dateTime.slice(0, 10),
      discharge: parseFloat(p.value),
    }));
    for (const riverId of riverIds) into.set(riverId, readings);
  }
}

/** Thirty daily means for the flagship gauges. Empty map if USGS is silent. */
export async function getFlagshipHistories(
  rivers: FlagshipRiver[],
): Promise<Map<string, DailyReading[]>> {
  noStore();
  const bySite = new Map<string, string[]>();
  for (const river of rivers) {
    if (!river.gauge) continue;
    const existing = bySite.get(river.gauge.siteId) ?? [];
    existing.push(river.id);
    bySite.set(river.gauge.siteId, existing);
  }
  const into = new Map<string, DailyReading[]>();
  if (bySite.size === 0) return into;

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  try {
    applyDvHistory(
      await readUsgs(
        dailyUrl(
          [...bySite.keys()],
          start.toISOString().slice(0, 10),
          end.toISOString().slice(0, 10),
        ),
      ),
      bySite,
      into,
    );
  } catch {
    // Roster sparks and the instrument fall back to a client fetch / empty cell.
  }
  return into;
}

/**
 * Live snapshots for the rail. Must not run a 24-hour IV dump — that payload
 * truncates and this function used to swallow the parse error as "offline".
 * `noStore` keeps `/` from baking a failed build-time fetch into ISR HTML.
 */
export async function getGaugeSnapshots(
  rivers: FlagshipRiver[],
): Promise<Map<string, GaugeSnapshot>> {
  noStore();

  const bySite = new Map<string, string[]>();
  for (const river of rivers) {
    if (!river.gauge) continue;
    const existing = bySite.get(river.gauge.siteId) ?? [];
    existing.push(river.id);
    bySite.set(river.gauge.siteId, existing);
  }

  const snapshots = new Map<string, GaugeSnapshot>();
  if (bySite.size === 0) return snapshots;

  const siteIds = [...bySite.keys()];
  try {
    applyIvSeries(await readUsgs(instantaneousUrl(siteIds)), bySite, snapshots);
  } catch {
    // IV failed closed — last-seen daily mean is the honest fallback.
  }

  const missing = siteIds.filter((id) =>
    (bySite.get(id) ?? []).some((riverId) => snapshots.get(riverId)?.cfs == null),
  );
  if (missing.length > 0) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 3);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);
    try {
      applyDvSeries(await readUsgs(dailyUrl(missing, startStr, endStr)), bySite, snapshots);
    } catch {
      // Leave those rivers without a number; the rail will say last seen if we have one.
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

export function formatObservedDay(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
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
