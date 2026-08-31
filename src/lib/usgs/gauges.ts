import { isUsgsSiteId } from "./site-id";

/** One mapped USGS site on a river (a section). */
export interface RiverGauge {
  site_id: string;
  name: string;
  section: string;
  latitude?: number;
  longitude?: number;
}

type GaugeRecord = {
  site_id?: unknown;
  siteId?: unknown;
  id?: unknown;
  name?: unknown;
  section?: unknown;
  latitude?: unknown;
  longitude?: unknown;
};

function asCoord(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return undefined;
  const n = Number(value.trim());
  return Number.isFinite(n) ? n : undefined;
}

function asSiteId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return isUsgsSiteId(trimmed) ? trimmed : undefined;
}

function normalizeOne(raw: unknown, fallbackName: string): RiverGauge | null {
  if (typeof raw === "string") {
    const site_id = asSiteId(raw);
    return site_id ? { site_id, name: fallbackName, section: "Main" } : null;
  }
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as GaugeRecord;
  const site_id = asSiteId(rec.site_id ?? rec.siteId ?? rec.id);
  if (!site_id) return null;
  const name = typeof rec.name === "string" && rec.name.trim() ? rec.name.trim() : fallbackName;
  const section =
    typeof rec.section === "string" && rec.section.trim() ? rec.section.trim() : "Main";
  const latitude = asCoord(rec.latitude);
  const longitude = asCoord(rec.longitude);
  return { site_id, name, section, latitude, longitude };
}

function normalizeList(list: unknown[], fallbackName: string): RiverGauge[] {
  const out: RiverGauge[] = [];
  for (const item of list) {
    const g = normalizeOne(item, fallbackName);
    if (g) out.push(g);
  }
  return out;
}

/**
 * `rivers.usgs_gauge_id` is a bare site id, a JSON array string, or (from
 * PostgREST jsonb) the already-parsed array/object. Never call `.trim()` on it.
 */
export function parseRiverGauges(raw: unknown, fallbackName = "Gauge"): RiverGauge[] {
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) return normalizeList(raw, fallbackName);
  if (typeof raw === "object") return normalizeList([raw], fallbackName);
  if (typeof raw !== "string") return [];
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "[]" || trimmed === "null") return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) return normalizeList(parsed, fallbackName);
      if (parsed && typeof parsed === "object") return normalizeList([parsed], fallbackName);
    } catch {
      return [];
    }
    return [];
  }
  const first = trimmed.split(",")[0]?.trim();
  const site_id = asSiteId(first);
  if (!site_id) return [];
  return [{ site_id, name: fallbackName, section: "Main" }];
}

/** First valid USGS site id from a river `usgs_gauge_id` value. */
export function firstUsgsSiteId(raw?: unknown): string | undefined {
  return parseRiverGauges(raw)[0]?.site_id;
}
