import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  flyDisplayName,
  sizeChipValue,
  speciesHoverChips,
  toSpeciesBrowseItem,
  topFliesLine,
} from "./species-items";

describe("sizeChipValue", () => {
  it("uses the first stored clause and drops an empty string", () => {
    assert.equal(sizeChipValue("12-20 inches, 1-5 lbs"), "12-20 inches");
    assert.equal(sizeChipValue("  "), undefined);
  });
});

describe("topFliesLine", () => {
  it("takes three stored flies and strips hook sizes", () => {
    assert.equal(
      topFliesLine(["Parachute Adams #14-18", "Elk Hair Caddis #14-16", "Pheasant Tail Nymph #14-18", "RS2 #18"]),
      "Top flies: Parachute Adams, Elk Hair Caddis, Pheasant Tail Nymph",
    );
    assert.equal(topFliesLine([]), "");
  });
});

describe("flyDisplayName", () => {
  it("does not invent a name when there is no size token", () => {
    assert.equal(flyDisplayName("Woolly Bugger"), "Woolly Bugger");
  });
});

describe("speciesHoverChips", () => {
  it("ships family and size only when stored", () => {
    assert.deepEqual(
      speciesHoverChips({ family: "trout", averageSize: "12-20 inches, 1-5 lbs" }),
      [
        { label: "Family", value: "Trout" },
        { label: "Size", value: "12-20 inches" },
      ],
    );
    assert.deepEqual(speciesHoverChips({ family: undefined, averageSize: undefined }), []);
  });
});

describe("toSpeciesBrowseItem", () => {
  it("builds a reference hover panel from stored fields only", () => {
    const item = toSpeciesBrowseItem({
      id: "species-rainbow-trout",
      slug: "rainbow-trout",
      commonName: "Rainbow Trout",
      scientificName: "Oncorhynchus mykiss",
      family: "trout",
      description:
        "The rainbow trout is one of the most widely distributed game fish. Named for the pink lateral band. Native to Pacific tributaries. Extra sentence must not appear if we already have three.",
      preferredFlies: [
        "Parachute Adams #14-18",
        "Elk Hair Caddis #14-16",
        "Pheasant Tail Nymph #14-18",
      ],
      averageSize: "12-20 inches, 1-5 lbs",
      relatedDestinationIds: [],
      relatedRiverIds: [],
      featured: true,
    });
    assert.equal(item.imageContain, true);
    assert.equal(item.subtitle, "Oncorhynchus mykiss");
    assert.deepEqual(item.hoverPanel?.chips, [
      { label: "Family", value: "Trout" },
      { label: "Size", value: "12-20 inches" },
    ]);
    assert.match(item.hoverPanel?.brief ?? "", /widely distributed/);
    assert.equal((item.hoverPanel?.brief ?? "").includes("Extra sentence"), false);
    assert.equal(
      item.hoverPanel?.footer,
      "Top flies: Parachute Adams, Elk Hair Caddis, Pheasant Tail Nymph",
    );
  });
});
