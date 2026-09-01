import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("home visitor QA locks", () => {
  it("composes T7O4R in GazetteHome, not HomeHero + CategoryIndex", () => {
    const home = readFileSync(join(root, "src/app/page.tsx"), "utf8");
    const gazette = readFileSync(join(root, "src/components/gazette/GazetteHome.tsx"), "utf8");
    assert.match(home, /GazetteLiveHome/);
    assert.equal(home.includes("LiveHomeHero"), false);
    assert.equal(home.includes("CategoryIndex"), false);
    assert.equal(home.includes("WhereToGo"), false);
    assert.equal(home.includes("LiveConditionsRail"), false);
    assert.match(gazette, /lg:grid-cols-\[minmax\(0,1.62fr\)_minmax\(0,1fr\)\]/);
    assert.match(gazette, /and Hatches/);
    assert.match(gazette, /lg:whitespace-nowrap/);
    assert.match(gazette, /bg-\[var\(--copper\)\]/);
    assert.match(gazette, /formatHeroCaption/);
    assert.equal(gazette.includes("h-[50vh]"), false);
    assert.equal(gazette.includes("absolute bottom-0"), false);
  });

  it("keeps the journal invitation on paper with a willow button", () => {
    const gazette = readFileSync(join(root, "src/components/gazette/GazetteHome.tsx"), "utf8");
    assert.match(gazette, /Keep a journal/);
    assert.match(gazette, /bg-\[var\(--accent\)\]/);
    assert.equal(gazette.includes("ea-band-ink"), false);
  });

  it("drops leftover section indexes and Where to go", () => {
    assert.equal(existsSync(join(root, "src/components/home/SectionMark.tsx")), false);
  });
});
