
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
