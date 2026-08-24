import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mayPublish, publishStatus } from "./licence";

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
