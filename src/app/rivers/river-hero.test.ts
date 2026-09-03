import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const page = readFileSync(
  join(process.cwd(), "src/app/rivers/[slug]/page.tsx"),
  "utf8",
);

describe("river hero paper band", () => {
  it("prints destination · water type once — not again as reversed meta", () => {
    assert.match(page, /const heroSubtitle = \[destinationLabel/);
    assert.match(page, /subtitle=\{heroSubtitle \|\| undefined\}/);
    assert.equal(page.includes("dest?.state"), false);
    assert.equal(
      page.includes("[river.flowType, river.difficulty, river.wadingType"),
      false,
    );
    assert.match(page, /meta=\{river\.lengthMiles \? `\$\{river\.lengthMiles\} miles` : undefined\}/);
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
    assert.equal(
      page.includes("lg:grid-cols-[minmax(0,1fr)_minmax(18rem,36rem)]"),
      false,
    );
    assert.equal(page.includes("EntityChrome"), false);
    assert.equal(
      page.includes("[river.difficulty, river.wadingType, ...(river.primarySpecies ?? [])]"),
      false,
    );
    assert.equal(page.includes('className="ea-chip"'), false);
  });

  it("keeps overview prose and does not repeat species as badges", () => {
    assert.match(page, /Read the river overview/);
    assert.match(page, /river\.description\.split/);
    assert.match(page, /label: "Fish"/);
    assert.match(page, /TokenRow/);
    assert.equal(page.includes("entity-tags"), false);
    assert.equal(page.includes('variant="river"'), false);
    assert.equal(page.includes('import Badge'), false);
  });

  it("labels nearby river water type instead of printing the raw enum", () => {
    assert.match(page, /waterTypeLabel\(near\.flowType\)/);
    assert.equal(page.includes("subtitle={near.flowType}"), false);
  });

  it("scopes Madison SEO lede, season H2, and neighbor slugs to that river only", () => {
    assert.match(page, /lede=\{river\.slug === "madison-river" \? MADISON_LEDE : undefined\}/);
    assert.match(page, /When is the best time to fly fish the Madison River\?/);
    assert.match(page, /"gallatin-river"/);
    assert.match(page, /"yellowstone-river"/);
    assert.match(page, /"jefferson-river-montana"/);
    assert.match(page, /"missouri-river"/);
    assert.match(page, /"big-hole-river"/);
    assert.match(page, /"beaverhead-river-montana"/);
    assert.match(page, /nearbyRiversForPage/);
    assert.equal(page.includes("/plan/madison-river"), false);
    assert.match(page, /if \(river\.slug !== "madison-river"\)/);
  });

  it("paints lodge stills and stays quiet when the frame is empty", () => {
    assert.match(page, /imageUrl=\{lodge\.heroImageUrl\}/);
    assert.match(page, /imageFallback="quiet"/);
    assert.equal(page.includes("hostedStillUrl(lodge.heroImageUrl)"), false);
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

  it("renders an optional lede on the identity band above the spec rail", () => {
    assert.match(hero, /lede\?: string/);
    assert.match(hero, /\{lede \? \(/);
    assert.match(hero, /max-w-\[var\(--prose\)\]/);
  });
});
