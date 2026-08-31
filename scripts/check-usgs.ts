/**
 * Live USGS smoke: flagship gauges must return a discharge via the shared client.
 *
 *   npm run check:usgs
 *
 * Hits api.waterdata.usgs.gov (falls back to WaterServices). Fails if fewer
 * than four of the six homepage rivers have a finite CFS. Does not invent a
 * reading. Does not use EA_USGS_FIXTURE.
 */
import assert from "node:assert/strict";
import { PARAM_DISCHARGE, fetchDaily, fetchLatest, latestBySiteParam } from "../src/lib/usgs/client";

const FLAGSHIP = [
  { label: "Madison", siteId: "06038500" },
  { label: "Green", siteId: "09234500" },
  { label: "Henry's Fork", siteId: "13042500" },
  { label: "Yellowstone", siteId: "06191500" },
  { label: "Snake", siteId: "13011000" },
  { label: "Missouri", siteId: "06065500" },
] as const;

const MIN_LIVE = 4;

async function main() {
  if (process.env.EA_USGS_FIXTURE === "1") {
    throw new Error("check:usgs refuses EA_USGS_FIXTURE — this gate hits the real USGS");
  }

  const siteIds = FLAGSHIP.map((r) => r.siteId);
  const grouped = latestBySiteParam(await fetchLatest(siteIds, [PARAM_DISCHARGE]));
  const lines: string[] = [];
  let live = 0;
  for (const river of FLAGSHIP) {
    const cfs = grouped.get(river.siteId)?.get(PARAM_DISCHARGE)?.value;
    if (cfs != null && Number.isFinite(cfs) && cfs >= 0) {
      live += 1;
      lines.push(`${river.label} ${river.siteId} ${Math.round(cfs)} cfs`);
    } else {
      lines.push(`${river.label} ${river.siteId} NO READING`);
    }
  }
  console.log(lines.join("\n"));
  assert.ok(
    live >= MIN_LIVE,
    `expected at least ${MIN_LIVE} flagship gauges with CFS, got ${live}`,
  );

  const end = new Date();
  const start = new Date();
  start.setUTCDate(end.getUTCDate() - 14);
  const daily = await fetchDaily(
    [FLAGSHIP[0].siteId],
    start.toISOString().slice(0, 10),
    end.toISOString().slice(0, 10),
  );
  assert.ok(
    daily.length >= 7,
    `Madison daily means: expected at least 7 points in 14 days, got ${daily.length}`,
  );
  console.log(`Madison daily ${daily.length} points (14-day window)`);
  console.log(`check:usgs OK — ${live}/${FLAGSHIP.length} live`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
