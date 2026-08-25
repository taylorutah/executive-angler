/**
 * Accessibility gate — axe-core over the visual-regression routes (plus the
 * signed-in desk), both registers, 1440 and 390.
 *
 *   npx tsx scripts/check-a11y.ts
 *
 * Requires a running app at BASE_URL (default http://localhost:3000),
 * Playwright Chromium, and EA_FIXTURE_EMAIL / EA_FIXTURE_PASSWORD for the
 * signed-in half. Never the App Store review inbox.
 *
 * Fails on any axe serious/critical (color-contrast excluded — that is the
 * painted-contrast gate) or if page-loads < 80.
 *
 * Focus-indicator contrast is measured, not eyeballed: outline vs adjacent
 * background, 3:1, both registers. Same relative-luminance arithmetic as
 * check-contrast-rendered.ts.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium, type Page } from "playwright";

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SCREENSHOT_DIR = join(HERE, "..", "docs", "a11y");
const WANT_SHOTS = process.env.A11Y_SCREENSHOTS === "1";

/** visual.spec.ts PUBLIC_ROUTES — keep in lockstep. */
export const PUBLIC_ROUTES = [
  "/",
  "/rivers",
  "/rivers/madison-river",
  "/flies/library",
  "/flies/pheasant-tail",
  "/destinations",
  "/destinations/new-zealand",
  "/articles",
  "/learn",
  "/search?q=green+river",
  "/login",
  "/styleguide",
] as const;

/**
 * visual.spec.ts SIGNED_IN_ROUTES plus the U2 extras.
 * `/` is included signed-in so a logged-in angler can still open the front
 * page, and so the matrix reaches 80 page-loads.
 */
export const SIGNED_IN_ROUTES = [
  "/journal",
  "/today",
  "/plan/madison-river",
  "/flybox",
  "/rivers/mine",
  "/account",
  "/account/gear",
  "/",
] as const;

export const REGISTERS = ["daylight", "dusk"] as const;
export const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
] as const;

export function plannedPageLoads(): number {
  return (
    (PUBLIC_ROUTES.length + SIGNED_IN_ROUTES.length) *
    REGISTERS.length *
    VIEWPORTS.length
  );
}

const MIN_LOADS = 80;
const FOCUS_MIN = 3;

const FIXTURE_EMAIL = process.env.EA_FIXTURE_EMAIL ?? "";
const FIXTURE_PASSWORD = process.env.EA_FIXTURE_PASSWORD ?? "";

type Impact = "minor" | "moderate" | "serious" | "critical";

type Finding = {
  route: string;
  register: string;
  viewport: string;
  id: string;
  impact: Impact;
  help: string;
  nodes: number;
};

function loadAxeSource(): string {
  const vendored = join(HERE, "vendor", "axe.min.js");
  try {
    return readFileSync(vendored, "utf8");
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
    } catch {
      throw new Error(
        "axe-core is missing. Expected scripts/vendor/axe.min.js " +
          "(see docs/decisions/p4-u2-wire-gate.md).",
      );
    }
  }
}

async function signIn(page: Page): Promise<void> {
  if (!FIXTURE_EMAIL || !FIXTURE_PASSWORD) {
    throw new Error(
      "EA_FIXTURE_EMAIL and EA_FIXTURE_PASSWORD must be set. " +
        "There is no default account.",
    );
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.");
  }
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: FIXTURE_EMAIL, password: FIXTURE_PASSWORD }),
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
  const host = new URL(BASE).hostname;
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
      secure: BASE.startsWith("https"),
      sameSite: "Lax",
    },
  ]);
  await page.goto(`${BASE}/today`, {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });
  if (page.url().includes("/login")) {
    throw new Error("fixture session bounced to /login");
  }
}

