import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Public river intel — DELIBERATELY MINIMAL.
 *
 * After the privacy overhaul, this endpoint exposes only fly identifications
 * ("Recent Fly Choices"). Catch counts, fish lengths, trip reports, gear
 * stats, leaderboards, and time-of-day patterns are all owner-only or
 * Pro/personal-only and live elsewhere.
 *
 * The fly aggregation runs through the `river_fly_pulse` SECURITY DEFINER
 * SQL function — the only public path that can read across the new
 * owner-only RLS on `catches`. The function returns names + sizes only;
 * counts are internal to its ORDER BY and never reach the response.
 */

export interface FlyChoice {
  flyName: string;
  sizes: string[];
}

export interface RiverFlyPulse {
  riverId: string;
  topFlies: FlyChoice[];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ riverId: string }> }
) {
  const { riverId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("river_fly_pulse", {
    target_river_id: riverId,
  });

  if (error) {
    console.error("[river_fly_pulse]", error);
    return NextResponse.json(
      { riverId, topFlies: [] } satisfies RiverFlyPulse,
      { status: 200 }
    );
  }

  const topFlies: FlyChoice[] = (data || []).map(
    (r: { fly_name: string; sizes: string[] | null }) => ({
      flyName: r.fly_name,
      sizes: r.sizes ?? [],
    })
  );

  return NextResponse.json({ riverId, topFlies } satisfies RiverFlyPulse);
}
