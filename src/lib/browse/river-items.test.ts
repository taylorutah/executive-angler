import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  accessLabel,
  excerptRiverBrief,
  formatBestMonthsLine,
  shortInsect,
  toRiverBrowseItem,
} from "./river-items";

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

  it("builds a reference hover panel from stored fields only", () => {
    const item = toRiverBrowseItem(
      {
        id: "river-madison",
        slug: "madison-river",
        name: "Madison River",
        destinationId: "dest-montana",
        description:
          "The Madison is the crown jewel of Montana fly fishing. Born at the Firehole and Gibbon, it fishes as a continuous riffle. The salmonfly hatch in late May is the spectacle.",
        heroImageUrl: "/images/rivers/madison-river-hero.jpg",
        primarySpecies: ["Brown Trout"],
        flowType: "freestone",
        difficulty: "intermediate",
        wadingType: "both",
        bestMonths: ["June", "July", "August", "September", "October"],
        latitude: 45,
        longitude: -111,
        featured: true,
        hatchChart: [],
      },
      "August",
    );
    assert.deepEqual(item.hoverPanel?.chips, [
      { label: "Water", value: "Freestone" },
      { label: "Access", value: "Mixed" },
      { label: "Difficulty", value: "Intermediate" },
    ]);
    assert.equal(item.hoverPanel?.footer, "Best: Jun–Oct");
    assert.match(item.hoverPanel?.brief ?? "", /crown jewel/);
    assert.equal((item.hoverPanel?.brief ?? "").includes("salmonfly"), true);
  });
});

describe("accessLabel", () => {
  it("maps wade / float / both and drops unknown values", () => {
    assert.equal(accessLabel("wade"), "Wade");
    assert.equal(accessLabel("float"), "Boat");
    assert.equal(accessLabel("both"), "Mixed");
    assert.equal(accessLabel("walk"), undefined);
  });
});

describe("formatBestMonthsLine", () => {
  it("collapses consecutive months into ranges", () => {
    assert.equal(
      formatBestMonthsLine(["April", "May", "June", "September", "October"]),
      "Apr–Jun, Sep–Oct",
    );
    assert.equal(formatBestMonthsLine(["June", "July", "August"]), "Jun–Aug");
    assert.equal(formatBestMonthsLine(["October"]), "Oct");
    assert.equal(formatBestMonthsLine([]), "");
  });
});

describe("excerptRiverBrief", () => {
  it("keeps two or three sentences and does not invent text", () => {
    const brief = excerptRiverBrief(
      "First sentence here is long enough. Second sentence follows. Third is the last one we want. Fourth must not appear.",
    );
    assert.match(brief, /First sentence/);
    assert.match(brief, /Second sentence/);
    assert.equal(brief.includes("Fourth"), false);
  });
});
