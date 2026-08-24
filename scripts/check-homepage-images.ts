/**
 * Homepage photograph uniqueness + lane ratio.
 *
 *   BASE_URL=http://localhost:3000 npx tsx scripts/check-homepage-images.ts
 *
 * Collects every <img> on `/`, canonicalizes next/image URLs, and asserts
 * uniqueness. The light/dark logo pair is the only allowed repeat.
 * Also reports resource / app / ethic vertical-pixel share at 1440.
 */
import { chromium } from "playwright";
import { reportDuplicateImages } from "../src/components/home/homepage-images";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 60_000 });

  const rawSrcs = await page.locator("img").evaluateAll((imgs) =>
    imgs.map((img) => (img as HTMLImageElement).currentSrc || (img as HTMLImageElement).src),
  );

  const report = reportDuplicateImages(rawSrcs);
  console.log(`img tags: ${rawSrcs.length}`);
  console.log(`canonical content sources: ${report.contentSources.length}`);
  for (const src of report.contentSources) {
    console.log("  " + src);
  }

  if (!report.ok) {
    console.error("\nDuplicate photographs on /:");
    for (const src of report.duplicates) {
      const n = report.contentSources.filter((s) => s === src).length;
      console.error(`  ${src}  ×${n}`);
    }
    await browser.close();
    process.exit(1);
  }

  console.log("\nhomepage image uniqueness OK (logo pair excepted)");

  const lanes = JSON.parse(
    String(
      await page.evaluate(`(() => {
        const nodes = [...document.querySelectorAll("[data-lane]")];
        const totals = { resource: 0, app: 0, ethic: 0 };
        for (const node of nodes) {
          const lane = node.getAttribute("data-lane");
          if (!lane || !(lane in totals)) continue;
          totals[lane] += node.getBoundingClientRect().height;
        }
        const sum = totals.resource + totals.app + totals.ethic;
        const pct = (n) => (sum === 0 ? 0 : Math.round((n / sum) * 1000) / 10);
        return JSON.stringify({
          bands: nodes.length,
          px: totals,
          pct: {
            resource: pct(totals.resource),
            app: pct(totals.app),
            ethic: pct(totals.ethic),
          },
        });
      })()`),
    ),
  ) as {
    bands: number;
    px: { resource: number; app: number; ethic: number };
    pct: { resource: number; app: number; ethic: number };
  };

  console.log(
    `\nlane bands: ${lanes.bands}  resource ${lanes.pct.resource}% / app ${lanes.pct.app}% / ethic ${lanes.pct.ethic}%`,
  );
  console.log(
    `  px @1440  resource ${Math.round(lanes.px.resource)}  app ${Math.round(lanes.px.app)}  ethic ${Math.round(lanes.px.ethic)}`,
  );

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
