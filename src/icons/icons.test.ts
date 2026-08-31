import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { iconMark, isIconName } from "./names.ts";
import { isFilled, opticalFor } from "./Icon.tsx";

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

describe("rating star", () => {
  it("draws a five-pointed star, not a four-point sparkle", () => {
    const src = readFileSync(new URL("./glyphs.tsx", import.meta.url), "utf8");
    const block = src.slice(src.indexOf("const star:"), src.indexOf("const bell:"));
    assert.match(block, /i < 10/);
    assert.match(block, /Math\.PI \/ 5/);
    assert.equal(block.includes("i < 8"), false);
    assert.equal(block.includes("Math.PI / 4"), false);
  });
});

describe("filled marks", () => {
  it("treats fill-[token] as a filled rank star, not only fill-current", () => {
    assert.equal(isFilled(true, undefined, undefined), true);
    assert.equal(isFilled(undefined, undefined, "h-4 w-4 fill-[var(--accent)]"), true);
    assert.equal(isFilled(undefined, undefined, "h-4 w-4 fill-current"), true);
    assert.equal(isFilled(undefined, undefined, "h-4 w-4 fill-none"), false);
    assert.equal(isFilled(undefined, undefined, "h-4 w-4 text-[var(--accent)]"), false);
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
