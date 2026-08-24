import { test, expect } from "@playwright/test";
import { liveMasks, stubLiveData } from "./helpers/stubs";

const ROUTES = [
  "/",
  "/rivers",
  "/rivers/madison-river",
  "/flies",
  "/flies/library",
  "/flies/pheasant-tail",
  "/destinations",
  "/destinations/new-zealand",
  "/articles",
  "/learn",
  "/search?q=green+river",
  "/login",
  "/journal",
  "/dashboard",
  "/styleguide",
] as const;

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
] as const;

test.describe("visual regression", () => {
  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      const slug = route.replace(/[/?=+]/g, "_").replace(/^_+|_+$/g, "") || "home";
      test(`${route} @${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await stubLiveData(page, { searchIndex: route.startsWith("/search") ? false : true });
        await page.goto(route, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(800);
        // Viewport, not full page: below-the-fold live cards and lazy images
        // change document height between runs. A flaky baseline is worse than none.
        // The regressions this lane exists to catch (type inversion, missing h1)
        // are above the fold.
        await expect(page).toHaveScreenshot(`${slug}-${vp.name}.png`, {
          fullPage: false,
          maxDiffPixelRatio: 0.02,
          mask: [...liveMasks(page), page.locator("img")],
        });
      });
    }
  }
});
