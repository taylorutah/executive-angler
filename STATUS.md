# Executive Angler — Project Status

**Last updated:** 2026-03-01
**Current state:** Phase 3 complete — search, 404 fixes, expanded international content, species images

## Live URLs
- **Production:** https://executiveangler.com (Vercel)
- **Supabase:** https://qlasxtfbodyxbcuchvxz.supabase.co
- **Repo:** https://github.com/taylorutah/executive-angler (branch: `main`)
- **Vercel Dashboard:** Project `executive-angler` under team `team_ysAhFGCZzRV2KEBFc1choVyX`

## What's Working

### Pages (250+ static pages, all live)
| Route | Count | Status |
|-------|-------|--------|
| `/` | 1 | Homepage with 6 featured content sections |
| `/destinations` | 1 list + 30 detail | All 30 destinations rendering with maps |
| `/rivers` | 1 list + 41 detail | All 41 rivers with Mapbox maps, access points, hatch charts |
| `/species` | 1 list + 35 detail | All 35 species with Wikimedia Commons illustrations |
| `/lodges` | 1 list + 32 detail | All 32 lodges with galleries, amenities |
| `/guides` | 1 list + 31 detail | All 31 guides with bios, specialties |
| `/fly-shops` | 1 list + 27 detail | All 27 shops with hours, services, brands |
| `/articles` | 1 list + 16 detail | All 16 articles with full HTML content |
| `/search` | 1 | Full-text search across all content types, Cmd+K shortcut |
| `/about` | 1 | About page with mission, coverage, conservation |
| `/contact` | 1 | Contact form (sends to taylor.warnick@gmail.com via FormSubmit.co) |
| `/privacy` | 1 | Full privacy policy |
| `/terms` | 1 | Terms of service |
| `/login` | 1 | Email/password login form |
| `/signup` | 1 | Registration form |
| `/favorites` | 1 | Protected — requires auth |
| `/admin/photos` | 1 | Photo moderation dashboard |

### Features Working
- [x] Full static site generation — all pages pre-rendered
- [x] Responsive design — mobile nav, card grids, hero sections
- [x] Mapbox interactive maps on river + destination pages
- [x] Hatch charts on river detail pages
- [x] Schema.org structured data on every entity page
- [x] Dynamic sitemap with all 250+ URLs
- [x] robots.txt and llms.txt
- [x] Full-text search with Cmd+K shortcut
- [x] About, contact, privacy, and terms pages
- [x] Supabase Auth — email/password signup and login
- [x] User favorites system (FavoriteButton + API route)
- [x] Photo submission form on all entity pages (UI built, requires Storage bucket)
- [x] Community photos display component on all entity pages
- [x] Google Reviews component on lodges, guides, fly shops (empty state — no API key)
- [x] Photo moderation admin dashboard
- [x] Photo approval/rejection API with HMAC-signed URLs
- [x] Framer Motion scroll animations throughout
- [x] Breadcrumbs with JSON-LD on all detail pages
- [x] Species images from Wikimedia Commons (public domain)

### API Routes (serverless)
| Route | Method | Status |
|-------|--------|--------|
| `/api/favorites` | GET/POST/DELETE | Working — requires auth |
| `/api/google-reviews` | GET | Needs `GOOGLE_PLACES_API_KEY` |
| `/api/photos/submit` | POST | Needs Supabase Storage bucket + optional `RESEND_API_KEY` |
| `/api/photos/review` | GET | Needs `PHOTO_REVIEW_SECRET` + optional `RESEND_API_KEY` |

## What's NOT Working / Not Set Up

### Needs Manual Configuration
- [ ] **Supabase Storage bucket** — Create `photo-submissions` bucket in Supabase dashboard (public, 10MB limit, image MIME only). Without this, photo uploads will fail.
- [ ] **Google OAuth** — Add Google Cloud OAuth credentials in Supabase Auth dashboard. Without this, the "Sign in with Google" button won't work.
- [ ] **Google Places API key** — Set `GOOGLE_PLACES_API_KEY` in Vercel env vars. Without this, GoogleReviews component shows empty state.
- [ ] **Resend API key + verified domain** — Set `RESEND_API_KEY` in Vercel env vars and verify a sender domain in Resend dashboard. Without this, photo notification emails won't send (non-blocking — everything else still works).
- [ ] **PHOTO_REVIEW_SECRET** — Set in Vercel env vars. Without this, HMAC-signed approval links won't validate.

### Not Built Yet
- [ ] User review submission UI — DB table + RLS exist, no form
- [ ] Admin authentication — `/admin/photos` is publicly accessible
- [ ] Admin content management — content changes require editing TypeScript files + redeploy
- [ ] Database-driven pages — pages read from `src/data/*.ts`, not Supabase; seed script exists but pages aren't wired to query DB
- [ ] Newsletter signup
- [ ] Weather/flow data integration
- [ ] Trip planning / itinerary builder

### Known Issues
1. All images (except homepage hero and species) are Unsplash placeholders — need real photography
2. Admin photos dashboard has no auth gate
3. Contact form uses FormSubmit.co which may require email confirmation on first use

## Content Inventory

### Destinations (30)
**US:** Montana, Wyoming, Colorado, Idaho, Alaska, Oregon, Pennsylvania, Michigan, Arkansas, Florida Keys
**Canada:** British Columbia
**Europe:** Iceland, Norway, Scotland, Slovenia, Ireland, Kola Peninsula (Russia)
**Asia:** Japan, Mongolia
**Oceania:** New Zealand, Tasmania
**South America:** Patagonia, Chile, Tierra del Fuego
**Caribbean/Central America:** Bahamas, Belize, Cuba
**Indian Ocean:** Christmas Island, Seychelles, Maldives
**Pacific:** Kamchatka

### Rivers (41)
US: Madison, Yellowstone, Gallatin, Missouri, Bighorn, Big Hole, Bitterroot, Ruby, Rock Creek, Boulder, Smith, Clark Fork, North Platte, Green, Snake, South Fork Snake, Henry's Fork, Silver Creek, Deschutes, Beaverhead, Kenai, Naknek, Copper, Delaware, Au Sable, South Holston, San Juan, Frying Pan, Florida Keys Flats
New Zealand: Tongariro, Rangitikei, Mataura
International: River Moy (Ireland), Ponoi River (Russia), Eg-Uur River (Mongolia), Jardines de la Reina (Cuba), North Malé Atoll (Maldives)

### Species (35)
7 families — trout (10), salmon (5), char (5), grayling (2), saltwater (5), warmwater (5), pike (3)
All species now have Wikimedia Commons public domain scientific illustrations.

### Lodges (32), Guides (31), Fly Shops (27)
Spread across 20+ destinations worldwide

### Articles (16)
Categories: technique (6), destination (3), gear (2), conservation (2), culture (2), species (1)

## Environment Variables Status
| Variable | Set in Vercel? | Required? |
|----------|---------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes | Yes |
| `NEXT_PUBLIC_SITE_URL` | Yes | Yes |
| `GOOGLE_PLACES_API_KEY` | No | Optional |
| `RESEND_API_KEY` | No | Optional |
| `PHOTO_REVIEW_SECRET` | No | Optional |

## Deployment History
| Date | Commit | Description |
|------|--------|-------------|
| 2026-03-01 | Initial commits | Phase 1 — MVP scaffold, Montana content, auth, SEO |
| 2026-03-01 | `7ecf507` | Phase 2 — 200+ pages, species system, photo system, full content expansion |
| 2026-03-01 | Phase 3 | Search, 404 fixes, 5 new destinations, species images, 250+ pages |
