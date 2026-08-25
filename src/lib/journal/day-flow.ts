/**
 * One day's instantaneous discharge trace for a session's river.
 *
 * Owner-only data path: the session detail page is the only caller, and it
 * runs this after the owner check. Nothing here reaches a public surface.
 */

const PARAM_DISCHARGE = "00060";

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
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed) as GaugeConfig[];
    } catch {
      return [];
    }
  }
  return [{ site_id: trimmed, name: "Gauge", section: "Main" }];
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

  const url =
    `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${gauge.site_id}` +
    `&parameterCd=${PARAM_DISCHARGE}&startDT=${date}&endDT=${date}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 21600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const values: { dateTime: string; value: string }[] =
      json?.value?.timeSeries?.[0]?.values?.[0]?.value ?? [];

    const readings: DayFlowReading[] = [];
    for (const v of values) {
      const cfs = Number(v.value);
      if (!Number.isFinite(cfs) || cfs < 0) continue;
      // USGS returns site-local wall time with an offset; the clock face is
      // what the angler experienced, so read the hour/minute literally.
      const m = /T(\d{2}):(\d{2})/.exec(v.dateTime);
      if (!m) continue;
      readings.push({ minutes: Number(m[1]) * 60 + Number(m[2]), cfs });
    }
    if (readings.length < 2) return null;
    return { gaugeName: gauge.name, siteId: gauge.site_id, readings };
  } catch {
    return null;
  }
}
