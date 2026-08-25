/**
 * Render one DB-authored body per content type and flag computed text
 * colours that are not in the Daylight token set.
 *
 *   npm run check:authored-bodies
 *
 * Requires a running app at BASE_URL (default http://localhost:3000)
 * and Playwright Chromium.
 */

import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

/**
 * The place and river templates moved their authored bodies to `.prose` and
 * stopped rendering `.destination-body` / `.river-body`, so those two rows
 * reported "missing" on every run instead of checking any colour. The article
 * body still carries `.article-body` alongside `.prose` for the element rules
 * its stored HTML depends on, so that selector stays.
 */
const BODIES = [
  { route: "/destinations/montana", selector: ".prose" },
  { route: "/articles/introduction-to-euro-nymphing", selector: ".article-body" },
  { route: "/rivers/madison-river", selector: ".prose" },
] as const;

/** Resolved Daylight text tokens (rgb). */
const LEGAL: Array<[number, number, number]> = [
  [20, 24, 20], // ink / text-primary
  [62, 70, 73], // graphite / text-body
  [94, 102, 105], // slate / text-meta
  [158, 86, 21], // copper-700 / action
  [138, 74, 18], // action-hover
  [12, 114, 134], // teal-700 / signal-live
  [31, 122, 61], // rise-700
  [179, 38, 30], // cut-700
  [255, 255, 255], // on-action
];

function near(a: [number, number, number], b: [number, number, number], tol = 4): boolean {
  return Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol;
}

function parseRgb(raw: string): [number, number, number] | null {
  const m = raw.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (!m) return null;
  return [Math.round(Number(m[1])), Math.round(Number(m[2])), Math.round(Number(m[3]))];
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const bad: string[] = [];

  try {
    for (const body of BODIES) {
      const res = await page.goto(`${BASE}${body.route}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
      if (!res || !res.ok()) {
        bad.push(`${body.route}  HTTP ${res?.status() ?? "no response"}`);
        continue;
      }
      await page.waitForTimeout(300);
      const samples = await page.evaluate((sel) => {
        const root = document.querySelector(sel);
        if (!root) return { missing: true, rows: [] as Array<{ text: string; color: string }> };
        const rows: Array<{ text: string; color: string }> = [];
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
          const text = (node.textContent || "").replace(/\s+/g, " ").trim();
          const el = node.parentElement;
          if (text && el) {
            rows.push({ text: text.slice(0, 80), color: getComputedStyle(el).color });
          }
          node = walker.nextNode();
        }
        return { missing: false, rows };
      }, body.selector);

      if (samples.missing) {
        bad.push(`${body.route}  missing ${body.selector}`);
        continue;
      }
      for (const row of samples.rows) {
        const rgb = parseRgb(row.color);
        if (!rgb) {
          bad.push(`${body.route}  unparseable ${row.color}  "${row.text}"`);
          continue;
        }
        if (!LEGAL.some((tok) => near(rgb, tok))) {
          bad.push(`${body.route}  rgb(${rgb.join(",")})  "${row.text}"`);
        }
      }
    }
  } finally {
    await browser.close();
  }

  if (bad.length) {
    console.error(`authored-body audit: ${bad.length} off-token colours\n`);
    for (const line of bad.slice(0, 40)) console.error(`  ${line}`);
    if (bad.length > 40) console.error(`  … ${bad.length - 40} more`);
    process.exit(1);
  }
  console.log("authored-body audit OK — destination, article, and river bodies use token colours");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
