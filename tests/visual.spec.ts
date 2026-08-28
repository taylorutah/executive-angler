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

type Page = import("@playwright/test").Page;
type Viewport = (typeof VIEWPORTS)[number];

type ImageCensus = {
  visible: number;
  loaded: number;
  unloaded: number;
};

async function imageCensus(page: Page): Promise<ImageCensus> {
  return page.evaluate(() => {
    const visible = [...document.images].filter((img) => {
      const r = img.getBoundingClientRect();
      return r.width >= 80 && r.height >= 80 && r.top < window.innerHeight && r.bottom > 0;
    });
    const loaded = visible.filter((img) => img.complete && img.naturalWidth > 0).length;
    return { visible: visible.length, loaded, unloaded: visible.length - loaded };
  });
}

async function forceEager(page: Page) {
  await page.evaluate(() => {
    for (const img of document.images) {
      img.loading = "eager";
    }
  });
}

async function settle(page: Page, route: string, vp: Viewport): Promise<{
  durationMs: number;
  census: ImageCensus;
}> {
  await forceEager(page);
  await page.evaluate(() => document.fonts.ready);
  // Viewport photographs must decode, or the next run paints paper and diffs 15 %.
  // Login / styleguide have only a logo — 0 content images is fine.
  const started = Date.now();
  try {
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
    );
  } catch {
    const stats = await imageCensus(page);
    throw new Error(
      `settle timed out on ${route} @${vp.name}: ${stats.unloaded} of ${stats.visible} visible images still at naturalWidth 0`,
    );
  }
  const durationMs = Date.now() - started;
  await page.addStyleTag({
    content: "*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}",
  });
  return { durationMs, census: await imageCensus(page) };
}

/**
 * First load fills next/image's on-disk cache (cold CI has no CDN).
 * Capture is the second load — the honest production equivalent.
 */
async function warmup(page: Page, route: string): Promise<{
  needed: boolean;
  durationMs: number;
  idle: "reached" | "timeout";
  census: ImageCensus;
}> {
  const started = Date.now();
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await forceEager(page);
  let idle: "reached" | "timeout" = "reached";
  try {
    // Mapbox / analytics can keep the network busy. 15s is enough for
    // /_next/image cache-miss transforms; then we reload regardless.
    await page.waitForLoadState("networkidle", { timeout: 15_000 });
  } catch {
    idle = "timeout";
  }
  const census = await imageCensus(page);
  const durationMs = Date.now() - started;
  return {
    needed: census.unloaded > 0 || idle === "timeout" || durationMs > 3_000,
    durationMs,
    idle,
    census,
  };
}

async function capture(page: Page, route: string, vp: Viewport) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await stubRemoteImages(page);
  await stubLiveData(page, { searchIndex: route.startsWith("/search") ? false : true });
  const warm = await warmup(page, route);
  const path = new URL(page.url()).pathname;
  if (!route.startsWith("/login")) {
    expect(path, `${route} must capture itself, not a bounce`).not.toMatch(/^\/login/);
  } else {
    expect(path).toMatch(/^\/login/);
  }
  await page.goto(route, { waitUntil: "domcontentloaded" });
  const settled = await settle(page, route, vp);
  // Browse indexes paint a skeleton first. Do not baseline the fallback —
  // Soft Hackle Carrot on the plate is the flies still Nick walks.
  if (route.startsWith("/flies/library")) {
    await page.getByRole("heading", { name: "On the water this week" }).waitFor({
      timeout: 15_000,
    });
    await page.getByText("Soft Hackle Carrot").waitFor({ timeout: 15_000 });
  }
  console.log(
    `[visual] ${route} @${vp.name} warmup ${warm.needed ? "needed" : "not-needed"} ${warm.durationMs}ms idle=${warm.idle} images=${warm.census.loaded}/${warm.census.visible}; settle ${settled.durationMs}ms images=${settled.census.loaded}/${settled.census.visible}`,
  );
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
