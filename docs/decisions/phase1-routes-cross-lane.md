# Phase 1 routes — cross-lane notes

**Lane:** Wave 0 / Phase 1 routes (Lane D)  
**Branch:** `cursor/phase1-routes-bd9b`

## [cross-lane] Header.tsx

Lane D did **not** edit `src/components/layout/Header.tsx` (Lane E). Please point:

- Flies boxes / inventory links at **`/flybox`** (today the Flies nav still goes to `/flies`, which now redirects logged-in users to `/flybox`)
- Favorites link (mobile user section, `href="/favorites"`) at **`/rivers/mine`**

Also still on `/journal/flies/new` in the plus menu — that path is kept (new-pattern form); not a retired fly-box surface.

## Other internal links that still hit redirects

Not edited (outside this lane's files). They work via 308 in `next.config.ts`:

- `src/app/journal/JournalClient.tsx` — `/journal/stats`, `/journal/flies`, `/favorites`
- `src/components/dashboard/CompactStatsRow.tsx` — `/dashboard/insights`, `/dashboard/analytics`, `/dashboard/hatch-reports`
- `src/components/dashboard/MyFliesWidget.tsx` — `/my-flies?...`
- `src/components/stats/RiverStatsWidget.tsx` — `/journal/stats`
- `src/app/flies/_components/FliesShell.tsx` — sub-nav still lists Workspace / Boxes / Shared (those URLs 308 to `/flybox`). Do not restyle here; Lane D left chrome alone.
- `src/app/page.tsx` — marketing CTA still uses `/my-flies?tab=workbench` (308 to `/flies/workbench` when `tab=workbench`)
