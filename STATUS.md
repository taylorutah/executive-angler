# Executive Angler — Project Status

**Last updated:** 2026-03-01
**Current state:** Phase 4 complete — Supabase data layer, ISR caching, loading skeletons

## Live URLs
- **Production:** https://executiveangler.com (Vercel)
- **Supabase:** https://qlasxtfbodyxbcuchvxz.supabase.co
- **Repo:** https://github.com/taylorutah/executive-angler (branch: `main`)
- **Vercel Dashboard:** Project `executive-angler` under team `team_ysAhFGCZzRV2KEBFc1choVyX`

## What's Working

### Pages (234 pages, all live with ISR)
| Route | Count | Status |
|-------|-------|--------|
| `/` | 1 | Homepage — ISR 1800s |
| `/destinations` | 1 list + 30 detail | ISR 3600s / 86400s |
| `/rivers` | 1 list + 41 detail | ISR 3600s / 86400s |
| `/species` | 1 list + 35 detail | ISR 3600s / 86400s |
| `/lodges` | 1 list + 32 detail | ISR 3600s / 86400s |
| `/guides` | 1 list + 31 detail | ISR 3600s / 86400s |
| `/fly-shops` | 1 list + 27 detail | ISR 3600s / 86400s |
| `/articles` | 1 list + 16 detail | ISR 3600s / 86400s |
| `/search` | 1 | Cmd+K full-text search |
| `/about`, `/contact`, `/privacy`, `/terms` | 4 | Static |
| `/login`, `/signup`, `/favorites` | 3 | Auth pages |
| `/admin/photos` | 1 | Photo moderation |

### Data Architecture
- **src/lib/db/** — 28 typed query functions across 7 entities
- **Cookie-free Supabase client** (createStaticClient) for ISR-compatible queries
- **Static data fallback** on every query — site never breaks if Supabase is down
- **ISR revalidation:** list pages 1h, detail pages 24h, homepage 30min, sitemap 24h
- **14 loading.tsx skeletons** with animate-pulse on all list + detail pages
- **scripts/seed-supabase.ts** — idempotent seeder (run once after DB migration)
- **supabase/migration-text-ids.sql** — schema migration (UUID → TEXT PKs)

### Features Working
- [x] Supabase data layer with typed query functions and static fallbacks
- [x] ISR caching on all 234 pages
- [x] Loading skeleton UI on all list + detail pages
- [x] Full static site generation — all pages pre-rendered
- [x] Responsive design — mobile nav, card grids, hero sections
- [x] Mapbox interactive maps on river + destination pages
- [x] Schema.org structured data on every entity page
- [x] Dynamic sitemap with all URLs
- [x] robots.txt and llms.txt
- [x] Full-text search with Cmd+K shortcut
- [x] Supabase Auth — email/password signup and login
- [x] User favorites system
- [x] Photo submission form (UI built, requires Storage bucket)
- [x] Google Reviews component (empty state — no API key)
- [x] Photo moderation admin dashboard
- [x] All 16 articles with structured HTML layout (tables, callouts, bullets)
- [x] Species images from Wikimedia Commons (public domain)

## ⚠️ To Activate Supabase as Live Data Source

Two steps required (Taylor does these):

1. **Run DB migration** — paste `supabase/migration-text-ids.sql` into Supabase SQL Editor
2. **Seed data** — `SUPABASE_SERVICE_ROLE_KEY=xxx npm run seed:supabase`

Until these run, pages serve from static TypeScript fallbacks (identical output, no user-visible difference).

## What's NOT Working / Not Set Up

### Needs Manual Configuration (Vercel env vars)
- [ ] `GOOGLE_PLACES_API_KEY` — enables real Google Reviews on lodge/guide pages
- [ ] `RESEND_API_KEY` — enables photo submission email notifications
- [ ] `PHOTO_REVIEW_SECRET` — enables HMAC-signed approval links

### Needs Supabase Setup
- [ ] `photo-submissions` Storage bucket — public, 10MB limit, image MIME only

### Not Built Yet
- [ ] Auth gate on `/admin/photos` — currently publicly accessible
- [ ] Logo SVG — mayfly-on-R wordmark concept, CC task pending
- [ ] Real photography replacing Unsplash placeholders
- [ ] Mass data ingestion from yellowdogflyfishing.com, troutbitten.com
- [ ] DB-driven content management (add content via Supabase dashboard without code changes)
- [ ] User review submission UI
- [ ] Newsletter signup

## Content Inventory

**Destinations:** 30 | **Rivers:** 41 | **Species:** 35 | **Lodges:** 32 | **Guides:** 31 | **Fly Shops:** 27 | **Articles:** 16

## Environment Variables
| Variable | Set in Vercel? | Required? |
|----------|---------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Yes |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | ✅ | Yes |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Yes |
| `GOOGLE_PLACES_API_KEY` | ❌ | Optional |
| `RESEND_API_KEY` | ❌ | Optional |
| `PHOTO_REVIEW_SECRET` | ❌ | Optional |

## Deployment History
| Date | Commit | Description |
|------|--------|-------------|
| 2026-03-01 | Multiple | Phase 1-3 — MVP, 234 pages, auth, SEO, articles, image fixes |
| 2026-03-01 | `e05f018` | Phase 4 — Supabase data layer, ISR caching, 14 loading skeletons |
