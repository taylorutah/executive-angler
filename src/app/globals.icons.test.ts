import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { ICON_NAMES } from "../icons/names.ts";
import { GLYPHS } from "../icons/glyphs.tsx";

const root = process.cwd();

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

describe("v4.1 icon set gate", () => {
  it("does not depend on lucide-react", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    assert.equal(pkg.dependencies?.["lucide-react"], undefined);
    assert.equal(pkg.devDependencies?.["lucide-react"], undefined);
  });

  it("does not import lucide-react from source", () => {
    const hits = walk(join(root, "src"))
      .filter((p) => p.endsWith(".ts") || p.endsWith(".tsx") || p.endsWith(".js") || p.endsWith(".jsx"))
      .filter((p) => !p.endsWith(".test.ts") && !p.endsWith(".test.tsx"))
      .filter((p) => /from\s+['"]lucide-react['"]/.test(readFileSync(p, "utf8")));
    assert.deepEqual(hits, []);
  });

  it("does not emit a lucide class on any svg", () => {
    const files = walk(join(root, "src")).filter(
      (p) => p.endsWith(".ts") || p.endsWith(".tsx") || p.endsWith(".js") || p.endsWith(".jsx"),
    );
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (/class(Name)?\s*=\s*{?["'`][^"'`]*lucide/.test(text)) hits.push(file);
      if (/["'`][^"'`]*\blucide\b[^"'`]*["'`]/.test(text) && file.includes(".svg")) hits.push(file);
    }
    assert.deepEqual(hits, []);
  });

  it("draws every named icon at all three optical sizes", () => {
    for (const name of ICON_NAMES) {
      assert.equal(typeof GLYPHS[name], "function", name);
      for (const size of [16, 20, 24] as const) {
        const node = GLYPHS[name](size, false);
        assert.notEqual(node, undefined, `${name}@${size}`);
      }
    }
  });
});
