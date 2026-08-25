/**
 * Drives the workbench keyboard map against a running app and asserts that
 * focus and selection actually move, on all four surfaces.
 *
 *   npm run check:workbench
 *
 * Requires a running app at BASE_URL (default http://localhost:3000) and
 * Playwright Chromium. Signs in as the fixture account (never the App
 * Store review account). Rebuild rows with:
 *   SUPABASE_SERVICE_ROLE_KEY=… npx tsx scripts/seed-fixture-account.ts
 *
 * Also writes 1440 and 390 screenshots to reports/workbench/.
 */
import { mkdirSync } from "node:fs";
import { chromium, type Page } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const FIXTURE_EMAIL = process.env.FIXTURE_EMAIL ?? "fixture@executiveangler.com";
const FIXTURE_PASSWORD = process.env.FIXTURE_PASSWORD ?? "FixtureEA2026!";
const OUT = "reports/workbench";

interface Surface {
  name: string;
  path: string;
  /** Clicks needed to reveal the table (view toggles). */
  reveal?: (page: Page) => Promise<void>;
}

const SURFACES: Surface[] = [
  {
    name: "journal",
    path: "/journal",
    reveal: async (page) => {
      // Desktop uses an icon button; the mobile header uses a labelled one.
      const desktop = page.getByRole("button", { name: "Table view" });
      const mobile = page.getByRole("button", { name: "Table", exact: true });
      const target = (await desktop.count()) > 0 ? desktop : mobile;
      await target.first().click();
    },
  },
  {
    name: "flybox",
    path: "/flybox",
    reveal: async (page) => {
      await page.getByRole("button", { name: "table", exact: true }).first().click();
    },
  },
  { name: "rivers-mine", path: "/rivers/mine" },
  {
    name: "gear-locker",
    path: "/account/gear",
    reveal: async (page) => {
      await page.getByRole("button", { name: "table", exact: true }).first().click();
    },
  },
];

const failures: string[] = [];
const notes: string[] = [];

function check(label: string, ok: boolean, detail = "") {
  const line = `${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`;
  console.log(line);
  if (!ok) failures.push(line);
}

