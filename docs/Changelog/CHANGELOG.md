
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
