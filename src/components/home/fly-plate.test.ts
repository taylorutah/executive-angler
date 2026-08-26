import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { flyPlateAlt, specimenScale } from "./fly-plate";

describe("specimenScale", () => {
  it("makes a #20 optically smaller than a #4", () => {
    const streamer = specimenScale(["4"]);
    const midge = specimenScale(["20"]);
    assert.equal(streamer > midge, true);
    assert.equal(streamer, 1);
    assert.ok(midge < 0.65);
  });
});

describe("flyPlateAlt", () => {
  it("names the pattern, never an empty string", () => {
    assert.equal(flyPlateAlt("Hare's Ear", "#12", "mayfly nymph"), "Hare's Ear, #12, mayfly nymph");
    assert.equal(flyPlateAlt("Adams", null, null), "Adams");
  });
});