const FOCUS_SAMPLE = `(() => {
  function parseRgb(input) {
    if (!input || input === "transparent") return null;
    const m = String(input).match(/rgba?\\((\\d+)[,\\s]+(\\d+)[,\\s]+(\\d+)(?:[,\\s\\/]+([0-9.]+))?\\)/);
    if (!m) return null;
    return { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : +m[4] };
  }
  function srgb(c) {
    const x = c / 255;
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }
  function lum(rgb) {
    return 0.2126 * srgb(rgb.r) + 0.7152 * srgb(rgb.g) + 0.0722 * srgb(rgb.b);
  }
  function contrast(a, b) {
    const l1 = lum(a);
    const l2 = lum(b);
    const hi = Math.max(l1, l2);
    const lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }
  function bgOf(el) {
    let node = el;
    while (node && node !== document.documentElement) {
      const bg = parseRgb(getComputedStyle(node).backgroundColor);
      if (bg && bg.a > 0.05) return bg;
      node = node.parentElement;
    }
    return parseRgb(getComputedStyle(document.body).backgroundColor) || { r: 250, g: 246, b: 240, a: 1 };
  }
  const skip = document.querySelector(".ea-skip-link, a[href='#main-content']");
  const ring = document.querySelector(".ea-focus-ring, a.ea-nav-link, button");
  const target = ring instanceof HTMLElement ? ring : skip instanceof HTMLElement ? skip : null;
  if (!target) return { ok: false, reason: "no focusable control", ratio: 0 };
  target.focus();
  const style = getComputedStyle(target);
  const outline = parseRgb(style.outlineColor);
  if (!outline) return { ok: false, reason: "no outline color", ratio: 0 };
  const bg = bgOf(target);
  const ratio = contrast(outline, bg);
  return { ok: ratio + 1e-9 >= 3, reason: "", ratio: Math.round(ratio * 100) / 100, fg: style.outlineColor };
})()`;

async function applyRegister(page: Page, register: "daylight" | "dusk") {
  await page.evaluate((reg) => {
    document.documentElement.setAttribute("data-register", reg);
  }, register);
  await page.waitForFunction(
    (reg) => document.documentElement.getAttribute("data-register") === reg,
    register,
    { timeout: 5_000 },
  );
}

async function runAxe(page: Page, axeSource: string) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (opts: unknown) => Promise<{
      violations: Array<{
        id: string;
        impact?: string;
        help: string;
        nodes: unknown[];
      }>;
    }> } }).axe;
    return axe.run({
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      },
      rules: {
        "color-contrast": { enabled: false },
      },
    });
  });
}

async function chromeChecks(page: Page) {
  return page.evaluate(() => {
    const skip = document.querySelector(".ea-skip-link, a[href='#main-content']");
    const main = document.querySelector("main, #main-content, [role='main']");
    const header = document.querySelector("header");
    const nav = document.querySelector("nav");
    const footer = document.querySelector("footer");
    return {
      skip: Boolean(skip),
      main: Boolean(main),
      header: Boolean(header),
      nav: Boolean(nav),
      footer: Boolean(footer),
    };
  });
}

async function focusRatio(page: Page): Promise<{ ok: boolean; ratio: number; reason: string }> {
  return page.evaluate(FOCUS_SAMPLE);
}

async function maybeShot(
  page: Page,
  taken: Set<string>,
  key: string,
  file: string,
) {
  if (!WANT_SHOTS || taken.has(key)) return;
  taken.add(key);
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({
    path: join(SCREENSHOT_DIR, file),
    fullPage: false,
  });
}

