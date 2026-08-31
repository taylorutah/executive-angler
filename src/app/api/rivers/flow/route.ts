import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUsgsSiteId } from "@/lib/search/usgs";
import {
  PARAM_DISCHARGE,
  PARAM_GAGE_HEIGHT,
  fetchContinuous,
} from "@/lib/usgs/client";

/**
 * GET /api/rivers/flow?siteId=USGS_SITE_ID&days=30
 *
 * Instantaneous discharge and gage height for a window.
 */

interface FlowPoint {
  datetime: string;
  value: number;
  unit: string;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteId = request.nextUrl.searchParams.get("siteId");
  const days = Math.min(
    Math.max(parseInt(request.nextUrl.searchParams.get("days") || "30", 10) || 30, 1),
    120
  );

  if (!siteId || !isUsgsSiteId(siteId)) {
    return NextResponse.json(
      { error: "siteId query parameter is required" },
      { status: 400 }
    );
  }

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  try {
    const obs = await fetchContinuous(
      [siteId],
      start.toISOString(),
      end.toISOString(),
      [PARAM_DISCHARGE, PARAM_GAGE_HEIGHT],
    );

    let siteName = "";
    const discharge: FlowPoint[] = [];
    const gageHeight: FlowPoint[] = [];

    for (const point of obs) {
      if (!siteName && point.siteName) siteName = point.siteName;
      const row: FlowPoint = {
        datetime: point.dateTime,
        value: Math.round(point.value * 100) / 100,
        unit: point.parameterCode === PARAM_DISCHARGE ? "cfs" : "ft",
      };
      if (point.parameterCode === PARAM_DISCHARGE) discharge.push(row);
      else if (point.parameterCode === PARAM_GAGE_HEIGHT) gageHeight.push(row);
    }

    return NextResponse.json(
      { discharge, gageHeight, siteName },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (err) {
    console.error("[USGS Flow] Fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch flow data from USGS" },
      { status: 502 }
    );
  }
}
