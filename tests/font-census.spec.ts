import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/rivers/madison-river", "/flies/library"] as const;

/**
 * DESIGN.md §2 — two faces only:
 *   Fraunces (500/600): headlines, journal entry titles, pull quotes, large stats.
 *   Inter (400/500/600): nav, body, forms, buttons, tables, labels.
 * Archivo, Newsreader, and IBM Plex Mono are retired; their CSS variable names
 * alias to Inter, so legacy classes compile but a computed font-family must
 * never resolve to them. h5/h6 are Inter by design (globals.css). The lawful
 * Fraunces set is h1–h4, the display utilities (.font-heading / .font-display /
 * .font-serif), and .ea-stat-value — nothing else.
 */
const FRAUNCES_SANCTION =
  "h1, h2, h3, h4, .font-heading, .font-display, .font-serif, .ea-stat-value";

test.describe("font census", () => {
  for (const route of ROUTES) {
    test(`Inter dominates, Fraunces only in sanctioned display roles, retired fonts absent — ${route}`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);

      const census = await page.evaluate((sanctionSelector) => {
        const counts = {
          inter: 0,
          fraunces: 0,
          archivo: 0,
          newsreader: 0,
          plex: 0,
          other: 0,
        };
        const retiredLeaks: string[] = [];
        const frauncesLeaks: string[] = [];

        const nodes = document.body.querySelectorAll("*");
        for (const el of nodes) {
          if (!(el instanceof HTMLElement)) continue;
          const text = (el.innerText || "").trim();
          if (!text || el.children.length > 0) continue;
          const fam = getComputedStyle(el).fontFamily.toLowerCase();
          const where = `${el.tagName}.${el.className}`.slice(0, 80);
          let bucket: keyof typeof counts = "other";
          if (fam.includes("inter")) bucket = "inter";
          else if (fam.includes("fraunces")) bucket = "fraunces";
          else if (fam.includes("archivo")) bucket = "archivo";
          else if (fam.includes("newsreader")) bucket = "newsreader";
          else if (fam.includes("ibm plex") || fam.includes("plex mono"))
            bucket = "plex";
          counts[bucket] += 1;

          if (
            bucket === "archivo" ||
            bucket === "newsreader" ||
            bucket === "plex"
          ) {
            retiredLeaks.push(`${bucket}: ${where}`);
          }
          if (bucket === "fraunces") {
            const inlineDisplay = /var\(--font-(heading|display|serif)\)/.test(
              el.style.fontFamily,
            );
            if (!el.closest(sanctionSelector) && !inlineDisplay) {
              frauncesLeaks.push(where);
            }
          }
        }
        return { counts, retiredLeaks, frauncesLeaks };
      }, FRAUNCES_SANCTION);

      expect(
        census.counts.inter,
        `Inter must dominate on ${route} (it is the body/UI face) — census: ${JSON.stringify(census.counts)}`,
      ).toBeGreaterThan(census.counts.fraunces);
      expect(
        census.retiredLeaks,
        `Retired fonts resolved in computed font-family on ${route}: ${census.retiredLeaks.slice(0, 5).join(", ")}`,
      ).toEqual([]);
      expect(
        census.frauncesLeaks,
        `Fraunces outside sanctioned roles (h1–h4, .font-heading/.font-display/.font-serif, .ea-stat-value) on ${route}: ${census.frauncesLeaks.slice(0, 5).join(", ")}`,
      ).toEqual([]);
    });
  }
});
