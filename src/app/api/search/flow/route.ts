import { NextRequest, NextResponse } from "next/server";
import { isUsgsSiteId } from "@/lib/search/usgs";
import { PARAM_DISCHARGE, fetchLatest, latestBySiteParam } from "@/lib/usgs/client";

/**
 * GET /api/search/flow?sites=06041000,06043500
 *
 * Public, latest discharge only. Max 8 USGS site ids. No journal data.
 * Site tokens must be 8–15 digits so callers cannot inject extra USGS params.
 */

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("sites") ?? "";
  const sites = [
    ...new Set(raw.split(",").map((s) => s.trim()).filter(isUsgsSiteId)),
  ].slice(0, 8);

  if (sites.length === 0) {
    return NextResponse.json({});
  }

  try {
    const grouped = latestBySiteParam(await fetchLatest(sites, [PARAM_DISCHARGE]));
    const out: Record<string, number> = {};
    for (const siteId of sites) {
      const cfs = grouped.get(siteId)?.get(PARAM_DISCHARGE)?.value;
      if (cfs != null && Number.isFinite(cfs)) out[siteId] = cfs;
    }
    return NextResponse.json(out, {
      headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=1800" },
    });
  } catch (err) {
    console.error("[search/flow]", err);
    return NextResponse.json({}, { status: 502 });
  }
}
