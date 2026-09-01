import { test, expect } from "@playwright/test";
import { LOGGED_IN_HOME, signInWithEmail } from "./helpers/auth";

test.describe("journey smoke", () => {
  test("stranger on a river page sees flow, hatch, and access", async ({ page }) => {
    await page.goto("/rivers/madison-river", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /madison river/i }).first()).toBeVisible();
    await expect(page.locator("body")).toContainText(/\d[\d,]*\s*cfs/i, { timeout: 15_000 });
    await expect(page.getByText(/on the water/i).first()).toBeVisible();
    await expect(page.locator("body")).toContainText(/hatch/i);
    await expect(page.locator("body")).toContainText(/access/i);
  });

  test("home rail shows a numeric cfs on first paint", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-home-rail]")).toContainText(/\d[\d,]*\s*cfs/i, {
      timeout: 20_000,
    });
    await expect(page.locator("[data-home-rail]")).not.toContainText(/no reading/i);
  });

  test.describe("gauges without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("home rail HTML still has a numeric cfs", async ({ page }) => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(page.locator("[data-home-rail]")).toContainText(/\d[\d,]*\s*cfs/i);
      await expect(page.locator("[data-home-rail]")).not.toContainText(/no reading/i);
    });
  });

  test('"pmd hatch" returns hatches and flies, not fly shops first', async ({ page }) => {
    await page.goto("/search?q=pmd+hatch", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Hatches" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Flies" })).toBeVisible();
    const order = await page.getByRole("heading", { level: 2 }).allTextContents();
    const hatch = order.indexOf("Hatches");
    const flies = order.indexOf("Flies");
    const shops = order.indexOf("Fly shops");
    expect(hatch).toBeGreaterThanOrEqual(0);
    expect(flies).toBeGreaterThanOrEqual(0);
    if (shops >= 0) expect(Math.min(hatch, flies)).toBeLessThan(shops);
  });

  test("destinations index lists the public catalog, not a blank bounce", async ({ page }) => {
    await page.goto("/destinations", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/destinations\/?$/);
    await expect(page.getByRole("heading", { level: 1, name: /destinations/i })).toBeVisible();
  });

  test('"green river" ranks Green River first among rivers', async ({ page }) => {
    await page.goto("/search?q=green+river", { waitUntil: "domcontentloaded" });
    const rivers = page.locator('a[href*="/rivers/"]').filter({ hasText: /green river/i });
    await expect(rivers.first()).toBeVisible({ timeout: 15_000 });
    const firstRiverLink = page.locator("main").locator('a[href*="/rivers/"]').first();
    await expect(firstRiverLink).toContainText(/green river/i);
  });

  test("logged-out visitor cannot reach a journal surface", async ({ page }) => {
    await page.goto("/journal", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?redirect=%2Fjournal/);
    await page.goto("/journal/new", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?redirect=/);
  });

  test("logged-out /flies lands on the library desk", async ({ page }) => {
    const res = await page.goto("/flies", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/flies\/library/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /on the plate/i })).toBeVisible();
  });

  test("/dashboard permanently lands on /today", async ({ page }) => {
    await signInWithEmail(page, "/dashboard");
    await expect(page).toHaveURL(LOGGED_IN_HOME);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(LOGGED_IN_HOME);
  });

  test("authenticated user reaches the logged-in home from the logo", async ({ page }) => {
    await signInWithEmail(page, "/today");
    const logo = page.getByRole("link", { name: /executive angler/i }).first();
    await logo.click();
    await expect(page).toHaveURL(LOGGED_IN_HOME);
  });

  test("contact page does not paint Turnstile", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: /^contact$/i })).toBeVisible();
    await expect(page.locator('iframe[src*="challenges.cloudflare.com"]')).toHaveCount(0);
    await expect(page.locator('iframe[src*="turnstile"]')).toHaveCount(0);
    await expect(page.getByText(/verification failed/i)).toHaveCount(0);
  });
});
