import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  commonsFilePageUrl,
  commonsFileTitle,
  parseCommonsExtmetadata,
  stripMarkup,
} from "./wikimedia-credit";

describe("commonsFileTitle", () => {
  it("decodes a hashed Commons path", () => {
    assert.equal(
      commonsFileTitle(
        "https://upload.wikimedia.org/wikipedia/commons/d/dd/Brook_trout_freshwater_fish.jpg",
      ),
      "Brook_trout_freshwater_fish.jpg",
    );
  });

  it("decodes a top-level commons file name", () => {
    assert.equal(
      commonsFileTitle(
        "https://upload.wikimedia.org/wikipedia/commons/Great_barracuda_%28Duane_Raver%29.png",
      ),
      "Great_barracuda_(Duane_Raver).png",
    );
  });

  it("builds the Commons file page URL", () => {
    assert.equal(
      commonsFilePageUrl(
        "https://upload.wikimedia.org/wikipedia/commons/d/dd/Brook_trout_freshwater_fish.jpg",
      ),
      "https://commons.wikimedia.org/wiki/File:Brook_trout_freshwater_fish.jpg",
    );
  });
});

describe("parseCommonsExtmetadata", () => {
  it("strips artist HTML and keeps the short licence", () => {
    assert.deepEqual(
      parseCommonsExtmetadata({
        LicenseShortName: { value: "CC BY-SA 4.0" },
        LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/4.0/" },
        Artist: { value: '<a href="https://commons.wikimedia.org/wiki/User:X">Duane Raver</a>' },
      }),
      {
        licence: "CC BY-SA 4.0",
        licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        artist: "Duane Raver",
      },
    );
  });

  it("returns empty fields when Commons has no licence", () => {
    assert.deepEqual(parseCommonsExtmetadata({}), {
      licence: "",
      licenceUrl: "",
      artist: "",
    });
  });
});

describe("stripMarkup", () => {
  it("collapses whitespace after tags", () => {
    assert.equal(stripMarkup("<b>U.S. Fish  &amp; Wildlife</b>"), "U.S. Fish & Wildlife");
  });

  it("dedupes Commons Unknown authorUnknown author", () => {
    assert.equal(stripMarkup("Unknown authorUnknown author"), "Unknown author");
  });
});
