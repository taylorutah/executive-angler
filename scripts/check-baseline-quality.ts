/**
 * Fail if a committed visual baseline is a magenta rectangle, a near-blank
 * paper field, or a byte-duplicate of another baseline.
 *
 *   npm run check:baseline-quality
 *
 * For every PNG under tests/**snapshots**:
 *   - no single RGB exceeds 60 % of pixels
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
const MIN_DISTINCT = 500;

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
      `  ${rel}  ${stats.pixels} px  ${stats.distinct} colours  dominant rgb(${stats.dominant}) ${pct}%`,
    );
    if (stats.dominantShare > MAX_DOMINANT_SHARE) {
      failures.push(
        `${rel}  dominant rgb(${stats.dominant}) is ${pct}% (max ${(MAX_DOMINANT_SHARE * 100).toFixed(0)}%)`,
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
