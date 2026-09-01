import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const page = readFileSync(
  join(process.cwd(), "src/app/rivers/[slug]/page.tsx"),
  "utf8",
);

describe("river station report", () => {
  it("prints place · water · miles as the overline, not a trip brochure", () => {
    assert.match(page, /const heroSubtitle = \[/);
    assert.match(page, /subtitle=\{heroSubtitle \|\| undefined\}/);
    assert.match(page, /river\.lengthMiles \? `\$\{river\.lengthMiles\} miles`/);
    assert.equal(page.includes("Trip brief"), false);
    assert.equal(page.includes("Taylor Warnick"), false);
  });

  it("prints difficulty and access as labeled facts, not enum chips", () => {
    assert.match(page, /difficultyLabel\(river\.difficulty\)/);
    assert.match(page, /accessLabel\(river\.wadingType\)/);
    assert.match(page, /label: "Difficulty"/);
    assert.match(page, /label: "Access"/);
    assert.match(page, /label: "Season"/);
    assert.match(page, /formatBestMonthsLine/);
    assert.match(page, /spec=/);
    assert.match(page, /toolbar=/);
    assert.match(page, /className: "col-span-3"/);
    assert.match(page, /i < speciesNames.length - 1 \? "," : ""/);
    assert.equal(page.includes("sm:grid-cols-4"), false);
    assert.equal(page.includes("lead={i > 0}"), false);
    assert.equal(page.includes("lead="), false);
    assert.equal(page.includes("EntityChrome"), false);
    assert.equal(page.includes('className="ea-chip"'), false);
  });

  it("keeps overview prose and does not repeat species as badges", () => {
    assert.match(page, /Read the river overview/);
    assert.match(page, /river\.description\.split/);
    assert.match(page, /label: "Fish"/);
    assert.match(page, /TokenRow/);
    assert.equal(page.includes("entity-tags"), false);
    assert.equal(page.includes('variant="river"'), false);
    assert.equal(page.includes("import Badge"), false);
  });

  it("labels nearby river water type instead of printing the raw enum", () => {
    assert.match(page, /waterTypeLabel\(near\.flowType\)/);
    assert.equal(page.includes("subtitle={near.flowType}"), false);
  });

  it("keeps a journal CTA and one field-note link on Madison", () => {
    assert.match(page, /Keep a journal on this river/);
    assert.match(page, /best-flies-for-the-madison-river-2026/);
    assert.equal(page.includes("Planning a Madison trip"), false);
  });
});

describe("river hero credit is not a byline", () => {
  const hero = readFileSync(
    join(process.cwd(), "src/components/ui/RiverHeroImage.tsx"),
    "utf8",
  );

  it("keeps photographer credit off the identity band under the H1", () => {
    assert.match(hero, /labeledPhotoCredit/);
    assert.equal(hero.includes("credit={"), false);
  });
});
