import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const page = readFileSync(join(process.cwd(), "src/app/rivers/[slug]/page.tsx"), "utf8");
const report = readFileSync(
  join(process.cwd(), "src/components/gazette/GazetteRiverReport.tsx"),
  "utf8",
);
const gauge = readFileSync(
  join(process.cwd(), "src/components/gazette/GazetteLiveGauge.tsx"),
  "utf8",
);

describe("river station report", () => {
  it("opens with giant CFS + hydrograph, not a magazine hero", () => {
    assert.match(page, /GazetteRiverReport/);
    assert.equal(page.includes("RiverHeroImage"), false);
    assert.equal(page.includes("Trip brief"), false);
    assert.equal(page.includes("Taylor Warnick"), false);
    assert.equal(page.includes("ReportButton"), false);
    assert.equal(page.includes("FavoriteButton"), false);
    assert.match(gauge, /Live gauge/);
    assert.match(report, /GazetteLiveGauge/);
    assert.match(report, /Current hatches/);
    assert.match(report, /Keep a journal on this river/);
  });

  it("uses Missouri Headwaters overline on Madison", () => {
    assert.match(page, /MISSOURI HEADWATERS/);
    assert.match(page, /madison-river/);
  });
});
