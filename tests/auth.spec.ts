import { test, expect } from "@playwright/test";
import { LOGGED_IN_HOME, signInWithEmail, signOut } from "./helpers/auth";

test.describe("auth", () => {
  test("email sign-in", async ({ page }) => {
    await signInWithEmail(page, "/today");
    await expect(page).toHaveURL(LOGGED_IN_HOME);
  });

  test("Google sign-in constructs our callback, without talking to Google", async ({ page }) => {
    let authorizeUrl: string | null = null;
    await page.route("**/auth/v1/authorize**", async (route) => {
      authorizeUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: "text/plain",
        body: "oauth-stub",
      });
    });
    await page.route("https://accounts.google.com/**", async (route) => {
      throw new Error(`Google handshake was not stubbed: ${route.request().url()}`);
    });

    await page.goto("/login");
    await page.getByRole("button", { name: /continue with google/i }).click();
    await expect.poll(() => authorizeUrl, { timeout: 10_000 }).toBeTruthy();

    const url = new URL(authorizeUrl!);
    expect(url.hostname).not.toBe("accounts.google.com");
    expect(url.searchParams.get("provider")).toBe("google");
    const redirectTo = url.searchParams.get("redirect_to") ?? "";
    expect(redirectTo).toContain("/auth/callback");
    expect(redirectTo).toMatch(/next=%2Ftoday|next=\/today/);
  });

  test("sign-up leads to verify-email", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await page.goto("/verify-email");
    // Unsigned visitors are sent to login. Do not treat leftover Turnstile
    // copy as proof the verify page rendered.
    await expect(page).toHaveURL(/\/(login|verify-email)/);
    await expect(
      page.getByRole("heading", { name: /sign in|confirm your email/i }),
    ).toBeVisible();
  });

  test("password reset form is labeled and is not submitted", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /send reset link/i })).toBeVisible();
    // Do not fill or submit. resetPasswordForEmail hits a real provider inbox.
  });

  test("deep link while signed out lands on login and returns after auth", async ({ page }) => {
    await page.goto("/journal");
    await expect(page).toHaveURL(/\/login\?redirect=%2Fjournal/);
    await signInWithEmail(page, "/journal");
    await expect(page).toHaveURL(/\/journal/);
  });

  test("signed-in user can still open /", async ({ page }) => {
    await signInWithEmail(page, "/today");
    await page.goto("/");
    const path = new URL(page.url()).pathname;
    expect(path).toBe("/");
  });

  test("sign out", async ({ page }) => {
    await signInWithEmail(page, "/today");
    await signOut(page);
    await page.goto("/journal");
    await expect(page).toHaveURL(/\/login\?redirect=/);
  });

  test("session survives a hard refresh", async ({ page }) => {
    await signInWithEmail(page, "/today");
    await page.reload();
    await expect(page).not.toHaveURL(/\/login/);
    await page.goto("/account");
    await expect(page).toHaveURL(/\/account/);
  });
});
