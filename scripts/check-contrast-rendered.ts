/**
 * Painted-output contrast check.
 *
 * Token-pair `check:contrast` cannot see alpha, undefined utilities, sibling
 * scrims, or text sitting on the wrong surface. This walks the composited page.
 *
 *   npm run check:contrast:rendered
 *
 * Requires a running app at BASE_URL (default http://localhost:3000)
 * and Playwright Chromium (`npx playwright install chromium`).
 *
 * The evaluate payload is a string so tsx cannot inject helpers into it.
 * Keep that true: SAMPLE_PAGE must stay a plain string with no nested
 * template literals. `scripts/check-contrast-rendered.test.ts` parse-checks
 * it with `new Function()` so a stray backtick cannot silently truncate it.
 *
 * After V0 this script reports two buckets:
 *   failures      — gating (exit 1)
 *   unverifiable  — image-backed with no computable CSS overlay; non-gating
 *
 * Worst-case photo-absent arithmetic (Part 3 verdict): a title in the 0.8
 * alpha band of `.hero-overlay` over Vellum is 8.45:1; the 0.3 band is 2.14:1.
 * Judge by position, not by class name. Do not gate CI on `unverifiable`.
 *
 * Decorative orbs (`opacity-10` + opaque background-color) must multiply
 * computed opacity into the composited alpha. Treating them as solid fills
 * reports copper-on-copper 1.00:1 that is not on the screen.
 */

import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { chromium, type Page } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const DEFAULT_ROUTES = [
  "/",
  "/rivers",
  "/rivers/madison-river",
  "/destinations",
  "/destinations/montana",
  "/flies/library",
  "/flies/pheasant-tail",
  "/articles",
  "/guides",
  "/lodges",
  "/fly-shops",
  "/species",
  "/about",
  "/search",
  "/login",
] as const;

const ROUTES = (process.env.CONTRAST_ROUTES
  ? process.env.CONTRAST_ROUTES.split(",").map((r) => r.trim()).filter(Boolean)
  : DEFAULT_ROUTES) as readonly string[];

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

type Unverifiable = {
  route: string;
  viewport: string;
  text: string;
  selector: string;
  reason: string;
};

type Sample = {
  text: string;
  selector: string;
  fg: string;
  bg: string;
  ratio: number;
  min: number;
  large: boolean;
  unverifiable: boolean;
  reason: string;
};

/**
 * Browser payload. Must remain a template literal whose contents contain
 * no backticks — a backtick in a comment here would terminate this string
 * and tsc would still pass.
 */
