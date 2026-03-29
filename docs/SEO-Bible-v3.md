# Executive Angler — SEO Bible v3.0
**Generated: 2026-03-29 | Aether SEO Lab | Live data from GSC + GA4**

---

## 1. SEO Health Score: 65/100 (+3 from v2, +27 from v1)

| Category | Score | Δ from v1 | Notes |
|----------|-------|-----------|-------|
| Technical SEO | 75/100 | +30 | 13 schema types, AVIF, preconnect, fonts optimized, sitemap clean |
| On-Page SEO | 70/100 | +20 | Internal linking 2x improved, metadata complete, FAQ schema on species |
| Content Quality | 60/100 | +5 | Strong depth, but placeholder images remain. No new articles published |
| Off-Page / Authority | 10/100 | +0 | STILL ZERO BACKLINKS — unchanged, #1 blocker |
| Speed / CWV | 55/100 | +15 | Fonts optimized, AVIF enabled, but no CrUX field data yet |
| E-E-A-T | 30/100 | +10 | No author pages, no expert credentials, no bylines |
| AI-Search Readiness | 60/100 | +25 | llms.txt, speakable, HowTo, FAQ schema all implemented |

## 2. Live Data (2026-03-29)

### GSC (Mar 5-27, ~23 days)
- Impressions: 685 (up from 109 in v1)
- Clicks: 6
- CTR: 0.9%
- Avg position: 43.5
- Queries: 202
- Pages with impressions: 145
- Indexed: 80 / 1,020 sitemap URLs (7.8%)
- Not indexed: 545 (514 discovered, 24 crawled, 6 duplicate canonical, 1 redirect)
- Backlinks: 0

### GA4 (Mar 1-28)
- Active users: 112
- Sessions: 352
- Views: 3,138
- Organic Search sessions: 31 (up from 6)
- Traffic: Direct 63%, Referral 26%, Organic 9%

### Near-Page-1 Rankings
- /guides — position 4.6 (54 impressions)
- /fly-shops/basin-fly-shop — position 5.8
- /flies/for/west-branch-farmington-river — position 1.2
- /rivers/rapidan-river — position 8.0
- /rivers/ponoi-river — position 6.6
- /rivers/teton-river-idaho — position 7.4

### Top Query Clusters
- River fishing: methow, clearwater, green river, blue river, st joe, boulder
- Fly shops: brand name queries ranking well (pos 5-16)
- Species: steelhead, peacock bass
- Guides: montana troutfitters, grey reef, dragonfly anglers

## 3. Critical Blockers
1. Zero backlinks — caps everything
2. 92.2% pages not indexed
3. No new content published in weeks
4. 24 pages crawled but not indexed (quality issue)
5. 6 canonical duplicates (failed validation)

## 4. 90-Day Targets
- Indexed: 80 → 300+
- Impressions: ~1,000/mo → 5,000+/mo
- Clicks: ~10/mo → 200+/mo
- Avg position: 43.5 → 25
- Backlinks: 0 → 30+
- Organic sessions: 31/mo → 300+/mo

---

## 5. Implementation Log (2026-03-29)

### Global Metadata Optimization (19 files modified)
All pages now have keyword-rich `<title>` tags, compelling `<meta description>`, and canonical URLs via `generateMetadata`.

**Detail Pages (7 entity types):**
- Destinations: `{Name} Fly Fishing — {State/Country} Guide to Rivers, Lodges & Hatches | Executive Angler`
- Rivers: `{Name} Fly Fishing — {FlowType} Water for {TopSpecies} | Executive Angler` + miles, difficulty, access count in description
- Species: `{CommonName} — Fly Fishing Guide: Best Flies, Tactics & Waters`
- Lodges: `{Name} — {PriceTier} Fly Fishing Lodge | Reviews & Booking`
- Guides: `{Name} — Expert Fly Fishing Guide | {Specialties}`
- Fly Shops: `{Name} — Fly Shop & Outfitter | {City/State}` (city extracted from address)
- Articles: `{Title} | Expert Fly Fishing {Category}`

**List Pages (8 pages):** All updated with entity counts in titles, canonical URLs added.

**Utility Pages:**
- `/about` — full metadata + OG + canonical
- `/contact` — metadata + canonical
- `/search` — set to `noindex, follow` to preserve crawl budget

### llms.txt Updated
Corrected entity counts: 31 destinations, 37 rivers, 56 fly shops, 100 fly patterns, 37 fly-for-river pages, 54 hatch pages, 450+ total pages.

### GA4 Internal Traffic Filter
- Defined IP rule: `136.59.155.1/32` (Owner - Taylor Warnick)
- Data filter activated: Internal Traffic → Exclude → Active
- Owner's browsing no longer skews analytics data going forward

### Documents Created
- `docs/SEO-Bible-v3.md` — This file
- `docs/Backlink-Strategy.md` — 5-phase link building plan with targets, templates, KPIs

### Sitemap Resubmitted
- Resubmitted sitemap.xml in GSC for the www property

### Canonical Duplicate Investigation
- 6 pages flagged for duplicate canonical (validation failed 3/28)
- All affected pages now have explicit canonical URLs from generateMetadata
- Needs re-validation in GSC after deployment completes
