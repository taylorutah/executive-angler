import { getAllDestinations, getAllRivers } from "@/lib/db";
import { selectFlagshipRivers } from "@/components/home/conditions";
import { loadFlagshipGaugePayload } from "@/components/home/flagship-cache";
import { LiveConditionsRail } from "@/components/home/LiveHomeGauges";

/**
 * Site-wide ON THE WATER ticker. Reuses the flagship gauge fetch.
 * Do not rewrite fishing logic here.
 */
export default async function SiteTicker() {
  const [rivers, destinations] = await Promise.all([
    getAllRivers().catch(() => []),
    getAllDestinations().catch(() => []),
  ]);
  const destById = new Map(destinations.map((d) => [d.id, d]));
  const flagshipRivers = selectFlagshipRivers(rivers).map((river) => ({
    ...river,
    state: destById.get(river.destinationId)?.state ?? destById.get(river.destinationId)?.name,
  }));
  const gauges = await loadFlagshipGaugePayload(flagshipRivers).catch(() => ({
    snapshots: {},
    histories: {},
  }));

  return <LiveConditionsRail rivers={flagshipRivers} initial={gauges} />;
}
