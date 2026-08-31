import { unstable_cache } from "next/cache";
import {
  getFlagshipHistories,
  getGaugeSnapshots,
  type DailyReading,
  type FlagshipRiver,
  type GaugeSnapshot,
} from "./conditions";

export type FlagshipGaugePayload = {
  snapshots: Record<string, GaugeSnapshot>;
  histories: Record<string, DailyReading[]>;
};

export async function loadFlagshipGaugePayload(
  rivers: FlagshipRiver[],
): Promise<FlagshipGaugePayload> {
  const key = rivers.map((r) => `${r.id}:${r.gauge?.siteId ?? ""}`).join("|");
  return unstable_cache(
    async () => {
      const [snapshots, histories] = await Promise.all([
        getGaugeSnapshots(rivers),
        getFlagshipHistories(rivers).catch(() => new Map<string, DailyReading[]>()),
      ]);
      return {
        snapshots: Object.fromEntries(snapshots),
        histories: Object.fromEntries(histories),
      };
    },
    ["flagship-gauges", key],
    { revalidate: 300 },
  )();
}
