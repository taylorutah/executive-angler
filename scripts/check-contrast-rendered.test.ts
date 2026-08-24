import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ROUTES,
  DUSK_ROUTES,
  SAMPLE_PAGE,
} from "./check-contrast-rendered.ts";

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
    assert.match(SAMPLE_PAGE, /<= 0\.5/);
  });
});

describe("check-contrast-rendered route lists", () => {
  it("covers the public pages that have never been measured", () => {
    const required = [
      "/search",
      "/search?q=green+river",
      "/learn",
      "/species",
      "/species/rainbow-trout",
      "/lodges",
      "/lodges/firehole-ranch",
      "/guides",
      "/guides/bud-lillys-guide-service",
      "/fly-shops",
      "/fly-shops/blue-ribbon-flies",
      "/about",
      "/contact",
      "/for-guides",
      "/feed",
      "/signup",
      "/privacy",
      "/terms",
      "/flies",
      "/flies/materials",
      "/flies/hatch/caddis",
      "/flies/for/madison-river",
      "/flies/category/nymph",
      "/articles/introduction-to-euro-nymphing",
      "/authors",
      "/gear",
      "/ea-contrast-404-probe",
    ];
    for (const route of required) {
      assert.ok(DEFAULT_ROUTES.includes(route), `missing ${route}`);
    }
  });

  it("covers the dusk register after QA sign-in", () => {
    const required = [
      "/dashboard",
      "/journal",
      "/journal/insights",
      "/flies/boxes",
      "/account",
      "/notifications",
      "/messages",
    ];
    for (const route of required) {
      assert.ok(DUSK_ROUTES.includes(route), `missing ${route}`);
    }
  });
});
