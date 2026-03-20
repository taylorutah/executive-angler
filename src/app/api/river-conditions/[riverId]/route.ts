import { NextRequest, NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/static";

// ── In-memory cache (per-instance, survives across requests until redeploy) ──
const cache = new Map<string, { data: USGSConditions; expires: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes — matches USGS update frequency

// ── USGS parameter codes ──
const PARAM_DISCHARGE = "00060"; // Streamflow (cfs)
const PARAM_GAGE_HEIGHT = "00065"; // Gage height (ft)
const PARAM_WATER_TEMP = "00010"; // Water temperature (°C)

export interface USGSConditions {
  siteId: string;
  siteName: string;
  riverId: string;
  timestamp: string; // ISO 8601
  discharge?: { value: number; unit: string }; // cfs
  gageHeight?: { value: number; unit: string }; // ft
  waterTemp?: { valueCelsius: number; valueFahrenheit: number; unit: string };
  source: string;
  stale: boolean; // true if reading is > 2 hours old
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

async function fetchFromUSGS(siteId: string, riverId: string): Promise<USGSConditions | null> {
  const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${siteId}&parameterCd=${PARAM_DISCHARGE},${PARAM_GAGE_HEIGHT},${PARAM_WATER_TEMP}&siteStatus=all`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 900 }, // 15 min ISR cache
  });

  if (!res.ok) {
    console.error(`[USGS] Failed to fetch site ${siteId}: ${res.status}`);
    return null;
  }

  const data: USGSResponse = await res.json();
  const series = data?.value?.timeSeries;
  if (!series || series.length === 0) return null;

  const siteName = series[0]?.sourceInfo?.siteName ?? siteId;
  let latestTimestamp = "";

  const conditions: USGSConditions = {
    siteId,
    siteName,
    riverId,
    timestamp: "",
    source: "USGS National Water Information System",
    stale: false,
  };

  for (const ts of series) {
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
        conditions.discharge = { value: Math.round(numVal), unit: "cfs" };
        break;
      case PARAM_GAGE_HEIGHT:
        conditions.gageHeight = { value: Math.round(numVal * 100) / 100, unit: "ft" };
        break;
      case PARAM_WATER_TEMP:
        conditions.waterTemp = {
          valueCelsius: Math.round(numVal * 10) / 10,
          valueFahrenheit: celsiusToFahrenheit(numVal),
          unit: "°F",
        };
        break;
    }
  }

  conditions.timestamp = latestTimestamp || new Date().toISOString();

  // Mark stale if reading is > 2 hours old
  const readingAge = Date.now() - new Date(conditions.timestamp).getTime();
  conditions.stale = readingAge > 2 * 60 * 60 * 1000;

  return conditions;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ riverId: string }> }
) {
  const { riverId } = await params;

  // Check cache first
  const cached = cache.get(riverId);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        "X-Cache": "HIT",
      },
    });
  }

  // Look up USGS gauge ID from rivers table
  const supabase = createStaticClient();
  const { data: river, error } = await supabase
    .from("rivers")
    .select("id, name, usgs_gauge_id")
    .eq("id", riverId)
    .maybeSingle();

  if (error || !river || !river.usgs_gauge_id) {
    return NextResponse.json(
      { error: "No USGS gauge configured for this river" },
      { status: 404 }
    );
  }

  const conditions = await fetchFromUSGS(river.usgs_gauge_id, riverId);

  if (!conditions) {
    return NextResponse.json(
      { error: "Unable to fetch conditions from USGS" },
      { status: 502 }
    );
  }

  // Store in cache
  cache.set(riverId, { data: conditions, expires: Date.now() + CACHE_TTL_MS });

  return NextResponse.json(conditions, {
    headers: {
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      "X-Cache": "MISS",
    },
  });
}
