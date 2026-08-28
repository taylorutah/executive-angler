import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
const livePip = readFileSync(join(process.cwd(), "public/images/home/live.svg"), "utf8");

describe("v4.1 geometry tokens", () => {
  it("maps Cover Tokens 2:2 into @theme", () => {
    assert.match(css, /--paper:\s*#FAF6F0/i);
    assert.match(css, /--vellum:\s*#F2EDE4/i);
    assert.match(css, /--ink:\s*#2C211B/i);
    assert.match(css, /--graphite:\s*#4F4540/i);
    assert.match(css, /--slate:\s*#6D645F/i);
    assert.match(css, /--rule:\s*#E2DACD/i);
    assert.match(css, /--copper-700:\s*#B4410D/i);
    assert.match(css, /--teal-700:\s*#086B6C/i);
    assert.match(css, /--copper:\s*var\(--copper-700\)/);
    assert.match(css, /--teal:\s*var\(--teal-700\)/);
    assert.match(css, /--riverbed:\s*#0B1112/i);
    assert.match(css, /--chalk:\s*#EEF2F1/i);
    assert.match(css, /--color-paper:\s*var\(--paper\)/);
    assert.match(css, /--color-vellum:\s*var\(--vellum\)/);
    assert.match(css, /--color-ink:\s*var\(--ink\)/);
    assert.match(css, /--color-graphite:\s*var\(--graphite\)/);
    assert.match(css, /--color-slate:\s*var\(--slate\)/);
    assert.match(css, /--color-rule:\s*var\(--rule\)/);
    assert.match(css, /--color-copper:\s*var\(--copper\)/);
    assert.match(css, /--color-teal:\s*var\(--teal\)/);
    assert.match(css, /--color-riverbed:\s*var\(--riverbed\)/);
    assert.match(css, /--color-chalk:\s*var\(--chalk\)/);
    assert.match(livePip, /width="6"/);
    assert.match(livePip, /height="6"/);
    assert.match(livePip, /fill="#086B6C"/);
  });

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

  it("keeps the home fold dek cream Archivo on the plate", () => {
    const dek = css.match(/\.hero-dek,\s*\n\.prose\.hero-dek \{[\s\S]*?\n\}/);
    assert.ok(dek, "hero-dek rule missing");
    assert.match(dek[0], /font-family:\s*var\(--font-ui\)/);
    assert.match(dek[0], /color:\s*var\(--hero-type\)/);
    assert.match(css, /\.home-hero-fold \{\n  height: calc\(100dvh - 56px/);
    assert.match(css, /@media \(max-width:\s*639px\)[\s\S]*?\.home-hero-fold \{\n    height: 664px;/);
    assert.match(css, /@media \(max-width:\s*639px\)[\s\S]*?\.hero-overlay-home/);
    assert.match(css, /\[data-register="daylight"\] \.home-hero-fold h1/);
    assert.match(css, /\[data-register="daylight"\] \.hero-on-photo h1/);
    assert.match(css, /\.hero-cfs \{\n  color:\s*var\(--teal\);\n  background-color:\s*var\(--paper\);/);
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

  it("locks house copy to one 65ch Newsreader measure and ink Fraunces heads", () => {
    assert.match(
      css,
      /\.house-measure \{\n  max-width: 65ch;\n  font-family:\s*var\(--font-body\);/,
    );
    assert.match(css, /\.house-measure \.prose,\n\.house-measure \.desk-dek-ui \{\n  max-width: none;/);
    assert.match(css, /\.house-measure h1,[\s\S]*?color:\s*var\(--text-primary\)/);
    assert.match(css, /\.house-measure \.prose \{\n  font-family:\s*var\(--font-body\)/);
    assert.match(css, /\.desk-form \{[\s\S]*?--action:\s*var\(--copper-700\)/);
    assert.match(css, /\[data-register="daylight"\] main \{\n  flex: 0 0 auto;/);
  });

  it("squares Mapbox attribution to --radius-instrument", () => {
    assert.match(
      css,
      /\.mapboxgl-ctrl-attrib[\s\S]*?\.mapboxgl-ctrl-attrib-button\s*\{[\s\S]*?border-radius:\s*var\(--radius-instrument\)/,
    );
  });
});
