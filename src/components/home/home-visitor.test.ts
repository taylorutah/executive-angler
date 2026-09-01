import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("home visitor QA locks", () => {
  it("composes still 4 in GazetteHome — rivers report, not a brochure hero", () => {
    const home = readFileSync(join(root, "src/app/page.tsx"), "utf8");
    const gazette = readFileSync(join(root, "src/components/gazette/GazetteHome.tsx"), "utf8");
    assert.match(home, /GazetteLiveHome/);
    assert.equal(home.includes("LiveHomeHero"), false);
    assert.equal(home.includes("CategoryIndex"), false);
    assert.equal(home.includes("WhereToGo"), false);
    assert.equal(home.includes("LiveConditionsRail"), false);
    assert.match(gazette, /On the water now/);
    assert.match(gazette, /Rivers/);
    assert.match(gazette, /Report/);
    assert.match(gazette, /02 The plate/);
    assert.match(gazette, /GazettePlate/);
    const plate = readFileSync(join(root, "src/components/gazette/GazettePlate.tsx"), "utf8");
    assert.equal(plate.includes("ea-plate-well"), false, "empty photo wells must be omitted");
    assert.match(gazette, /Field note/);
    assert.match(gazette, /Keep the record the water can/);
    assert.equal(gazette.includes("h-[50vh]"), false);
    assert.equal(gazette.includes("and Hatches"), false);
    assert.equal(gazette.includes("HERO_IMAGE"), false);
  });

  it("keeps the journal invitation on paper with a double-rule box", () => {
    const gazette = readFileSync(join(root, "src/components/gazette/GazetteHome.tsx"), "utf8");
    assert.match(gazette, /Keep a journal/);
    assert.match(gazette, /ea-journal-box/);
    assert.equal(gazette.includes("ea-band-ink"), false);
  });

  it("drops leftover section indexes and Where to go", () => {
    assert.equal(existsSync(join(root, "src/components/home/SectionMark.tsx")), false);
  });
});
