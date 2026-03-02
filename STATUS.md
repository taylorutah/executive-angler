# Executive Angler — Project Status

**Last updated:** 2026-03-02
**Current state:** Phase 5 complete — Google Reviews component, 22 new fly shops, Utah destination, Provo + Green Rivers

## Live URLs
- **Production:** https://executiveangler.com (Vercel)
- **Supabase:** https://qlasxtfbodyxbcuchvxz.supabase.co
- **Repo:** https://github.com/taylorutah/executive-angler (branch: `main`)
- **Vercel Dashboard:** Project `executive-angler` under team `team_ysAhFGCZzRV2KEBFc1choVyX`

## What's Working

### Pages (all live with ISR)
| Route | Count | Status |
|-------|-------|--------|
| `/` | 1 | Homepage — ISR 1800s |
| `/destinations` | 1 list + 31 detail | ISR 3600s / 86400s |
| `/rivers` | 1 list + 43 detail | ISR 3600s / 86400s |
| `/species` | 1 list + 35 detail | ISR 3600s / 86400s |
| `/lodges` | 1 list + 32 detail | ISR 3600s / 86400s |
| `/guides` | 1 list + 31 detail | ISR 3600s / 86400s |
| `/fly-shops` | 1 list + 49 detail | ISR 3600s / 86400s |
| `/articles` | 1 list + 16 detail | ISR 3600s / 86400s |
| `/search` | 1 | Cmd+K full-text search |
| `/about`, `/contact`, `/privacy`, `/terms` | 4 | Static |
| `/login`, `/signup`, `/favorites` | 3 | Auth pages |
| `/admin/photos` | 1 | Photo moderation |

### Data (Supabase — live)
| Entity | Count |
|--------|-------|
| Destinations | 31 (incl. Utah) |
| Rivers | 43 (incl. Provo + Green River UT) |
| Species | 35 |
| Lodges | 32 |
| Guides | 31 |
| Fly Shops | 49 |
| Articles | 16 |

### Features Working
- [x] Supabase data layer with typed query functions and static fallbacks
- [x] ISR caching on all pages
- [x] Loading skeleton UI on all list + detail pages
- [x] Google Reviews component on lodge/guide/fly-shop detail pages (stars, reviewer cards, Google Business link)
- [x] Full static site generation — all pages pre-rendered
- [x] Responsive design — mobile nav, card grids, hero sections
- [x] Mapbox interactive maps on river + destination pages
- [x] Schema.org structured data on every entity page
- [x] Dynamic sitemap with all URLs
- [x] Full-text search with Cmd+K shortcut
- [x] Supabase Auth — email/password signup and login
- [x] User favorites system
- [x] Photo submission form
- [x] Photo moderation admin dashboard
- [x] All 16 articles with structured HTML layout

## Google Reviews Strategy
- **No API needed** — hardcode rating + review count + 3 featured reviews per location
- **Direct Google Business URL** per shop/lodge/guide (not generic Maps link)
- Data populated via browser scrape → Supabase upsert
- Fields: `google_rating`, `google_review_count`, `google_reviews_url`, `featured_reviews` (JSONB)
- ~30 of 49 fly shops now have review data; remaining need populating

## Content Added 2026-03-02
**New Fly Shops (22):**
- Idaho/Henry's Fork: Henry's Fork Anglers, TroutHunter, TRR Outfitters, Drift Lodge, Yellowstone Fly Shop
- Montana/Madison River: Madison River Outfitters, Beartooth Flyfishing, MRFC, The Tackle Shop, Jacklin's
- Wyoming/Jackson Hole: JD High Country, Grand Teton Fly Fishing, Westbank Anglers, Snake River Angler, Orvis Jackson Hole, Jackson Hole Fly Company
- Utah/Provo River: Fish Heads, Trout Bum 2, Western Rivers Flyfisher, Fly Fish Food, Heber Fly Shop
- Utah/Green River: Trout Creek Flies, Western Rivers (Green River)

**New Destination:** Utah (dest-utah)
**New Rivers:** Provo River, Green River (Flaming Gorge)

## What's NOT Working / Not Set Up

### Needs Manual Configuration
- [ ] `RESEND_API_KEY` — enables photo submission email notifications
- [ ] `PHOTO_REVIEW_SECRET` — enables HMAC-signed approval links

### Needs Supabase Setup
- [ ] `photo-submissions` Storage bucket — public, 10MB limit, image MIME only

### Not Built Yet
- [ ] Auth gate on `/admin/photos` — currently publicly accessible
- [ ] Logo SVG — mayfly-on-R wordmark (CC task pending)
- [ ] Hero images for new fly shops (22 shops need images)
- [ ] Review data for ~19 fly shops still missing
- [ ] Real photography replacing placeholders
- [ ] User review submission UI
- [ ] Newsletter signup

## Environment Variables
| Variable | Set in Vercel? | Required? |
|----------|---------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Yes |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | ✅ | Yes |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Yes |
| `RESEND_API_KEY` | ❌ | Optional |
| `PHOTO_REVIEW_SECRET` | ❌ | Optional |

## Deployment History
| Date | Commit | Description |
|------|--------|-------------|
| 2026-03-01 | Multiple | Phase 1-4 — MVP, Supabase data layer, ISR, 234 pages |
| 2026-03-02 | `6915cac` | Phase 5 — Google Reviews component on lodge/guide/fly-shop pages |
| 2026-03-02 | `91f65eb` | fix: null safety on all iterable fields + async generateStaticParams |
| 2026-03-02 | `4f1b6ba` | data: Google reviews populated for fly shops, lodges, guides |
| 2026-03-02 | `0bf2ab3` | chore: ISR cache flush redeploy |
| 2026-03-02 | Supabase only | 22 new fly shops, Utah destination, Provo + Green Rivers, all 38 rivers rewritten |
| 2026-03-02 | In progress | Breadcrumb destination level (CC nova-cloud) |
