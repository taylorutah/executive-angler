/**
 * Photograph uniqueness across the homepage and the place pages.
 *
 *   BASE_URL=http://localhost:3000 npx tsx scripts/check-page-images.ts
 *
 * Collects every <img> on each page, canonicalizes next/image URLs, and
 * asserts uniqueness. The light/dark logo pair is the only blanket repeat;
 * anything else must be listed in ALLOWED_REPEATS to pass.
 *
 * Place slugs are read off /destinations so the list maintains itself. Set
 * PLACES to a comma-separated list of slugs to narrow the run, or PLACE_LIMIT
 * to cap it (default 8; `all` runs every place).
 */
import { chromium, type Browser } from "playwright";
import { reportDuplicateImages } from "../src/components/home/homepage-images";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

/**
 * Documented duplicates, keyed by pathname. A river that genuinely appears in
 * two roles on one page belongs here with a comment saying which two roles.
 * An empty entry is the goal — the place template claims hero and river-grid
 * photographs before the essay picks figures, so nothing should repeat.
 */
const ALLOWED_REPEATS: Record<string, readonly string[]> = {};

async function collectImageSrcs(browser: Browser, path: string): Promise<string[]> {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60_000 });
    return await page
      .locator("img")
      .evaluateAll((imgs) =>
        imgs.map((img) => (img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src),
      );
  } finally {
    await page.close();
  }
}

async function placePaths(browser: Browser): Promise<string[]> {
  const explicit = process.env.PLACES?.trim();
  if (explicit && explicit !== "all") {
    return explicit
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((slug) => `/destinations/${slug}`);
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(BASE + "/destinations", { waitUntil: "networkidle", timeout: 60_000 });
    const hrefs = await page
      .locator('a[href^="/destinations/"]')
      .evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? ""));
    const paths = [...new Set(hrefs)].filter((h) => /^\/destinations\/[^/?#]+$/.test(h)).sort();
    const limit = process.env.PLACE_LIMIT ?? "8";
    return limit === "all" ? paths : paths.slice(0, Number(limit) || 8);
  } finally {
    await page.close();
  }
}

async function checkPath(browser: Browser, path: string): Promise<boolean> {
  const rawSrcs = await collectImageSrcs(browser, path);
  const report = reportDuplicateImages(rawSrcs, ALLOWED_REPEATS[path] ?? []);

  if (report.ok) {
    console.log(`  OK   ${path}  (${rawSrcs.length} img, ${report.contentSources.length} content)`);
    return true;
  }

  console.error(`  FAIL ${path}  (${rawSrcs.length} img, ${report.contentSources.length} content)`);
  for (const src of report.duplicates) {
    const n = report.contentSources.filter((s) => s === src).length;
    console.error(`         ${src}  ×${n}`);
  }
  return false;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const paths = ["/", ...(await placePaths(browser))];

  console.log(`checking ${paths.length} pages against ${BASE}\n`);
  let failures = 0;
  for (const path of paths) {
    if (!(await checkPath(browser, path))) failures += 1;
  }

  await browser.close();

  if (failures > 0) {
    console.error(
      `\n${failures} of ${paths.length} pages repeat a photograph. Fix the page, or add a documented entry to ALLOWED_REPEATS.`,
    );
    process.exit(1);
  }

  console.log(`\nphotograph uniqueness OK across ${paths.length} pages (logo pair excepted)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
