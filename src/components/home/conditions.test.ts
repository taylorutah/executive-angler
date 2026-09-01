import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyDailyPoints,
  applyDvHistory,
  applyDvSeries,
  applyIvSeries,
  applyLatestObservations,
  instantaneousUrl,
  primaryGauge,
  type DailyReading,
  type GaugeSnapshot,
} from "./conditions";
import {
  HERO_DEK,
  HERO_DEK_QUIET,
  formatHeroCaption,
  formatHeroEyebrow,
  heroDek,
} from "./hero-copy";

describe("primaryGauge", () => {
  it("reads a bare site id", () => {
    const g = primaryGauge("06038500", "Madison");
    assert.equal(g?.siteId, "06038500");
  });

  it("reads site_id from JSON", () => {
    const g = primaryGauge(
      JSON.stringify([{ site_id: "06038500", name: "Hebgen", section: "Upper" }]),
      "Madison",
    );
    assert.equal(g?.siteId, "06038500");
    assert.equal(g?.section, "Upper");
  });

  it("reads siteId from already-parsed rows", () => {
    const g = primaryGauge([{ siteId: "06038500", name: "Hebgen" }], "Madison");
    assert.equal(g?.siteId, "06038500");
  });
});

describe("instantaneousUrl", () => {
  it("does not ask USGS for a 24-hour dump", () => {
    const url = instantaneousUrl(["06038500", "06040000"]);
    assert.equal(url.includes("period="), false);
    assert.equal(url.includes("06038500"), true);
  });
});

describe("applyIvSeries", () => {
  it("takes the latest discharge for a site", () => {
    const bySite = new Map([["06038500", ["river-madison"]]]);
    const into = new Map<string, GaugeSnapshot>();
    const recent = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const earlier = new Date(Date.now() - 75 * 60 * 1000).toISOString();
    applyIvSeries(
      [
        {
          sourceInfo: { siteCode: [{ value: "06038500" }] },
          variable: { variableCode: [{ value: "00060" }] },
          values: [
            {
              value: [
                { value: "700", dateTime: earlier },
                { value: "760", dateTime: recent },
              ],
            },
          ],
        },
      ],
      bySite,
      into,
    );
    assert.equal(into.get("river-madison")?.cfs, 760);
    assert.equal(into.get("river-madison")?.stale, false);
  });
});

describe("applyLatestObservations", () => {
  it("maps OGC-shaped latest points onto the river id", () => {
    const bySite = new Map([["06038500", ["river-madison"]]]);
    const into = new Map<string, GaugeSnapshot>();
    const recent = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    applyLatestObservations(
      [
        {
          siteId: "06038500",
          parameterCode: "00060",
          value: 760,
          dateTime: recent,
        },
        {
          siteId: "06038500",
          parameterCode: "00010",
          value: 16.1,
          dateTime: recent,
        },
      ],
      bySite,
      into,
    );
    assert.equal(into.get("river-madison")?.cfs, 760);
    assert.equal(into.get("river-madison")?.waterTempF, 61);
    assert.equal(into.get("river-madison")?.stale, false);
  });

  it("keeps the USGS fixture live even when the frozen instant is days old", () => {
    const prev = process.env.EA_USGS_FIXTURE;
    process.env.EA_USGS_FIXTURE = "1";
    try {
      const into = new Map<string, GaugeSnapshot>();
      applyLatestObservations(
        [
          {
            siteId: "06038500",
            parameterCode: "00060",
            value: 740,
            dateTime: "2026-08-24T18:00:00.000Z",
          },
        ],
        new Map([["06038500", ["river-madison"]]]),
        into,
      );
      assert.equal(into.get("river-madison")?.cfs, 740);
      assert.equal(into.get("river-madison")?.stale, false);
    } finally {
      if (prev === undefined) delete process.env.EA_USGS_FIXTURE;
      else process.env.EA_USGS_FIXTURE = prev;
    }
  });
});

