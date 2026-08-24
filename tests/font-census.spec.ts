import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/rivers/madison-river", "/flies/library"] as const;

function familyOf(fontFamily: string): "archivo" | "fraunces" | "newsreader" | "plex" | "other" {
  const f = fontFamily.toLowerCase();
  if (f.includes("archivo")) return "archivo";
  if (f.includes("fraunces")) return "fraunces";
  if (f.includes("newsreader")) return "newsreader";
  if (f.includes("ibm plex") || f.includes("plex mono")) return "plex";
  return "other";
}

test.describe("font census", () => {
  for (const route of ROUTES) {
    test(`Archivo dominates, Fraunces on headings, Newsreader only in prose — ${route}`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);

      const census = await page.evaluate(() => {
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
            newsreaderLeaks.push(`${tag}.${el.className}`.slice(0, 80));
          }
          if (bucket === "fraunces" && !/^H[1-6]$/.test(tag) && !inProse) {
            frauncesLeaks.push(`${tag}.${el.className}`.slice(0, 80));
          }
        }
        return { counts, newsreaderLeaks, frauncesLeaks };
      });

      expect(census.counts.archivo, `Archivo must dominate on ${route}`).toBeGreaterThan(
        census.counts.fraunces + census.counts.newsreader,
      );
      expect(census.newsreaderLeaks, `Newsreader leaked outside .prose / .article-body on ${route}`).toEqual([]);
      expect(
        census.frauncesLeaks.length,
        `Fraunces on non-heading UI on ${route}: ${census.frauncesLeaks.slice(0, 5).join(", ")}`,
      ).toBeLessThan(8);

      void familyOf;
    });
  }
});
