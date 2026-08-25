import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fallbackPlacePaths, placePathsFromHrefs } from "./place-paths";

describe("placePathsFromHrefs", () => {
  it("keeps place pages and drops the index and deep links", () => {
    assert.deepEqual(
      placePathsFromHrefs([
        "/destinations",
        "/destinations/montana",
        "/destinations/wyoming",
        "/destinations/montana/photos",
        "/rivers/madison-river",
        "",
      ]),
      ["/destinations/montana", "/destinations/wyoming"],
    );
  });

  it("dedupes, sorts, and strips queries, hashes and trailing slashes", () => {
    assert.deepEqual(
      placePathsFromHrefs([
        "/destinations/wyoming",
        "/destinations/montana/",
        "/destinations/montana?ref=nav",
        "/destinations/montana#rivers",
      ]),
      ["/destinations/montana", "/destinations/wyoming"],
    );
  });

  it("falls back to the hand-kept list", () => {
    assert.deepEqual(placePathsFromHrefs([]), []);
    assert.ok(fallbackPlacePaths().includes("/destinations/montana"));
  });
});
