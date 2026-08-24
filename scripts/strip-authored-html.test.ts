import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { stripAuthoredClasses, hasForbiddenUtilities } from "./strip-authored-html.ts";

describe("stripAuthoredClasses", () => {
  it("turns forest callouts into aside and drops classes", () => {
    const html = `<div class="bg-forest/5 border-l-4 border-forest p-5 my-6 rounded-r-lg">
  <p class="text-[#D8DEE4] text-sm">Direct contact.</p>
</div>`;
    const out = stripAuthoredClasses(html);
    assert.match(out, /<aside>/);
    assert.match(out, /<\/aside>/);
    assert.equal(out.includes("class="), false);
    assert.equal(out.includes("text-[#D8DEE4]"), false);
  });

  it("leaves semantic markup in place", () => {
    const html = `<h2>Gear</h2><p>A <strong>10-foot</strong> rod.</p>`;
    assert.equal(stripAuthoredClasses(html), html);
  });

  it("flags text-[var( and bg-[var( utilities", () => {
    assert.equal(hasForbiddenUtilities(`<p class="text-[var(--text-body)]">x</p>`), true);
    assert.equal(hasForbiddenUtilities(`<p>plain</p>`), false);
  });
});
