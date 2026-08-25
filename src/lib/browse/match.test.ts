import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { itemMatchesFilters, parseRange, parseSizes, valueMatches } from "./match";
import { speciesTokens } from "./species-tokens";
import { seasonsFromBestMonths, tripLengthFromPlace } from "./place-filters";
import { hatchTokens, flyHasSizeInRange } from "./fly-filters";
import { classifyFlowState, iqr, median, medianBand, quantile } from "./flow-state";
import type { FilterDimension } from "@/types/list-config";

const dims = (match: FilterDimension["match"], key = "x"): FilterDimension[] => [
  { key, label: key, options: [], match },
];

describe("browse match", () => {
  it("exact match is the historical behavior", () => {
    assert.equal(valueMatches("exact", "freestone", "freestone"), true);
    assert.equal(valueMatches("exact", "freestone", "tailwater"), false);
    assert.equal(valueMatches("exact", undefined, "freestone"), false);
  });

  it("contains matches a comma list (species, hatch, season)", () => {
    assert.equal(valueMatches("contains", "rainbow,brown,cutthroat", "brown"), true);
    assert.equal(valueMatches("contains", "rainbow,brown", "salmon"), false);
    assert.equal(
      itemMatchesFilters(
        { species: "trout,salmon" },
        { species: "trout" },
        dims("contains", "species"),
      ),
      true,
    );
  });

  it("range matches any stored hook size in the band", () => {
    assert.deepEqual(parseRange("14-16"), { min: 14, max: 16 });
    assert.deepEqual(parseSizes("#18, 16-14"), [18, 14, 15, 16]);
    assert.equal(valueMatches("range", "12,14,16,18", "14-16"), true);
    assert.equal(valueMatches("range", "18,20,22", "4-8"), false);
    assert.equal(flyHasSizeInRange(["16", "#18", "20"], "18-22"), true);
  });

  it("flag requires a true value when the filter is on", () => {
    assert.equal(valueMatches("flag", "1", "1"), true);
    assert.equal(valueMatches("flag", "0", "1"), false);
    assert.equal(
      itemMatchesFilters({ canTie: "0" }, { canTie: "1" }, dims("flag", "canTie")),
      false,
    );
  });

  it("empty active filters pass everything", () => {
    assert.equal(itemMatchesFilters({ a: "x" }, {}, []), true);
    assert.equal(itemMatchesFilters(undefined, {}, []), true);
  });
});

describe("species tokens", () => {
  it("buckets labels we already store and does not invent families", () => {
    const tokens = speciesTokens(["Rainbow Trout", "Atlantic Salmon", "Bonefish"]);
    assert.ok(tokens.includes("trout"));
    assert.ok(tokens.includes("salmon"));
    assert.ok(tokens.includes("saltwater"));
    assert.equal(tokens.includes("steelhead"), false);
  });
});

describe("place filters", () => {
  it("seasons come only from bestMonths", () => {
    assert.deepEqual(seasonsFromBestMonths(["June", "September", "October"]), [
      "summer",
      "fall",
    ]);
    assert.deepEqual(seasonsFromBestMonths([]), []);
  });

  it("trip length is a travel bucket from country/state", () => {
    assert.equal(
      tripLengthFromPlace({ country: "United States", state: "Montana" }),
      "weekend",
    );
    assert.equal(
      tripLengthFromPlace({ country: "United States", state: "Alaska" }),
      "week",
    );
    assert.equal(tripLengthFromPlace({ country: "New Zealand" }), "longer");
  });
});

describe("fly hatch tokens", () => {
  it("maps stored imitates and hatch insects, not invented names", () => {
    const tokens = hatchTokens({
      imitates: ["Mayfly", "Caddis"],
      hatchAssociations: [{ insect: "Pale Morning Dun" }, { insect: "Hopper" }],
    });
    assert.ok(tokens.includes("mayfly"));
    assert.ok(tokens.includes("caddis"));
    assert.ok(tokens.includes("terrestrial"));
    assert.equal(tokens.includes("stonefly"), false);
  });
});

describe("flow state", () => {
  it("classifies against a site's own recent median", () => {
    assert.equal(classifyFlowState(200, 400), "low");
    assert.equal(classifyFlowState(400, 400), "normal");
    assert.equal(classifyFlowState(700, 400), "high");
    assert.equal(classifyFlowState(1000, 400), "blown");
    assert.equal(classifyFlowState(400, 0), null);
    assert.equal(median([10, 20, 30]), 20);
    assert.equal(quantile([10, 20, 30, 40], 0.25), 17.5);
    assert.equal(quantile([10, 20, 30, 40], 0.75), 32.5);
    assert.equal(iqr([10, 20, 30, 40]), 15);
    assert.deepEqual(medianBand([10, 20, 30, 40]), {
      median: 25,
      low: 10,
      high: 40,
    });
  });
});
