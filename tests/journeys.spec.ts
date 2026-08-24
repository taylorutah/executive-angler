import { test, expect } from "@playwright/test";
import { LOGGED_IN_HOME, signInWithEmail } from "./helpers/auth";

test.describe("journey smoke", () => {
  test("stranger on a river page sees flow, hatch, and access", async ({ page }) => {
    await page.goto("/rivers/madison-river", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /madison river/i }).first()).toBeVisible();
    await expect(page.locator("body")).toContainText(/cfs/i, { timeout: 15_000 });
    await expect(page.locator("body")).toContainText(/hatch/i);
    await expect(page.locator("body")).toContainText(/access/i);
  });

  test('"pmd hatch" returns hatches and flies, not fly shops first', async ({ page }) => {
    await page.goto("/search?q=pmd+hatch", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".mb-10").filter({ hasText: /^Hatches/ }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(".mb-10").filter({ hasText: /^Flies/ }).first()).toBeVisible();
    const order = await page.locator(".mb-10").evaluateAll((els) =>
      els.map((el) => el.querySelector("span")?.textContent?.trim() ?? ""),
    );
    const hatch = order.indexOf("Hatches");
    const flies = order.indexOf("Flies");
    const shops = order.indexOf("Fly Shops");
    expect(hatch).toBeGreaterThanOrEqual(0);
    expect(flies).toBeGreaterThanOrEqual(0);
    if (shops >= 0) expect(Math.min(hatch, flies)).toBeLessThan(shops);
  });

  test('"green river" ranks Green River first among rivers', async ({ page }) => {
    await page.goto("/search?q=green+river", { waitUntil: "domcontentloaded" });
    const rivers = page.locator('a[href*="/rivers/"]').filter({ hasText: /green river/i });
    await expect(rivers.first()).toBeVisible({ timeout: 15_000 });
    const firstRiverLink = page.locator('a[href*="/rivers/"]').first();
    await expect(firstRiverLink).toContainText(/green river/i);
  });

  test("logged-out visitor cannot reach a journal surface", async ({ page }) => {
    await page.goto("/journal", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?redirect=%2Fjournal/);
    await page.goto("/journal/new", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login\?redirect=/);
  });

  test("authenticated user reaches the logged-in home from the logo", async ({ page }) => {
    await signInWithEmail(page, "/dashboard");
    const logo = page.getByRole("link", { name: /executive angler/i }).first();
    await logo.click();
    await expect(page).toHaveURL(LOGGED_IN_HOME);
  });
});
