import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  canonicalImgSrc,
  claimImageUrl,
  imageAvailable,
  photoAlt,
  reportDuplicateImages,
} from "./homepage-images";

const homeHero = readFileSync(join(process.cwd(), "src/components/home/HomeHero.tsx"), "utf8");

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

describe("photoAlt", () => {
  it("never returns an empty string", () => {
    assert.equal(photoAlt("", "Madison River"), "Madison River");
    assert.equal(photoAlt("  ", "Hare's Ear"), "Hare's Ear");
    assert.equal(photoAlt("A brown trout stream", "Madison River"), "A brown trout stream");
  });
});

describe("HomeHero photograph", () => {
  it("serves the public JPEG, not the optimizer", () => {
    assert.match(homeHero, /\bunoptimized\b/);
    assert.equal(homeHero.includes("quality={85}"), false);
    assert.match(homeHero, /src=\{HERO_IMAGE\.src\}/);
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