export const SAMPLE_PAGE = `(() => {
  function parse(raw) {
    const m = String(raw || "").match(/rgba?\\(\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*,\\s*([\\d.]+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)/);
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
  function overlapRatio(inner, outer) {
    const ix = Math.max(0, Math.min(inner.right, outer.right) - Math.max(inner.left, outer.left));
    const iy = Math.max(0, Math.min(inner.bottom, outer.bottom) - Math.max(inner.top, outer.top));
    const area = inner.width * inner.height;
    if (area < 1) return 0;
    return (ix * iy) / area;
  }
  function zNumber(el) {
    const z = getComputedStyle(el).zIndex;
    return z === "auto" ? null : Number(z);
  }
  function paintsBehind(layer, target) {
    if (layer === target) return false;
    if (layer.contains(target)) return true;
    if (target.contains(layer)) return false;
    var a = layer;
    var b = target;
    var ap = a.parentElement;
    var bp = b.parentElement;
    while (ap && !ap.contains(b)) {
      a = ap;
      ap = a.parentElement;
    }
    while (bp && bp !== ap) {
      b = bp;
      bp = b.parentElement;
    }
    var za = zNumber(a);
    var zb = zNumber(b);
    if (za != null || zb != null) {
      var na = za == null ? 0 : za;
      var nb = zb == null ? 0 : zb;
      if (na !== nb) return na < nb;
    }
    var pos = a.compareDocumentPosition(b);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return true;
    return false;
  }
  function parseGradient(bgImage) {
    if (!bgImage || bgImage === "none" || bgImage.indexOf("linear-gradient") === -1) return null;
    var toTop = /to\\s+top\\b/.test(bgImage) || /linear-gradient\\(\\s*0deg/.test(bgImage);
    var stops = [];
    var re = /rgba?\\(\\s*([\\d.]+)\\s*,\\s*([\\d.]+)\\s*,\\s*([\\d.]+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)(?:\\s+([\\d.]+)%)?/g;
    var m;
    while ((m = re.exec(bgImage))) {
      stops.push({
        color: [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])],
        pos: m[5] === undefined ? null : Number(m[5]) / 100,
      });
    }
    if (stops.length < 2) return null;
    var missing = 0;
    for (var i = 0; i < stops.length; i++) if (stops[i].pos == null) missing++;
    if (missing === stops.length) {
      for (var j = 0; j < stops.length; j++) stops[j].pos = j / (stops.length - 1);
    } else {
      if (stops[0].pos == null) stops[0].pos = 0;
      if (stops[stops.length - 1].pos == null) stops[stops.length - 1].pos = 1;
      for (var k = 1; k < stops.length - 1; k++) {
        if (stops[k].pos == null) {
          var prev = k - 1;
          var next = k + 1;
          while (next < stops.length && stops[next].pos == null) next++;
          var p = stops[prev].pos;
          var n = stops[next].pos;
          stops[k].pos = p + (n - p) * ((k - prev) / (next - prev));
        }
      }
    }
    return { toTop: toTop, stops: stops };
  }
  function sampleStops(stops, t) {
    if (t <= stops[0].pos) return stops[0].color.slice();
    if (t >= stops[stops.length - 1].pos) return stops[stops.length - 1].color.slice();
    for (var i = 1; i < stops.length; i++) {
      if (t <= stops[i].pos) {
        var a = stops[i - 1];
        var b = stops[i];
        var span = b.pos - a.pos || 1;
        var u = (t - a.pos) / span;
        return [
          a.color[0] + (b.color[0] - a.color[0]) * u,
          a.color[1] + (b.color[1] - a.color[1]) * u,
          a.color[2] + (b.color[2] - a.color[2]) * u,
          a.color[3] + (b.color[3] - a.color[3]) * u,
        ];
      }
    }
    return stops[stops.length - 1].color.slice();
  }
  function layerHasRaster(node) {
    if (node.tagName === "IMG" || node.tagName === "VIDEO" || node.tagName === "CANVAS") return true;
    if (node.querySelector && node.querySelector("img, video, canvas, picture")) return true;
    var bi = getComputedStyle(node).backgroundImage || "";
    return bi.indexOf("url(") !== -1;
  }
  function layerPaintsCss(node) {
    var s = getComputedStyle(node);
    var bg = parse(s.backgroundColor);
    if (bg && bg[3] > 0.01) return true;
    if (s.backgroundImage && s.backgroundImage !== "none") return true;
    return false;
  }
  function coveringOverlays(el) {
    var rect = el.getBoundingClientRect();
    var found = [];
    var seen = new Set();
    var node = el;
    while (node && node !== document.documentElement) {
      var parent = node.parentElement;
      if (!parent) break;
      var kids = parent.children;
      for (var i = 0; i < kids.length; i++) {
        var child = kids[i];
        if (child === node || seen.has(child)) continue;
        var cs = getComputedStyle(child);
        if (cs.position !== "absolute" && cs.position !== "fixed") continue;
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        if (Number(cs.opacity) < 0.01) continue;
        var r = child.getBoundingClientRect();
        if (overlapRatio(rect, r) < 0.9) continue;
        if (!layerPaintsCss(child) && !layerHasRaster(child)) continue;
        if (!paintsBehind(child, el)) continue;
        seen.add(child);
        found.push(child);
      }
      node = parent;
    }
    found.sort(function (a, b) {
      var pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    return found;
  }
  function compositeLayer(layer, el, acc, flags) {
    var s = getComputedStyle(layer);
    var rect = el.getBoundingClientRect();
    var overlayRect = layer.getBoundingClientRect();
    var op = Number(s.opacity);
    if (isNaN(op) || op < 0) op = 1;
    if (layerHasRaster(layer)) {
      var rasterAlpha = op;
      if (layer.tagName !== "IMG" && layer.tagName !== "VIDEO" && layer.tagName !== "CANVAS" && layer.querySelector) {
        var media = layer.querySelector("img, video, canvas");
        if (media) {
          var mop = Number(getComputedStyle(media).opacity);
          if (!isNaN(mop) && mop >= 0) rasterAlpha = op * mop;
        }
      }
      if (rasterAlpha >= 0.5) {
        acc = VELLUM.slice();
        flags.usedRaster = true;
      } else if (rasterAlpha > 0.01) {
        acc = over([VELLUM[0], VELLUM[1], VELLUM[2], rasterAlpha], acc.concat([1]));
      }
    }
    var bg = parse(s.backgroundColor);
    if (bg && bg[3] * op > 0.01) {
      acc = over([bg[0], bg[1], bg[2], bg[3] * op], acc.concat([1]));
      if (flags.usedRaster) flags.paintedCssOverRaster = true;
    }
    var grad = parseGradient(s.backgroundImage);
    if (grad) {
      var h = overlayRect.height || 1;
      var visualT = (rect.top + rect.height / 2 - overlayRect.top) / h;
      if (visualT < 0) visualT = 0;
      if (visualT > 1) visualT = 1;
      var t = grad.toTop ? 1 - visualT : visualT;
      var stop = sampleStops(grad.stops, t);
      stop[3] *= op;
      if (stop[3] > 0.01) {
        acc = over(stop, acc.concat([1]));
        if (flags.usedRaster) flags.paintedCssOverRaster = true;
      }
    }
    return acc;
  }
  var bodyBg = parse(getComputedStyle(document.body).backgroundColor) || [250, 247, 242, 1];
  var pageOpaque = [bodyBg[0], bodyBg[1], bodyBg[2]];
  var VELLUM = [242, 237, 228];
  function effectiveBg(el) {
    var flags = { usedRaster: false, paintedCssOverRaster: false, opaqueCssSurface: false };
    var acc = pageOpaque.slice();
    var overlays = coveringOverlays(el);
    for (var i = 0; i < overlays.length; i++) {
      acc = compositeLayer(overlays[i], el, acc, flags);
    }
    var node = el;
    var stack = [];
    while (node && node !== document.documentElement) {
      var isOverlayHost = false;
      for (var h = 0; h < overlays.length; h++) {
        if (overlays[h].parentElement === node) { isOverlayHost = true; break; }
      }
      if (isOverlayHost) break;
      var bg = parse(getComputedStyle(node).backgroundColor);
      if (bg && bg[3] > 0) stack.push(bg);
      node = node.parentElement;
    }
    for (var j = stack.length - 1; j >= 0; j--) {
      var layer = stack[j];
      acc = over(layer, acc.concat([1]));
      if (layer[3] >= 0.95) flags.opaqueCssSurface = true;
    }
    var unverifiable = flags.usedRaster && !flags.paintedCssOverRaster && !flags.opaqueCssSurface;
    return {
      rgb: acc,
      unverifiable: unverifiable,
      reason: unverifiable ? "raster backdrop with no computable CSS overlay" : "",
    };
  }
  function cssPath(el) {
    var parts = [];
    var node = el;
    while (node && node !== document.body && parts.length < 4) {
      var id = node.id ? "#" + node.id : "";
      var cls = node.className && typeof node.className === "string"
        ? "." + node.className.trim().split(/\\s+/).slice(0, 2).join(".")
        : "";
      parts.unshift(node.tagName.toLowerCase() + id + cls);
      node = node.parentElement;
    }
    return parts.join(" > ");
  }
  var out = [];
  var seen = new Set();
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  while (walker.nextNode()) {
    var el = walker.currentNode;
    if (!(el instanceof HTMLElement)) continue;
    var style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") continue;
    var rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    if (rect.bottom < 0 || rect.top > (window.innerHeight || 0) + 4000) continue;
    var own = Array.from(el.childNodes)
      .filter(function (n) { return n.nodeType === Node.TEXT_NODE; })
      .map(function (n) { return (n.textContent || "").replace(/\\s+/g, " ").trim(); })
      .filter(Boolean)
      .join(" ");
    if (!own) continue;
    var color = parse(style.color);
    if (!color) continue;
    var measured = effectiveBg(el);
    var bg = measured.rgb;
    var painted = color[3] < 1 ? over(color, bg.concat([1])) : [color[0], color[1], color[2]];
    var l1 = lum(painted);
    var l2 = lum(bg);
    var ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    var size = parseFloat(style.fontSize);
    var weight = parseInt(style.fontWeight, 10) || 400;
    var large = size >= 24 || (size >= 18.66 && weight >= 700);
    var min = large ? 3 : 4.5;
    var key = cssPath(el) + "|" + own.slice(0, 40) + "|" + ratio.toFixed(2);
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
      unverifiable: measured.unverifiable,
      reason: measured.reason,
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
  const unverifiable: Unverifiable[] = [];
  let samples = 0;

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      for (const route of ROUTES) {
        const url = `${BASE}${route}`;
        const res = await page.goto(url, { waitUntil: "load", timeout: 60_000 });
        if (!res || !res.ok()) {
          console.error(`SKIP ${route} @${vp.name} — HTTP ${res?.status() ?? "no response"}`);
          continue;
        }
        // Transparent body = user-agent background (CSS not applied yet).
        // Sampling then reports default link-blue on rgb(0,0,0).
        await page.waitForFunction(() => {
          const bg = getComputedStyle(document.body).backgroundColor;
          return Boolean(bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent");
        }, undefined, { timeout: 15_000 });
        await page.waitForTimeout(200);
        const found = await samplePage(page);
        samples += found.length;
        let routeFails = 0;
        let routeUnver = 0;
        for (const s of found) {
          if (s.unverifiable) {
            routeUnver += 1;
            unverifiable.push({
              route,
              viewport: vp.name,
              text: s.text,
              selector: s.selector,
              reason: s.reason,
            });
            continue;
          }
          if (s.ratio + 1e-9 < s.min) {
            routeFails += 1;
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
        console.log(
          `${route.padEnd(28)} @${vp.name.padStart(4)}  ${String(found.length).padStart(4)} samples  ${routeFails} fail  ${routeUnver} unverifiable`,
        );
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  failures.sort((a, b) => a.ratio - b.ratio);
  const whiteOnPaper = failures.filter(
    (f) => f.fg.includes("255,255,255") && (f.bg.includes("250,246,240") || f.bg.includes("242,237,228")),
  );
  console.log(`\n${samples} text samples · ${failures.length} failures · ${unverifiable.length} unverifiable`);
  console.log(
    `summary: ${whiteOnPaper.length} white-on-paper/vellum · ${failures.filter((f) => f.ratio < 1.5).length} below 1.5:1\n`,
  );

  if (failures.length > 0) {
    console.log("failures (gating):");
    const worst = failures.slice(0, 20);
    for (const f of worst) {
      console.log(
        `  ${f.ratio.toFixed(2).padStart(5)}:1  (min ${f.min})  ${f.route} @${f.viewport}  "${f.text}"`,
      );
      console.log(`         ${f.fg} on ${f.bg}`);
      console.log(`         ${f.selector}`);
    }
    if (failures.length > 20) {
      console.log(`  … ${failures.length - 20} more failures`);
    }
  }

  if (unverifiable.length > 0) {
    console.log("\nunverifiable (non-gating, visual-review list):");
    const shown = unverifiable.slice(0, 15);
    for (const u of shown) {
      console.log(`  ${u.route} @${u.viewport}  "${u.text}"  — ${u.reason}`);
    }
    if (unverifiable.length > 15) {
      console.log(`  … ${unverifiable.length - 15} more unverifiable`);
    }
  }

  const dump = process.env.CONTRAST_JSON;
  if (dump) {
    writeFileSync(dump, JSON.stringify({ samples, failures, unverifiable }, null, 2));
    console.log(`wrote ${dump}`);
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entry) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