async function signIn(page: Page): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: FIXTURE_EMAIL, password: FIXTURE_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Fixture sign-in failed: HTTP ${res.status}`);
  const session = (await res.json()) as Record<string, unknown>;
  const ref = new URL(supabaseUrl).hostname.split(".")[0];
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
      domain: new URL(BASE).hostname,
      path: "/",
      httpOnly: false,
      secure: BASE.startsWith("https"),
      sameSite: "Lax",
    },
  ]);
}

/** Index of the row that currently has DOM focus, or -1. */
async function focusedRow(page: Page): Promise<number> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    const row = el?.closest("[data-workbench-row]") as HTMLElement | null;
    return row ? Number(row.dataset.workbenchRow) : -1;
  });
}

/** Whether the focused element paints a visible ring (outline width > 0). */
async function focusRingVisible(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return false;
    const s = getComputedStyle(el);
    return parseFloat(s.outlineWidth) > 0 && s.outlineStyle !== "none";
  });
}

async function exerciseKeyboard(page: Page, surface: Surface): Promise<void> {
  const rows = page.locator("[data-workbench-row]");
  const rowCount = await rows.count();
  if (rowCount < 2) {
    notes.push(
      `${surface.name}: only ${rowCount} row(s) in the QA account — movement asserted on what exists.`,
    );
  }
  if (rowCount === 0) {
    check(`${surface.name}: table rendered`, false, "no rows to drive");
    return;
  }
  check(`${surface.name}: table rendered`, true, `${rowCount} rows`);

  // Row height is 32px.
  const box = await rows.first().boundingBox();
  check(
    `${surface.name}: 32px rows`,
    !!box && Math.abs(box.height - 32) < 1.5,
    `measured ${box?.height?.toFixed(1)}px`,
  );

  // Zebra: adjacent rows use different backgrounds.
  if (rowCount >= 2) {
    const [a, b] = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("[data-workbench-row]"));
      return [getComputedStyle(els[0]).backgroundColor, getComputedStyle(els[1]).backgroundColor];
    });
    check(`${surface.name}: zebra striping`, a !== b, `${a} vs ${b}`);
  }

  // Right-aligned tabular numerics.
  const numericCells = await page.locator("[data-workbench-row] .num").count();
  check(`${surface.name}: tabular numeric cells`, numericCells > 0, `${numericCells} cells`);

  // Enter the grid from the top, then drive it.
  await rows.first().focus();
  check(`${surface.name}: row takes DOM focus`, (await focusedRow(page)) === 0);

  // Three `j` presses: the review criterion. A painted ring can move without
  // `document.activeElement` changing — this reads the actual focused node.
  const tripleTarget = Math.min(3, rowCount - 1);
  await page.keyboard.press("j");
  await page.keyboard.press("j");
  await page.keyboard.press("j");
  const afterThreeJ = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    const row = el?.closest("[data-workbench-row]") as HTMLElement | null;
    return {
      tag: el?.tagName ?? "none",
      role: el?.getAttribute("role") ?? "",
      row: row ? Number(row.dataset.workbenchRow) : -1,
      tabIndex: el?.tabIndex ?? null,
    };
  });
  console.log(
    `${surface.name}: after j×3  document.activeElement=${afterThreeJ.tag}[role=${afterThreeJ.role}] row=${afterThreeJ.row} tabIndex=${afterThreeJ.tabIndex}`,
  );
  check(
    `${surface.name}: j×3 moves real DOM focus`,
    afterThreeJ.row === tripleTarget && afterThreeJ.tag === "DIV",
    `activeElement ${afterThreeJ.tag} row ${afterThreeJ.row}`,
  );

  await page.keyboard.press("ArrowDown");
  const afterDown = await focusedRow(page);
  const expectedDown = Math.min(tripleTarget + 1, rowCount - 1);
  check(
    `${surface.name}: ArrowDown moves focus`,
    afterDown === expectedDown,
    `row ${afterDown}`,
  );
  // Checked after a key press: :focus-visible only matches keyboard-driven
  // focus, which is exactly the guarantee we care about.
  check(`${surface.name}: visible focus ring on the row`, await focusRingVisible(page));

  await page.keyboard.press("k");
  const afterK = await focusedRow(page);
  check(
    `${surface.name}: k moves focus up`,
    afterK === Math.max(0, afterDown - 1),
    `row ${afterK}`,
  );

  await page.keyboard.press("j");
  const afterJ = await focusedRow(page);
  check(
    `${surface.name}: j moves focus down`,
    afterJ === afterDown,
    `row ${afterJ}`,
  );

  const editOnRow = page.getByRole("button", {
    name: new RegExp(`^Edit .+, row ${afterJ + 1}$`),
  });
  if ((await editOnRow.count()) > 0) {
    await editOnRow.first().click();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(80);
    const afterEscEdit = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      const row = el?.closest("[data-workbench-row]") as HTMLElement | null;
      return {
        tag: el?.tagName ?? "none",
        role: el?.getAttribute("role") ?? "",
        row: row ? Number(row.dataset.workbenchRow) : -1,
      };
    });
    check(
      `${surface.name}: Esc from an edit returns DOM focus to the row`,
      afterEscEdit.row === afterJ && afterEscEdit.tag === "DIV",
      `activeElement ${afterEscEdit.tag}[role=${afterEscEdit.role}] row ${afterEscEdit.row}`,
    );
  }

  // Space selects and reveals the bulk bar.
  await page.keyboard.press(" ");
  await page.waitForTimeout(120);
  const selectedCount = await page.locator("[data-workbench-row][aria-selected='true']").count();
  check(`${surface.name}: Space selects the focused row`, selectedCount === 1);
  check(
    `${surface.name}: bulk toolbar appears on selection`,
    await page.locator("[data-workbench-bulkbar]").isVisible(),
  );

  // Esc clears selection (nothing else is pending).
  await page.keyboard.press("Escape");
  await page.waitForTimeout(120);
  check(
    `${surface.name}: Esc clears selection`,
    (await page.locator("[data-workbench-row][aria-selected='true']").count()) === 0,
  );

  // "/" focuses the filter.
  await rows.first().focus();
  await page.keyboard.press("/");
  await page.waitForTimeout(120);
  const active = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    return {
      isFilter: el?.hasAttribute("data-workbench-filter") ?? false,
      tag: el?.tagName ?? "none",
      cls: el?.className?.toString().slice(0, 60) ?? "",
    };
  });
  check(`${surface.name}: / focuses the filter`, active.isFilter, `${active.tag} ${active.cls}`);
  check(`${surface.name}: visible focus ring on the filter`, await focusRingVisible(page));

  // ArrowDown out of the filter goes back to the rows; letters still type.
  await page.keyboard.type("z");
  const typed = await page.evaluate(
    () => (document.activeElement as HTMLInputElement | null)?.value ?? "",
  );
  check(`${surface.name}: letters type in the filter instead of navigating`, typed === "z");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
  check(
    `${surface.name}: Esc clears the filter query`,
    (await page.evaluate(
      () => (document.querySelector("[data-workbench-filter]") as HTMLInputElement | null)?.value ?? "x",
    )) === "",
  );

  // ⌘K reaches the global palette rather than being swallowed by the grid.
  await rows.first().focus();
  await page.keyboard.press("Meta+k");
  await page.waitForTimeout(300);
  const paletteOpen = await page.locator("[role='dialog']").count();
  check(`${surface.name}: ⌘K opens the global palette`, paletteOpen > 0);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
}

async function exerciseErrorFlash(page: Page, surface: Surface, column: string) {
  const cell = page.getByRole("button", { name: new RegExp(`^Edit ${column}, row`) }).first();
  if ((await cell.count()) === 0) {
    check(`${surface.name}: error-flash affordance`, false, `no editable "${column}" cell`);
    return;
  }
  await cell.click();
  const input = page.getByRole("textbox", { name: new RegExp(`^${column}, row`) });
  await input.fill("");
  await input.press("Enter");
  const flashed = await page
    .locator(".ea-wb-flash-error")
    .first()
    .waitFor({ state: "attached", timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  check(`${surface.name}: a rejected inline save flashes red`, flashed);
  const cleared = await page
    .locator(".ea-wb-flash-error")
    .first()
    .waitFor({ state: "detached", timeout: 2000 })
    .then(() => true)
    .catch(() => false);
  check(`${surface.name}: the red flash clears after animationend`, cleared);
}

async function exerciseReducedMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const duration = await page.evaluate(() => {
    const el = document.createElement("span");
    el.className = "ea-wb-flash-saved";
    document.body.appendChild(el);
    const ms = parseFloat(getComputedStyle(el).animationDuration) * 1000;
    el.remove();
    return ms;
  });
  check(
    "prefers-reduced-motion suppresses the save flash",
    duration > 0 && duration <= 20,
    `animation-duration ${duration}ms`,
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
}

/**
 * Round-trips a real inline edit and asserts the optimistic green flash.
 * Only run where a rename is harmless and reversible.
 */
async function exerciseInlineEdit(page: Page, surface: Surface, column: string) {
  const cell = page.getByRole("button", { name: new RegExp(`^Edit ${column}, row`) }).first();
  if ((await cell.count()) === 0) {
    check(`${surface.name}: inline edit affordance`, false, `no editable "${column}" cell`);
    return;
  }
  const original = ((await cell.textContent()) ?? "").trim();
  await cell.click();
  const input = page.getByRole("textbox", { name: new RegExp(`^${column}, row`) });
  await input.fill(`${original} edited`);
  await input.press("Enter");

  const flashed = await page
    .locator(".ea-wb-flash-saved")
    .first()
    .waitFor({ state: "attached", timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  check(`${surface.name}: a successful inline save flashes green`, flashed);

  const cleared = await page
    .locator(".ea-wb-flash-saved")
    .first()
    .waitFor({ state: "detached", timeout: 2000 })
    .then(() => true)
    .catch(() => false);
  check(`${surface.name}: the green flash clears after animationend`, cleared);

  // Put it back.
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: new RegExp(`^Edit ${column}, row`) }).first().click();
  const input2 = page.getByRole("textbox", { name: new RegExp(`^${column}, row`) });
  await input2.fill(original);
  await input2.press("Enter");
  await page.waitForTimeout(1200);
  const now = (
    (await page.getByRole("button", { name: new RegExp(`^Edit ${column}, row`) }).first().textContent()) ?? ""
  ).trim();
  check(`${surface.name}: the inline edit round-trips`, now === original, `"${now}" vs "${original}"`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await signIn(page);

  for (const surface of SURFACES) {
    console.log(`\n── ${surface.name} (${surface.path}) ──`);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}${surface.path}`, { waitUntil: "networkidle", timeout: 60_000 });
    if (page.url().includes("/login")) {
      check(`${surface.name}: authenticated`, false, "redirected to /login");
      continue;
    }
    if (surface.reveal) {
      await surface.reveal(page);
      await page.waitForTimeout(400);
    }
    await exerciseKeyboard(page, surface);
    if (surface.name === "journal") {
      await exerciseErrorFlash(page, surface, "Session");
    }
    if (surface.name === "gear-locker") {
      await exerciseInlineEdit(page, surface, "Item");
      await exerciseReducedMotion(page);
    }
    await page.screenshot({ path: `${OUT}/${surface.name}-1440.png`, fullPage: true });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "networkidle" });
    if (surface.reveal) {
      await surface.reveal(page);
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: `${OUT}/${surface.name}-390.png`, fullPage: true });
  }

  await browser.close();

  if (notes.length) {
    console.log("\nNotes:");
    for (const n of notes) console.log(`  · ${n}`);
  }
  console.log(`\nScreenshots → ${OUT}/`);
  if (failures.length) {
    console.error(`\n${failures.length} keyboard/chrome assertion(s) failed.`);
    process.exit(1);
  }
  console.log("\nworkbench keyboard map OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
