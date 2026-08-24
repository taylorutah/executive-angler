import { NextResponse } from "next/server";
import { firstUsgsSiteId, isUsgsSiteId } from "@/lib/search/usgs";
import { classifyFlowState, median, type FlowState } from "@/lib/browse/flow-state";
import { getAllRivers } from "@/lib/db";

const PARAM_DISCHARGE = "00060";
const USGS_MISSING = "-999999";
const BATCH = 80;

export interface FlowStateRow {
  siteId: string;
  cfs: number;
  median30: number;
  state: FlowState;
}

interface UsgsValue {
  value: string;
}

interface UsgsTimeSeries {
  sourceInfo?: { siteCode?: { value: string }[] };
  values?: { value?: UsgsValue[] }[];
}

interface UsgsResponse {
  value?: { timeSeries?: UsgsTimeSeries[] };
}

async function fetchUsgsJson(url: string): Promise<UsgsResponse | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return (await res.json()) as UsgsResponse;
  } catch {
    return null;
  }
}

function latestBySite(data: UsgsResponse | null): Map<string, number> {
  const out = new Map<string, number>();
  for (const series of data?.value?.timeSeries ?? []) {
    const siteId = series.sourceInfo?.siteCode?.[0]?.value;
    const points = series.values?.[0]?.value ?? [];
    const last = points[points.length - 1];
    if (!siteId || !last?.value || last.value === USGS_MISSING) continue;
    const n = Number(last.value);
    if (isUsgsSiteId(siteId) && Number.isFinite(n) && n >= 0) out.set(siteId, n);
  }
  return out;
}

function dailyBySite(data: UsgsResponse | null): Map<string, number[]> {
  const out = new Map<string, number[]>();
  for (const series of data?.value?.timeSeries ?? []) {
    const siteId = series.sourceInfo?.siteCode?.[0]?.value;
    if (!siteId || !isUsgsSiteId(siteId)) continue;
    const values: number[] = [];
    for (const point of series.values?.[0]?.value ?? []) {
      if (!point.value || point.value === USGS_MISSING) continue;
      const n = Number(point.value);
      if (Number.isFinite(n) && n > 0) values.push(n);
    }
    if (values.length) out.set(siteId, values);
  }
  return out;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * GET /api/rivers/flow-states
 * Current discharge vs that site's 30-day daily median. Public. No journal data.
 */
export async function GET() {
  const rivers = await getAllRivers();
  const riverBySite = new Map<string, string[]>();
  for (const river of rivers) {
    const siteId = firstUsgsSiteId(river.usgsGaugeId);
    if (!siteId) continue;
    const list = riverBySite.get(siteId) ?? [];
    list.push(river.id);
    riverBySite.set(siteId, list);
  }

  const sites = [...riverBySite.keys()];
  const current = new Map<string, number>();
  const history = new Map<string, number[]>();

  for (const group of chunk(sites, BATCH)) {
    const joined = group.join(",");
    const ivUrl = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${joined}&parameterCd=${PARAM_DISCHARGE}`;
    const dvUrl = `https://waterservices.usgs.gov/nwis/dv/?format=json&sites=${joined}&parameterCd=${PARAM_DISCHARGE}&statCd=00003&period=P30D`;
    const [iv, dv] = await Promise.all([fetchUsgsJson(ivUrl), fetchUsgsJson(dvUrl)]);
    for (const [site, cfs] of latestBySite(iv)) current.set(site, cfs);
    for (const [site, values] of dailyBySite(dv)) history.set(site, values);
  }

  const byRiver: Record<string, FlowStateRow> = {};
  for (const [siteId, riverIds] of riverBySite) {
    const cfs = current.get(siteId);
    const median30 = median(history.get(siteId) ?? []);
    if (cfs == null || median30 == null) continue;
    const state = classifyFlowState(cfs, median30);
    if (!state) continue;
    const row: FlowStateRow = { siteId, cfs, median30, state };
    for (const id of riverIds) byRiver[id] = row;
  }

  return NextResponse.json(
    { rivers: byRiver },
    { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=1800" } },
  );
}
