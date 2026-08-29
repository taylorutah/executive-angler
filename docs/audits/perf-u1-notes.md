# U1 performance notes — 2026-08-25

Measured against `npm run build && npm start` in `/tmp/ea-u1`. Playwright Chromium, Slow 4G + 4× CPU at 390, unthrottled at 1440.

## Page-loads: 10 / 9

| id | LCP ms (before → after) | CLS | INP ms | TBT ms | JS transferred |
|---|---|---|---|---|---|
| home-390 | 3484 → **2324** | 0.0695 | 1023 | 226 | 489 KB |
| home-1440 | 888 → **756** | 0.0015 | 2 | 10 | 498 KB |
| rivers-390 | 1272 → **1016** | 0.44 | 823 | 183 | 302 KB |
| rivers-1440 | 488 → 404 | 0.5115 | 1 | 0 | 496 KB |
| madison-390 | 2968 → **2128** | 0.1991 | 936 | 243 | 455 KB |
| madison-1440 | 132 → 120 | **0.289 → 0.141** | 5 | 5 | 528 KB |
| flies-390 | 1248 → **1004** | 0.4479 | 822 | 155 | 306 KB |
| flies-1440 | 312 → 248 | 0.5564 | 2 | 0 | 315 KB |
| nz-390 | 4736 → **3864** | 0 | 943 | 181 | 373 KB |
| home-dusk-390 | 3424 → **2540** | 0.0695 | 973 | 177 | 489 KB |

## Bundles (HTML-referenced JS on disk)

| route | bytes |
|---|---|
| /rivers | 1,103,488 |
| /rivers/madison-river | 1,523,767 |
| /flies/library | 1,094,080 |
| /destinations/new-zealand | 1,144,537 |
| all static JS | 4,732,693 |

## Lazy widgets

- **LazyFlowChart:** `/api/river-history` was requested **before scroll** on the baseline (rootMargin 240px pulled the dusk-band chart into the first paint). After: requested **only after scroll**. Saving: chart JS + history fetch off LCP.
- **LazyMapView:** Mapbox tiles never requested (no token in this environment). The GL module is now `import()`'d only after intersection instead of a static import.

## Fonts

Six woff2 files (~456 KB) were preloaded on every route, including Newsreader italic (147 KB) unused on most first paints. After: only Fraunces + Archivo preload. Newsreader stays `latin` + `display:swap` + `preload: false` (font-census still requires it on homepage desk `P.leading-relaxed` and `.prose` / `.article-body`). IBM Plex Mono same.

## U2

Inspected `cursor/p4-u2-3c0f` @ `7db12ba`. Skip-link + focus-ring/ARIA on chrome we do not own. Not merged. No third remasure; skip-link is focus-only and should not move LCP.

## Remaining budget misses

See `remainingMisses` in `perf-after.json`. `scripts/check-perf.ts` exits 1 on them.

## 2026-08-26 landing remasure (not a pass)

Re-ran `--measure` on the rebased tree. LCP elements were `H1`/`P`, fonts transferred 0 bytes, CLS 0. That is not the hero-photograph LCP the budget is about. Kept `perf-after.json` (IMG LCP, real CLS). Thresholds not widened.
