# Executive Angler — SEO Bible v1.0
**Generated: 2026-03-19 | Aether SEO Lab**

---

## 1. Current SEO Health Score: 38/100

| Category | Score | Weight | Notes |
|----------|-------|--------|-------|
| Technical SEO | 45/100 | 20% | Solid static gen, but missing schemas, canonical issues, 571 unindexed pages |
| On-Page SEO | 50/100 | 15% | Good title/description on detail pages, missing on list/utility pages |
| Content Quality | 55/100 | 20% | Strong depth per page, but placeholder images and no E-E-A-T signals |
| Off-Page / Authority | 10/100 | 15% | ZERO backlinks. 21-year domain age is the only asset |
| Speed / Core Web Vitals | 40/100 | 10% | No CrUX data yet, fonts not optimized, no next/font |
| E-E-A-T | 20/100 | 10% | No author pages, no credentials, no expert signals |
| AI-Search Readiness | 35/100 | 10% | llms.txt exists, but no FAQ schema, no HowTo, weak structured data |

---

## 2. Data Baseline (as of 2026-03-19)

### Google Search Console (www.executiveangler.com)
- **Indexed pages:** 39 / 610 known (6.4% index rate — CRITICAL)
- **Total impressions (3mo):** 109
- **Total clicks:** 2
- **Average CTR:** 1.8%
- **Average position:** 39.6
- **Queries appearing:** 39
- **External backlinks:** 0
- **Internal links detected:** 67

#### Top Queries by Impressions
| Query | Impressions | Clicks | Notes |
|-------|------------|--------|-------|
| peacock bass | 6 | 0 | Species page ranking ~40 |
| greybull river fly fishing | 5 | 0 | Niche river query |
| fly fishing on the green river utah | 2 | 0 | Local intent — high value |
| peacock bass fly fishing | 2 | 0 | Species + technique |
| belize fly fishing | 2 | 0 | Destination intent |
| trout fishing outfitters & guides in montana | 2 | 0 | Guide list commercial intent |
| bristol bay fishing | 1 | 0 | Destination |
| keyhole reservoir fly fishing guide | 1 | 0 | Local guide intent |
| steelhead | 1 | 0 | Broad species |
| what are steelhead | 1 | 0 | Informational intent |

#### Top Pages by Impressions
| Page | Impressions | Clicks |
|------|------------|--------|
| /guides | 4 | 2 (only page with clicks!) |
| /rivers/green-river-utah | 26 | 0 |
| /species/peacock-bass | 12 | 0 |
| /rivers/river-moy | 11 | 0 |
| /guides/grey-reef-outfitters | 6 | 0 |
| /guides/bold-batbayar-mongolia-guide | 5 | 0 |
| /articles/complete-guide-fly-rod-selection | 5 | 0 |
| /lodges/white-river-trout-lodge | 5 | 0 |
| /destinations/belize | 5 | 0 |

