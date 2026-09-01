import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("home visitor QA locks", () => {
  it("keeps the journal invitation on paper with a willow button", () => {
    const journal = readFileSync(join(root, "src/components/home/JournalBand.tsx"), "utf8");
    assert.match(journal, /Keep a journal/);
    assert.match(journal, /ea-btn ea-btn-primary/);
    assert.equal(journal.includes("ea-band-ink"), false);
  });

  it("drops leftover section indexes and Where to go", () => {
    assert.equal(existsSync(join(root, "src/components/home/SectionMark.tsx")), false);
    const plate = readFileSync(join(root, "src/components/home/FlyPlate.tsx"), "utf8");
    const home = readFileSync(join(root, "src/app/page.tsx"), "utf8");
    assert.match(plate, /The plate/);
    assert.match(plate, /--plate/);
    assert.equal(home.includes("WhereToGo"), false);
    assert.equal(home.includes("LiveConditionsRail"), false);
    assert.equal(plate.includes("SectionMark"), false);
  });

  it("keeps the reference a hanging index, not four doors", () => {
    const src = readFileSync(join(root, "src/components/home/CategoryIndex.tsx"), "utf8");
    assert.equal(src.includes("Door"), false);
    assert.equal(src.includes("lg:grid-cols-4"), false);
    assert.equal(src.includes("ea-stat-value"), false);
    assert.match(src, /class ReferenceIndex/);
  });
});
