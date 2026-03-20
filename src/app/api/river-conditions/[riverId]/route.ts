import { NextRequest, NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/static";

// ── In-memory cache (per-instance, survives across requests until redeploy) ──
const cache = new Map<string, { data: GaugeReading[]; expires: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes — matches USGS update frequency

// ── USGS parameter codes ──
const PARAM_DISCHARGE = "00060"; // Streamflow (cfs)
const PARAM_GAGE_HEIGHT = "00065"; // Gage height (ft)
const PARAM_WATER_TEMP = "00010"; // Water temperature (°C)

export interface GaugeReading {
  siteId: string;
  siteName: string;
  section: string;
  riverId: string;
  timestamp: string;
  discharge?: { value: number; unit: string };
  gageHeight?: { value: number; unit: string };
  waterTemp?: { valueCelsius: number; valueFahrenheit: number; unit: string };
  source: string;
  stale: boolean;
}

interface GaugeConfig {
  site_id: string;
  name: string;
  section: string;
}

interface USGSTimeSeriesValue {
  value: { value: string; qualifiers: string[]; dateTime: string }[];
}

interface USGSTimeSeries {
  sourceInfo: { siteName: string; siteCode: { value: string }[] };
  variable: { variableCode: { value: string }[] };
  values: USGSTimeSeriesValue[];
}

interface USGSResponse {
  value: {
    timeSeries: USGSTimeSeries[];
  };
}

function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

async function fetchMultipleFromUSGS(
  gauges: GaugeConfig[],
  riverId: string
): Promise<GaugeReading[]> {
  // Batch all site IDs into one USGS request (comma-separated)
  const siteIds = gauges.map((g) => g.site_id).join(",");
  const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${siteIds}&parameterCd=${PARAM_DISCHARGE},${PARAM_GAGE_HEIGHT},${PARAM_WATER_TEMP}&siteStatus=all`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 900 },
  });

  if (!res.ok) {
    console.error(`[USGS] Failed to fetch sites ${siteIds}: ${res.status}`);
    return [];
  }

  const data: USGSResponse = await res.json();
  const allSeries = data?.value?.timeSeries;
  if (!allSeries || allSeries.length === 0) return [];

  // Group time series by site code
  const bySite = new Map<string, USGSTimeSeries[]>();
  for (const ts of allSeries) {
    const siteCode = ts.sourceInfo?.siteCode?.[0]?.value;
    if (!siteCode) continue;
    const existing = bySite.get(siteCode) || [];
    existing.push(ts);
    bySite.set(siteCode, existing);
  }

  // Build readings for each configured gauge
  const readings: GaugeReading[] = [];
  for (const gauge of gauges) {
    const siteSeries = bySite.get(gauge.site_id);
    if (!siteSeries || siteSeries.length === 0) continue;

    const reading: GaugeReading = {
      siteId: gauge.site_id,
      siteName: gauge.name,
      section: gauge.section,
      riverId,
      timestamp: "",
      source: "USGS National Water Information System",
      stale: false,
    };

    let latestTimestamp = "";

    for (const ts of siteSeries) {
      const paramCode = ts.variable?.variableCode?.[0]?.value;
      const latestValue = ts.values?.[0]?.value?.[0];
      if (!latestValue || latestValue.value === "" || latestValue.value === "-999999") continue;

      const numVal = parseFloat(latestValue.value);
      if (isNaN(numVal)) continue;

      if (latestValue.dateTime > latestTimestamp) {
        latestTimestamp = latestValue.dateTime;
      }

      switch (paramCode) {
        case PARAM_DISCHARGE:
          reading.discharge = { value: Math.round(numVal), unit: "cfs" };
          break;
        case PARAM_GAGE_HEIGHT:
          reading.gageHeight = { value: Math.round(numVal * 100) / 100, unit: "ft" };
          break;
        case PARAM_WATER_TEMP:
          reading.waterTemp = {
            valueCelsius: Math.round(numVal * 10) / 10,
            valueFahrenheit: celsiusToFahrenheit(numVal),
            unit: "°F",
          };
          break;
      }
    }

    reading.timestamp = latestTimestamp || new Date().toISOString();
    const readingAge = Date.now() - new Date(reading.timestamp).getTime();
    reading.stale = readingAge > 2 * 60 * 60 * 1000;

    // Only include if we got at least one metric
    if (reading.discharge || reading.gageHeight || reading.waterTemp) {
      readings.push(reading);
    }
  }

  return readings;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ riverId: string }> }
) {
  const { riverId } = await params;

  // Check cache first
  const cached = cache.get(riverId);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({ gauges: cached.data }, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        "X-Cache": "HIT",
      },
    });
  }

  // Look up USGS gauge config from rivers table
  const supabase = createStaticClient();
  const { data: river, error } = await supabase
    .from("rivers")
    .select("id, name, usgs_gauge_id")
    .eq("id", riverId)
    .maybeSingle();

  if (error || !river) {
    return NextResponse.json({ error: "River not found" }, { status: 404 });
  }

  // Parse gauge configurations from usgs_gauge_id field
  // Supports two formats:
  // 1. JSON array: [{"site_id": "10163000", "name": "...", "section": "..."}]
  // 2. Simple site ID string: "10163000"
  let gauges: GaugeConfig[] = [];

  if (river.usgs_gauge_id) {
    const raw = river.usgs_gauge_id.trim();
    if (raw.startsWith("[")) {
      try {
        gauges = JSON.parse(raw) as GaugeConfig[];
      } catch {
        console.error(`[USGS] Failed to parse gauge config for ${riverId}`);
      }
    } else {
      gauges = [{ site_id: raw, name: river.name, section: "Main" }];
    }
  }

  if (gauges.length === 0) {
    return NextResponse.json({ error: "No USGS gauges configured for this river" }, { status: 404 });
  }

  const readings = await fetchMultipleFromUSGS(gauges, riverId);

  if (readings.length === 0) {
    return NextResponse.json({ error: "Unable to fetch conditions from USGS" }, { status: 502 });
  }

  // Store in cache
  cache.set(riverId, { data: readings, expires: Date.now() + CACHE_TTL_MS });

  return NextResponse.json({ gauges: readings }, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      "X-Cache": "MISS",
    },
  });
}
