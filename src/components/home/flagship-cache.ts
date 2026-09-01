import { unstable_cache } from "next/cache";
import {
  deltaCfsFromHistory,
  getFlagshipHistories,
  getGaugeSnapshots,
  type DailyReading,
  type FlagshipRiver,
  type GaugeSnapshot,
} from "./conditions";
import { usgsFixtureEnabled } from "@/lib/usgs/client";

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
      const snapObj = Object.fromEntries(snapshots);
      const histObj = Object.fromEntries(histories);
      for (const [id, snap] of Object.entries(snapObj)) {
        if (snap.deltaCfs == null) {
          snap.deltaCfs = deltaCfsFromHistory(snap.cfs, histObj[id] ?? null);
        }
      }
      return {
        snapshots: snapObj,
        histories: histObj,
      };
    },
    ["flagship-gauges", key, usgsFixtureEnabled() ? "fixture" : "live"],
    { revalidate: 300 },
  )();
}
