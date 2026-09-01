import { NextRequest, NextResponse } from "next/server";
import { firstUsgsSiteId } from "@/lib/search/usgs";
import { classifyFlowState, median, type FlowState } from "@/lib/browse/flow-state";
import { getAllRivers } from "@/lib/db";
import { allowRequest, clientKey, tooManyRequests } from "@/lib/api/rate-limit";
import { PARAM_DISCHARGE, fetchDaily, fetchLatest, latestBySiteParam } from "@/lib/usgs/client";

export interface FlowStateRow {
  siteId: string;
  cfs: number;
  median30: number;
  state: FlowState;
  /** Last two daily means — 24h-ish change. Null when the series is too short. */
  deltaCfs: number | null;
}

/**
 * GET /api/rivers/flow-states
 * Current discharge vs that site's 30-day daily median. Public. No journal data.
 */
export async function GET(request: NextRequest) {
  if (!allowRequest(clientKey(request, "usgs-flow-states"), 20, 60_000)) {
    return tooManyRequests();
  }
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
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  const [latest, daily] = await Promise.all([
    fetchLatest(sites, [PARAM_DISCHARGE]),
    fetchDaily(sites, startStr, endStr),
  ]);
  const current = new Map<string, number>();
  for (const [siteId, byParam] of latestBySiteParam(latest)) {
    const cfs = byParam.get(PARAM_DISCHARGE)?.value;
    if (cfs != null && Number.isFinite(cfs) && cfs >= 0) current.set(siteId, cfs);
  }
  const history = new Map<string, number[]>();
  for (const point of daily) {
    if (point.value <= 0) continue;
    const list = history.get(point.siteId) ?? [];
    list.push(point.value);
    history.set(point.siteId, list);
  }

  const byRiver: Record<string, FlowStateRow> = {};
  for (const [siteId, riverIds] of riverBySite) {
    const cfs = current.get(siteId);
    const median30 = median(history.get(siteId) ?? []);
    if (cfs == null || median30 == null) continue;
    const state = classifyFlowState(cfs, median30);
    if (!state) continue;
    const series = history.get(siteId) ?? [];
    const deltaCfs =
      series.length >= 2 ? Math.round(series[series.length - 1] - series[series.length - 2]) : null;
    const row: FlowStateRow = { siteId, cfs, median30, state, deltaCfs };
    for (const id of riverIds) byRiver[id] = row;
  }

  return NextResponse.json(
    { rivers: byRiver },
    { headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=1800" } },
  );
}
