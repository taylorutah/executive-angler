import { NextRequest, NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/static";
import { allowRequest, clientKey, tooManyRequests } from "@/lib/api/rate-limit";
import { parseRiverGauges, type RiverGauge } from "@/lib/usgs/gauges";
import {
  PARAM_DISCHARGE,
  PARAM_GAGE_HEIGHT,
  PARAM_WATER_TEMP,
  fetchLatest,
  latestBySiteParam,
} from "@/lib/usgs/client";

// ── In-memory cache (per-instance, survives across requests until redeploy) ──
const cache = new Map<string, { data: GaugeReading[]; expires: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes — matches USGS update frequency

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

function celsiusToFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

async function fetchMultipleFromUSGS(
  gauges: RiverGauge[],
  riverId: string
): Promise<GaugeReading[]> {
  const siteIds = gauges.map((g) => g.site_id);
  const obs = await fetchLatest(siteIds, [
    PARAM_DISCHARGE,
    PARAM_GAGE_HEIGHT,
    PARAM_WATER_TEMP,
  ]);
  const grouped = latestBySiteParam(obs);

  const readings: GaugeReading[] = [];
  for (const gauge of gauges) {
    const byParam = grouped.get(gauge.site_id);
    if (!byParam || byParam.size === 0) continue;

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
    const discharge = byParam.get(PARAM_DISCHARGE);
    const height = byParam.get(PARAM_GAGE_HEIGHT);
    const temp = byParam.get(PARAM_WATER_TEMP);

    if (discharge) {
      reading.discharge = { value: Math.round(discharge.value), unit: "cfs" };
      if (discharge.dateTime > latestTimestamp) latestTimestamp = discharge.dateTime;
      if (discharge.siteName && reading.siteName === gauge.name) {
        reading.siteName = gauge.name;
      }
    }
    if (height) {
      reading.gageHeight = { value: Math.round(height.value * 100) / 100, unit: "ft" };
      if (height.dateTime > latestTimestamp) latestTimestamp = height.dateTime;
    }
    if (temp) {
      reading.waterTemp = {
        valueCelsius: Math.round(temp.value * 10) / 10,
        valueFahrenheit: celsiusToFahrenheit(temp.value),
        unit: "°F",
      };
      if (temp.dateTime > latestTimestamp) latestTimestamp = temp.dateTime;
    }

    reading.timestamp = latestTimestamp || new Date().toISOString();
    const readingAge = Date.now() - new Date(reading.timestamp).getTime();
    reading.stale = readingAge > 2 * 60 * 60 * 1000;

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
  if (!allowRequest(clientKey(request, "usgs-conditions"), 60, 60_000)) {
    return tooManyRequests();
  }

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

  const gauges = parseRiverGauges(river.usgs_gauge_id, river.name);

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
