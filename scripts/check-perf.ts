/**
 * Program 4 U1 performance gate.
 *
 *   npx tsx scripts/check-perf.ts --measure [out.json]
 *   npx tsx scripts/check-perf.ts [report.json]
 *
 * Measure needs a running production server (npm run build && npm start)
 * at BASE_URL (default http://localhost:3000). Check mode reads a committed
 * report and compares it to docs/audits/perf-baseline-2026-08-25.json.
 *
 * Prints `page-loads: N / 9` and exits 1 if the count is under 9, if a
 * budgeted mobile load misses LCP/CLS/INP, or if any load regresses past
 * the floors (LCP +10%, CLS +0.02, TBT +15%).
 */

import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { chromium, type Browser, type Page } from "playwright";

const ROOT = process.cwd();
const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PAGE_LOAD_FLOOR = 9;
const BASELINE_PATH = join(ROOT, "docs/audits/perf-baseline-2026-08-25.json");
const DEFAULT_AFTER = join(ROOT, "docs/audits/perf-after.json");

const BUDGETS = {
  lcpMs: 2000,
  cls: 0.05,
  inpMs: 200,
} as const;

const FLOORS = {
  lcpPct: 0.1,
  clsAbs: 0.02,
  tbtPct: 0.15,
} as const;

const BUDGET_ROUTES = new Set(["/", "/rivers", "/rivers/madison-river", "/flies/library"]);

export type PerfPageLoad = {
  id: string;
  route: string;
  viewport: number;
  throttled: boolean;
  register: "daylight" | "dusk";
  lcpMs: number;
  cls: number;
  inpMs: number;
  tbtMs: number;
  fcpMs: number;
  jsTransferredBytes: number;
  lcpElement: string;
};

export type PerfReport = {
  generatedAt: string;
  baseUrl: string;
  pageLoadCount: number;
  pageLoadFloor: number;
  budgets: typeof BUDGETS;
  regressionFloors: typeof FLOORS;
  pageLoads: PerfPageLoad[];
  bundles: Record<string, { firstLoadJsBytes: number; chunkCount: number }>;
  lazy: {
    mapboxRequestedBeforeScroll: boolean;
    mapboxRequestedAfterScroll: boolean;
    flowChartRequestedBeforeScroll: boolean;
    flowChartRequestedAfterScroll: boolean;
    notes: string;
  };
  fonts: {
    frauncesBytes: number;
    newsreaderBytes: number;
    archivoBytes: number;
    ibmPlexMonoBytes: number;
    recommendation: string;
  };
};

const PAGE_LOADS: Array<{
  id: string;
  route: string;
  viewport: number;
  throttled: boolean;
  register: "daylight" | "dusk";
}> = [
  { id: "home-390", route: "/", viewport: 390, throttled: true, register: "daylight" },
  { id: "home-1440", route: "/", viewport: 1440, throttled: false, register: "daylight" },
  { id: "rivers-390", route: "/rivers", viewport: 390, throttled: true, register: "daylight" },
  { id: "rivers-1440", route: "/rivers", viewport: 1440, throttled: false, register: "daylight" },
  { id: "madison-390", route: "/rivers/madison-river", viewport: 390, throttled: true, register: "daylight" },
  { id: "madison-1440", route: "/rivers/madison-river", viewport: 1440, throttled: false, register: "daylight" },
  { id: "flies-390", route: "/flies/library", viewport: 390, throttled: true, register: "daylight" },
  { id: "flies-1440", route: "/flies/library", viewport: 1440, throttled: false, register: "daylight" },
  { id: "nz-390", route: "/destinations/new-zealand", viewport: 390, throttled: true, register: "daylight" },
  { id: "home-dusk-390", route: "/", viewport: 390, throttled: true, register: "dusk" },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function walkFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(p, out);
    else if (entry.isFile()) out.push(p);
  }
  return out;
}

