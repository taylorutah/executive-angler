import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hatchRailFromChart, weekFliesFromChart } from "./week-flies";
import type { CanonicalFly, HatchEntry } from "@/types/entities";

function fly(name: string, slug: string): CanonicalFly {
  return {
    id: slug,
    slug,
    name,
    category: "dry",
    description: "",
    imitates: [],
    effectiveSpecies: [],
    waterTypes: [],
    sizes: ["16"],
    colors: [],
    beadOptions: [],
    hookStyles: [],
    galleryUrls: [],
    relatedFlyIds: [],
    relatedRiverIds: [],
    relatedDestinationIds: [],
    flyShopIds: [],
    featured: false,
    isHeroPattern: false,
    heroImageUrl: `/images/flies/${slug}.jpg`,
  };
}

const hatches: HatchEntry[] = [
  { insect: "Pale Morning Dun (Ephemerella)", size: "#16", pattern: "PMD Sparkle Dun", timeOfDay: "afternoon" },
  { insect: "Caddis", size: "#14", pattern: "Elk Hair Caddis", timeOfDay: "dusk" },
  { insect: "Mayfly nymph", size: "#14", pattern: "Hare's Ear" },
];

describe("weekFliesFromChart", () => {
  it("matches library names and keeps chart size/time", () => {
    const chips = weekFliesFromChart(hatches, [
      fly("PMD Sparkle Dun", "pmd-sparkle-dun"),
      fly("Elk Hair Caddis", "elk-hair-caddis"),
    ]);
    assert.equal(chips.length, 3);
    assert.equal(chips[0].name, "PMD Sparkle Dun");
    assert.equal(chips[0].href, "/flies/pmd-sparkle-dun");
    assert.equal(chips[0].size, "#16");
    assert.equal(chips[0].hint, "afternoon");
    assert.equal(chips[1].name, "Elk Hair Caddis");
    assert.equal(chips[2].name, "Mayfly nymph");
    assert.equal(chips[2].href, undefined);
  });

  it("does not invent a fly name when the library has no match", () => {
    const chips = weekFliesFromChart(
      [{ insect: "Salmonfly (Pteronarcys)", size: "#4", pattern: "Sofa Pillow" }],
      [fly("Adams", "adams")],
    );
    assert.equal(chips[0].name, "Salmonfly");
    assert.equal(chips[0].href, undefined);
  });
});

describe("hatchRailFromChart", () => {
  it("strips scientific names and uses timeOfDay when present", () => {
    const rows = hatchRailFromChart(hatches);
    assert.equal(rows[0].insect, "Pale Morning Dun");
    assert.equal(rows[0].detail, "afternoon");
    assert.equal(rows[2].detail, "#14");
  });
});
