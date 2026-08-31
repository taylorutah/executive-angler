/**
 * Fail if a committed visual baseline is a magenta rectangle, a near-blank
 * capture, or a byte-duplicate of another baseline.
 *
 *   npm run check:baseline-quality
 *
 * For every PNG under tests/**snapshots**:
 *   - Playwright mask fill #FF00FF must stay under 2 %
 *   - a single RGB over 60 % fails unless it is a declared page fill
 *     (paper / vellum / riverbed / pool). #32's home was 94 % magenta.
 *     Paper-first index pages and dusk /today honestly exceed 60 % paper
 *     or riverbed — that is the brand, not a blank capture. See
 *     docs/decisions/p4-lane0-harness.md.
 *   - distinct RGB colours ≥ 500
 *   - no two files share an md5
 *
 * Floor: 20 baselines. A pass that looked at nothing is #32.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const MIN_BASELINES = 20;
const MAX_DOMINANT_SHARE = 0.6;
const MAX_MASK_SHARE = 0.02;
const MIN_DISTINCT = 500;

/** Declared page fills from globals.css. Anti-aliasing may land 1 off. */
const PAGE_FILLS = new Set([
<<<<<<< HEAD
  "250,249,245", // --paper #FAF9F5
  "242,239,232", // --paper-deep / --vellum #F2EFE8
  "250,246,240", // retired paper (kept so old dusk-era baselines still classify)
  "242,237,228", // retired vellum
  "11,17,18", // --riverbed (retired dusk)
  "19,27,29", // --pool (retired dusk)
=======
  "250,246,240", // --paper (legacy painted fill)
  "250,249,245", // --paper #FAF9F5
  "242,237,228", // --vellum
  "11,17,18", // --riverbed
  "19,27,29", // --pool
>>>>>>> 04cbc3d7 (Fix hover-panel contrast and refresh /rivers baselines.)
]);
const MASK_FILL = "255,0,255";

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && entry.name.endsWith(".png")) out.push(p);
  }
  return out;
}

async function analyze(file: string): Promise<{
  pixels: number;
  distinct: number;
  dominantShare: number;
  dominant: string;
  maskShare: number;
}> {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const counts = new Map<string, number>();
  const channels = info.channels;
  const pixels = info.width * info.height;
  for (let i = 0; i < data.length; i += channels) {
    const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let dominant = "";
  let dominantCount = 0;
  for (const [key, n] of counts) {
    if (n > dominantCount) {
      dominant = key;
      dominantCount = n;
    }
  }
  return {
    pixels,
    distinct: counts.size,
    dominantShare: pixels === 0 ? 1 : dominantCount / pixels,
    dominant,
    maskShare: pixels === 0 ? 0 : (counts.get(MASK_FILL) ?? 0) / pixels,
  };
}

async function main() {
  const files = walk(path.join(ROOT, "tests")).sort();
  console.log(`check-baseline-quality: ${files.length} PNG(s) (floor ${MIN_BASELINES})`);
  if (files.length < MIN_BASELINES) {
    console.error(`checked ${files.length} baselines — below floor of ${MIN_BASELINES}`);
    process.exit(1);
  }

  const md5s = new Map<string, string>();
  const failures: string[] = [];

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const buf = fs.readFileSync(file);
    const hash = createHash("md5").update(buf).digest("hex");
    const prev = md5s.get(hash);
    if (prev) {
      failures.push(`${rel}  md5 ${hash} duplicates ${path.relative(ROOT, prev)}`);
    } else {
      md5s.set(hash, file);
    }

    const stats = await analyze(file);
    const pct = (stats.dominantShare * 100).toFixed(1);
    console.log(
      `  ${rel}  ${stats.pixels} px  ${stats.distinct} colours  dominant rgb(${stats.dominant}) ${pct}%  mask ${(stats.maskShare * 100).toFixed(2)}%`,
    );
    if (stats.maskShare > MAX_MASK_SHARE) {
      failures.push(
        `${rel}  Playwright mask #FF00FF is ${(stats.maskShare * 100).toFixed(1)}% (max ${(MAX_MASK_SHARE * 100).toFixed(0)}%)`,
      );
    }
    if (stats.dominantShare > MAX_DOMINANT_SHARE && !PAGE_FILLS.has(stats.dominant)) {
      failures.push(
        `${rel}  dominant rgb(${stats.dominant}) is ${pct}% (max ${(MAX_DOMINANT_SHARE * 100).toFixed(0)}% unless paper/vellum/riverbed/pool)`,
      );
    }
    if (stats.distinct < MIN_DISTINCT) {
      failures.push(`${rel}  ${stats.distinct} distinct colours (min ${MIN_DISTINCT})`);
    }
  }

  if (failures.length) {
    console.error(`\n${failures.length} baseline quality failure(s):`);
    for (const f of failures) console.error("  " + f);
    process.exit(1);
  }

  console.log(`check-baseline-quality: ${files.length} baselines OK`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
