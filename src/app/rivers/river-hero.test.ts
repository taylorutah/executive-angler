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

  it("prints difficulty and access as labeled text, not enum chips", () => {
    assert.match(page, /difficultyLabel\(river\.difficulty\)/);
    assert.match(page, /accessLabel\(river\.wadingType\)/);
    assert.equal(
      page.includes("[river.difficulty, river.wadingType, ...(river.primarySpecies ?? [])]"),
      false,
    );
    assert.equal(page.includes('className="ea-chip"'), false);
  });

  it("keeps overview prose and does not repeat species as badges", () => {
    assert.match(page, /Read the river overview/);
    assert.match(page, /river\.description\.split/);
    assert.equal(page.includes("entity-tags"), false);
    assert.equal(page.includes('variant="river"'), false);
    assert.equal(page.includes('import Badge'), false);
  });

  it("labels nearby river water type instead of printing the raw enum", () => {
    assert.match(page, /waterTypeLabel\(near\.flowType\)/);
    assert.equal(page.includes("subtitle={near.flowType}"), false);
  });
});
