# P4 / U2 — cross-lane a11y stubs

Lane U2 may only edit `scripts/check-a11y.ts`, `src/components/layout/nav/**`,
focus/label changes in `src/components/ui/`, and a11y attributes in
`src/components/workbench/**`. Everything below is stubbed around, not edited.

## `src/app/layout.tsx` — Lane E / chrome

`<main>` has no id. Skip-to-content targets `#main-content`.

**Needed:** `id="main-content"` on `<main>`. U2's `SkipLink` sets the id at
runtime if it is missing so the link works today.

## `src/components/layout/Header.tsx` — Lane E

Skip link must be the first focusable in source order. U2 portals it in front
of the React root from `HeaderSearch` because Header is not owned.

**Needed:** render `<SkipLink />` as the first child of `<header>` and drop
the portal stub.

Also: the signed-in `+` quick-actions menu has no Escape / Tab trap (same
pattern as `ExploreMenu`). `FOCUS_VISIBLE` is missing on a few utility links.

## `src/app/globals.css` — Lane E

`#64` already shortens workbench flash animations under
`prefers-reduced-motion: reduce`. U2 applied `motion-reduce:transition-none`
on owned controls only.

**Needed in globals.css:**

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .ea-wb-flash-saved,
  .ea-wb-flash-error {
    animation-duration: 1ms; /* keep animationend so the flash clears */
  }
}

.ea-skip-link:focus {
  /* Lane E owns the token file; keep the ring on --signal-live */
}
```

Do **not** zero the workbench flash to `0s` — `animationend` is what clears it.

## `src/components/CommandPalette.tsx` — not owned

cmdk already labels the dialog. Gaps U2 cannot patch:

- Escape is ignored while the query field is focused (`isTextField` early-out).
- No return-focus (there is no trigger; restore the last chrome control).
- Result count is not announced. Add `role="status" aria-live="polite"` with
  `"N results"` when `query` is non-empty.
- Focus ring still uses `--color-*` leftovers, not `--signal-live`.

## `src/components/home/ConditionsRail.tsx` — Lane F

Live CFS chips update without an announcement.

**Needed:** wrap the reading in `<span aria-live="polite">{cfs} cfs</span>`
(or one polite region for the rail). Polite, not assertive.

## `src/components/rivers/RiverConditionsCard.tsx` — Lane I

Same: gauge / weather refresh should `aria-live="polite"` the active
section's flow and temp. U2 did not touch this file.

## `src/components/search/SearchPageClient.tsx` — Lane N

Already has `role="status"` for result counts. Keep it. Header search has no
type-ahead list, so U2 did not add a second live region there.

## Pages / headings / alts — many lanes

One `h1` per page and no skipped levels is a template concern (I / J / K / L /
M / G). Axe `heading-order` / `page-has-heading-one` are **moderate**; the U2
gate fails only **serious** and **critical**.

`image-alt` on entity heroes is owned by those templates. Decorative chrome
images in U2's files use `alt=""`.

## Color contrast

Axe `color-contrast` is disabled in `check-a11y.ts`. Heroes over sibling
scrims are false positives (Part 3 verdict). Token and painted contrast stay
on `check:contrast` / `check:contrast:rendered`. Focus-indicator contrast
(3:1, both registers) is measured in the a11y script with the same
relative-luminance arithmetic.

## See Also

- [[p4-u2-wire-gate]]
- [[contrast-verdict]]

## Timeline

- 2026-08-25 | Stubs listed; skip-link and main-id applied at runtime.
