import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("gazette geometry tokens", () => {
  it("ships a 0–4px radius scale", () => {
    assert.match(css, /--radius-surface:\s*0/);
    assert.match(css, /--radius-instrument:\s*0/);
    assert.match(css, /--radius-chip:\s*4px/);
    assert.equal(css.includes("--radius-control:"), false);
  });

  it("retires heavy elevation and glow", () => {
    assert.equal(css.includes("--elev-3:"), false);
    assert.equal(css.includes("--elev-4:"), false);
    assert.equal(css.includes("--elev-glow"), false);
  });

  it("reports paper RGB on transparent structural boxes", () => {
    assert.match(css, /rgba\(244,\s*239,\s*230,\s*0\)/);
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

  it("squares Mapbox attribution to --radius-instrument", () => {
    assert.match(
      css,
      /\.mapboxgl-ctrl-attrib[\s\S]*?\.mapboxgl-ctrl-attrib-button\s*\{[\s\S]*?border-radius:\s*var\(--radius-instrument\)/,
    );
  });
});
