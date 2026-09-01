import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("home visitor QA locks", () => {
  it("keeps ink-band button type ink against the later paper-link rule", () => {
    const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
    assert.match(css, /\.ea-band-ink a:not\(\.ea-btn\)/);
    assert.match(css, /\.ea-band-ink a\.ea-btn-on-ink\s*\{[\s\S]*?color:\s*var\(--ink\)/);
    const journal = readFileSync(join(root, "src/components/home/JournalBand.tsx"), "utf8");
    assert.match(journal, /ea-btn ea-btn-lg ea-btn-on-ink/);
  });

  it("drops leftover section indexes", () => {
    assert.equal(existsSync(join(root, "src/components/home/SectionMark.tsx")), false);
    const plate = readFileSync(join(root, "src/components/home/FlyPlate.tsx"), "utf8");
    const go = readFileSync(join(root, "src/components/home/WhereToGo.tsx"), "utf8");
    assert.match(plate, /The plate/);
    assert.match(go, /Where to go/);
    assert.equal(plate.includes("SectionMark"), false);
    assert.equal(go.includes("SectionMark"), false);
    assert.equal(/\bn=["']0[123]["']/.test(plate + go), false);
  });

  it("keeps the reference a contents list, not four doors", () => {
    const src = readFileSync(join(root, "src/components/home/CategoryIndex.tsx"), "utf8");
    assert.equal(src.includes("Door"), false);
    assert.equal(src.includes("lg:grid-cols-4"), false);
    assert.equal(src.includes("ea-stat-value"), false);
    assert.match(src, /class ReferenceIndex/);
    assert.match(src, /Open/);
    assert.match(src, /--action/);
  });
});
