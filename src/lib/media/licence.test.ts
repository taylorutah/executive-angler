import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  attributionHref,
  attributionRequired,
  classifyLicence,
  formatAttribution,
  mayPublish,
  publishStatus,
} from "./licence";

describe("mayPublish", () => {
  it("refuses a row without a licence", () => {
    assert.equal(
      mayPublish({ licence: null, storagePath: "media/x.jpg", status: "pending" }),
      false,
    );
    assert.equal(publishStatus({ licence: null, storagePath: "media/x.jpg" }), "flagged");
  });

  it("refuses a licensed row that is not yet in storage", () => {
    assert.equal(mayPublish({ licence: "Unsplash", storagePath: null }), false);
    assert.equal(publishStatus({ licence: "Unsplash License", storagePath: "" }), "pending");
  });

  it("allows a hosted, licensed row", () => {
    assert.equal(
      mayPublish({
        licence: "CC BY-SA 4.0",
        storagePath: "media/species/brook-trout.jpg",
      }),
      true,
    );
  });
});

describe("classifyLicence", () => {
  it("treats share-alike as cc-by-sa, not plain BY", () => {
    assert.equal(classifyLicence("CC BY-SA 4.0"), "cc-by-sa");
    assert.equal(classifyLicence("Creative Commons Attribution-Share Alike 3.0"), "cc-by-sa");
  });

  it("classifies BY, Unsplash, and public domain", () => {
    assert.equal(classifyLicence("CC BY 4.0"), "cc-by");
    assert.equal(classifyLicence("Unsplash License"), "unsplash");
    assert.equal(classifyLicence("Public domain"), "pd");
    assert.equal(classifyLicence("CC0"), "pd");
  });

  it("leaves NC / ND / empty as unknown", () => {
    assert.equal(classifyLicence("CC BY-NC 4.0"), "unknown");
    assert.equal(classifyLicence("CC BY-ND 2.0"), "unknown");
    assert.equal(classifyLicence(""), "unknown");
    assert.equal(classifyLicence(null), "unknown");
  });
});

describe("formatAttribution", () => {
  it("puts the licence name on CC rows", () => {
    assert.equal(
      formatAttribution({ creditName: "Duane Raver", licence: "CC BY-SA 4.0" }),
      "Duane Raver · CC BY-SA 4.0",
    );
    assert.equal(
      formatAttribution({ creditName: "Jane Doe", licence: "Unsplash License" }),
      "Jane Doe / Unsplash",
    );
    assert.equal(
      formatAttribution({ creditName: "U.S. FWS", licence: "Public domain" }),
      "U.S. FWS (public domain)",
    );
  });

  it("does not invent a licence for an unknown string", () => {
    assert.equal(formatAttribution({ creditName: "Unknown artist", licence: "" }), "Unknown artist");
  });
});

describe("attributionHref", () => {
  it("links the licence text on CC rows", () => {
    assert.equal(
      attributionHref({
        creditUrl: "https://commons.wikimedia.org/wiki/User:X",
        licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        licence: "CC BY-SA 4.0",
      }),
      "https://creativecommons.org/licenses/by-sa/4.0/",
    );
  });

  it("links the photographer on Unsplash", () => {
    assert.equal(
      attributionHref({
        creditUrl: "https://unsplash.com/@jane",
        licenceUrl: "https://unsplash.com/license",
        licence: "Unsplash License",
      }),
      "https://unsplash.com/@jane",
    );
  });
});

describe("attributionRequired", () => {
  it("requires credit for BY, BY-SA, and Unsplash", () => {
    assert.equal(attributionRequired("cc-by"), true);
    assert.equal(attributionRequired("cc-by-sa"), true);
    assert.equal(attributionRequired("unsplash"), true);
    assert.equal(attributionRequired("pd"), false);
    assert.equal(attributionRequired("unknown"), false);
  });
});
