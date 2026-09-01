import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/rivers/madison-river", "/flies/library"] as const;

/**
 * Gazette faces:
 *   Fraunces: headlines
 *   Source Serif 4: body
 *   IBM Plex Sans Condensed: nav, tables, CFS, UI
 * Inter / Roboto / Geist / Space Grotesk are forbidden.
 */
const FRAUNCES_SANCTION =
  "h1, h2, h3, h4, .font-heading, .font-display, .font-serif, .ea-stat-value, .ea-wordmark";

test.describe("font census", () => {
  for (const route of ROUTES) {
    test(`gazette faces only — ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);

      const census = await page.evaluate((sanctionSelector) => {
        const counts = {
          inter: 0,
          fraunces: 0,
          source: 0,
          plex: 0,
          forbidden: 0,
          other: 0,
        };
        const leaks: string[] = [];

        const nodes = document.body.querySelectorAll("*");
        for (const el of nodes) {
          if (!(el instanceof HTMLElement)) continue;
          const text = (el.innerText || "").trim();
          if (!text || el.children.length > 0) continue;
          const fam = getComputedStyle(el).fontFamily.toLowerCase();
          const where = `${el.tagName}.${el.className}`.slice(0, 80);
          if (fam.includes("inter") || fam.includes("roboto") || fam.includes("geist") || fam.includes("space grotesk")) {
            counts.forbidden += 1;
            leaks.push(where);
          } else if (fam.includes("fraunces")) counts.fraunces += 1;
          else if (fam.includes("source serif")) counts.source += 1;
          else if (fam.includes("plex")) counts.plex += 1;
          else counts.other += 1;
        }
        return { counts, leaks, sanctionSelector };
      }, FRAUNCES_SANCTION);

      expect(
        census.leaks,
        `Forbidden faces on ${route}: ${census.leaks.slice(0, 5).join(", ")}`,
      ).toEqual([]);
      expect(
        census.counts.source + census.counts.plex + census.counts.fraunces,
        `Gazette faces must appear on ${route}`,
      ).toBeGreaterThan(0);
    });
  }
});
