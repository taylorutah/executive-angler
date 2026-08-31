import { NextRequest, NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/static";
import { parseRiverGauges } from "@/lib/usgs/gauges";
import { fetchDaily } from "@/lib/usgs/client";

// ── Cache — daily values don't change frequently ──
const cache = new Map<string, { data: DailyReading[]; expires: number }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface DailyReading {
  date: string;      // YYYY-MM-DD
  discharge: number; // cfs (daily mean)
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

  const supabase = createStaticClient();
  const { data: river, error } = await supabase
    .from("rivers")
    .select("id, name, usgs_gauge_id")
    .eq("id", riverId)
    .maybeSingle();

  if (error || !river || !river.usgs_gauge_id) {
    return NextResponse.json({ error: "River not found or no gauges" }, { status: 404 });
  }

  const gauges = parseRiverGauges(river.usgs_gauge_id, river.name);
  const targetSiteId = siteId || gauges[0]?.site_id;
  if (!targetSiteId) {
    return NextResponse.json({ error: "No gauge found" }, { status: 404 });
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  const startStr = startDate.toISOString().split("T")[0];
  const endStr = endDate.toISOString().split("T")[0];

  try {
    const points = await fetchDaily([targetSiteId], startStr, endStr);
    const readings: DailyReading[] = points
      .filter((p) => p.siteId === targetSiteId)
      .map((p) => ({ date: p.date, discharge: Math.round(p.value) }))
      .filter((r) => Number.isFinite(r.discharge));

    cache.set(cacheKey, { data: readings, expires: Date.now() + CACHE_TTL_MS });

    return NextResponse.json({ readings }, {
      headers: { "Cache-Control": "public, s-maxage=21600", "X-Cache": "MISS" },
    });
  } catch (err) {
    console.error("[USGS History] Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 502 });
  }
}
