# Executive Angler — Project Status

**Last updated:** 2026-04-02
**Current state:** Major pivot complete — journal-first platform with fly tying workbench, AI insights, USGS correlation, trophy wall, user reviews

## Live URLs
- **Production:** https://www.executiveangler.com (Vercel, auto-deploy from `main`)
- **Supabase:** https://qlasxtfbodyxbcuchvxz.supabase.co
- **Repo (Web):** https://github.com/taylorutah/executive-angler
- **Repo (iOS):** https://github.com/taylorutah/executive-angler-ios
- **Repo (Android):** https://github.com/taylorutah/executive-angler-android
- **Vercel Dashboard:** Project `executive-angler` under team `team_ysAhFGCZzRV2KEBFc1choVyX`

## Cross-Platform Status

| Platform | Status | Last Push |
|----------|--------|-----------|
| Web (Next.js 16) | ✅ LIVE at executiveangler.com | 2026-04-02 (98e23b0) |
| iOS (SwiftUI) | ✅ TestFlight LIVE, App Store Build 3 resubmitted | 2026-04-02 (7636054) |
| Android (Kotlin/Compose) | ✅ Building in Android Studio, untested on device | 2026-04-02 (4bdc9c8) |
| watchOS | ✅ Companion to iOS | — |

All platforms share the same Supabase backend.

## What's Working

### Web Pages
| Route | Count | Notes |
|-------|-------|-------|
| `/` | 1 | Product-focused homepage (Journal, Flies, Rivers, Feed pillars) |
| `/destinations` | 1 list + 31 detail | Auth-aware hero heights |
| `/rivers` | 1 list + 138 detail | USGS live conditions, hatch charts, Mapbox maps, auth-aware heroes |
| `/species` | 1 list + 35 detail | FAQPage schema, auth-aware heroes |
| `/lodges` | 1 list + 32 detail | Google Reviews + User Reviews |
| `/guides` | 1 list + 31 detail | Google Reviews + User Reviews |
| `/fly-shops` | 1 list + 49 detail | Google Reviews + User Reviews |
| `/flies` | 1 list + 120+ detail | Structured recipes, materials, tying videos |
| `/flies/materials` | 1 | 500+ tying materials browser with search/filter |
| `/articles` | 1 list + 16 detail | Full HTML content |
| `/journal` | Dashboard | Strava-style feed, session logging, stats |
| `/journal/stats` | 1 | River stats (awards feature-flagged off) |
| `/journal/trophy-wall` | 1 | Personal bests by species/river |
| `/journal/insights` | 1 | Rule-based + AI journal insights (Claude API) |
| `/journal/flies` | Fly Box | Favorites, Tie Next queue, personal flies |
| `/journal/flies/workbench` | 1 | Fly tying workbench |
| `/search` | 1 | Cmd+K full-text search |
| `/pricing` | 1 | Free + Pro tiers |
| `/messages` | DMs | Direct messaging system |
| `/notifications` | 1 | Notification center |
| Auth pages | 4 | Login, signup, reset-password, favorites |
| Admin pages | 6 | All have `isAdmin()` auth gate |
| Static pages | 4 | About, contact, privacy, terms |

### Data (Supabase)
| Entity | Count |
|--------|-------|
| Destinations | 31 |
| Rivers | 138 |
| Species | 35 |
| Lodges | 32 |
| Guides | 31 |
| Fly Shops | 49 |
| Articles | 16 |
| Canonical Flies | 120+ |
| Tying Materials | 500+ |
| USGS Gauges | 70+ (29 rivers) |

### Major Features (Shipped)
- [x] **Fishing Journal** — Strava-style session logging, multi-photo catch tracking, fish photo collage feed
- [x] **Fly Tying Workbench** — Structured recipe builder, material autocomplete, PDF recipe export
- [x] **Materials Database** — 500+ seeded materials (hooks, beads, thread, dubbing, feathers, flash)
- [x] **AI Journal Insights** — Rule-based analytics + Claude API natural-language insights (premium)
- [x] **USGS Flow Integration** — 70+ gauges, live conditions, personal catch overlay on flow charts
- [x] **Trophy Wall** — Personal bests by species/river with photo gallery
- [x] **User Reviews** — Full CRUD on lodges, guides, fly shops (star rating, edit/delete own)
- [x] **Social** — Public feed, kudos, comments, follows, DMs (social reframed as "River Activity")
- [x] **Awards System** — Feature-flagged off (stats still calculate, badges hidden)
- [x] **Auth-Aware Hero Heights** — Anonymous (full), logged-in (medium), Pro (compact)
- [x] **Premium Gating** — Free + Pro ($4.99/mo, $29.99/yr), CSV export, AI insights premium-locked
- [x] **Google Reviews** — Hardcoded ratings/reviews on ~30/49 fly shops
- [x] **Photo Submissions** — Upload form + admin moderation dashboard
- [x] **SEO** — Schema.org on all pages, FAQPage on species, dynamic sitemap, GA4, GSC indexed
- [x] **Retry Logic** — Transient Supabase error resilience on all DB queries during static generation

