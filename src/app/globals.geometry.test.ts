import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("v4.1 geometry tokens", () => {
  it("ships the corrected radius scale", () => {
    assert.match(css, /--radius-surface:\s*6px/);
    assert.match(css, /--radius-instrument:\s*4px/);
    assert.match(css, /--radius-chip:\s*9999px/);
    assert.equal(css.includes("--radius-control:"), false);
  });

  it("retires heavy elevation and glow", () => {
    assert.equal(css.includes("--elev-3:"), false);
    assert.equal(css.includes("--elev-4:"), false);
    assert.equal(css.includes("--elev-glow"), false);
  });

  it("reports paper RGB on transparent structural boxes", () => {
    assert.match(css, /rgba\(250,\s*246,\s*240,\s*0\)/);
  });

  it("retires staged entrance and photo zoom", () => {
    assert.equal(css.includes("--photo-zoom-scale"), false);
    assert.equal(css.includes("--photo-zoom-duration"), false);
    assert.equal(css.includes("--enter-duration"), false);
    assert.equal(css.includes("--enter-rise"), false);
    assert.equal(css.includes("--enter-stagger"), false);
    assert.equal(css.includes("scale(var(--photo-zoom-scale))"), false);
    assert.equal(css.includes("var(--enter-stagger)"), false);
  });

  it("keeps the home fold dek cream Archivo, off .prose and Newsreader", () => {
    const dek = css.match(/\.hero-dek,\s*\n\.prose\.hero-dek \{[\s\S]*?\n\}/);
    assert.ok(dek, "hero-dek rule missing");
    assert.match(dek[0], /font-family:\s*var\(--font-ui\)/);
    assert.match(dek[0], /color:\s*var\(--hero-type\)/);
    assert.equal(dek[0].includes("--font-body"), false);
    assert.match(css, /@media \(max-width:\s*639px\)[\s\S]*?\.hero-overlay-home/);
    assert.equal(css.includes("--hover-duration: 600ms"), true);
    assert.match(css, /\.photo-lift[\s\S]*?var\(--hover-duration\)/);
    assert.match(css, /\.hover-copper[\s\S]*?var\(--hover-duration\)/);
    assert.match(css, /\.card-hover[\s\S]*?var\(--hover-duration\)/);
  });

  it("ships one 12-col desk sheet and 7em spec labels", () => {
    assert.match(css, /\.desk-sheet \{/);
    assert.match(css, /padding-inline:\s*var\(--gutter\)/);
    assert.match(css, /grid-template-columns:\s*repeat\(12, minmax\(0, 1fr\)\)/);
    assert.match(css, /grid-template-columns:\s*7em minmax\(0, 1fr\)/);
    assert.match(css, /\.desk-sheet-photo \{[\s\S]*?grid-column:\s*1 \/ span 5/);
    assert.match(css, /\.desk-sheet-name \{[\s\S]*?grid-column:\s*6 \/ span 7/);
  });

  it("squares Mapbox attribution to --radius-instrument", () => {
    assert.match(
      css,
      /\.mapboxgl-ctrl-attrib[\s\S]*?\.mapboxgl-ctrl-attrib-button\s*\{[\s\S]*?border-radius:\s*var\(--radius-instrument\)/,
    );
  });
});