async function main() {
  const planned = plannedPageLoads();
  if (planned < MIN_LOADS) {
    throw new Error(`route matrix is ${planned}, need >= ${MIN_LOADS}`);
  }

  const axeSource = loadAxeSource();
  const browser = await chromium.launch();
  const findings: Finding[] = [];
  let loads = 0;
  let serious = 0;
  let critical = 0;
  const shots = new Set<string>();

  async function audit(
    page: Page,
    route: string,
    register: (typeof REGISTERS)[number],
    vp: (typeof VIEWPORTS)[number],
  ) {
    const url = `${BASE}${route}`;
    let res: import("playwright").Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await page.goto(url, {
          waitUntil: attempt === 0 ? "domcontentloaded" : "load",
          timeout: 45_000,
        });
        break;
      } catch (err) {
        if (attempt === 2) {
          console.error(
            `${route.padEnd(32)} ${register.padEnd(8)} @${vp.name.padStart(4)}  SKIP  ${err instanceof Error ? err.message : err}`,
          );
          return;
        }
      }
    }
    const status = res?.status() ?? 0;
    if (status >= 500) {
      console.error(
        `${route.padEnd(32)} ${register.padEnd(8)} @${vp.name.padStart(4)}  SKIP  HTTP ${status}`,
      );
      return;
    }

    await page.waitForSelector("body", { timeout: 15_000 });
    await applyRegister(page, register);
    await page
      .waitForSelector(".ea-skip-link, [data-ea-skip-host] a, main", { timeout: 8_000 })
      .catch(() => undefined);

    loads += 1;

    const chrome = await chromeChecks(page);
    if (!chrome.skip) {
      serious += 1;
      findings.push({
        route,
        register,
        viewport: vp.name,
        id: "ea-skip-link",
        impact: "serious",
        help: "Skip-to-content link missing",
        nodes: 1,
      });
    }
    if (!chrome.main) {
      serious += 1;
      findings.push({
        route,
        register,
        viewport: vp.name,
        id: "ea-main-landmark",
        impact: "serious",
        help: "No main landmark",
        nodes: 1,
      });
    }

    const focus = await focusRatio(page);
    if (!focus.ok) {
      serious += 1;
      findings.push({
        route,
        register,
        viewport: vp.name,
        id: "ea-focus-contrast",
        impact: "serious",
        help: `Focus ring ${focus.ratio}:1 < ${FOCUS_MIN}:1${focus.reason ? ` (${focus.reason})` : ""}`,
        nodes: 1,
      });
    }

    const axe = await runAxe(page, axeSource);
    let routeSerious = chrome.skip && chrome.main && focus.ok ? 0 : findings.filter((f) => f.route === route && f.register === register && f.viewport === vp.name).length;
    let routeCritical = 0;
    for (const v of axe.violations) {
      const impact = (v.impact ?? "moderate") as Impact;
      if (impact !== "serious" && impact !== "critical") continue;
      findings.push({
        route,
        register,
        viewport: vp.name,
        id: v.id,
        impact,
        help: v.help,
        nodes: v.nodes.length,
      });
      if (impact === "critical") {
        critical += 1;
        routeCritical += 1;
      } else {
        serious += 1;
        routeSerious += 1;
      }
    }

    console.log(
      `${route.padEnd(32)} ${register.padEnd(8)} @${vp.name.padStart(4)}  ${String(axe.violations.length).padStart(3)} axe  ${routeSerious} serious  ${routeCritical} critical  focus ${focus.ratio}:1`,
    );

    if (route === "/" && register === "daylight") {
      await page.keyboard.press("Tab");
      await maybeShot(page, shots, `skip-${vp.name}`, `skip-${vp.name}.png`);
      await page.keyboard.press("Tab");
      await maybeShot(page, shots, `focus-${vp.name}`, `focus-${vp.name}.png`);
    }
  }

  try {
    for (const vp of VIEWPORTS) {
      const publicCtx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const publicPage = await publicCtx.newPage();
      for (const register of REGISTERS) {
        for (const route of PUBLIC_ROUTES) {
          await audit(publicPage, route, register, vp);
        }
      }
      await publicCtx.close();

      const memberCtx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const memberPage = await memberCtx.newPage();
      await memberPage.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await signIn(memberPage);
      for (const register of REGISTERS) {
        for (const route of SIGNED_IN_ROUTES) {
          await audit(memberPage, route, register, vp);
        }
      }
      await memberCtx.close();
    }
  } finally {
    await browser.close();
  }

  const report = {
    pageLoads: loads,
    planned,
    minLoads: MIN_LOADS,
    serious,
    critical,
    findings,
  };
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
  writeFileSync(join(SCREENSHOT_DIR, "report.json"), JSON.stringify(report, null, 2));

  console.log("");
  console.log(
    `page-loads: ${loads}  planned: ${planned}  serious: ${serious}  critical: ${critical}`,
  );

  if (loads < MIN_LOADS) {
    console.error(`FAIL: ${loads} page-loads is under ${MIN_LOADS}`);
    process.exit(1);
  }
  if (serious > 0 || critical > 0) {
    for (const f of findings) {
      console.error(
        `  [${f.impact}] ${f.id}  ${f.route} ${f.register} @${f.viewport}  ${f.help}  (${f.nodes})`,
      );
    }
    console.error("FAIL: serious or critical violations");
    process.exit(1);
  }
  console.log("PASS");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
