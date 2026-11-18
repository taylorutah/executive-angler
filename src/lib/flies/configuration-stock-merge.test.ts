import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mergeConfigurationStockCounts,
  stockCountsAfterLastBoxRemoval,
} from "./configuration-stock-merge.ts";

describe("mergeConfigurationStockCounts", () => {
  it("reproduces Steve bug on main: re-add qty 2 after remove would yield 4 if increment", () => {
    const merged = mergeConfigurationStockCounts({
      existingTied: 0,
      existingBought: 2,
      addTied: 0,
      addBought: 2,
      inBoxCount: 0,
    });
    assert.equal(merged.bought_count, 2);
    assert.equal(merged.tied_count, 0);
  });

  it("increments when the version is still in a box", () => {
    const merged = mergeConfigurationStockCounts({
      existingTied: 1,
      existingBought: 2,
      addTied: 0,
      addBought: 2,
      inBoxCount: 1,
    });
    assert.equal(merged.bought_count, 4);
  });

  it("sets tied and bought when re-adding after last box removal cleared counts", () => {
    const cleared = stockCountsAfterLastBoxRemoval();
    assert.deepEqual(cleared, { tied_count: 0, bought_count: 0 });
    const merged = mergeConfigurationStockCounts({
      existingTied: cleared.tied_count,
      existingBought: cleared.bought_count,
      addTied: 0,
      addBought: 2,
      inBoxCount: 0,
    });
    assert.equal(merged.bought_count, 2);
  });
});