### Fly Tying Workbench Detail
- Structured recipe builder with MaterialAutocomplete (searches 500+ materials)
- Size/color dropdowns auto-populate from selected material
- Canonical fly detail pages display structured recipes via RecipeCard
- Inline material substitutions with expandable panel
- PDF recipe export (premium-gated) via `/api/export/recipe-pdf`
- Fly Favorites + Tie Next queue with optimistic UI toggles
- Community material submission form
- Materials browser at `/flies/materials` with search, category filters, add-to-inventory

## Environment Variables
| Variable | Set in Vercel? | Required? |
|----------|---------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Yes |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | ✅ | Yes |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Yes (`https://www.executiveangler.com`) |
| `PHOTO_REVIEW_SECRET` | ✅ | Optional — HMAC photo approval links |
| `RESEND_API_KEY` | ❌ | Optional — photo notification emails |
| `GOOGLE_PLACES_API_KEY` | ❌ | Optional — Google Reviews (using hardcoded data instead) |
| `SUPABASE_SERVICE_ROLE_KEY` | Local only | Required for seed scripts |
| `NEXT_PUBLIC_FEATURE_AWARDS_VISIBLE` | ❌ (default: false) | Awards/badges feature flag |

## What's NOT Working / Needs Manual Config

### Needs Dashboard Configuration (can't be done via code)
- [ ] **Google OAuth** — Create OAuth credentials in Google Cloud Console → paste Client ID + Secret into Supabase Auth dashboard → Providers → Google
- [ ] **Resend sender domain** — Add `executiveangler.com` in Resend dashboard → Domains → add DNS records (DKIM, SPF) in domain registrar

### Content/Data Tasks
- [ ] **Google Reviews for lodges/guides** — ~30/49 fly shops have data; lodges (32) and guides (31) need browser scraping from Google Maps
- [ ] **Real photography** — Most entity images are Unsplash URL placeholders; need real photography or licensed stock
- [ ] **Typography migration** — Web still uses Playfair Display + Source Sans 3; Brand Spec targets DM Serif Display + DM Sans + IBM Plex Mono (Phase 6)

### Completed (previously open)
- [x] Admin auth gate — All 6 admin pages have `isAdmin()` checks
- [x] PHOTO_REVIEW_SECRET — Set in Vercel
- [x] Supabase Storage bucket `photo-submissions` — Exists, configured (public, 20MB, image MIME)
- [x] User review submission UI — Full CRUD built (API + component)
- [x] Vercel deployment error — Fixed by excluding `scripts/` from tsconfig

## Recent Deployment History
| Date | Commit | Description |
|------|--------|-------------|
| 2026-04-02 | 98e23b0 | fix: exclude scripts/ from TS build, fix Vercel deployment |
| 2026-04-02 | 8aaf779 | feat: user review submission UI with full CRUD |
| 2026-04-01 | 57e7eb7 | chore: dev tooling, demo seed script, vercel config |
| 2026-04-01 | 02514ac | feat: auth-aware hero heights, fly page layout redesign |
| 2026-04-01 | ff4fdde | fix: double-hash on fly sizes |
| 2026-04-01 | 0856ab5 | feat: redesign header + footer |
| 2026-03-31 | 649a0e3 | feat: trophy wall, insights, fly favorites, USGS overlay, AI insights, CSV export |
| 2026-03-31 | 57fe205 | feat: redesign new fly page with materials-first recipe builder |
| 2026-03-31 | 24028a2 | feat: Phase 1A/1B — feature-flag awards, reframe social |
| 2026-03-29 | 7d679c3 | feat: global SEO optimization |
