import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("home visitor QA locks", () => {
  it("composes still 1 in GazetteHome — rivers report, not a brochure hero", () => {
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
    assert.match(plate, /ea-plate-ink/, "still 1 keeps the notched cream plate");
    assert.match(plate, /ea-plate-etch/, "plates carry an ink etch from desk icons");
    assert.equal(plate.includes("ea-plate-well"), false, "empty photo wells must be omitted");
    assert.equal(plate.includes("<img"), false, "plates are type, not photos");
    assert.equal(plate.includes("next/image"), false, "plates are type, not photos");
    assert.equal(plate.includes("heroImage"), false, "plates are type, not photos");
    assert.match(gazette, /Field note/);
    assert.match(gazette, /Keep the record the water can/);
    assert.equal(gazette.includes("h-[50vh]"), false);
    assert.equal(gazette.includes("and Hatches"), false);
    assert.equal(gazette.includes("HERO_IMAGE"), false, "still 1 has no Three Dollar Bridge hero");
    assert.equal(gazette.includes("formatHeroCaption"), false);
    assert.equal(gazette.includes("<figcaption"), false);
    assert.match(gazette, /facing="right"/, "journal heron faces right, as the still");
    assert.match(gazette, /montana: "MT"/, "hanging index uses USPS, not MO for Montana");
  });

  it("keeps the journal invitation as a rule-and-arrow, not an ink band", () => {
    const gazette = readFileSync(join(root, "src/components/gazette/GazetteHome.tsx"), "utf8");
    assert.match(gazette, /Keep a journal/);
    assert.equal(gazette.includes("ea-band-ink"), false);
  });

  it("drops leftover section indexes and Where to go", () => {
    assert.equal(existsSync(join(root, "src/components/home/SectionMark.tsx")), false);
  });
});
