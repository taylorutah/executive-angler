import type { Page } from "@playwright/test";

export const QA_EMAIL = process.env.EA_QA_EMAIL ?? "test@executiveangler.com";
export const QA_PASSWORD = process.env.EA_QA_PASSWORD ?? "TestEA2026!";

/** Logo target after Lane G is `/today`; until then it is `/dashboard`. */
export const LOGGED_IN_HOME = /\/(dashboard|today)\/?$/;

export async function signInWithEmail(page: Page, next = "/dashboard") {
  await page.goto(`/login?redirect=${encodeURIComponent(next)}`);
  await page.locator("#email").fill(QA_EMAIL);
  await page.locator("#password").fill(QA_PASSWORD);
  const submit = page.getByRole("button", { name: /sign in with email/i });
  await submit.waitFor({ state: "visible" });
  // Turnstile fail-open unlocks the button within ~6s if the widget never tokens.
  await submit.waitFor({ state: "attached" });
  await page.waitForFunction(
    () => {
      const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      return !!btn && !btn.disabled;
    },
    null,
    { timeout: 12_000 },
  );
  await submit.click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 20_000 });
}

export async function signOut(page: Page) {
  await page.goto("/account");
  const signOutBtn = page.getByRole("button", { name: /sign out/i });
  if (await signOutBtn.count()) {
    await signOutBtn.click();
    await page.waitForURL((url) => url.pathname === "/" || url.pathname.startsWith("/login"));
    return;
  }
  // Fallback: clear supabase cookies and reload.
  await page.context().clearCookies();
  await page.goto("/");
}
