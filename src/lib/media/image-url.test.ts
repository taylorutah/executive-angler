import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hostedStillUrl, normalizeImageUrl, plateImageUrl } from "./image-url";
import { localHeroMobileSrc, localHeroWebpSrc } from "./local-hero";

describe("normalizeImageUrl", () => {
  it("remaps the retired Madison still onto the home file", () => {
    assert.equal(
      normalizeImageUrl("/images/madison-river-three-dollar-bridge.jpg"),
      "/images/home/madison-three-dollar-bridge.jpg",
    );
  });

  it("leaves a blank string missing", () => {
    assert.equal(normalizeImageUrl("  "), undefined);
  });

  it("keeps plate cards off icon and submission paths", () => {
    assert.equal(plateImageUrl("/fly-icons/pt.svg"), undefined);
    assert.equal(
      plateImageUrl("/community-images/submissions/abc.jpg"),
      undefined,
    );
    assert.equal(
      plateImageUrl("/images/madison-river-three-dollar-bridge.jpg"),
      "/images/home/madison-three-dollar-bridge.jpg",
    );
  });

  it("resolves local hero derivatives from the retired Madison path", () => {
    assert.equal(
      localHeroMobileSrc("/images/madison-river-three-dollar-bridge.jpg"),
      "/images/home/madison-three-dollar-bridge-828.jpg",
    );
    assert.equal(
      localHeroWebpSrc("/images/madison-river-three-dollar-bridge.jpg"),
      "/images/home/madison-three-dollar-bridge.webp",
    );
  });

  it("rejects Unsplash on leftover public templates", () => {
    assert.equal(
      hostedStillUrl("https://images.unsplash.com/photo-1502635385003-6675045844ad?w=1200"),
      undefined,
    );
    assert.equal(
      hostedStillUrl("https://plus.unsplash.com/premium-photo-x"),
      undefined,
    );
    assert.equal(
      hostedStillUrl("/images/home/madison-three-dollar-bridge.jpg"),
      "/images/home/madison-three-dollar-bridge.jpg",
    );
  });

  it("feeds next/image the remapped path, not the 404", () => {
    const safe = readFileSync(
      join(process.cwd(), "src/components/media/SafeEntityImage.tsx"),
      "utf8",
    );
    const hero = readFileSync(
      join(process.cwd(), "src/components/ui/RiverHeroImage.tsx"),
      "utf8",
    );
    assert.match(safe, /const href = normalizeImageUrl\(src\)/);
    assert.match(safe, /src=\{href\}/);
    assert.match(hero, /const heroSrc = normalizeImageUrl\(heroImageUrl\)/);
    assert.match(hero, /src=\{heroSrc\}/);
  });
});
