import { NextResponse } from "next/server";
import { getAllDestinations, getAllRivers } from "@/lib/db";
import { selectFlagshipRivers } from "@/components/home/conditions";
import { loadFlagshipGaugePayload } from "@/components/home/flagship-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const [rivers, destinations] = await Promise.all([
    getAllRivers().catch(() => []),
    getAllDestinations().catch(() => []),
  ]);
  const destById = new Map(destinations.map((d) => [d.id, d]));
  const flagship = selectFlagshipRivers(rivers).map((river) => ({
    ...river,
    state: destById.get(river.destinationId)?.state ?? destById.get(river.destinationId)?.name,
  }));
  const payload = await loadFlagshipGaugePayload(flagship);
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
    },
  });
}