#### Indexing Issues (571 pages not indexed)
| Issue | Count | Severity |
|-------|-------|----------|
| Discovered - currently not indexed | 553 | HIGH — Google knows URLs but won't crawl them (low authority/quality signals) |
| Crawled - currently not indexed | 10 | MEDIUM — Google crawled but deemed not worth indexing |
| Duplicate without user-selected canonical | 6 | MEDIUM — missing canonical tags on some pages |
| Soft 404 | 1 | LOW — `/rivers/green-river-utah` (has 301 redirect, Google hasn't re-evaluated) |
| Duplicate, Google chose different canonical | 1 | MEDIUM — homepage www vs non-www conflict |

#### Sitemap Status
- Submitted: Mar 5, 2026 | Resubmitted: Mar 19, 2026
- Status: Success | 602 pages discovered
- **Issue:** 602 pages in sitemap vs ~250 actual content pages = ~350 extra URLs being generated

### Google Analytics 4 (Feb 19 - Mar 18, 2026)
- **Active users:** 69 | **New users:** 68
- **Average engagement time:** 42m 07s (skewed by power users on journal)
- **Total pageviews:** 1,573
- **Views per user:** 22.80

#### Traffic Sources
| Channel | Sessions |
|---------|----------|
| Direct | 165 |
| Referral | 16 |
| Organic Search | 6 |
| Organic Social | 1 |
| Unassigned | 1 |

#### Top Pages by Views
| Page | Views | Users | Engagement |
|------|-------|-------|------------|
| Homepage | 388 | 53 | 23m 49s |
| Fishing Journal | 214 | 3 | 24m 40s |
| Session Detail | 138 | 3 | 22m 05s |
| World-Class Fly Fishing | 107 | 12 | 1h 45m |
| Destinations | 108 | — | — |

#### Geographic Distribution
US: 31 | Australia: 8 | Iran: 5 | Germany: 3 | France: 3 | Iceland: 3 | Luxembourg: 3

### Domain Authority
- **Registered:** 2005-01-13 (21 years old — massive trust signal)
- **Registrar:** GoDaddy
- **Backlinks:** 0 (despite domain age — the domain was dormant)

---

## 3. Critical Issues (Fix Immediately)

### CRITICAL-1: 93.6% of Pages Not Indexed
**Impact:** Only 39 of 610 known pages are indexed. Google sees 602 URLs but deems most not worth crawling.
**Root Causes:**
1. **Zero backlinks** — Google has no external signal that this site has authority
2. **Sitemap bloat** — 602 URLs discovered vs ~250 actual pages (extra URLs from journal/app routes, API routes leaking)
3. **Thin internal linking** — only 67 internal links across 250+ pages
4. **No structured data** — Google can't understand entity relationships
5. **Placeholder images** — Unsplash stock photos signal low-quality/template site

**Fix (90-day plan):**
- Clean up sitemap to only include indexable content pages
- Implement aggressive internal linking (every entity page links to related entities)
- Add schema.org markup to every page type
- Begin backlink acquisition campaign
- Replace placeholder images progressively

### CRITICAL-2: Zero External Backlinks
**Impact:** Without backlinks, Google has no reason to trust or crawl the site deeply.
**Fix:** See Section 7 (Off-Page Strategy)

### CRITICAL-3: Homepage Canonical Conflict
**Impact:** Google chose a different canonical than specified for the homepage (www vs non-www).
**Fix:** Ensure all internal links use `https://www.executiveangler.com/`, verify Vercel redirects non-www → www with 301, add explicit `<link rel="canonical">` to every page.

---

## 4. Technical SEO Fixes

### T-1: Fix robots.txt (Priority: HIGH, Effort: 5 min)
**Current issues:**
- Sitemap URL points to non-www `https://executiveangler.com/sitemap.xml`
- `/admin/` routes not blocked

**File:** `src/app/robots.ts`

### T-2: Add BreadcrumbList JSON-LD (Priority: HIGH, Effort: 30 min)
**Current state:** Visual breadcrumbs exist but no structured data.
**Impact:** BreadcrumbList schema enables rich snippets in Google search results showing site hierarchy.
**File:** `src/components/ui/Breadcrumbs.tsx` — add JSON-LD script alongside visual breadcrumbs.

### T-3: Entity-Specific Schema.org Types (Priority: HIGH, Effort: 2-3 hours)
Missing schemas by entity type:
| Entity | Current Schema | Required Schema |
|--------|---------------|-----------------|
| Destinations | None | `TouristDestination` + `Place` |
| Rivers | None | `BodyOfWater` + `Place` with `geo` |
| Species | None | `Thing` with `name`, `description`, `image`, `sameAs` (Wikipedia) |
| Lodges | None | `LodgingBusiness` + `AggregateRating` + `Review` |
| Guides | None | `ProfessionalService` + `Person` |
| Fly Shops | `LocalBusiness` (partial) | `SportingGoodsStore` + full address + `AggregateRating` |
| Articles | `Article` (good) | Add `publisher`, `dateModified`, `speakable` |
| Homepage | None | `WebSite` + `SearchAction` (sitelinks search box) |

### T-4: Fix Font Loading (Priority: HIGH, Effort: 45 min)
**Current:** CSS `@import url('fonts.googleapis.com/...')` — blocking render, no font optimization.
**Fix:** Migrate to `next/font/google` in `layout.tsx` for automatic optimization, subsetting, and zero-CLS font loading.

### T-5: Add Metadata to Missing Pages (Priority: MEDIUM, Effort: 15 min)
Pages with no server-side metadata:
- `/contact` — client component, needs wrapper with `generateMetadata`
- `/search` — client component, needs wrapper
- List pages missing OG images (all 7 list pages)

### T-6: Clean Up Sitemap (Priority: HIGH, Effort: 30 min)
**Current:** 602 URLs discovered. Actual content: ~250.
**Investigation needed:** The sitemap is generating URLs for journal/session/account routes that should NOT be indexed. These are app routes, not content pages.
**Fix:** Audit `src/app/sitemap.ts` — ensure only content entity pages and editorial pages are included. Exclude all `/journal/`, `/account/`, `/api/`, `/admin/` routes.

### T-7: Fix Soft 404 — /rivers/green-river-utah (Priority: LOW, Effort: 5 min)
301 redirect already exists in `next.config.ts`. Click "VALIDATE FIX" in GSC to have Google re-evaluate.

### T-8: Add WebSite Schema with SearchAction (Priority: MEDIUM, Effort: 15 min)
Enables Google Sitelinks Search Box in SERP.

---

## 5. On-Page SEO Fixes

### O-1: Internal Linking Overhaul (Priority: CRITICAL, Effort: 4-6 hours)
**Current state:** 67 total internal links. National Geographic has 500+ per page.

**Strategy:**
1. **Entity cross-linking:** Every river page links to its destination, nearby lodges, guides, fly shops, and related species
2. **Related content sections:** "You might also like" blocks on every detail page
3. **Contextual links in descriptions:** Link species names, river names, destination names within text content
4. **Breadcrumb enhancement:** Include destination-level breadcrumb (Home > Destinations > Montana > Madison River)
5. **Footer links:** Add top destinations, popular rivers, featured species
6. **Article internal links:** Every article should link to 3-5 relevant entity pages

**Target:** 500+ internal links within 30 days.

### O-2: Title Tag Optimization (Priority: MEDIUM, Effort: 1 hour)
Current titles are functional but not click-optimized.

**Formula for detail pages:**
`{Entity Name} — {Unique Value Prop} | Executive Angler`

**Examples:**
- Current: `Green River — Fly Fishing Guide | Executive Angler`
- Optimized: `Green River Utah — Flaming Gorge to Dinosaur NM Fly Fishing | Executive Angler`
- Current: `Peacock Bass — Fly Fishing Species Guide | Executive Angler`
- Optimized: `Peacock Bass — Size, Tactics & Where to Catch Them | Executive Angler`

### O-3: Meta Description Optimization (Priority: MEDIUM, Effort: 1 hour)
Add call-to-action and unique data points to meta descriptions.
Include numbers, seasons, specifics that trigger clicks.

---

## 6. Content Strategy

### C-1: Article Publishing Cadence (Priority: HIGH)
**Target:** 1 article per week, optimized for these query clusters already appearing in GSC:

| Priority | Topic Cluster | Target Keywords | Content Type |
|----------|--------------|-----------------|-------------|
| 1 | Peacock Bass | peacock bass fly fishing, peacock bass size, are peacock bass freshwater, what states have peacock bass | Species deep-dive + destination guide |
| 2 | Green River Utah | fly fishing green river utah, green river trout fishing, flaming gorge green river, green river fishing guide | Destination masterpiece (2000+ words) |
| 3 | Belize Fly Fishing | belize fly fishing, fly fishing in belize, fishing belize, fishing cuba | Destination + planning guide |
| 4 | Bristol Bay | bristol bay fishing, bristol bay fly fishing | Destination + lodge comparison |
| 5 | Steelhead | steelhead, what are steelhead | Species guide + seasonal timing |
| 6 | Montana Guides | trout fishing outfitters in montana, montana troutfitters, montana trout fishing guides | Guide comparison + booking guide |
| 7 | White River Lodge | white river trout lodge, white river fishing lodges, white river fishing resorts arkansas | Lodge review + destination |

### C-2: E-E-A-T Content Signals (Priority: HIGH)
**Current state:** No author pages, no credentials, no expert signals.

**Required:**
1. **Author pages** — Create `/authors/[slug]` pages with bio, credentials, publications, `Person` schema
2. **Expert quotes** — Add first-person expert content (guide interviews, lodge owner Q&As)
3. **Data citations** — Reference state wildlife agencies, USGS, Trout Unlimited data
4. **Photography credits** — Replace Unsplash with attributed, location-specific images
5. **"Written by" + "Reviewed by"** — Add author attribution to every article

### C-3: FAQ Sections (Priority: MEDIUM, Effort: 2 hours per entity type)
Add FAQ sections with `FAQPage` schema to entity pages. Source questions from:
- GSC queries (already appearing: "are peacock bass freshwater", "what are steelhead", "what states have peacock bass")
- Google's "People Also Ask" for each entity
- Related searches at bottom of Google results

---

## 7. Off-Page / Link Building Strategy

### Phase 1: Foundation (Days 1-30)
1. **Directory submissions** (DA 30+):
   - Google Business Profile (if applicable)
   - Yelp (for lodges/guides/fly shops with physical locations)
   - TripAdvisor (destination and lodge listings)
   - AllTrails (cross-promotion for river access points)
   - Fishing-specific: Orvis dealer locator, TU chapter links

2. **Social profiles** (each = 1 nofollow link + brand signal):
   - Instagram, YouTube, Facebook, Twitter/X, Pinterest
   - Reddit r/flyfishing (genuine participation, not spam)
   - Fishing forums: Drake Magazine forums, Fly Fisherman forums

3. **Content syndication:**
   - Pitch articles to MidCurrent, Hatch Magazine, Drake Magazine
   - Guest posts on outdoor blogs (link back to species/destination pages)

### Phase 2: Authority Building (Days 30-90)
1. **Resource page link building:**
   - State wildlife agency resource pages (Montana FWP, Utah DWR, Wyoming G&F)
   - Tourism board links (Visit Montana, Visit Wyoming)
   - Conservation org links (TU, IGFA, FFF)

2. **Data-driven linkable assets:**
   - Create "State of Fly Fishing 2026" annual report
   - Interactive hatch chart tool (embeddable, link-worthy)
   - River condition dashboard (real-time data from USGS feeds)

3. **Digital PR:**
   - Pitch stories about the journal/app feature to outdoor media
   - Conservation angle stories to general media

### Phase 3: Scale (Days 90-365)
- Influencer partnerships with guides/content creators
- Sponsorship of local fishing events + conservation initiatives
- Podcast guesting (fly fishing podcasts)

---

## 8. AI-Search Readiness

### AI-1: Optimize for Google AI Overviews
- Add concise, factual answer blocks at the top of species/destination pages
- Structure content in Q&A format where natural
- Add comparison tables (species comparison, river comparison, lodge comparison)
- Include definitive numbers/stats that AI can extract

### AI-2: Optimize for Perplexity/ChatGPT Search
- `llms.txt` already exists (good)
- Add `llms-full.txt` with complete entity inventory
- Ensure every page has a clear, extractable summary paragraph
- Add `speakable` schema to articles

### AI-3: FAQ + HowTo Schema
- Add `FAQPage` schema to species pages (common questions)
- Add `HowTo` schema to technique articles (step-by-step fly tying, casting techniques)

---

## 9. Speed & Core Web Vitals

### S-1: Font Optimization (LCP impact)
Migrate from CSS `@import` to `next/font/google`. Expected LCP improvement: 200-400ms.

### S-2: Image Optimization
- All Unsplash images should use `next/image` with explicit `width`/`height` and `sizes` (mostly done)
- Add LQIP (Low Quality Image Placeholders) via `placeholder="blur"` + `blurDataURL`
- Consider AVIF format support in `next.config.ts`

### S-3: Preload Critical Resources
- Preload hero image on homepage
- Preconnect to Supabase, Mapbox, Google Fonts domains

---

## 10. Prioritized Roadmap

### Week 1 (Quick Wins — Days 1-7)
| # | Task | Impact | Effort | Files |
|---|------|--------|--------|-------|
| 1 | Fix robots.txt (www sitemap URL + /admin/ block) | Medium | 5 min | `src/app/robots.ts` |
| 2 | Add BreadcrumbList JSON-LD to Breadcrumbs component | High | 30 min | `src/components/ui/Breadcrumbs.tsx` |
| 3 | Add metadata to Contact + Search pages | Medium | 15 min | `src/app/contact/page.tsx`, `src/app/search/page.tsx` |
| 4 | Add WebSite + SearchAction schema to root layout | Medium | 15 min | `src/app/layout.tsx` |
| 5 | Add OG images to all 7 list pages | Medium | 20 min | All list page.tsx files |
| 6 | Validate Soft 404 fix in GSC | Low | 2 min | GSC dashboard |
| 7 | Fix font loading (next/font) | High | 45 min | `src/app/layout.tsx`, `src/app/globals.css` |

### Week 2-3 (Schema + Content — Days 8-21)
| # | Task | Impact | Effort |
|---|------|--------|--------|
| 8 | Implement all entity-specific schemas (6 types) | High | 3 hours |
| 9 | Internal linking overhaul (cross-entity links) | Critical | 4-6 hours |
| 10 | Add FAQ sections to top 5 species pages | High | 2 hours |
| 11 | Optimize title tags + meta descriptions for top 10 impression pages | Medium | 1 hour |
| 12 | Clean up sitemap (remove non-content URLs) | High | 30 min |
| 13 | Create author page template + first author | High | 2 hours |

### Month 2-3 (Authority Building — Days 22-90)
| # | Task | Impact | Effort |
|---|------|--------|--------|
| 14 | Publish 1 article/week targeting GSC query clusters | High | 4 hrs/week |
| 15 | Submit to 10+ fishing/outdoor directories | Medium | 2 hours |
| 16 | Create social profiles (Instagram, YouTube, Pinterest) | Medium | 2 hours |
| 17 | Pitch 3 guest posts to fishing publications | High | 6 hours |
| 18 | Replace 50% of placeholder images | High | Ongoing |
| 19 | Add FAQ schema to all entity types | Medium | 4 hours |
| 20 | Create embeddable hatch chart widget (linkable asset) | High | 8 hours |

### Month 4-12 (Scale — Days 91-365)
| # | Task | Impact | Effort |
|---|------|--------|--------|
| 21 | Weekly article cadence (50 articles by end of year) | Critical | Ongoing |
| 22 | Digital PR campaign (journal/app feature story) | High | Ongoing |
| 23 | Conservation partnership content | High | Ongoing |
| 24 | Interactive tools (river condition dashboard, gear calculator) | High | 20+ hours |
| 25 | Video content for YouTube + embeds | High | Ongoing |

---

## 11. KPIs & Measurement Plan

### 30-Day Targets
- Indexed pages: 39 → 100+
- Impressions: 109 → 500+
- Clicks: 2 → 20+
- External backlinks: 0 → 5+

### 90-Day Targets
- Indexed pages: 200+
- Impressions: 2,000+
- Clicks: 100+
- Average position: 39.6 → 25
- External backlinks: 20+
- Organic search sessions: 6 → 100+

### 12-Month Targets
- All 250+ content pages indexed
- 10,000+ monthly impressions
- 500+ monthly clicks
- Average position: < 15 for target keywords
- 100+ external backlinks
- 1,000+ monthly organic sessions
- Featured snippets for 5+ queries
- AI Overview citations for 10+ queries

---

## 12. Target Audience Profile — The Executive Angler

**Persona:** An executive angler looks at fishing like a business. How to optimize, what levers to pull, where to invest time and money, and what's the ROI. Historical data is priceless — what worked before, what worked a year ago.

**Search behavior:**
- Researches destinations weeks/months in advance
- Compares lodges, guides, and outfitters before booking
- Seeks data: hatch charts, water temps, historical conditions
- Values expertise and credentials (guides with X years experience)
- Uses the journal to track performance over time (the "dashboard" for fishing)

**Content implications:**
- Every page needs DATA — numbers, charts, comparisons
- ROI framing: "Best months" = when you get the most for your investment
- Historical data features in the journal app = massive retention hook
- Species pages need tactical depth (not just identification)

---

## 13. Competitive Landscape

| Competitor | Strengths | Weakness vs EA |
|------------|----------|----------------|
| FishBrain | Huge community, catch data, maps | No editorial depth, no destination planning |
| Anglr | Trip tracking, gear management | Limited content, weak SEO |
| Orvis.com | Massive DA, editorial + commerce | Generic, not performance-oriented |
| Hatch Magazine | Beautiful editorial, strong backlinks | No app, no data/tracking features |
| Trout Unlimited | Conservation authority, .org domain | Not trip planning, not performance |

**Executive Angler's moat:** The journal/app layer + editorial content + data-driven approach. No competitor combines Strava-like tracking with National Geographic-quality destination content. This is the differentiator — lean into it.

---

**SEO Bible locked and saved as permanent shared context. All future work will reference and build upon this foundation. I will never repeat calibration unless new major assets are provided.**
