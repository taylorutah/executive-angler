---
type: concept
title: "Part 3 Contrast Verdict"
project: executive-angler
updated: 2026-08-24
tags: [ea, website, a11y, contrast, validation]
---

# Part 3 — contrast verdict: do NOT repaint the worst-10

**Validation of PR #25 / #26, 2026-08-24.** Both PRs are correct and should merge. This document overrides the "fix all 99 / 1,446" instruction in Build Brief II Lane S2.

## The finding

`scripts/check-contrast-rendered.ts` resolves an element's background by walking `parentElement` for `backgroundColor` only (lines 81–112). It has **no concept of sibling overlay layers or `<img>` backdrops.**

Every hero title on this site is painted over a full-bleed photo plus an absolutely-positioned scrim that is a **sibling**, not an ancestor. The checker therefore resolves those titles to `bodyBg` (paper `#FAF6F0`) and reports 1.08:1.

**All ten of the "worst 10" are this pattern.** They are false positives.

## The arithmetic

`.hero-overlay` is `linear-gradient(rgba(15,43,31,0.3) 0%, 0.5 40%, 0.8 100%)`, painted unconditionally. Worst realistic case is a failed image showing `PlateFallback` (Vellum `#F2EDE4`) behind it:

| Position in hero | Scrim alpha | Composited | White text |
|---|---|---|---|
| top | 0.30 | `rgb(174,179,169)` | **2.14:1 — fails** |
| 40% | 0.50 | `rgb(128,140,130)` | **3.50:1 — fails small text** |
| bottom | 0.80 | `rgb(60,82,70)` | **8.45:1 — passes** |

`HeroSection` renders its `h1` and subtitle with `items-end` + `pb-12`, i.e. in the 0.8 band. **They pass even when the photo never loads.** Repainting them to ink-on-paper would make the site worse — dark text over a dark scrim over a photo.

## What IS real

1. **Photo-credit chips.** `text-white/50` on `bg-black/40` composites to ~3.26:1 *before* the text alpha is applied — at 10px. Real failure. `HeroSection` lines 71/77, `RiverHeroImage`, `HeroCompact`.
2. **Anything rendered in the top 40% of a hero** where the scrim is ≤0.5 alpha and the image may not load. Audit by position, not by class name.
3. `/rivers` list `h1` — Cursor flagged it as still `text-white`. Needs the positional check: if it sits in the 0.8 band it is fine; if not, it is real.

## The corrected Part 3

**Fix the checker first, then re-measure.** Three changes:

1. **Composite sibling layers.** For each candidate, find the nearest positioned ancestor, then composite any absolutely-positioned sibling that covers ≥90% of it and paints (background colour, background image, or contains an `<img>`), in DOM order, before computing the ratio.
2. **Bucket what it cannot verify** as `unverifiable` rather than `fail` — anything backed by a raster image whose pixels it cannot sample. Report the two buckets separately. `unverifiable` should not gate CI; it should generate a visual-review list.
3. **Sample the gradient at the element's actual vertical position**, not at a single stop. That is what separates the 2.14:1 case from the 8.45:1 case.

Then re-run. Expect the real number to land in the low dozens, not 1,446.

**Do not gate CI on the current checker output.** It will block every PR on failures that are not failures, and the team will learn to bypass it — which costs more than having no checker.

## Also confirmed in validation

- **PR #25 font binding is exactly right.** `--font-body` → Newsreader, `body` → `--font-ui` (Archivo), `.prose` added, Mapbox popup moved to UI. Census confirms Archivo dominant, Fraunces headings-only, Newsreader confined to `.article-body`.
- **`data-register` is not hardcoded** — `REGISTER_BOOTSTRAP` in `src/lib/register.ts` sets dusk/daylight from the pathname before paint. The route map matches the spec.
- **PR #26 `SafeEntityImage`** correctly gates the scrim on `onLoad` and falls back to `PlateFallback` on `failed`. This is the right shape.
- **Shared 8×8 vellum LQIP over per-image blur hashes** — correct call given `/images/rivers/*` is absent from the checkout; build-time hashes would have been wrong on preview.

## Open items not in either PR

- `SITE_DESCRIPTION` still reads "The definitive fly fishing resource…"; `package.json` description still says "intelligence platform". Both are banned copy (Brand Bible v3.1 §6). Copy lane.
- Leftover `PRO` pills in `PersonalFlowOverlay` and `BestWindowCalculator` — there is no paid tier.
- 124 of 126 fly hero macros are stored 3:2, not 1:1 cutouts. Reported, not fixed.
- 9 dead Wikimedia species images (Phase 0 sampled these as OK — the sample missed them).

## See Also
- [[EA-Build-Brief-II-2026-08-24]] — this supersedes Lane S2's "fix all 99"
- [[Website-Design-Review-2026-08-23]] — the design spec
- [[Brand-Bible-v3.1]] — banned copy list

## Timeline

- **2026-08-24** | Validation of PR #25/#26. Worst-10 contrast failures identified as checker false positives; Part 3 rescoped from "repaint headings" to "fix the checker, then re-measure".
