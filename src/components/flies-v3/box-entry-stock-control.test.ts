import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { clampStockQty } from "./BoxEntryStockControl.tsx";

describe("clampStockQty", () => {
  it("accepts whole numbers >= 0", () => {
    assert.equal(clampStockQty(2), 2);
    assert.equal(clampStockQty("12"), 12);
    assert.equal(clampStockQty(-3), 0);
    assert.equal(clampStockQty("x"), 0);
  });
});
