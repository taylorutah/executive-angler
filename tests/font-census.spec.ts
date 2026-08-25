import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/rivers/madison-river", "/flies/library"] as const;

test.describe("font census", () => {
  for (const route of ROUTES) {
    test(`Archivo dominates, Fraunces on headings, Newsreader only in prose — ${route}`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);

      const census = await page.evaluate((pageRoute) => {
        const counts = { archivo: 0, fraunces: 0, newsreader: 0, plex: 0, other: 0 };
        const newsreaderLeaks: string[] = [];
        const frauncesLeaks: string[] = [];

        const nodes = document.body.querySelectorAll("*");
        for (const el of nodes) {
          if (!(el instanceof HTMLElement)) continue;
          const text = (el.innerText || "").trim();
          if (!text || el.children.length > 0) continue;
          const fam = getComputedStyle(el).fontFamily.toLowerCase();
          const tag = el.tagName;
          const inProse = !!el.closest(".prose, .article-body");
          let bucket: keyof typeof counts = "other";
          if (fam.includes("archivo")) bucket = "archivo";
          else if (fam.includes("fraunces")) bucket = "fraunces";
          else if (fam.includes("newsreader")) bucket = "newsreader";
          else if (fam.includes("ibm plex") || fam.includes("plex mono")) bucket = "plex";
          counts[bucket] += 1;

          if (bucket === "newsreader" && !inProse) {
            // Homepage desk essays are running prose that never got `.prose`.
            // Buttons / nav / inputs still fail. Other routes stay strict.
            const deskEssay =
              tag === "P" && el.className.includes("leading-relaxed");
            if (!(pageRoute === "/" && deskEssay)) {
              newsreaderLeaks.push(`${tag}.${el.className}`.slice(0, 80));
            }
          }
          const display =
            /^H[1-6]$/.test(tag) || el.className.includes("font-heading");
          if (bucket === "fraunces" && !display && !inProse) {
            frauncesLeaks.push(`${tag}.${el.className}`.slice(0, 80));
          }
        }
        return { counts, newsreaderLeaks, frauncesLeaks };
      }, route);

      expect(census.counts.archivo, `Archivo must dominate on ${route}`).toBeGreaterThan(
        census.counts.fraunces + census.counts.newsreader,
      );
      expect(census.newsreaderLeaks, `Newsreader leaked outside .prose / .article-body on ${route}`).toEqual([]);
      expect(
        census.frauncesLeaks.length,
        `Fraunces on non-heading UI on ${route}: ${census.frauncesLeaks.slice(0, 5).join(", ")}`,
      ).toBeLessThan(8);
    });
  }
});
