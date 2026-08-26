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
});
