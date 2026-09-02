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
  it("opens as a station report, not a magazine hero", () => {
    assert.match(page, /GazetteRiverReport/);
    assert.equal(page.includes("RiverHeroImage"), false);
    assert.equal(page.includes("Trip brief"), false);
    assert.equal(page.includes("Taylor Warnick"), false);
    assert.equal(page.includes("ReportButton"), false);
    assert.equal(page.includes("FavoriteButton"), false);
    assert.match(gauge, /Live gauge/);
    assert.match(gauge, /Flow/);
    assert.match(gauge, /Water temp/);
    assert.match(gauge, /formatTwentyFourHourLine/);
    assert.match(gauge, /formatSeriesTrendLine/);
    assert.match(gauge, /24H/);
    assert.match(report, /GazetteLiveGauge/);
    assert.match(report, /Fish this now/);
    assert.match(report, /Keep a journal on this river/);
    assert.match(report, /formatLonLat/);
    assert.match(report, /lg:grid-cols-3/, "access hangs left of the etching and journal");
    assert.equal(/>\s*Fish\s*</.test(report), false);
  });

  it("prints place · water · miles as type, not a brochure overline", () => {
    assert.match(page, /lengthMiles/);
    assert.match(page, /crumbs/);
    assert.match(page, /madison-river/);
  });
});
