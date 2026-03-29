import { NextRequest, NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/static";

// ── Cache — daily values don't change frequently ──
const cache = new Map<string, { data: DailyReading[]; expires: number }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const PARAM_DISCHARGE = "00060"; // Streamflow (cfs)

interface DailyReading {
  date: string;      // YYYY-MM-DD
  discharge: number; // cfs (daily mean)
}

interface GaugeConfig {
  site_id: string;
  name: string;
  section: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ riverId: string }> }
) {
  const { riverId } = await params;
  const siteId = request.nextUrl.searchParams.get("siteId");

  const cacheKey = `${riverId}:${siteId || "primary"}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({ readings: cached.data }, {
      headers: { "Cache-Control": "public, s-maxage=21600", "X-Cache": "HIT" },
    });
  }

  // Look up gauge config
  const supabase = createStaticClient();
  const { data: river, error } = await supabase
    .from("rivers")
    .select("id, name, usgs_gauge_id")
    .eq("id", riverId)
    .maybeSingle();

  if (error || !river || !river.usgs_gauge_id) {
    return NextResponse.json({ error: "River not found or no gauges" }, { status: 404 });
  }

  let gauges: GaugeConfig[] = [];
  const raw = river.usgs_gauge_id.trim();
  if (raw.startsWith("[")) {
    try { gauges = JSON.parse(raw); } catch { /* ignore */ }
  } else {
    gauges = [{ site_id: raw, name: river.name, section: "Main" }];
  }

  // Use specific site or first gauge
  const targetSiteId = siteId || gauges[0]?.site_id;
  if (!targetSiteId) {
    return NextResponse.json({ error: "No gauge found" }, { status: 404 });
  }

  // Fetch 12 months of daily mean values from USGS
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  const url = `https://waterservices.usgs.gov/nwis/dv/?format=json&sites=${targetSiteId}&parameterCd=${PARAM_DISCHARGE}&startDT=${startStr}&endDT=${endStr}&statCd=00003`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 21600 },
    });

    if (!res.ok) {
      console.error(`[USGS History] Failed: ${res.status}`);
      return NextResponse.json({ error: "USGS API error" }, { status: 502 });
    }

    const data = await res.json();
    const timeSeries = data?.value?.timeSeries;
    if (!timeSeries || timeSeries.length === 0) {
      return NextResponse.json({ readings: [] });
    }

    // Find the discharge time series
    const dischargeSeries = timeSeries.find((ts: { variable: { variableCode: { value: string }[] } }) =>
      ts.variable?.variableCode?.[0]?.value === PARAM_DISCHARGE
    );

    if (!dischargeSeries) {
      return NextResponse.json({ readings: [] });
    }

    const values = dischargeSeries.values?.[0]?.value || [];
    const readings: DailyReading[] = values
      .filter((v: { value: string }) => v.value && v.value !== "-999999")
      .map((v: { dateTime: string; value: string }) => ({
        date: v.dateTime.split("T")[0],
        discharge: Math.round(parseFloat(v.value)),
      }))
      .filter((r: DailyReading) => !isNaN(r.discharge));

    cache.set(cacheKey, { data: readings, expires: Date.now() + CACHE_TTL_MS });

    return NextResponse.json({ readings }, {
      headers: { "Cache-Control": "public, s-maxage=21600", "X-Cache": "MISS" },
    });
  } catch (err) {
    console.error("[USGS History] Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 502 });
  }
}
