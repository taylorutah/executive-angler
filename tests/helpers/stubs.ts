import fs from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

const FIXTURE_PHOTO = path.join(process.cwd(), "tests/fixtures/stable-photo.jpg");
const REMOTE_HOST = /unsplash\.com|upload\.wikimedia\.org|cloudinary\.com|imgix\.net/i;

/** Frozen instant so "last checked" / relative times do not flake baselines. */
export const FROZEN_NOW = "2026-08-24T18:00:00.000Z";

const STABLE_FLOW = {
  discharge: { value: 740, unit: "ft3/s" },
  gageHeight: { value: 1.81, unit: "ft" },
  waterTemp: { valueFahrenheit: 46 },
};

/**
 * Stub live endpoints so visual snapshots do not capture USGS jitter,
 * search-index churn, or wall-clock stamps. Journey tests that need real
 * ranking should call `stubLiveData` with `{ searchIndex: false }`.
 *
 * Images are not stubbed and not masked. We host them; a changing image
 * is a finding, not noise.
 */
export async function stubLiveData(
  page: Page,
  opts: { searchIndex?: boolean } = {},
) {
  const stubSearch = opts.searchIndex !== false;

  await page.clock.install({ time: new Date(FROZEN_NOW) });

  await page.route("https://waterservices.usgs.gov/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ value: { timeSeries: [] } }),
    }),
  );

  await page.route("**/api/river-**", (route) => {
    const url = route.request().url();
    if (url.includes("/api/river-history")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          readings: [
            { date: "2026-07-25", discharge: 900 },
            { date: "2026-08-24", discharge: 740 },
          ],
        }),
      });
    }
    if (url.includes("/api/river-conditions")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          gauges: [{ ...STABLE_FLOW, siteId: "06038800" }],
        }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  await page.route("**/api/rivers/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ cfs: 740, unit: "cfs" }),
    }),
  );

  await page.route("**/api/search/flow**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ "06038800": 740 }),
    }),
  );

  if (stubSearch) {
    await page.route("**/api/search-index", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      }),
    );
  }
}

/**
 * Remote hosts are not deterministic (Unsplash 404s, wikimedia churn).
 * Serve one local JPEG so card grids do not flake. Self-hosted `/images`
 * and Supabase storage still go through — a change there is a finding.
 */
export async function stubRemoteImages(page: Page) {
  const body = fs.readFileSync(FIXTURE_PHOTO);
  await page.route("**/*", async (route) => {
    const req = route.request();
    if (req.resourceType() !== "image" && !req.url().includes("/_next/image")) {
      return route.continue();
    }
    const url = req.url();
    let remote = REMOTE_HOST.test(url);
    if (url.includes("/_next/image")) {
      try {
        const src = decodeURIComponent(new URL(url).searchParams.get("url") ?? "");
        remote = REMOTE_HOST.test(src);
      } catch {
        remote = false;
      }
    }
    if (!remote) return route.continue();
    return route.fulfill({ status: 200, contentType: "image/jpeg", body });
  });
}

/** Locators that move every request — mask them in screenshots. Not images. */
export function liveMasks(page: Page) {
  return [
    page.locator(".recharts-responsive-container"),
    page.locator(".mapboxgl-map"),
    page.locator("canvas.mapboxgl-canvas"),
    page.locator("[data-live]"),
    page.locator("time"),
  ];
}
