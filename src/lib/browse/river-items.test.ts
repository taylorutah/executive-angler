import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shortInsect, toRiverBrowseItem } from "./river-items";

describe("shortInsect", () => {
  it("keeps the chart name and drops the scientific parenthetical", () => {
    assert.equal(shortInsect("Pale Morning Dun (Ephemerella)"), "Pale Morning Dun");
    assert.equal(shortInsect("PMD"), "PMD");
  });
});

describe("toRiverBrowseItem", () => {
  it("puts state on the kicker and this month's hatch on the meta line", () => {
    const item = toRiverBrowseItem(
      {
        id: "river-madison",
        slug: "madison-river",
        name: "Madison River",
        destinationId: "dest-montana",
        description: "A river.",
        heroImageUrl: "/images/rivers/madison-river-hero.jpg",
        primarySpecies: ["Brown Trout"],
        flowType: "freestone",
        difficulty: "intermediate",
        wadingType: "both",
        latitude: 45,
        longitude: -111,
        featured: true,
        hatchChart: [
          {
            month: "August",
            hatches: [
              {
                insect: "Pale Morning Dun (Ephemerella)",
                size: "#16",
                pattern: "Sparkle Dun",
              },
            ],
          },
        ],
      },
      "August",
    );
    assert.equal(item.kicker, "Montana");
    assert.equal(item.group, "Montana");
    assert.equal(item.meta, "Pale Morning Dun");
    assert.equal(item.href, "/rivers/madison-river");
  });

  it("falls back to flow type when the chart has no insect this month", () => {
    const item = toRiverBrowseItem(
      {
        id: "river-x",
        slug: "x-river",
        name: "X River",
        destinationId: "dest-utah",
        description: "",
        heroImageUrl: "/images/rivers/x.jpg",
        primarySpecies: [],
        flowType: "tailwater",
        difficulty: "beginner",
        wadingType: "wade",
        latitude: 0,
        longitude: 0,
        featured: false,
        hatchChart: [],
      },
      "August",
    );
    assert.equal(item.kicker, "Utah");
    assert.equal(item.meta, "tailwater");
  });
});
