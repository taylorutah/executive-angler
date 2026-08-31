/**
 * USGS Water Data access.
 *
 * Primary: modern OGC API at api.waterdata.usgs.gov (WaterServices is
 * decommissioned Q1 2027; USGS began degrading waterservices.usgs.gov in
 * August 2026). Fallback: legacy WaterServices JSON, same observations.
 *
 * `EA_USGS_FIXTURE=1` returns a frozen 740 cfs so visual snapshots do not
 * capture live jitter. Production never sets that flag.
 */

import { isUsgsSiteId } from "./site-id";

export const PARAM_DISCHARGE = "00060";
export const PARAM_GAGE_HEIGHT = "00065";
export const PARAM_WATER_TEMP = "00010";
export const STAT_DAILY_MEAN = "00003";
export const USGS_MISSING = "-999999";

const OGC_BASE = "https://api.waterdata.usgs.gov/ogcapi/v0/collections";
const LEGACY_IV = "https://waterservices.usgs.gov/nwis/iv/";
const LEGACY_DV = "https://waterservices.usgs.gov/nwis/dv/";
const USER_AGENT = "ExecutiveAngler/1.0 (+https://www.executiveangler.com)";
const FIXTURE_AT = "2026-08-24T18:00:00.000Z";
const FIXTURE_CFS = 740;
const CHUNK = 40;
const DEFAULT_TIMEOUT_MS = 8_000;

export interface UsgsObservation {
  siteId: string;
  siteName?: string;
  parameterCode: string;
  value: number;
  dateTime: string;
}

export interface UsgsDailyPoint {
  siteId: string;
  date: string;
  value: number;
}

