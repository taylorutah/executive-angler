/**
 * Mechanical hex → semantic-token rewrite.
 *
 * Commit A of Lane A: replace Tailwind arbitrary-hex utilities with
 * var(--token) utilities whose CSS values are identical to today's hexes.
 *
 *   npx tsx scripts/codemod-tokens.ts --dry
 *   npx tsx scripts/codemod-tokens.ts
 *
 * Scope: src ts/tsx files, excluding src/data.
 * Skips: email templates, Mapbox style objects, theme-color meta, chart
 * configs (hexes that are not class names). When in doubt, skip and report.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "src");
const DRY = process.argv.includes("--dry");

const PREFIXES = [
  "bg",
  "text",
  "border",
  "ring",
  "fill",
  "stroke",
  "from",
  "via",
  "to",
  "shadow",
  "outline",
  "decoration",
  "accent",
  "caret",
] as const;

/** Today's hardcoded hex → semantic token. Values stay identical in Commit A. */
const HEX_TO_TOKEN: Record<string, string> = {
  "#0D1117": "--surface-page",
  "#161B22": "--surface-raised",
  "#1F2937": "--surface-card",
  "#21262D": "--border-rule",
  "#30363D": "--border-strong",
  "#F0F6FC": "--text-primary",
  "#A8B2BD": "--text-body",
  "#6E7681": "--text-meta",
  "#E8923A": "--action",
  "#0BA5C7": "--signal-live",
  "#00B4D8": "--signal-live",
  "#2EA44F": "--state-positive",
  "#DA3633": "--state-negative",
};

const SKIP_PATH_RE =
  /(^|\/)src\/data(\/|$)|(^|\/)(email|emails)(\/|$)|mapbox|theme-color|chart-config/i;

const CLASS_RE = new RegExp(
  `((?:[\\w-]+:)*)(${PREFIXES.join("|")})-\\[#([0-9A-Fa-f]{3,8})\\](\\/\\d+)?`,
  "g",
);

function expandHex(raw: string): string {
  const h = raw.toUpperCase();
  if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
  if (h.length === 4) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  if (h.length === 8) return `#${h.slice(0, 6)}`;
  return `#${h}`;
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

type Leftover = { hex: string; file: string; snippet: string };

function rewriteFile(file: string): {
  changed: boolean;
  replacements: number;
  leftovers: Leftover[];
  prefixBreakdown: Record<string, Record<string, number>>;
} {
  const rel = path.relative(process.cwd(), file);
  if (SKIP_PATH_RE.test(rel)) {
    return { changed: false, replacements: 0, leftovers: [], prefixBreakdown: {} };
  }

  const src = fs.readFileSync(file, "utf8");
  const leftovers: Leftover[] = [];
  const prefixBreakdown: Record<string, Record<string, number>> = {};
  let replacements = 0;

  const next = src.replace(CLASS_RE, (full, variants: string, prefix: string, hex: string, opacity: string = "") => {
    const normalized = expandHex(hex);
    const token = HEX_TO_TOKEN[normalized];
    prefixBreakdown[normalized] ??= {};
    prefixBreakdown[normalized][prefix] = (prefixBreakdown[normalized][prefix] ?? 0) + 1;
    if (!token) {
      leftovers.push({ hex: normalized, file: rel, snippet: full });
      return full;
    }
    replacements += 1;
    return `${variants}${prefix}-[var(${token})]${opacity}`;
  });

  const changed = next !== src;
  if (changed && !DRY) fs.writeFileSync(file, next);
  return { changed, replacements, leftovers, prefixBreakdown };
}

function main() {
  const files = walk(ROOT);
  let total = 0;
  let filesChanged = 0;
  const leftovers: Leftover[] = [];
  const prefixBreakdown: Record<string, Record<string, number>> = {};

  for (const file of files) {
    const r = rewriteFile(file);
    total += r.replacements;
    if (r.changed) filesChanged += 1;
    leftovers.push(...r.leftovers);
    for (const [hex, byPrefix] of Object.entries(r.prefixBreakdown)) {
      prefixBreakdown[hex] ??= {};
      for (const [p, n] of Object.entries(byPrefix)) {
        prefixBreakdown[hex][p] = (prefixBreakdown[hex][p] ?? 0) + n;
      }
    }
  }

  const leftoverByHex = new Map<string, Map<string, number>>();
  for (const l of leftovers) {
    if (!leftoverByHex.has(l.hex)) leftoverByHex.set(l.hex, new Map());
    const m = leftoverByHex.get(l.hex)!;
    m.set(l.file, (m.get(l.file) ?? 0) + 1);
  }

  console.log(DRY ? "DRY RUN — no files written\n" : "Wrote files\n");
  console.log(`Replacements: ${total} across ${filesChanged} files`);
  console.log("\n#1F2937 prefix breakdown (ambiguous surface vs button fill):");
  const stone = prefixBreakdown["#1F2937"] ?? {};
  for (const [p, n] of Object.entries(stone).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${p.padEnd(12)} ${n}`);
  }

  console.log("\nLeftovers grouped by hex:");
  const sorted = [...leftoverByHex.entries()].sort((a, b) => {
    const na = [...a[1].values()].reduce((s, n) => s + n, 0);
    const nb = [...b[1].values()].reduce((s, n) => s + n, 0);
    return nb - na;
  });
  for (const [hex, filesMap] of sorted) {
    const n = [...filesMap.values()].reduce((s, c) => s + c, 0);
    console.log(`\n${hex}  (${n})`);
    for (const [f, c] of [...filesMap.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${c.toString().padStart(3)}  ${f}`);
    }
  }

  const baseline = {
    generatedAt: new Date().toISOString(),
    leftovers: Object.fromEntries(
      sorted.map(([hex, filesMap]) => [
        hex,
        [...filesMap.entries()].map(([file, count]) => ({ file, count })),
      ]),
    ),
  };
  const baselinePath = path.resolve(process.cwd(), "scripts/hex-baseline.json");
  if (!DRY) {
    fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + "\n");
    console.log(`\nWrote ${path.relative(process.cwd(), baselinePath)}`);
  }
}

main();
