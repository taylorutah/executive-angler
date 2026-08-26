import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { iconMark, isIconName } from "./names.ts";
import { opticalFor } from "./Icon.tsx";

describe("icon fallback mark", () => {
  it("renders a small-caps abbreviation, never a square", () => {
    assert.equal(iconMark("hackle"), "HAC");
    assert.equal(iconMark("social-x"), "SOC");
    assert.equal(iconMark(""), "EA");
  });

  it("rejects unknown names so Icon can fall back", () => {
    assert.equal(isIconName("rocket"), false);
    assert.equal(isIconName("sparkle"), false);
    assert.equal(isIconName("hackle"), true);
  });
});

describe("optical sizes", () => {
  it("picks 16 / 20 / 24 from class names rather than scaling one path", () => {
    assert.equal(opticalFor(undefined, "h-4 w-4"), 16);
    assert.equal(opticalFor(undefined, "h-5 w-5"), 20);
    assert.equal(opticalFor(undefined, "h-6 w-6"), 24);
    assert.equal(opticalFor(16), 16);
    assert.equal(opticalFor(20), 20);
    assert.equal(opticalFor(24), 24);
  });
});
