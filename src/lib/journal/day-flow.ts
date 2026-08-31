/**
 * One day's instantaneous discharge trace for a session's river.
 *
 * Owner-only data path: the session detail page is the only caller, and it
 * runs this after the owner check. Nothing here reaches a public surface.
 */

import { clockMinutes, fetchContinuous, PARAM_DISCHARGE } from "@/lib/usgs/client";
import { parseRiverGauges } from "@/lib/usgs/gauges";

export interface DayFlowReading {
  /** Minutes past local midnight — the x axis. */
  minutes: number;
  cfs: number;
}

export interface DayFlow {
  gaugeName: string;
  siteId: string;
  readings: DayFlowReading[];
}

interface GaugeConfig {
  site_id: string;
  name: string;
  section: string;
}

function parseGauges(raw: string | null | undefined): GaugeConfig[] {
  return parseRiverGauges(raw, "Gauge");
}

/** Picks the gauge whose section names the section fished, else the first. */
function pickGauge(gauges: GaugeConfig[], section?: string | null): GaugeConfig | null {
  if (gauges.length === 0) return null;
  if (section) {
    const needle = section.toLowerCase();
    const match = gauges.find(
      (g) =>
        g.section?.toLowerCase().includes(needle) ||
        needle.includes(g.section?.toLowerCase() ?? "\0")
    );
    if (match) return match;
  }
  return gauges[0];
}

/** Minutes past local midnight for a catch's clock time or ISO timestamp. */
export function catchMinutes(value?: string | null): number | null {
  if (!value) return null;
  const m = /T?(\d{1,2}):(\d{2})/.exec(value);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export async function fetchDayFlow(
  usgsGaugeId: string | null | undefined,
  date: string,
  section?: string | null
): Promise<DayFlow | null> {
  const gauge = pickGauge(parseGauges(usgsGaugeId), section);
  if (!gauge) return null;

  try {
    const obs = await fetchContinuous(
      [gauge.site_id],
      `${date}T00:00:00.000Z`,
      `${date}T23:59:59.000Z`,
      [PARAM_DISCHARGE],
    );
    const readings: DayFlowReading[] = [];
    for (const point of obs) {
      if (point.parameterCode !== PARAM_DISCHARGE) continue;
      if (!Number.isFinite(point.value) || point.value < 0) continue;
      const minutes = clockMinutes(point.dateTime);
      if (minutes == null) continue;
      readings.push({ minutes, cfs: point.value });
    }
    if (readings.length < 2) return null;
    return { gaugeName: gauge.name, siteId: gauge.site_id, readings };
  } catch {
    return null;
  }
}
