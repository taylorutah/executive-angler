import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/rivers/flow?siteId=USGS_SITE_ID&days=30
 *
 * Fetches instantaneous values from USGS Water Services API.
 * Returns discharge (cfs) and/or gage height (ft) as simple arrays.
 *
 * Response shape:
 * {
 *   discharge: { datetime: string, value: number, unit: "cfs" }[],
 *   gageHeight: { datetime: string, value: number, unit: "ft" }[],
 *   siteName: string
 * }
 */

const PARAM_DISCHARGE = "00060"; // Streamflow, ft³/s
const PARAM_GAGE_HEIGHT = "00065"; // Gage height, ft

interface FlowPoint {
  datetime: string;
  value: number;
  unit: string;
}

interface USGSValue {
  value: string;
  qualifiers: string[];
  dateTime: string;
}

interface USGSTimeSeries {
  sourceInfo: { siteName: string };
  variable: { variableCode: { value: string }[] };
  values: { value: USGSValue[] }[];
}

interface USGSResponse {
  value: { timeSeries: USGSTimeSeries[] };
}

export async function GET(request: NextRequest) {
  const siteId = request.nextUrl.searchParams.get("siteId");
  const days = Math.min(
    Math.max(parseInt(request.nextUrl.searchParams.get("days") || "30", 10) || 30, 1),
    120
  );

  if (!siteId) {
    return NextResponse.json(
      { error: "siteId query parameter is required" },
      { status: 400 }
    );
  }

  const url = `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${siteId}&period=P${days}D&parameterCd=${PARAM_DISCHARGE},${PARAM_GAGE_HEIGHT}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error(`[USGS Flow] Failed for site ${siteId}: ${res.status}`);
      return NextResponse.json(
        { error: "USGS API returned an error" },
        { status: 502 }
      );
    }

    const data: USGSResponse = await res.json();
    const allSeries = data?.value?.timeSeries;
    if (!allSeries || allSeries.length === 0) {
      return NextResponse.json({
        discharge: [],
        gageHeight: [],
        siteName: "",
      });
    }

    let siteName = "";
    const discharge: FlowPoint[] = [];
    const gageHeight: FlowPoint[] = [];

    for (const ts of allSeries) {
      if (!siteName && ts.sourceInfo?.siteName) {
        siteName = ts.sourceInfo.siteName;
      }

      const paramCode = ts.variable?.variableCode?.[0]?.value;
      const rawValues = ts.values?.[0]?.value || [];

      for (const v of rawValues) {
        if (!v.value || v.value === "" || v.value === "-999999") continue;
        const numVal = parseFloat(v.value);
        if (isNaN(numVal)) continue;

        const point: FlowPoint = {
          datetime: v.dateTime,
          value: Math.round(numVal * 100) / 100,
          unit: paramCode === PARAM_DISCHARGE ? "cfs" : "ft",
        };

        if (paramCode === PARAM_DISCHARGE) {
          discharge.push(point);
        } else if (paramCode === PARAM_GAGE_HEIGHT) {
          gageHeight.push(point);
        }
      }
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
