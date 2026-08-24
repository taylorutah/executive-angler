/**
 * Painted-output contrast check.
 *
 * Token-pair `check:contrast` cannot see alpha, undefined utilities, or
 * text sitting on the wrong surface. This walks the composited page.
 *
 *   npm run check:contrast:rendered
 *
 * Requires a running app at BASE_URL (default http://localhost:3000)
 * and Playwright Chromium (`npx playwright install chromium`).
 *
 * The evaluate payload is a string so tsx cannot inject helpers into it.
 *
 * Exits 1 when any failure is reported. The Phase 1 type/contrast fix
 * covers the six worst river-page cases, not all routes.
 */

import { chromium, type Page } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const ROUTES = [
  "/",
  "/rivers",
  "/rivers/madison-river",
  "/destinations",
  "/destinations/montana",
  "/flies/library",
  "/articles",
  "/guides",
  "/lodges",
  "/fly-shops",
  "/species",
  "/about",
  "/search",
] as const;

const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
] as const;

type Failure = {
  route: string;
  viewport: string;
  text: string;
  ratio: number;
  min: number;
  fg: string;
  bg: string;
  selector: string;
};

type Sample = {
  text: string;
  selector: string;
  fg: string;
  bg: string;
  ratio: number;
  min: number;
  large: boolean;
};

const SAMPLE_PAGE = `(() => {
  function parse(raw) {
    const m = raw.match(/rgba?\\(\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*,\\s*([\\d.]+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)/);
    if (!m) return null;
    return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
  }
  function over(fg, bg) {
    const a = fg[3];
    return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a)];
  }
  function lin(c) {
    const x = c / 255;
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }
  function lum(rgb) {
    return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  }
  const bodyBg = parse(getComputedStyle(document.body).backgroundColor) || [250, 246, 240, 1];
  const pageOpaque = [bodyBg[0], bodyBg[1], bodyBg[2]];
  function effectiveBg(el) {
    let acc = null;
    let node = el;
    const stack = [];
    while (node && node !== document.documentElement) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg && bg[3] > 0) stack.push(bg);
      node = node.parentElement;
    }
    for (let i = stack.length - 1; i >= 0; i--) {
      const layer = stack[i];
      if (!acc) {
        acc = [layer[0], layer[1], layer[2]];
        if (layer[3] < 1) acc = over(layer, pageOpaque);
      } else {
        acc = over(layer, acc);
      }
    }
    return acc || pageOpaque;
  }
  function cssPath(el) {
    const parts = [];
    let node = el;
    while (node && node !== document.body && parts.length < 4) {
      const id = node.id ? "#" + node.id : "";
      const cls = node.className && typeof node.className === "string"
        ? "." + node.className.trim().split(/\\s+/).slice(0, 2).join(".")
        : "";
      parts.unshift(node.tagName.toLowerCase() + id + cls);
      node = node.parentElement;
    }
    return parts.join(" > ");
  }
  const out = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    const el = walker.currentNode;
    if (!(el instanceof HTMLElement)) continue;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    const own = Array.from(el.childNodes)
      .filter(function (n) { return n.nodeType === Node.TEXT_NODE; })
      .map(function (n) { return (n.textContent || "").replace(/\\s+/g, " ").trim(); })
      .filter(Boolean)
      .join(" ");
    if (!own) continue;
    const color = parse(style.color);
    if (!color) continue;
    const bg = effectiveBg(el);
    const painted = color[3] < 1 ? over(color, bg) : [color[0], color[1], color[2]];
    const l1 = lum(painted);
    const l2 = lum(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const size = parseFloat(style.fontSize);
    const weight = parseInt(style.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const min = large ? 3 : 4.5;
    const key = cssPath(el) + "|" + own.slice(0, 40) + "|" + ratio.toFixed(2);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      text: own.slice(0, 80),
      selector: cssPath(el),
      fg: "rgba(" + color.map(function (n) { return Math.round(n * 1000) / 1000; }).join(",") + ")",
      bg: "rgb(" + bg.map(function (n) { return Math.round(n); }).join(",") + ")",
      ratio: ratio,
      min: min,
      large: large,
    });
  }
  return out;
})()`;

async function samplePage(page: Page): Promise<Sample[]> {
  return page.evaluate(SAMPLE_PAGE);
}

async function main() {
  const browser = await chromium.launch();
  const failures: Failure[] = [];
  let samples = 0;

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      for (const route of ROUTES) {
        const url = `${BASE}${route}`;
        const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
        if (!res || !res.ok()) {
          console.error(`SKIP ${route} @${vp.name} — HTTP ${res?.status() ?? "no response"}`);
          continue;
        }
        await page.waitForTimeout(400);
        const found = await samplePage(page);
        samples += found.length;
        for (const s of found) {
          if (s.ratio + 1e-9 < s.min) {
            failures.push({
              route,
              viewport: vp.name,
              text: s.text,
              ratio: s.ratio,
              min: s.min,
              fg: s.fg,
              bg: s.bg,
              selector: s.selector,
            });
          }
        }
        const routeFails = found.filter((s) => s.ratio + 1e-9 < s.min).length;
        console.log(
          `${route.padEnd(28)} @${vp.name.padStart(4)}  ${String(found.length).padStart(4)} samples  ${routeFails} fail`,
        );
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  failures.sort((a, b) => a.ratio - b.ratio);
  console.log(`\n${samples} text samples · ${failures.length} failures\n`);
  const worst = failures.slice(0, 20);
  for (const f of worst) {
    console.log(
      `${f.ratio.toFixed(2).padStart(5)}:1  (min ${f.min})  ${f.route} @${f.viewport}  “${f.text}”`,
    );
    console.log(`         ${f.fg} on ${f.bg}`);
  }
  if (failures.length > 20) {
    console.log(`\n… ${failures.length - 20} more`);
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
