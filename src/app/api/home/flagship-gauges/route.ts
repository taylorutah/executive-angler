import { NextResponse } from "next/server";
import { getAllDestinations, getAllRivers } from "@/lib/db";
import {
  getFlagshipHistories,
  getGaugeSnapshots,
  selectFlagshipRivers,
} from "@/components/home/conditions";

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
  const [snapshots, histories] = await Promise.all([
    getGaugeSnapshots(flagship),
    getFlagshipHistories(flagship).catch(() => new Map()),
  ]);
  return NextResponse.json(
    {
      snapshots: Object.fromEntries(snapshots),
      histories: Object.fromEntries(histories),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    },
  );
}
