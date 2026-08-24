/**
 * Fail CI if new Tailwind arbitrary-hex utilities appear outside src/data.
 * Known leftovers from Commit A live in scripts/hex-baseline.json.
 *
 *   npm run check:hex
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "src");
const BASELINE_PATH = path.resolve(process.cwd(), "scripts/hex-baseline.json");
const PREFIXES =
  "bg|text|border|ring|fill|stroke|from|via|to|shadow|outline|decoration|accent|caret";
const CLASS_RE = new RegExp(
  `(?:[\\w-]+:)*(?:${PREFIXES})-\\[#([0-9A-Fa-f]{3,8})\\](?:\\/\\d+)?`,
  "g",
);

type Baseline = {
  leftovers: Record<string, Array<{ file: string; count: number }>>;
};

function expandHex(raw: string): string {
  const h = raw.toUpperCase();
  if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  return `#${h.slice(0, 6)}`;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "data" && path.basename(dir) === "src") continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

function main() {
  const baseline: Baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, "utf8"));
  const allowed = new Map<string, Map<string, number>>();
  for (const [hex, rows] of Object.entries(baseline.leftovers)) {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.file, r.count);
    allowed.set(hex, m);
  }

  const found = new Map<string, Map<string, number>>();
  for (const file of walk(ROOT)) {
    const rel = path.relative(process.cwd(), file);
    const src = fs.readFileSync(file, "utf8");
    for (const m of src.matchAll(CLASS_RE)) {
      const hex = expandHex(m[1]);
      if (!found.has(hex)) found.set(hex, new Map());
      const fm = found.get(hex)!;
      fm.set(rel, (fm.get(rel) ?? 0) + 1);
    }
  }

  const extras: string[] = [];
  for (const [hex, files] of found) {
    const allow = allowed.get(hex);
    for (const [file, count] of files) {
      const allowedCount = allow?.get(file) ?? 0;
      if (count > allowedCount) {
        extras.push(`${hex}  ${file}  found ${count}  allowed ${allowedCount}`);
      }
    }
  }

  if (extras.length) {
    console.error("New hardcoded hex utilities outside src/data:\n");
    for (const line of extras) console.error("  " + line);
    process.exit(1);
  }
  console.log("hex gate OK — no new arbitrary-hex utilities outside src/data");
}

main();
