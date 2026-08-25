import type { Page } from "@playwright/test";

/**
 * Fixture-account credentials. No fallback that can authenticate.
 * A missing env var must throw — a silent default was how the review
 * inbox ended up in CI.
 */
export function fixtureCredentials(): { email: string; password: string } {
  const email = process.env.EA_FIXTURE_EMAIL;
  const password = process.env.EA_FIXTURE_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "EA_FIXTURE_EMAIL and EA_FIXTURE_PASSWORD must be set. " +
        "There is no default account. Do not point these at the App Store review inbox.",
    );
  }
  return { email, password };
}

/** Logo and post-login landing after Lane G. */
export const LOGGED_IN_HOME = /\/today\/?$/;

export async function signInWithEmail(page: Page, next = "/today") {
  const { email, password } = fixtureCredentials();
  await page.goto(`/login?redirect=${encodeURIComponent(next)}`);
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  const submit = page.getByRole("button", { name: /sign in with email/i });
  await submit.waitFor({ state: "visible" });
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

/**
 * Cookie grant for visual / contrast sweeps. Avoids Turnstile.
 * Still requires EA_FIXTURE_* — never a baked-in account.
 */
export async function signInViaApi(page: Page): Promise<void> {
  const { email, password } = fixtureCredentials();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required to sign in.");
  }
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`fixture grant HTTP ${res.status}`);
  }
  const session = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    expires_in?: number;
    token_type?: string;
    user?: unknown;
  };
  const ref = new URL(supabaseUrl).hostname.split(".")[0];
  const base = page.url() || "http://localhost:3000";
  const host = new URL(base.startsWith("http") ? base : `http://localhost:3000`).hostname;
  await page.context().addCookies([
    {
      name: `sb-${ref}-auth-token`,
      value: JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type ?? "bearer",
        user: session.user,
      }),
      domain: host,
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}

export async function signOut(page: Page) {
  await page.goto("/account");
  const signOutBtn = page.getByRole("button", { name: /sign out/i });
  if (await signOutBtn.count()) {
    await signOutBtn.click();
    await page.waitForURL((url) => url.pathname === "/" || url.pathname.startsWith("/login"));
    return;
  }
  await page.context().clearCookies();
  await page.goto("/");
}
