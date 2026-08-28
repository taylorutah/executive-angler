import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeImageUrl } from "./image-url";

describe("normalizeImageUrl", () => {
  it("remaps the retired Madison still onto the home file", () => {
    assert.equal(
      normalizeImageUrl("/images/madison-river-three-dollar-bridge.jpg"),
      "/images/home/madison-three-dollar-bridge.jpg",
    );
  });

  it("leaves a blank string missing", () => {
    assert.equal(normalizeImageUrl("  "), undefined);
  });
});
