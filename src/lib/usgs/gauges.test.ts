import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { firstUsgsSiteId, parseRiverGauges } from "./gauges";

describe("parseRiverGauges", () => {
  it("reads a bare site id", () => {
    const g = parseRiverGauges("06038500", "Madison");
    assert.equal(g.length, 1);
    assert.equal(g[0]?.site_id, "06038500");
    assert.equal(g[0]?.name, "Madison");
  });

  it("reads site_id from a JSON string", () => {
    const g = parseRiverGauges(
      JSON.stringify([{ site_id: "06038500", name: "Hebgen", section: "Upper" }]),
      "Madison",
    );
    assert.equal(g[0]?.site_id, "06038500");
    assert.equal(g[0]?.section, "Upper");
  });

  it("reads siteId from an already-parsed jsonb array", () => {
    const g = parseRiverGauges([{ siteId: "06038500", name: "Hebgen" }], "Madison");
    assert.equal(g[0]?.site_id, "06038500");
  });

  it("keeps optional coordinates from a jsonb row", () => {
    const g = parseRiverGauges(
      [{ site_id: "06038500", name: "Hebgen", latitude: 44.86, longitude: -111.33 }],
      "Madison",
    );
    assert.equal(g[0]?.latitude, 44.86);
    assert.equal(g[0]?.longitude, -111.33);
  });

  it("does not throw on a parsed object and skips junk ids", () => {
    assert.deepEqual(parseRiverGauges({ site_id: "not-a-site" }), []);
    assert.deepEqual(parseRiverGauges(12), []);
    assert.deepEqual(parseRiverGauges(null), []);
  });
});

describe("firstUsgsSiteId", () => {
  it("accepts a jsonb array without calling trim on it", () => {
    assert.equal(
      firstUsgsSiteId([{ site_id: "06038800", name: "Kirby", section: "50-Mile" }]),
      "06038800",
    );
  });

  it("keeps the Madison live inset mounted when PostgREST returns four gauges", () => {
    const madison = [
      { site_id: "06038500", name: "Below Hebgen Lake", section: "Hebgen tailwater" },
      { site_id: "06038800", name: "Near Kirby Ranch", section: "50-Mile Riffle" },
      { site_id: "06040000", name: "Near Cameron", section: "Middle Madison" },
      { site_id: "06041000", name: "Below Ennis Lake", section: "Bear Trap Canyon" },
    ];
    assert.equal(firstUsgsSiteId(madison), "06038500");
    assert.equal(parseRiverGauges(madison).length, 4);
  });

  it("returns undefined for empty or invalid values", () => {
    assert.equal(firstUsgsSiteId(undefined), undefined);
    assert.equal(firstUsgsSiteId("not-a-site"), undefined);
    assert.equal(firstUsgsSiteId("[]"), undefined);
  });
});
