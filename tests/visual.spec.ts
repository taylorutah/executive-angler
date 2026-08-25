import { test, expect } from "@playwright/test";
import { signInViaApi } from "./helpers/auth";
import { liveMasks, stubLiveData, stubRemoteImages } from "./helpers/stubs";

/**
 * Public routes captured signed-out. `/flies` 308s to `/flies/library`
 * (asserted in journeys.spec.ts) so it is not a baseline.
 * `/dashboard` 308s to `/today` — same.
 */
const PUBLIC_ROUTES = [
  "/",
  "/rivers",
  "/rivers/madison-river",
  "/flies/library",
  "/flies/pheasant-tail",
  "/destinations/new-zealand",
  "/articles",
  "/learn",
  "/search?q=green+river",
  "/login",
  "/styleguide",
] as const;

/** Protected routes — captured as the fixture account, not as /login. */
const SIGNED_IN_ROUTES = ["/journal", "/today"] as const;

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
] as const;

async function settle(page: import("@playwright/test").Page) {
  await page.evaluate(() => {
    for (const img of document.images) {
      img.loading = "eager";
    }
  });
  await page.evaluate(() => document.fonts.ready);
  // Viewport photographs must decode, or the next run paints paper and diffs 15 %.
  // Login / styleguide have only a logo — 0 content images is fine.
  await page.waitForFunction(
    () => {
      const visible = [...document.images].filter((img) => {
        const r = img.getBoundingClientRect();
        return r.width >= 80 && r.height >= 80 && r.top < window.innerHeight && r.bottom > 0;
      });
      if (visible.length === 0) return true;
      return visible.every((img) => img.complete && img.naturalWidth > 0);
    },
    null,
    { timeout: 20_000 },
  ).catch(() => undefined);
  await page.addStyleTag({
    content: "*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}",
  });
}

async function capture(
  page: import("@playwright/test").Page,
  route: string,
  vp: (typeof VIEWPORTS)[number],
) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await stubRemoteImages(page);
  await stubLiveData(page, { searchIndex: route.startsWith("/search") ? false : true });
  await page.goto(route, { waitUntil: "domcontentloaded" });
  const path = new URL(page.url()).pathname;
  if (!route.startsWith("/login")) {
    expect(path, `${route} must capture itself, not a bounce`).not.toMatch(/^\/login/);
  } else {
    expect(path).toMatch(/^\/login/);
  }
  await settle(page);
  const slug = route.replace(/[/?=+]/g, "_").replace(/^_+|_+$/g, "") || "home";
  await expect(page).toHaveScreenshot(`${slug}-${vp.name}.png`, {
    fullPage: false,
    maxDiffPixelRatio: 0.02,
    mask: liveMasks(page),
  });
}

test.describe("visual regression", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(HTMLImageElement.prototype, "loading", {
        configurable: true,
        get() {
          return "eager";
        },
        set() {
          /* next/image sets loading=lazy; a race there is a 15 % destinations flake */
        },
      });
    });
  });

  for (const vp of VIEWPORTS) {
    for (const route of PUBLIC_ROUTES) {
      test(`${route} @${vp.name}`, async ({ page }) => {
        await capture(page, route, vp);
      });
    }

    for (const route of SIGNED_IN_ROUTES) {
      test(`${route} @${vp.name} (fixture)`, async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await signInViaApi(page);
        await capture(page, route, vp);
      });
    }
  }
});
