import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const chart = readFileSync(
  join(process.cwd(), "src/components/hydrograph/Hydrograph.tsx"),
  "utf8",
);
const geometry = readFileSync(
  join(process.cwd(), "src/components/hydrograph/geometry.ts"),
  "utf8",
);
const home = readFileSync(
  join(process.cwd(), "src/components/home/HomeHydrograph.tsx"),
  "utf8",
);
const flow = readFileSync(
  join(process.cwd(), "src/components/rivers/FlowChart.tsx"),
  "utf8",
);

describe("hydrograph well fill", () => {
  it("stretches the plot to the well and keeps axis type in CSS pixels", () => {
    assert.match(chart, /preserveAspectRatio="none"/);
    assert.match(chart, /HYDRO_FRAME/);
    assert.match(chart, /text-sm tabular-nums text-\[var\(--text-2\)\]/);
    assert.equal(chart.includes('h-[9.5rem]'), false);
    assert.equal(chart.includes('fontSize="13"'), false);
    assert.equal(chart.includes('fontSize="12"'), false);
  });

  it("shares one frame class so the home stub matches the instrument", () => {
    assert.match(geometry, /export const HYDRO_FRAME/);
    assert.match(geometry, /lg:h-\[24rem\]/);
    assert.match(home, /HYDRO_FRAME/);
    assert.equal(home.includes('h-[9.5rem]'), false);
    const gazette = readFileSync(
      join(process.cwd(), "src/components/gazette/GazetteHydrograph.tsx"),
      "utf8",
    );
    assert.match(gazette, /linearGradient/);
    assert.match(gazette, /preserveAspectRatio="none"/);
    assert.equal(gazette.includes("24H"), false);
  });

  it("names the band in plain English and marks a mid date", () => {
    assert.match(chart, /midIndex/);
    assert.match(flow, /typical range/);
    assert.equal(flow.includes("IQR"), false);
    assert.equal(flow.includes("text-[2rem]"), false);
  });
});
