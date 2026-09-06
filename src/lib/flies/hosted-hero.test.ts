import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  flyHeroSrc,
  hostedFlyHeroUrl,
  withHostedFlyHero,
} from "./hosted-hero";

const ASSET = "/images/flies/blue-winged-olive-comparadun.jpg";
const STALE =
  "https://qlasxtfbodyxbcuchvxz.supabase.co/storage/v1/object/public/fly-pattern-images/blue-winged-olive-comparadun.jpg";

describe("hosted fly heroes", () => {
  it("keeps the BWO Comparadun JPEG in public/", () => {
    const path = join(process.cwd(), "public", ASSET.slice(1));
    assert.equal(existsSync(path), true);
    const bytes = readFileSync(path);
    assert.equal(bytes[0], 0xff);
    assert.equal(bytes[1], 0xd8);
    assert.ok(bytes.length > 10_000);
  });

  it("prefers the hosted still for the BWO Comparadun slug", () => {
    assert.equal(hostedFlyHeroUrl("blue-winged-olive-comparadun"), ASSET);
    assert.equal(
      flyHeroSrc({
        slug: "blue-winged-olive-comparadun",
        hero_image_url: STALE,
      }),
      ASSET,
    );
    assert.equal(
      withHostedFlyHero({
        slug: "blue-winged-olive-comparadun",
        hero_image_url: STALE,
      }).hero_image_url,
      ASSET,
    );
  });

  it("leaves other slugs on their stored URL", () => {
    assert.equal(hostedFlyHeroUrl("pheasant-tail"), undefined);
    assert.equal(
      flyHeroSrc({
        slug: "pheasant-tail",
        hero_image_url: "/images/fly-icons/dry.svg",
      }),
      "/images/fly-icons/dry.svg",
    );
  });
});
