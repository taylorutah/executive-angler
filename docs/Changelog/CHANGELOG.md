
## 2026-08-28 — Phase 3 refinements: the four client rulings

All four open questions from Phase 3 ruled by the client; executed and recorded as permanent law in DESIGN.md ("Phase 3 refinements — client rulings"). Functionality frozen throughout — presentation only.

### Ruled and shipped
- **WorkbenchTable → `.ea-table` spec.** Header 10px/0.1em/bold → 12px/0.06em/500 in `--text-3`; fixed 32px rows retired for 12px vertical cell padding; zebra retired for row hover `--paper-deep` (new `.ea-wb-row:hover` rule in globals.css); header fill and `--border-strong` header rule dropped to match `.ea-table`. Keyboard map, roving tabindex, inline edit, and bulk bar untouched. One table language app-wide — journal, flybox, rivers/mine, gear, and the fly workbench (`BoxesTable`) all inherit it; no markup changes needed at any call site. Dev-styleguide mock updated to teach the new language.
- **FirstRunEmpty on tokens.** `mt-10` (40px, off-scale) → `mt-8` (32px); purpose 17px → 16px body; action wrapper `mt-5` (20px, off-scale) → `mt-4`; action link on the overline spec (12px uppercase, 0.06em — was 0.14em — 500 weight, `--accent`); example 15px → 13px metadata. Same action-class fix at the two surfaces that render their own action button (`FlyboxEmpty`, `GearLockerClient`); one off-scale 15px link in the flybox empty state → 14px. Copy, markers, and the `check-empty-states` gate behavior unchanged.
- **FilterDropdown triggers: pill → 6px.** Triggers are buttons (they open menus), not tags — `rounded-chip` → `rounded-md`. The selected-count inside the trigger stays pill (it is a badge); `FilterChip` stays pill (it is a tag). Popover behavior untouched.
- **Touch targets resolved.** 32/40/48 heights govern desktop/pointer; below 768px every interactive element enforces a 44px minimum — one non-layered `@media (max-width: 767px)` `min-height` floor in globals.css (checkboxes/radios excepted; their rows/labels carry the target). The 40px bulk bar grows to the floor via `height: auto`.

### Gate alignment
- `scripts/check-workbench-keys.ts`: the two presentation assertions updated to the new spec — "32px rows" → 12px vertical cell padding, "zebra striping" → row hover is `rgb(242,239,232)`. Every keyboard-map assertion byte-identical.

### Flagged, not touched (out of scope)
- `src/components/fly-detail/FlyVariantTable.tsx` still runs the pre-spec language (zebra, 32px rows) on fly detail pages — a candidate for the next shared-components pass.
- `GearLockerClient.tsx` `GEAR_TYPES` carries emoji glyphs — BANNED per DESIGN.md §8, pre-existing, functionality frozen here.

## 2026-08-28 — Design Phase 3: Journal feed, the reference page

### Rebuilt (journal scope only)
- `SessionCard.tsx` — the reference journal entry card, per DESIGN.md §4: date as 12px overline, water name Fraunces 20px, one chip row (`.ea-chip`: water temp / clarity / weather / flies), notes clamped to 2 lines, 4:3 graded photo thumbs (`.ea-photo` / `.ea-photo-card`). Three type sizes per card: 20 / 14 / 12.
- `JournalClient.tsx` — page header with a single h1; mobile action grid (2×2, 40px `ea-btn`); segmented view toggle; sidebar (profile card, section nav, log actions, merged import/export "Journal data" card); `.ea-empty` filtered-empty state.
- `CalendarView.tsx` — token pass: chip year toggles with `aria-pressed`, accent-heat day cells via flat `color-mix`, 96px cells, lawful empty-month copy.
- `SidebarFilters.tsx` — overline heading, card panel, token checkboxes.

### New components in globals.css
- `.ea-segmented` / `.ea-segment` / `.ea-segment-icon` — the view-toggle pattern (32px segments, `--accent-soft` active).
- `.ea-sheet` — bottom-anchored mobile modal surface (radius-card top, 80vh cap, the floating shadow).

### BANNED-list purges in journal-rendered shared components
- `FilterBar.tsx` (journal is its only consumer): backdrop-blur removed, solid `--paper`, sticky top now `--header-h` (was 56px under a 68px header).
- `TipCard.tsx`: gradient → flat `--paper-deep` panel. `tone` prop retained for API compat; both tones render identically. Affects other pages' tip cards visually — flagged.
- `FilterDropdown.tsx`: popover radius 12 → `--radius-card`, surface/border tokens.
- `JournalMapView.tsx` (journal-only): dark fallback boxes → `--paper-deep`/`--text-2`; popup hexes → palette; fish emoji → "N fish" text.

### Decisions
- Photo collage capped at 3 thumbs + solid `--ink` "+N" count chip (the one sanctioned on-photo affordance). `feed_display: collage` still yields a multi-photo card.
- Card hover is border emphasis only (`card-hover`); shadows and photo zoom stay banned.
- Fish count moved from accent pill to the meta line; species summary is one truncated tabular line when no photos exist.
- `JournalTable` / `WorkbenchTable` untouched: shared instrument table with tested keyboard map. Its 10px headers / 32px rows predate the `.ea-table` spec — open question for the client.
- `FirstRunEmpty` untouched (shared by 6 surfaces, gated by check-empty-states): its 40px top margin and 0.14em tracking are off-token — flagged for a shared-components pass.
- Dead code removed: `bestSession` (computed, never rendered), rotating accent-border map.

### Verified
- `npm run build` green; `npm test` 205/205; eslint on touched files shows only pre-existing baseline errors (TipCard/FilterDropdown `set-state-in-effect`, unchanged logic).

## 2026-03-01 — Phase 4: Supabase Data Layer

### Added
- `src/lib/db/` — 28 typed query functions across 7 entities (destinations, rivers, lodges, guides, fly-shops, species, articles)
- `src/lib/supabase/static.ts` — Cookie-free Supabase client for ISR-compatible server queries
- `src/lib/db/utils.ts` — `keysToCamel()` snake_case → camelCase transform
- `scripts/seed-supabase.ts` — Idempotent data seeder (upserts on slug)
- `supabase/migration-text-ids.sql` — Schema migration (UUID → TEXT PKs for all content tables)
- 14 `loading.tsx` skeleton files with animate-pulse on all list + detail pages

### Changed
- All 17 pages now use DB query functions with `Promise.all` for parallel fetching
- ISR revalidation added: homepage 1800s, list pages 3600s, detail pages 86400s, sitemap 86400s
- `generateStaticParams` on all detail pages fetches slugs from Supabase at build time
- Static TypeScript data files kept as automatic fallback — site never breaks if Supabase is down

### Architecture Decision
Used `createStaticClient` (anon key, no cookies) instead of SSR cookie-based client to keep all pages statically renderable with ISR. All content tables have `RLS: select using (true)` so no auth needed for reads.

### Build Result
- 234 pages generated successfully
- List pages: ○ (Static) with 1h ISR
- Detail pages: ● (SSG) with 1h ISR  
- Build passes clean, zero TypeScript errors