function htmlForRoute(route: string): string | null {
  const rel = route === "/" ? "index.html" : `${route.replace(/^\//, "")}.html`;
  const candidates = [
    join(ROOT, ".next/server/app", rel),
    join(ROOT, ".next/server/app", route === "/" ? "page.html" : `${route.replace(/^\//, "")}/page.html`),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

function collectBundles(): PerfReport["bundles"] {
  const staticDir = join(ROOT, ".next/static");
  const files = walkFiles(staticDir).filter((f) => f.endsWith(".js"));
  const byName = new Map(files.map((f) => [f.split("/").pop() ?? f, f]));
  const totalJs = files.reduce((sum, f) => sum + statSync(f).size, 0);

  const bundles: PerfReport["bundles"] = {
    "_all-static-js": { firstLoadJsBytes: totalJs, chunkCount: files.length },
  };

  const routes = ["/", "/rivers", "/rivers/madison-river", "/flies/library", "/destinations/new-zealand"];
  for (const route of routes) {
    const htmlPath = htmlForRoute(route);
    if (!htmlPath) continue;
    const html = readFileSync(htmlPath, "utf8");
    const srcs = [...html.matchAll(/\/_next\/static\/[^"' ]+\.js/g)].map((m) => m[0]);
    const unique = [...new Set(srcs)];
    let bytes = 0;
    let count = 0;
    for (const src of unique) {
      const name = src.split("/").pop() ?? "";
      const onDisk = join(ROOT, ".next", src.replace(/^\/_next\//, ""));
      const file = existsSync(onDisk) ? onDisk : byName.get(name);
      if (!file) continue;
      bytes += statSync(file).size;
      count += 1;
    }
    bundles[route] = { firstLoadJsBytes: bytes, chunkCount: count };
  }

  const manifestPath = join(ROOT, ".next/app-build-manifest.json");
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      pages?: Record<string, string[]>;
    };
    for (const [route, chunks] of Object.entries(manifest.pages ?? {})) {
      if (bundles[route]) continue;
      let bytes = 0;
      let count = 0;
      for (const chunk of chunks) {
        const abs = chunk.startsWith(".next/") ? join(ROOT, chunk) : join(ROOT, ".next", chunk);
        const file = existsSync(abs) ? abs : byName.get(chunk.split("/").pop() ?? "");
        if (!file || !file.endsWith(".js")) continue;
        bytes += statSync(file).size;
        count += 1;
      }
      bundles[route] = { firstLoadJsBytes: bytes, chunkCount: count };
    }
  }
  return bundles;
}

const COLLECT_VITALS = `(() => {
  const state = {
    lcp: 0,
    lcpElement: "",
    cls: 0,
    tbt: 0,
    fcp: 0,
    inp: 0,
  };
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (!last) return;
      state.lcp = last.startTime;
      const el = last.element;
      state.lcpElement = el ? (el.tagName + (el.getAttribute("alt") ? ":" + el.getAttribute("alt").slice(0, 48) : "")) : last.url || "unknown";
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) state.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        state.tbt += Math.max(0, entry.duration - 50);
      }
    }).observe({ type: "longtask", buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const delay = typeof entry.processingStart === "number"
          ? entry.processingStart - entry.startTime + Math.max(0, (entry.processingEnd || 0) - entry.processingStart)
          : entry.duration;
        if (delay > state.inp) state.inp = delay;
      }
    }).observe({ type: "event", buffered: true, durationThreshold: 0 });
  } catch (e) {}
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const delay = entry.processingStart - entry.startTime;
        if (delay > state.inp) state.inp = delay;
      }
    }).observe({ type: "first-input", buffered: true });
  } catch (e) {}
  window.__eaPerf = state;
})()`;

const WAIT_FONTS_AND_IMAGES = `(() => Promise.race([
  Promise.all([
    document.fonts.ready,
    Promise.all([].slice.call(document.images).map(function(img) {
      return img.complete ? Promise.resolve() : new Promise(function(r) {
        img.onload = img.onerror = function() { r(null); };
      });
    }))
  ]),
  new Promise(function(r) { setTimeout(r, 8000); })
]))()`;

const READ_VITALS = `(() => {
  var s = window.__eaPerf || {};
  var paints = performance.getEntriesByType("paint");
  var fcpEntry = paints.filter(function(p) { return p.name === "first-contentful-paint"; })[0];
  var resources = performance.getEntriesByType("resource");
  var jsBytes = 0;
  var i;
  for (i = 0; i < resources.length; i++) {
    var r = resources[i];
    if (r.name.indexOf("/_next/static") !== -1 && r.name.indexOf(".js") !== -1) {
      jsBytes += r.transferSize || r.encodedBodySize || 0;
    }
  }
  var css = "";
  for (i = 0; i < document.styleSheets.length; i++) {
    try {
      var rules = document.styleSheets[i].cssRules;
      for (var j = 0; j < rules.length; j++) css += rules[j].cssText + "\\n";
    } catch (e) {}
  }
  var fontBytes = { fraunces: 0, newsreader: 0, archivo: 0, ibmPlexMono: 0 };
  for (i = 0; i < resources.length; i++) {
    var fr = resources[i];
    if (fr.name.indexOf(".woff") === -1) continue;
    var file = fr.name.split("/").pop() || "";
    var blocks = css.split("}");
    var fam = "";
    for (var b = 0; b < blocks.length; b++) {
      if (blocks[b].indexOf(file) !== -1) {
        var m = blocks[b].match(/font-family:\\s*([^;]+)/i);
        if (m) fam = m[1].replace(/['"]/g, "").toLowerCase();
        break;
      }
    }
    var bytes = fr.transferSize || fr.encodedBodySize || 0;
    if (fam.indexOf("newsreader") !== -1) fontBytes.newsreader += bytes;
    else if (fam.indexOf("fraunces") !== -1) fontBytes.fraunces += bytes;
    else if (fam.indexOf("archivo") !== -1) fontBytes.archivo += bytes;
    else if (fam.indexOf("plex") !== -1 || fam.indexOf("ibm") !== -1) fontBytes.ibmPlexMono += bytes;
  }
  return {
    lcp: s.lcp || 0,
    lcpElement: s.lcpElement || "",
    cls: s.cls || 0,
    tbt: s.tbt || 0,
    fcp: s.fcp || (fcpEntry ? fcpEntry.startTime : 0),
    inp: s.inp || 0,
    jsBytes: jsBytes,
    fontBytes: fontBytes
  };
})()`;

const HAS_MAP_DOM = `!!document.querySelector(".mapboxgl-map, canvas.mapboxgl-canvas")`;

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE, { redirect: "manual" });
      if (res.status > 0) return;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw new Error(`No server at ${BASE}. Start with: npm run build && npm start`);
}

function isMapboxUrl(url: string): boolean {
  return /mapbox\.com|mapbox-gl/i.test(url);
}

function isFlowChartUrl(url: string): boolean {
  return /\/api\/river-history|waterservices\.usgs\.gov/i.test(url);
}

async function measureOne(
  browser: Browser,
  spec: (typeof PAGE_LOADS)[number],
): Promise<{ load: PerfPageLoad; fonts: Record<string, number>; requested: string[] }> {
  const height = spec.viewport <= 400 ? 844 : 900;
  const context = await browser.newContext({
    viewport: { width: spec.viewport, height },
    deviceScaleFactor: spec.viewport <= 400 ? 2 : 1,
    isMobile: spec.viewport <= 400,
    hasTouch: spec.viewport <= 400,
    userAgent:
      spec.viewport <= 400
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  await client.send("Network.enable");

  if (spec.throttled) {
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: Math.floor((1.6 * 1024 * 1024) / 8),
      uploadThroughput: Math.floor((750 * 1024) / 8),
      connectionType: "cellular4g",
    });
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }

  if (spec.register === "dusk") {
    await page.addInitScript(() => {
      document.documentElement.setAttribute("data-register", "dusk");
    });
  }

  await page.addInitScript(COLLECT_VITALS);

  const requested: string[] = [];
  page.on("request", (req) => {
    requested.push(req.url());
  });

  await page.goto(`${BASE}${spec.route}`, { waitUntil: "load", timeout: 120_000 });
  await page.evaluate(WAIT_FONTS_AND_IMAGES).catch(() => undefined);
  await sleep(spec.throttled ? 4000 : 1500);

  await interactForInp(page, spec.viewport);
  await sleep(600);

  const vitals = (await page.evaluate(READ_VITALS)) as {
    lcp: number;
    lcpElement: string;
    cls: number;
    tbt: number;
    fcp: number;
    inp: number;
    jsBytes: number;
    fontBytes: { fraunces: number; newsreader: number; archivo: number; ibmPlexMono: number };
  };

  await context.close();

  return {
    load: {
      id: spec.id,
      route: spec.route,
      viewport: spec.viewport,
      throttled: spec.throttled,
      register: spec.register,
      lcpMs: Math.round(vitals.lcp),
      cls: Number(vitals.cls.toFixed(4)),
      inpMs: Math.round(vitals.inp),
      tbtMs: Math.round(vitals.tbt),
      fcpMs: Math.round(vitals.fcp),
      jsTransferredBytes: vitals.jsBytes,
      lcpElement: vitals.lcpElement,
    },
    fonts: vitals.fontBytes,
    requested,
  };
}

async function interactForInp(page: Page, viewport: number): Promise<void> {
  const search = page.locator("input[type='search'], input[name='q'], input[placeholder]").first();
  if (await search.count()) {
    await search.click({ timeout: 3000 }).catch(() => undefined);
    await search.press("a").catch(() => undefined);
    return;
  }
  const button = page.locator("button").first();
  if (await button.count()) {
    await button.click({ timeout: 3000, noWaitAfter: true }).catch(() => undefined);
    return;
  }
  await page.mouse.click(Math.min(180, viewport - 24), 72);
}

async function measureLazy(browser: Browser): Promise<PerfReport["lazy"]> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const requested: string[] = [];
  page.on("request", (req) => requested.push(req.url()));

  await page.goto(`${BASE}/rivers/madison-river`, {
    waitUntil: "load",
    timeout: 90_000,
  });
  await sleep(2500);

  const before = [...requested];
  const mapboxBefore = before.some(isMapboxUrl);
  const flowBefore = before.some(isFlowChartUrl);
  const mapDomBefore = Boolean(await page.evaluate(HAS_MAP_DOM));

  await page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
  await sleep(3000);

  const after = requested.slice(before.length);
  const mapboxAfter = after.some(isMapboxUrl);
  const flowAfter = after.some(isFlowChartUrl);
  const mapDomAfter = Boolean(await page.evaluate(HAS_MAP_DOM));

  await context.close();

  const notes = [
    mapboxBefore || mapDomBefore
      ? "Mapbox URL or .mapboxgl-map present before scroll — LazyMapView is not deferring."
      : mapboxAfter || mapDomAfter
        ? "Mapbox appeared only after scroll — LazyMapView defers."
        : "Mapbox never requested (token missing or chunk hashed). DOM map after scroll: " +
          String(mapDomAfter) +
          ".",
    flowBefore
      ? "/api/river-history requested before scroll — LazyFlowChart is in the first viewport margin."
      : flowAfter
        ? "/api/river-history requested after scroll — LazyFlowChart defers."
        : "No river-history request observed.",
  ].join(" ");

  return {
    mapboxRequestedBeforeScroll: mapboxBefore || mapDomBefore,
    mapboxRequestedAfterScroll: mapboxAfter || mapDomAfter || mapboxBefore || mapDomBefore,
    flowChartRequestedBeforeScroll: flowBefore,
    flowChartRequestedAfterScroll: flowAfter || flowBefore,
    notes,
  };
}

function fontRecommendation(fonts: PerfReport["fonts"]): string {
  const nr = fonts.newsreaderBytes;
  if (nr === 0) {
    return "Newsreader did not appear as a named font response on the measured routes; keep next/font subset + display:swap. Do not drop it — font-census allows Newsreader on homepage desk P.leading-relaxed and .prose / .article-body.";
  }
  return `Newsreader transferred ${nr} bytes. Keep the face (census requires it on desk essays / prose). Prefer subset + display:swap; do not drop the family.`;
}

async function measure(outPath: string): Promise<PerfReport> {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  const pageLoads: PerfPageLoad[] = [];
  const fontSum = { frauncesBytes: 0, newsreaderBytes: 0, archivoBytes: 0, ibmPlexMonoBytes: 0 };

  try {
    for (const spec of PAGE_LOADS) {
      process.stdout.write(`measuring ${spec.id} ${spec.route} @${spec.viewport}… `);
      const { load, fonts } = await measureOne(browser, spec);
      pageLoads.push(load);
      fontSum.frauncesBytes += fonts.fraunces;
      fontSum.newsreaderBytes += fonts.newsreader;
      fontSum.archivoBytes += fonts.archivo;
      fontSum.ibmPlexMonoBytes += fonts.ibmPlexMono;
      console.log(
        `LCP=${load.lcpMs}ms CLS=${load.cls} INP=${load.inpMs}ms TBT=${load.tbtMs}ms JS=${load.jsTransferredBytes}`,
      );
    }

    const lazy = await measureLazy(browser);
    const fonts = {
      ...fontSum,
      recommendation: "",
    };
    fonts.recommendation = fontRecommendation(fonts);

    const report: PerfReport = {
      generatedAt: new Date().toISOString(),
      baseUrl: BASE,
      pageLoadCount: pageLoads.length,
      pageLoadFloor: PAGE_LOAD_FLOOR,
      budgets: BUDGETS,
      regressionFloors: FLOORS,
      pageLoads,
      bundles: collectBundles(),
      lazy,
      fonts,
    };
    writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`wrote ${relative(ROOT, outPath)}`);
    return report;
  } finally {
    await browser.close();
  }
}

function loadReport(path: string): PerfReport {
  if (!existsSync(path)) {
    throw new Error(`Missing report: ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf8")) as PerfReport;
}

function check(report: PerfReport, baseline: PerfReport | null): number {
  const n = report.pageLoads?.length ?? 0;
  console.log(`page-loads: ${n} / ${PAGE_LOAD_FLOOR}`);
  const failures: string[] = [];

  if (n < PAGE_LOAD_FLOOR) {
    failures.push(`page-load count ${n} is under the floor of ${PAGE_LOAD_FLOOR}`);
  }

  for (const load of report.pageLoads ?? []) {
    const budgeted = load.throttled && BUDGET_ROUTES.has(load.route);
    if (!budgeted) continue;
    if (load.lcpMs > BUDGETS.lcpMs) {
      failures.push(`${load.id} LCP ${load.lcpMs}ms exceeds budget ${BUDGETS.lcpMs}ms`);
    }
    if (load.cls > BUDGETS.cls) {
      failures.push(`${load.id} CLS ${load.cls} exceeds budget ${BUDGETS.cls}`);
    }
    if (load.inpMs > BUDGETS.inpMs) {
      failures.push(`${load.id} INP ${load.inpMs}ms exceeds budget ${BUDGETS.inpMs}ms`);
    }
  }

  if (baseline) {
    const byId = new Map(baseline.pageLoads.map((p) => [p.id, p]));
    for (const load of report.pageLoads ?? []) {
      const prev = byId.get(load.id);
      if (!prev) continue;
      const lcpCeil = prev.lcpMs * (1 + FLOORS.lcpPct);
      const clsCeil = prev.cls + FLOORS.clsAbs;
      const tbtCeil = prev.tbtMs * (1 + FLOORS.tbtPct);
      if (load.lcpMs > lcpCeil + 1) {
        failures.push(
          `${load.id} LCP ${load.lcpMs}ms exceeds baseline ${prev.lcpMs}ms + 10% (${Math.round(lcpCeil)}ms)`,
        );
      }
      if (load.cls > clsCeil + 0.0001) {
        failures.push(`${load.id} CLS ${load.cls} exceeds baseline ${prev.cls} + 0.02 (${clsCeil.toFixed(4)})`);
      }
      if (prev.tbtMs > 0 && load.tbtMs > tbtCeil + 1) {
        failures.push(
          `${load.id} TBT ${load.tbtMs}ms exceeds baseline ${prev.tbtMs}ms + 15% (${Math.round(tbtCeil)}ms)`,
        );
      }
    }
  } else {
    console.log("no baseline at docs/audits/perf-baseline-2026-08-25.json — regression floors skipped");
  }

  if (failures.length) {
    console.error(`FAIL ${failures.length} check(s):`);
    for (const f of failures) console.error(`  - ${f}`);
    return 1;
  }
  console.log("PASS");
  return 0;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const measureIdx = args.indexOf("--measure");
  if (measureIdx >= 0) {
    const out = args[measureIdx + 1] && !args[measureIdx + 1].startsWith("-")
      ? args[measureIdx + 1]
      : DEFAULT_AFTER;
    const report = await measure(out);
    const baseline = existsSync(BASELINE_PATH) && out !== BASELINE_PATH ? loadReport(BASELINE_PATH) : null;
    const code = check(report, baseline);
    process.exit(code);
  }

  const reportPath = args.find((a) => !a.startsWith("-")) ?? DEFAULT_AFTER;
  const report = loadReport(reportPath);
  const baseline = existsSync(BASELINE_PATH) && reportPath !== BASELINE_PATH ? loadReport(BASELINE_PATH) : null;
  process.exit(check(report, baseline));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
