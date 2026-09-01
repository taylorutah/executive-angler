import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const svg = readFileSync(join(root, "public/brand/heron-mark.svg"), "utf8");
const component = readFileSync(join(root, "src/components/brand/HeronMark.tsx"), "utf8");

describe("heron etching mark", () => {
  it("ships a currentColor path etching, not the 12-stroke stick figure", () => {
    assert.match(svg, /fill="currentColor"/);
    assert.match(svg, /<path d="/);
    assert.ok(svg.length > 50_000, "etching must be a real path set, not a sketch");
    assert.equal(svg.includes("M8 52 L42 48"), false);
    assert.equal(svg.includes("circle-badge"), false);
    assert.match(svg, /viewBox="0 0 /);
  });

  it("keeps a print vector beside the SVG", () => {
    assert.equal(existsSync(join(root, "public/brand/heron-mark.pdf")), true);
  });

  it("tints the SVG through currentColor so the lockup can scale to the stills", () => {
    assert.match(component, /url\(\/brand\/heron-mark\.svg\)/);
    assert.match(component, /currentColor/);
    assert.match(component, /viewBox="0 0 1584 2882"/);
  });
});
