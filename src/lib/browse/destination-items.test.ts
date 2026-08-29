import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  destinationFooterGeo,
  destinationSpeciesChips,
  toDestinationBrowseItem,
} from "./destination-items";

describe("destinationSpeciesChips", () => {
  it("splits stored names into label/value and caps at three", () => {
    assert.deepEqual(
      destinationSpeciesChips(["Rainbow Trout", "Brown Trout", "Cutthroat Trout", "Brook Trout"]),
      [
        { label: "Trout", value: "Rainbow" },
        { label: "Trout", value: "Brown" },
        { label: "Trout", value: "Cutthroat" },
      ],
    );
  });

  it("keeps a single-word name as the value", () => {
    assert.deepEqual(destinationSpeciesChips(["Bonefish"]), [
      { label: "Species", value: "Bonefish" },
    ]);
  });
});

describe("destinationFooterGeo", () => {
  it("omits state and country already named on the card face", () => {
    assert.equal(
      destinationFooterGeo({
        name: "Montana",
        region: "Northern Rockies",
        country: "United States",
        state: "Montana",
      }),
      "",
    );
    assert.equal(
      destinationFooterGeo({
        name: "Florida Keys",
        region: "Southeast",
        country: "United States",
        state: "Florida",
      }),
      "",
    );
  });

  it("keeps a country the title does not already name", () => {
    assert.equal(
      destinationFooterGeo({
        name: "Tasmania",
        region: "Oceania",
        country: "Australia",
      }),
      "Australia",
    );
  });
});

describe("toDestinationBrowseItem", () => {
  it("builds a hover panel from stored fields only", () => {
    const item = toDestinationBrowseItem({
      id: "dest-montana",
      slug: "montana",
      name: "Montana",
      region: "Northern Rockies",
      country: "United States",
      state: "Montana",
      tagline: "The Last Best Place for Fly Fishing",
      description: "A place.",
      primarySpecies: ["Rainbow Trout", "Brown Trout", "Cutthroat Trout"],
      bestMonths: ["May", "June", "July", "August", "September", "October"],
      latitude: 46,
      longitude: -110,
      featured: true,
    });
    assert.equal(item.subtitle, "The Last Best Place for Fly Fishing");
    assert.deepEqual(item.hoverPanel?.chips, [
      { label: "Trout", value: "Rainbow" },
      { label: "Trout", value: "Brown" },
      { label: "Trout", value: "Cutthroat" },
    ]);
    assert.equal(item.hoverPanel?.brief, "The Last Best Place for Fly Fishing");
    assert.equal(item.hoverPanel?.footer, "Best: May–Oct");
    assert.equal(item.badges?.[0], "Northern Rockies");
  });

  it("prepends extra geo to the best-months footer", () => {
    const item = toDestinationBrowseItem({
      id: "dest-tasmania",
      slug: "tasmania",
      name: "Tasmania",
      region: "Oceania",
      country: "Australia",
      tagline: "Wild brown trout",
      description: "An island.",
      primarySpecies: ["Brown Trout", "Rainbow Trout"],
      bestMonths: ["November", "December", "January", "February"],
      latitude: -42,
      longitude: 147,
      featured: false,
    });
    assert.equal(item.hoverPanel?.footer, "Australia · Best: Jan–Feb, Nov–Dec");
  });
});