describe("applyDailyPoints", () => {
  it("fills last-seen only when live cfs is missing", () => {
    const bySite = new Map([["06038500", ["river-madison"]]]);
    const live = new Map<string, GaugeSnapshot>([
      [
        "river-madison",
        { cfs: 760, deltaCfs: 0, waterTempF: null, observedAt: "now", stale: false },
      ],
    ]);
    applyDailyPoints(
      [{ siteId: "06038500", date: "2026-08-23", value: 740 }],
      bySite,
      live,
    );
    assert.equal(live.get("river-madison")?.cfs, 760);

    const empty = new Map<string, GaugeSnapshot>();
    applyDailyPoints(
      [
        { siteId: "06038500", date: "2026-08-22", value: 800 },
        { siteId: "06038500", date: "2026-08-23", value: 740 },
      ],
      bySite,
      empty,
    );
    assert.equal(empty.get("river-madison")?.cfs, 740);
    assert.equal(empty.get("river-madison")?.stale, true);
    assert.equal(empty.get("river-madison")?.deltaCfs, -60);
  });
});

describe("applyDvSeries", () => {
  it("fills last-seen only when live cfs is missing", () => {
    const bySite = new Map([["06038500", ["river-madison"]]]);
    const into = new Map<string, GaugeSnapshot>([
      [
        "river-madison",
        { cfs: 760, deltaCfs: 0, waterTempF: null, observedAt: "now", stale: false },
      ],
    ]);
    applyDvSeries(
      [
        {
          sourceInfo: { siteCode: [{ value: "06038500" }] },
          variable: { variableCode: [{ value: "00060" }] },
          values: [{ value: [{ value: "740", dateTime: "2026-08-23" }] }],
        },
      ],
      bySite,
      into,
    );
    assert.equal(into.get("river-madison")?.cfs, 760);
    assert.equal(into.get("river-madison")?.stale, false);

    const empty = new Map<string, GaugeSnapshot>();
    applyDvSeries(
      [
        {
          sourceInfo: { siteCode: [{ value: "06038500" }] },
          variable: { variableCode: [{ value: "00060" }] },
          values: [{ value: [{ value: "740", dateTime: "2026-08-23" }] }],
        },
      ],
      bySite,
      empty,
    );
    assert.equal(empty.get("river-madison")?.cfs, 740);
    assert.equal(empty.get("river-madison")?.stale, true);
  });
});

describe("applyDvHistory", () => {
  it("keeps the dated series for that site", () => {
    const bySite = new Map([["06038500", ["river-madison"]]]);
    const into = new Map<string, DailyReading[]>();
    applyDvHistory(
      [
        {
          sourceInfo: { siteCode: [{ value: "06038500" }] },
          variable: { variableCode: [{ value: "00060" }] },
          values: [
            {
              value: [
                { value: "700", dateTime: "2026-08-01T00:00:00.000-06:00" },
                { value: "760", dateTime: "2026-08-24T00:00:00.000-06:00" },
              ],
            },
          ],
        },
      ],
      bySite,
      into,
    );
    assert.deepEqual(into.get("river-madison"), [
      { date: "2026-08-01", discharge: 700 },
      { date: "2026-08-24", discharge: 760 },
    ]);
  });
});

describe("hero copy follows the number", () => {
  it("drops CFS and the boast when the gauge is quiet", () => {
    assert.equal(formatHeroEyebrow(null, new Date("2026-08-24T18:00:00Z")).includes("CFS"), false);
    assert.equal(heroDek(null), HERO_DEK_QUIET);
    assert.equal(formatHeroEyebrow(760, new Date("2026-08-24T18:00:00Z")).includes("760 CFS"), true);
    assert.equal(heroDek(760), HERO_DEK);
    assert.equal(
      formatHeroCaption(760, new Date("2026-08-26T18:00:00Z")).includes("760 CFS"),
      true,
    );
    assert.equal(
      formatHeroCaption(null, new Date("2026-08-26T18:00:00Z")).includes("CFS"),
      false,
    );
  });

  it("freezes the calendar when EA_USGS_FIXTURE=1", () => {
    const prev = process.env.EA_USGS_FIXTURE;
    process.env.EA_USGS_FIXTURE = "1";
    try {
      assert.equal(formatHeroEyebrow(740).includes("AUGUST 24"), true);
      assert.equal(formatHeroEyebrow(740).includes("740 CFS"), true);
      assert.equal(formatHeroCaption(740).includes("AUGUST 24"), true);
    } finally {
      if (prev === undefined) delete process.env.EA_USGS_FIXTURE;
      else process.env.EA_USGS_FIXTURE = prev;
    }
  });
});
