import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/search/flow?sites=06041000,06043500
 *
 * Public, latest discharge only. Max 8 USGS site ids. No journal data.
 */

const PARAM_DISCHARGE = "00060";

interface UsgsValue {
  value: string;
  dateTime: string;
}

interface UsgsTimeSeries {
  sourceInfo?: { siteCode?: { value: string }[] };
  values?: { value?: UsgsValue[] }[];
}

interface UsgsResponse {
  value?: { timeSeries?: UsgsTimeSeries[] };
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("sites") ?? "";
  const sites = [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 8);

  if (sites.length === 0) {
    return NextResponse.json({});
  }

  const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${sites.join(",")}&parameterCd=${PARAM_DISCHARGE}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json({}, { status: 502 });
    }
    const data = (await res.json()) as UsgsResponse;
    const out: Record<string, number> = {};
    for (const series of data.value?.timeSeries ?? []) {
      const siteId = series.sourceInfo?.siteCode?.[0]?.value;
      const points = series.values?.[0]?.value ?? [];
      const last = points[points.length - 1];
      const n = last ? Number(last.value) : NaN;
      if (siteId && Number.isFinite(n)) out[siteId] = n;
    }
    return NextResponse.json(out, {
      headers: { "Cache-Control": "s-maxage=900, stale-while-revalidate=1800" },
    });
  } catch (err) {
    console.error("[search/flow]", err);
    return NextResponse.json({}, { status: 502 });
  }
}
