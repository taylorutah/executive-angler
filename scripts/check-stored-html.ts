/**
 * Fail CI if seeded or stored HTML depends on Tailwind colour utilities
 * that the build never scans.
 *
 *   npm run check:stored-html
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "src/data");
const FORBIDDEN = /(?:text|bg)-\[var\(/g;

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|html|sql)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function main() {
  const hits: string[] = [];
  for (const file of walk(ROOT)) {
    const src = fs.readFileSync(file, "utf8");
    const rel = path.relative(process.cwd(), file);
    for (const m of src.matchAll(FORBIDDEN)) {
      const line = src.slice(0, m.index).split("\n").length;
      hits.push(`${rel}:${line}  ${m[0]}`);
    }
  }
  if (hits.length) {
    console.error("Seeded HTML must not use text-[var( or bg-[var( utilities:\n");
    for (const h of hits) console.error(`  ${h}`);
    process.exit(1);
  }
  console.log("stored-html gate OK — no text-[var( / bg-[var( in src/data");
}

main();
