/**
 * Saves viewport screenshots + overflow check for box stock controls.
 * Usage: node scripts/capture-box-stock-screenshots.mjs <baseUrl>
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3000";
const outDir = "/opt/cursor/artifacts";
const pathSuffix = "/box-stock-control-demo";

const viewports = [
  { name: "box-stock-1440w", width: 1440, height: 900, dpr: 1 },
  { name: "box-stock-768w", width: 768, height: 1024, dpr: 1 },
  { name: "box-stock-390w", width: 390, height: 844, dpr: 2 },
  { name: "box-stock-375w", width: 375, height: 812, dpr: 2 },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const overflow = [];

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr,
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}${pathSuffix}`, { waitUntil: "networkidle" });
  const metrics = await page.evaluate(() => {
    const stock = document.querySelector("[data-box-stock-control]");
  return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      stockClip: stock
        ? stock.getBoundingClientRect().right > document.documentElement.clientWidth + 0.5
        : null,
    };
  });
  overflow.push({
    viewport: vp.name,
    ...metrics,
    pass: metrics.scrollWidth <= metrics.clientWidth && metrics.stockClip !== true,
  });
  await page.screenshot({
    path: path.join(outDir, `${vp.name}.png`),
    fullPage: false,
  });
  await context.close();
}

await browser.close();
await writeFile(path.join(outDir, "box-stock-overflow.json"), JSON.stringify(overflow, null, 2));
console.log(JSON.stringify(overflow, null, 2));
