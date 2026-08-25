import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canonicalImgSrc,
  claimImageUrl,
  imageAvailable,
  reportDuplicateImages,
} from "./homepage-images";

describe("canonicalImgSrc", () => {
  it("decodes a next/image optimizer URL", () => {
    const src =
      "/_next/image?url=%2Fimages%2Fmadison-river-three-dollar-bridge.jpg&w=3840&q=75";
    assert.equal(canonicalImgSrc(src), "/images/madison-river-three-dollar-bridge.jpg");
  });

  it("keeps a supabase storage URL", () => {
    const src =
      "https://qlasxtfbodyxbcuchvxz.supabase.co/storage/v1/object/public/fly-pattern-images/hares-ear-nymph.jpg";
    assert.equal(canonicalImgSrc(src), src);
  });
});

describe("reportDuplicateImages", () => {
  it("allows the light/dark logo pair to repeat", () => {
    const report = reportDuplicateImages([
      "/images/logo-horizontal-white.svg",
      "/images/logo-horizontal-forest.svg",
      "/images/logo-horizontal-white.svg",
      "/images/logo-horizontal-forest.svg",
      "/images/destinations/wyoming-hero.jpg",
    ]);
    assert.equal(report.ok, true);
    assert.deepEqual(report.duplicates, []);
  });

  it("fails when a content photograph repeats — the live / bug", () => {
    const report = reportDuplicateImages([
      "/images/logo-horizontal-white.svg",
      "/images/logo-horizontal-forest.svg",
      "/_next/image?url=%2Fimages%2Fmadison-river-three-dollar-bridge.jpg&w=3840&q=75",
      "/_next/image?url=%2Fimages%2Fmadison-river-three-dollar-bridge.jpg&w=3840&q=75",
      "/_next/image?url=%2Fimages%2Fdestinations%2Fmontana-hero.jpg&w=3840&q=75",
      "/_next/image?url=%2Fimages%2Fdestinations%2Fmontana-hero.jpg&w=3840&q=75",
      "https://qlasxtfbodyxbcuchvxz.supabase.co/storage/v1/object/public/fly-pattern-images/hares-ear-nymph.jpg",
      "https://qlasxtfbodyxbcuchvxz.supabase.co/storage/v1/object/public/fly-pattern-images/hares-ear-nymph.jpg",
    ]);
    assert.equal(report.ok, false);
    assert.deepEqual(report.duplicates, [
      "/images/madison-river-three-dollar-bridge.jpg",
      "/images/destinations/montana-hero.jpg",
      "https://qlasxtfbodyxbcuchvxz.supabase.co/storage/v1/object/public/fly-pattern-images/hares-ear-nymph.jpg",
    ]);
  });

  it("permits a documented repeat and still fails an undocumented one", () => {
    const twice = [
      "/images/rivers/madison-river-hero.jpg",
      "/images/rivers/madison-river-hero.jpg",
      "/images/rivers/gallatin-river-hero.jpg",
      "/images/rivers/gallatin-river-hero.jpg",
    ];
    const documented = reportDuplicateImages(twice, [
      "/images/rivers/madison-river-hero.jpg",
    ]);
    assert.equal(documented.ok, false);
    assert.deepEqual(documented.duplicates, ["/images/rivers/gallatin-river-hero.jpg"]);

    const bothDocumented = reportDuplicateImages(twice, [
      "/images/rivers/madison-river-hero.jpg",
      "/images/rivers/gallatin-river-hero.jpg",
    ]);
    assert.equal(bothDocumented.ok, true);
    assert.deepEqual(bothDocumented.duplicates, []);
  });

  it("passes when each content photograph is unique", () => {
    const report = reportDuplicateImages([
      "/images/logo-horizontal-white.svg",
      "/images/logo-horizontal-forest.svg",
      "/images/logo-horizontal-white.svg",
      "/images/logo-horizontal-forest.svg",
      "/images/madison-river-three-dollar-bridge.jpg",
      "/images/destinations/montana-hero.jpg",
      "/images/destinations/wyoming-hero.jpg",
      "https://qlasxtfbodyxbcuchvxz.supabase.co/storage/v1/object/public/fly-pattern-images/hares-ear-nymph.jpg",
    ]);
    assert.equal(report.ok, true);
    assert.equal(new Set(report.contentSources).size, report.contentSources.length);
  });
});

describe("claimImageUrl", () => {
  it("refuses a URL that is already claimed", () => {
    const used = new Set<string>();
    assert.equal(
      claimImageUrl("/images/madison-river-three-dollar-bridge.jpg", used),
      "/images/madison-river-three-dollar-bridge.jpg",
    );
    assert.equal(claimImageUrl("/images/madison-river-three-dollar-bridge.jpg", used), undefined);
    assert.equal(imageAvailable("/images/destinations/utah-hero.jpg", used), true);
  });
});
