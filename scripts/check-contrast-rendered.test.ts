import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_PAGE } from "./check-contrast-rendered.ts";

describe("check-contrast-rendered SAMPLE_PAGE", () => {
  it("contains no backticks that would truncate the template literal", () => {
    assert.equal(SAMPLE_PAGE.includes("`"), false);
  });

  it("parses as a Function body — catches silent template truncation", () => {
    assert.doesNotThrow(() => {
      new Function(SAMPLE_PAGE);
    });
  });

  it("still composites sibling overlays and buckets unverifiable", () => {
    assert.match(SAMPLE_PAGE, /coveringOverlays/);
    assert.match(SAMPLE_PAGE, /unverifiable/);
    assert.match(SAMPLE_PAGE, /parseGradient/);
    assert.match(SAMPLE_PAGE, /paintedCssOverRaster/);
    assert.match(SAMPLE_PAGE, /rasterAlpha/);
    assert.match(SAMPLE_PAGE, /opaqueCssSurface/);
  });
});
