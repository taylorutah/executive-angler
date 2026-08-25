/**
 * Place-page photograph uniqueness.
 *
 *   BASE_URL=http://localhost:3000 npx tsx scripts/check-place-images.ts
 *
 * The homepage rule, extended to `/destinations/[slug]`: every content
 * photograph on a place page appears once. A river hero belongs to that
 * river's card in the grid; printing it again as an essay plate showed the
 * same water twice.
 *
 * A river that genuinely appears in two roles on one page must be listed in
 * DOCUMENTED_DUPLICATES with the reason, not silently tolerated.
 */
import { chromium } from "playwright";
import { reportDuplicateImages } from "../src/components/home/homepage-images";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

/** Places with enough rivers, lodges, and community photos to be worth checking. */
const PLACES = ["montana", "wyoming", "idaho", "colorado", "belize", "new-zealand"];

/** canonical source → why the same photograph may appear twice on that page. */
const DOCUMENTED_DUPLICATES: Record<string, Record<string, string>> = {};

async function main() {
  const browser = await chromium.launch({ headless: true });
  let failed = false;

  for (const place of PLACES) {
    const path = `/destinations/${place}`;
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const response = await page.goto(BASE + path, { waitUntil: "load", timeout: 90_000 });

    if (!response || response.status() >= 400) {
      console.log(`${path}  skipped (${response?.status() ?? "no response"})`);
      await page.close();
      continue;
    }

    // Lazy cards below the fold never set currentSrc until they scroll in.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);

    const rawSrcs = await page.locator("img").evaluateAll((imgs) =>
      imgs.map((img) => (img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src),
    );

    const report = reportDuplicateImages(rawSrcs);
    const allowed = DOCUMENTED_DUPLICATES[place] ?? {};
    const unexplained = report.duplicates.filter((src) => !(src in allowed));

    console.log(
      `${path}  imgs ${rawSrcs.length}  content ${report.contentSources.length}  duplicates ${report.duplicates.length}`,
    );
    for (const src of report.duplicates) {
      const n = report.contentSources.filter((s) => s === src).length;
      const reason = allowed[src];
      console.log(`  ${reason ? "documented" : "UNEXPLAINED"}  ${src}  ×${n}${reason ? ` — ${reason}` : ""}`);
    }

    if (unexplained.length > 0) failed = true;
    await page.close();
  }

  await browser.close();

  if (failed) {
    console.error("\nPlace pages printed the same photograph twice. Fix the page or document the role.");
    process.exit(1);
  }
  console.log("\nplace image uniqueness OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
