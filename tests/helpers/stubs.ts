import type { Page } from "@playwright/test";

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

/** Locators that move every request — mask them in screenshots. */
export function liveMasks(page: Page) {
  return [
    page.locator(".recharts-responsive-container"),
    page.locator(".mapboxgl-map"),
    page.locator("canvas.mapboxgl-canvas"),
    page.locator("[data-live]"),
    page.locator("time"),
  ];
}
