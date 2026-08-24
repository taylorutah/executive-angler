/**
 * Smoke: the public homepage rail must show at least one numeric cfs.
 * Run against a live app: BASE_URL=http://127.0.0.1:3010 npm run check:home-rail
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

export async function railCfsCount(htmlOrPageCfs: string[]): Promise<number> {
  return htmlOrPageCfs.filter((t) => /\d[\d,]*\s*cfs/i.test(t)).length;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const res = await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60_000 });
  if (!res || !res.ok()) {
    throw new Error(`GET / failed: ${res?.status()}`);
  }
  const texts = await page.locator("[data-home-rail]").innerText();
  const hasCfs = /\d[\d,]*\s*cfs/i.test(texts);
  await browser.close();
  if (!hasCfs) {
    console.error("home rail has no numeric cfs:\n", texts);
    process.exit(1);
  }
  console.log("home rail OK — numeric cfs present");
}

const isEntry = process.argv[1] && process.argv[1].includes("check-home-rail.ts");
if (isEntry) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