export interface UsgsSiteLocation {
  siteId: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface OgcFeature {
  geometry?: { type?: string; coordinates?: number[] };
  properties?: Record<string, unknown>;
}

interface OgcCollection {
  features?: OgcFeature[];
  links?: Array<{ rel?: string; href?: string }>;
}

interface LegacyPoint {
  value?: string;
  dateTime?: string;
}

interface LegacyTimeSeries {
  sourceInfo?: {
    siteName?: string;
    siteCode?: Array<{ value?: string }>;
  };
  variable?: { variableCode?: Array<{ value?: string }> };
  values?: Array<{ value?: LegacyPoint[] }>;
}

interface LegacyResponse {
  value?: { timeSeries?: LegacyTimeSeries[] };
}

export function usgsFixtureEnabled(): boolean {
  return process.env.EA_USGS_FIXTURE === "1";
}

export function monitoringLocationId(siteId: string): string {
  return siteId.startsWith("USGS-") ? siteId : `USGS-${siteId}`;
}

export function siteIdFromMonitoringLocation(id: string): string {
  return id.replace(/^USGS-/i, "");
}

export function usableNumber(raw: unknown): number | null {
  if (raw == null || raw === "" || raw === USGS_MISSING) return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function uniqueSiteIds(siteIds: string[]): string[] {
  return [...new Set(siteIds.map((s) => s.trim()).filter(isUsgsSiteId))];
}

function apiKeyParam(params: URLSearchParams): void {
  const key = process.env.USGS_API_KEY?.trim();
  if (key) params.set("api_key", key);
}

function headers(): HeadersInit {
  return { Accept: "application/json", "User-Agent": USER_AGENT };
}

async function getJson(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<unknown> {
  const res = await fetch(url, {
    headers: headers(),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`USGS ${res.status} for ${url.slice(0, 120)}`);
  }
  return res.json();
}

export function latestContinuousUrl(siteIds: string[], parameterCodes: string[]): string {
  const params = new URLSearchParams({
    f: "json",
    monitoring_location_id: uniqueSiteIds(siteIds).map(monitoringLocationId).join(","),
    parameter_code: parameterCodes.join(","),
    limit: String(Math.max(100, uniqueSiteIds(siteIds).length * parameterCodes.length * 2)),
  });
  apiKeyParam(params);
  return `${OGC_BASE}/latest-continuous/items?${params.toString()}`;
}

export function dailyUrl(
  siteIds: string[],
  start: string,
  end: string,
  parameterCode = PARAM_DISCHARGE,
): string {
  const params = new URLSearchParams({
    f: "json",
    monitoring_location_id: uniqueSiteIds(siteIds).map(monitoringLocationId).join(","),
    parameter_code: parameterCode,
    statistic_id: STAT_DAILY_MEAN,
    datetime: `${start}/${end}`,
    limit: "10000",
    sortby: "time",
  });
  apiKeyParam(params);
  return `${OGC_BASE}/daily/items?${params.toString()}`;
}

export function continuousUrl(
  siteIds: string[],
  startIso: string,
  endIso: string,
  parameterCodes: string[],
): string {
  const params = new URLSearchParams({
    f: "json",
    monitoring_location_id: uniqueSiteIds(siteIds).map(monitoringLocationId).join(","),
    parameter_code: parameterCodes.join(","),
    datetime: `${startIso}/${endIso}`,
    limit: "10000",
    sortby: "time",
  });
  apiKeyParam(params);
  return `${OGC_BASE}/continuous/items?${params.toString()}`;
}

export function monitoringLocationsUrl(siteIds: string[]): string {
  const params = new URLSearchParams({
    f: "json",
    id: uniqueSiteIds(siteIds).map(monitoringLocationId).join(","),
    limit: String(Math.max(10, uniqueSiteIds(siteIds).length)),
  });
  apiKeyParam(params);
  return `${OGC_BASE}/monitoring-locations/items?${params.toString()}`;
}

export function legacyIvUrl(siteIds: string[], parameterCodes: string[], extra?: Record<string, string>): string {
  const params = new URLSearchParams({
    format: "json",
    sites: uniqueSiteIds(siteIds).join(","),
    parameterCd: parameterCodes.join(","),
    siteStatus: "all",
    ...extra,
  });
  return `${LEGACY_IV}?${params.toString()}`;
}

export function legacyDvUrl(
  siteIds: string[],
  parameterCode: string,
  extra: Record<string, string>,
): string {
  const params = new URLSearchParams({
    format: "json",
    sites: uniqueSiteIds(siteIds).join(","),
    parameterCd: parameterCode,
    statCd: STAT_DAILY_MEAN,
    ...extra,
  });
  return `${LEGACY_DV}?${params.toString()}`;
}

function propString(props: Record<string, unknown> | undefined, key: string): string | undefined {
  const v = props?.[key];
  return typeof v === "string" && v ? v : undefined;
}

export function observationsFromOgc(features: OgcFeature[]): UsgsObservation[] {
  const out: UsgsObservation[] = [];
  for (const feature of features) {
    const props = feature.properties ?? {};
    const loc = propString(props, "monitoring_location_id") ?? propString(props, "monitoring_location_number");
    const siteId = loc ? siteIdFromMonitoringLocation(loc) : undefined;
    const parameterCode = propString(props, "parameter_code");
    const dateTime = propString(props, "time");
    const value = usableNumber(props.value);
    if (!siteId || !isUsgsSiteId(siteId) || !parameterCode || !dateTime || value == null) continue;
    out.push({
      siteId,
      siteName: propString(props, "monitoring_location_name"),
      parameterCode,
      value,
      dateTime,
    });
  }
  return out;
}

export function observationsFromLegacy(json: unknown, parameterCodes?: string[]): UsgsObservation[] {
  const series = (json as LegacyResponse)?.value?.timeSeries ?? [];
  const allow = parameterCodes ? new Set(parameterCodes) : null;
  const out: UsgsObservation[] = [];
  for (const ts of series) {
    const siteId = ts.sourceInfo?.siteCode?.[0]?.value;
    const parameterCode = ts.variable?.variableCode?.[0]?.value;
    if (!siteId || !isUsgsSiteId(siteId) || !parameterCode) continue;
    if (allow && !allow.has(parameterCode)) continue;
    for (const point of ts.values?.[0]?.value ?? []) {
      const value = usableNumber(point.value);
      if (value == null || !point.dateTime) continue;
      out.push({
        siteId,
        siteName: ts.sourceInfo?.siteName,
        parameterCode,
        value,
        dateTime: point.dateTime,
      });
    }
  }
  return out;
}

async function fetchOgcFeatures(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<OgcFeature[]> {
  const features: OgcFeature[] = [];
  let next: string | null = url;
  let guard = 0;
  while (next && guard++ < 20) {
    const json = (await getJson(next, timeoutMs)) as OgcCollection;
    features.push(...(json.features ?? []));
    next = json.links?.find((l) => l.rel === "next")?.href ?? null;
  }
  return features;
}

function fixtureLatest(siteIds: string[], parameterCodes: string[]): UsgsObservation[] {
  const out: UsgsObservation[] = [];
  for (const siteId of uniqueSiteIds(siteIds)) {
    for (const parameterCode of parameterCodes) {
      const value =
        parameterCode === PARAM_DISCHARGE
          ? FIXTURE_CFS
          : parameterCode === PARAM_GAGE_HEIGHT
            ? 1.81
            : parameterCode === PARAM_WATER_TEMP
              ? 8
              : FIXTURE_CFS;
      out.push({ siteId, parameterCode, value, dateTime: FIXTURE_AT, siteName: "Fixture gauge" });
    }
  }
  return out;
}

function fixtureDaily(siteIds: string[], start: string, end: string): UsgsDailyPoint[] {
  const out: UsgsDailyPoint[] = [];
  const begin = new Date(`${start}T12:00:00Z`);
  const stop = new Date(`${end}T12:00:00Z`);
  if (Number.isNaN(begin.getTime()) || Number.isNaN(stop.getTime())) return out;
  for (const siteId of uniqueSiteIds(siteIds)) {
    for (let d = new Date(begin); d <= stop; d.setUTCDate(d.getUTCDate() + 1)) {
      out.push({ siteId, date: d.toISOString().slice(0, 10), value: FIXTURE_CFS });
    }
  }
  return out;
}

async function tryOgcThenLegacy(
  ogcUrl: string,
  legacyUrl: string,
  parameterCodes: string[],
): Promise<UsgsObservation[]> {
  try {
    const fromOgc = observationsFromOgc(await fetchOgcFeatures(ogcUrl));
    if (fromOgc.length > 0) return fromOgc;
  } catch {
    // WaterServices is the fallback while USGS finishes the 2026–27 cutover.
  }
  try {
    return observationsFromLegacy(await getJson(legacyUrl), parameterCodes);
  } catch {
    return [];
  }
}

/** Latest instantaneous values (discharge, stage, temp, …) for the given sites. */
export async function fetchLatest(
  siteIds: string[],
  parameterCodes: string[] = [PARAM_DISCHARGE],
): Promise<UsgsObservation[]> {
  const ids = uniqueSiteIds(siteIds);
  if (ids.length === 0) return [];
  if (usgsFixtureEnabled()) return fixtureLatest(ids, parameterCodes);

  const out: UsgsObservation[] = [];
  for (const group of chunk(ids, CHUNK)) {
    const batch = await tryOgcThenLegacy(
      latestContinuousUrl(group, parameterCodes),
      legacyIvUrl(group, parameterCodes),
      parameterCodes,
    );
    out.push(...batch);
  }
  return out;
}

function toDailyPoints(obs: UsgsObservation[], parameterCode = PARAM_DISCHARGE): UsgsDailyPoint[] {
  const out: UsgsDailyPoint[] = [];
  for (const o of obs) {
    if (o.parameterCode && o.parameterCode !== parameterCode) continue;
    out.push({ siteId: o.siteId, date: o.dateTime.slice(0, 10), value: o.value });
  }
  out.sort((a, b) => a.date.localeCompare(b.date) || a.siteId.localeCompare(b.siteId));
  return out;
}

/** Daily mean discharge (stat 00003) between inclusive YYYY-MM-DD bounds. */
export async function fetchDaily(
  siteIds: string[],
  start: string,
  end: string,
  parameterCode = PARAM_DISCHARGE,
): Promise<UsgsDailyPoint[]> {
  const ids = uniqueSiteIds(siteIds);
  if (ids.length === 0) return [];
  if (usgsFixtureEnabled()) return fixtureDaily(ids, start, end);

  const out: UsgsDailyPoint[] = [];
  for (const group of chunk(ids, CHUNK)) {
    let batch: UsgsObservation[] = [];
    try {
      batch = observationsFromOgc(await fetchOgcFeatures(dailyUrl(group, start, end, parameterCode), 12_000));
    } catch {
      batch = [];
    }
    if (batch.length === 0) {
      try {
        batch = observationsFromLegacy(
          await getJson(legacyDvUrl(group, parameterCode, { startDT: start, endDT: end }), 12_000),
          [parameterCode],
        );
      } catch {
        batch = [];
      }
    }
    out.push(...toDailyPoints(batch, parameterCode));
  }
  return out;
}

/**
 * High-frequency series for a window. `startIso`/`endIso` are ISO-8601.
 * Waterservices `startDT`/`endDT` accept the same date prefix.
 */
export async function fetchContinuous(
  siteIds: string[],
  startIso: string,
  endIso: string,
  parameterCodes: string[] = [PARAM_DISCHARGE],
): Promise<UsgsObservation[]> {
  const ids = uniqueSiteIds(siteIds);
  if (ids.length === 0) return [];
  if (usgsFixtureEnabled()) {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const out: UsgsObservation[] = [];
    for (const siteId of ids) {
      for (const parameterCode of parameterCodes) {
        for (let t = start.getTime(); t <= end.getTime(); t += 15 * 60 * 1000) {
          out.push({
            siteId,
            parameterCode,
            value: parameterCode === PARAM_GAGE_HEIGHT ? 1.81 : FIXTURE_CFS,
            dateTime: new Date(t).toISOString(),
          });
        }
      }
    }
    return out;
  }

  const startDay = startIso.slice(0, 10);
  const endDay = endIso.slice(0, 10);
  const out: UsgsObservation[] = [];
  for (const group of chunk(ids, 8)) {
    const batch = await tryOgcThenLegacy(
      continuousUrl(group, startIso, endIso, parameterCodes),
      legacyIvUrl(group, parameterCodes, { startDT: startDay, endDT: endDay }),
      parameterCodes,
    );
    out.push(...batch);
  }
  out.sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  return out;
}

export function locationsFromOgc(features: OgcFeature[]): UsgsSiteLocation[] {
  const out: UsgsSiteLocation[] = [];
  for (const feature of features) {
    const props = feature.properties ?? {};
    const id =
      propString(props, "id") ??
      propString(props, "monitoring_location_id") ??
      propString(props, "monitoring_location_number");
    const siteId = id ? siteIdFromMonitoringLocation(id) : undefined;
    const coords = feature.geometry?.coordinates;
    const longitude = coords?.[0];
    const latitude = coords?.[1];
    if (!siteId || !isUsgsSiteId(siteId)) continue;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    out.push({
      siteId,
      name: propString(props, "monitoring_location_name") ?? siteId,
      latitude: latitude as number,
      longitude: longitude as number,
    });
  }
  return out;
}

function locationsFromLegacyRdb(text: string): UsgsSiteLocation[] {
  const out: UsgsSiteLocation[] = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("#") || line.startsWith("agency") || line.startsWith("5s")) continue;
    const cols = line.split("\t");
    if (cols.length < 6) continue;
    const siteId = cols[1]?.trim();
    const name = cols[2]?.trim() ?? siteId;
    const latitude = parseFloat(cols[4]);
    const longitude = parseFloat(cols[5]);
    if (!siteId || !isUsgsSiteId(siteId) || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      continue;
    }
    out.push({ siteId, name, latitude, longitude });
  }
  return out;
}

/** Monitoring-location coordinates (OGC, then legacy RDB). */
export async function fetchSiteLocations(siteIds: string[]): Promise<Map<string, UsgsSiteLocation>> {
  const ids = uniqueSiteIds(siteIds);
  const result = new Map<string, UsgsSiteLocation>();
  if (ids.length === 0) return result;
  if (usgsFixtureEnabled()) {
    for (const siteId of ids) {
      result.set(siteId, { siteId, name: "Fixture gauge", latitude: 44.8664, longitude: -111.3388 });
    }
    return result;
  }

  try {
    for (const loc of locationsFromOgc(await fetchOgcFeatures(monitoringLocationsUrl(ids)))) {
      result.set(loc.siteId, loc);
    }
  } catch {
    // Fall through to the RDB site service.
  }
  const missing = ids.filter((id) => !result.has(id));
  if (missing.length > 0) {
    try {
      const url = `https://waterservices.usgs.gov/nwis/site/?format=rdb&sites=${missing.join(",")}&siteOutput=basic`;
      const res = await fetch(url, {
        headers: headers(),
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      });
      if (res.ok) {
        for (const loc of locationsFromLegacyRdb(await res.text())) {
          result.set(loc.siteId, loc);
        }
      }
    } catch {
      // Callers fall back to the river's own coordinates.
    }
  }
  return result;
}

/** Latest observation per site+parameter (last point wins). */
export function latestBySiteParam(obs: UsgsObservation[]): Map<string, Map<string, UsgsObservation>> {
  const out = new Map<string, Map<string, UsgsObservation>>();
  for (const o of obs) {
    const byParam = out.get(o.siteId) ?? new Map<string, UsgsObservation>();
    const prev = byParam.get(o.parameterCode);
    if (!prev || o.dateTime >= prev.dateTime) byParam.set(o.parameterCode, o);
    out.set(o.siteId, byParam);
  }
  return out;
}

/**
 * Minutes past local midnight for a USGS timestamp. OGC times are UTC;
 * WaterServices times are site-local with an offset. America/Denver is the
 * register's home zone and matches the old IV clock face on our rivers.
 */
export function clockMinutes(iso: string, timeZone = "America/Denver"): number | null {
  const d = new Date(iso);
  if (!Number.isNaN(d.getTime())) {
    const parts = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    }).formatToParts(d);
    const hour = Number(parts.find((p) => p.type === "hour")?.value);
    const minute = Number(parts.find((p) => p.type === "minute")?.value);
    if (Number.isFinite(hour) && Number.isFinite(minute)) return hour * 60 + minute;
  }
  const m = /T(\d{1,2}):(\d{2})/.exec(iso);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}
