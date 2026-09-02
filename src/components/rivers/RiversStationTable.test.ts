import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { UNGAUGED, cfsCell, isGauged, trendWord } from "./RiversStationTable";

describe("ungauged station cells", () => {
  it("uses an em dash, never a string of periods", () => {
    assert.equal(UNGAUGED, "—");
    assert.equal(cfsCell(undefined), "—");
    assert.equal(trendWord(undefined), "—");
    assert.equal(isGauged(undefined), false);
    assert.equal(cfsCell(undefined).includes("."), false);
    assert.equal(trendWord(undefined).includes("."), false);
  });

  it("keeps a live CFS number when the gauge reported", () => {
    const flow = { cfs: 106, state: "normal" as const, deltaCfs: 20 };
    assert.equal(isGauged(flow), true);
    assert.equal(cfsCell(flow), "106 CFS");
    assert.equal(trendWord(flow), "rising");
  });

  it("does not paint unexplained live dots next to CFS", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/rivers/RiversStationTable.tsx"),
      "utf8",
    );
    assert.equal(src.includes("ea-live-dot"), false);
  });
});
