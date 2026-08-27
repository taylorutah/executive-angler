import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { flowTrend, missingGaugeCopy, missingInstantaneousCopy } from "./missing-gauge";

describe("missingGaugeCopy", () => {
  it("names the river when no site is linked", () => {
    assert.equal(
      missingGaugeCopy("Arkansas River"),
      "No USGS site is linked to Arkansas River. We do not invent a site id or guess a flow.",
    );
    assert.equal(
      missingGaugeCopy("Pecos River", "[]"),
      "No USGS site is linked to Pecos River. We do not invent a site id or guess a flow.",
    );
  });

  it("names the invalid id when one is stored", () => {
    assert.equal(
      missingGaugeCopy("Madison River", "not-a-site"),
      "USGS site not-a-site is not a valid gauge id for Madison River. We do not guess a flow.",
    );
  });
});

describe("missingInstantaneousCopy", () => {
  it("names the instantaneous gap and leaves daily means intact", () => {
    assert.equal(
      missingInstantaneousCopy("Madison River", "06038500"),
      "USGS site 06038500 on Madison River did not return an instantaneous reading. Daily means below are the last published values. We do not guess a live flow.",
    );
  });
});

describe("flowTrend", () => {
  it("returns rising, dropping, or steady — never a colour name", () => {
    assert.equal(flowTrend(100, 140), "rising");
    assert.equal(flowTrend(140, 100), "dropping");
    assert.equal(flowTrend(100, 101), "steady");
    assert.equal(flowTrend(null, 100), null);
  });
});
