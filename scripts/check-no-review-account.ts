/**
 * Fail if the App Store review inbox or a hardcoded harness password
 * appears anywhere in the tree.
 *
 *   npm run check:no-review-account
 *
 * Needles are assembled at runtime so this file does not contain them.
 * Floor: 200 text files scanned. A pass that looked at nothing is #62.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MIN_FILES = 200;

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "coverage",
  "playwright-report",
  "test-results",
]);

const TEXT_RE =
  /\.(ts|tsx|js|jsx|mjs|cjs|md|yml|yaml|json|css|html|txt|svg|sql|toml|sh|env|example)$/i;

const REVIEW_EMAIL = ["test", "executiveangler.com"].join("@");
const YAML_PASSWORD = /EA_(QA|FIXTURE)_PASSWORD:\s*(?!\$\{\{\s*secrets\.)(\S)/;

function walk(dir: string, out: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(p, out);
    } else if (entry.isFile() && TEXT_RE.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

function main() {
  const files = walk(ROOT);
  console.log(`check-no-review-account: scanned ${files.length} files (floor ${MIN_FILES})`);
  if (files.length < MIN_FILES) {
    console.error(`scanned ${files.length} files — below floor of ${MIN_FILES}`);
    process.exit(1);
  }

  const hits: string[] = [];
  for (const file of files) {
    let text: string;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const rel = path.relative(ROOT, file);
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      if (line.includes(REVIEW_EMAIL)) {
        hits.push(`${rel}:${i + 1}  review-inbox literal`);
      }
      if (YAML_PASSWORD.test(line)) {
        hits.push(`${rel}:${i + 1}  hardcoded EA_*_PASSWORD`);
      }
    });
  }

  if (hits.length) {
    console.error(`\n${hits.length} hit(s):`);
    for (const h of hits) console.error("  " + h);
    process.exit(1);
  }

  console.log("check-no-review-account: 0 hits");
}

main();
