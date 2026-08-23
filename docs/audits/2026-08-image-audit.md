# Image audit — 23 August 2026

Part A of the Phase 0 gate (image audit + search rebuild). This is not a visual redesign. The live symptom is empty grey rectangles on `/rivers`, `/destinations`, `/articles`, `/search`, and `/flies/library`.

## Headline

Grey cards are **not** a `next.config.ts` allowlist miss. Every hostname currently stored on content rows is already in `images.remotePatterns`. `host-not-allowlisted = 0`.

The blanks come from three other things, in this order:

1. **Relative URLs that 404 in this checkout.** 136 of 138 river heroes are paths like `/images/rivers/missouri-river-hero.jpg`. Those files are **200 on production** (`www.executiveangler.com`) and **missing from this git snapshot**, so preview/local `next/image` paints a grey box. Madison River is `/images/madison-river-three-dollar-bridge.jpg` (200 on production).
2. **`next/image` with no `onError`.** A live URL that 404s (dead Unsplash, dead Wikimedia, missing local file) still occupies the slot. The photo-credit chip on `/rivers/[slug]` was wired to the *database credit*, not to a successful load.
3. **Null / empty URLs coerced to `""`.** Rivers and articles mappers used `?? ""`, so consumers could not tell missing from present. Empty string is falsy in some branches (search row dropped the thumbnail and misaligned) and truthy enough in others (`<Image src={river.heroImageUrl}>` always rendered).

## Inventory (production Supabase, 2026-08-23)

Counted from live columns. Absolute URLs were sampled with HEAD (8s timeout). Relative URLs were checked against production, not this checkout.

| Entity | Rows | Null / empty | Relative | Absolute | Host not allowlisted | Dead (sampled) |
|---|---:|---:|---:|---:|---:|---|
| Rivers `hero_image_url` | 138 | 0 | 136 | 2 | 0 | 0 of 5 relative on production; 2/2 `api.executiveangler.com` 200 |
| Rivers `thumbnail_url` | 138 | 6 | 132 | 0 | 0 | same relative set as heroes |
| Destinations `hero_image_url` | 52 | **9** | 43 | 0 | 0 | Alaska `/images/destinations/alaska-hero.jpg` 200 on production |
| Articles `hero_image_url` | 24 | 0 | 23 | 1 | 0 | 1/1 `api.executiveangler.com` 200 |
| Lodges `hero_image_url` | 32 | 0 | 0 | 32 | 0 | shop/CDN sample 200 |
| Guides `photo_url` | 106 | **76** | 1 | 29 | 0 | not the list-page grey-box driver |
| Fly shops `hero_image_url` | 230 | **107** | 1 | 122 (106 Unsplash) | 0 | Unsplash sample **7/32 dead (22%)**; shop CDNs 200 |
| Species `image_url` | 35 | 0 | 0 | 35 (Wikimedia) | 0 | 7/7 sampled 200 |
| Canonical flies `hero_image_url` | 162 | **36** | 3 | 123 (Supabase) | 0 | 3/3 Supabase 200 |

`canonical_flies` is a **view** over `flies` (`status = 'approved'`). It has `hero_image_url` only — no `gallery_image_urls` column. The audit script reads the view’s hero column.

### Null destinations (no hero at all)

Connecticut, Maryland, Massachusetts, Minnesota — Driftless, Nevada, New York — Catskills, Vermont, Washington, Wisconsin — Driftless.

### Hosts in the database (absolute URLs)

`(relative)` 339 · `images.unsplash.com` 167 · `qlasxtfbodyxbcuchvxz.supabase.co` 120 · `upload.wikimedia.org` 35 · `api.executiveangler.com` 7 · plus one-off shop CDNs already listed in `next.config.ts` (`cdn.shoplightspeed.com`, `assets.orvis.com`, `silver-creek.com`, `alaskaflyfishinggoods.com`, `worldcastanglers.com`, `gateslodge.com`, `www.tcoflyfishing.com`, `www.bendflyshop.com`, `minturnanglers.com`, `pacificflyfishers.com`, `www.nervouswaters.com`, `www.belizeriverlodge.com`, `www.sweetwaterflyshop.com`, `s3-us-west-2.amazonaws.com`).

**Decision: add no new `remotePatterns`.** Dead Unsplash IDs should be rehosted into Supabase storage, not allowlisted. Allowlisting a 404 does not fill a card.

## Why `/rivers` looks half-empty

Every river has a `hero_image_url`. The list page always passed it to `next/image`. In this snapshot `public/images/rivers/` is empty, so the optimizer 404s and the slot stays grey. Production has the JPEGs. The plate fallback (`PlateFallback` via `SafeEntityImage`) now covers missing *and* failed loads without waiting on a content backfill.

## Photo credit / overlay coupling

- **River hero** (`RiverHeroImage`): credit chip renders only when the photo is present and has not failed `onError`.
- **Destinations secondary cards:** overlay text sat on `from-forest-dark/80`. That token is not a reliable scrim when the image never arrives (Alaska featured is a split card — dark text panel is fine; the three secondary cards overlay white type on the photo). Replaced with an independent `from-black/80` scrim so type stays readable on the plate.
- **Mappers:** `normalizeImageUrl` returns `undefined` for null/blank. `SafeEntityImage` branches on that.

## Search index size (Part B input)

`GET https://www.executiveangler.com/api/search-index`

- **372,923 bytes** (~364 KB)
- **779 items:** fly-shop 230, fly 162, river 138, guide 106, destination 52, species 35, lodge 32, article 24
- **Recommendation: keep client-side scoring.** This is comfortably under a mobile first-interaction budget. Do not add `/api/search?q=` unless the index grows past ~1 MB.

Hatches are **not** in the index today. `/flies/hatch/[slug]` exists. A `hatches` table is not warranted — derive at index build from river `hatch_chart` JSON plus fly `imitates`.

## What changed in this PR

- `scripts/audit-images.ts` — read-only classifier (`ok` / `null` / `dead` / `host-not-allowlisted`), `--entity`, `--dry`, writes `reports/image-audit-<date>.{csv,json}`. `npm run audit:images`.
- `PlateFallback` + `SafeEntityImage` wired into river cards, destination cards, article cards, fly cards (`EntityCard` / compact / list), search rows, river/destination/article spotlights, `HeroCompact`, `HeroSection`, `MagazineGrid`.
- Search row **always** renders the 48px slot.
- River Unsplash placeholder removed. Credit chip gated on a loaded photo.
- Destination overlay scrim no longer depends on a loaded image.
- `next.config.ts` unchanged (no new hosts).

## Prioritised remediation (content, not this PR)

1. **Rivers** — keep relative heroes; ensure production `public/images/rivers/` stays in the deploy artifact. Optional: copy those JPEGs into this repo so previews match production.
2. **Fly shops** — 107 nulls + ~20% dead Unsplash. Rehost keepers to Supabase; do not keep Unsplash IDs that 404.
3. **Guides** — 76 missing `photo_url`. Plate is the designed absence until portraits exist.
4. **Destinations** — shoot or license the 9 null US states; Alaska is fine on production.
5. **Canonical flies** — 36 without `hero_image_url`; plate shows category/size until macros land.
6. **Species** — Wikimedia hosts are allowlisted; re-check any 404s individually and swap the file, do not add hosts.

## How to re-run

```bash
npm run audit:images          # HEAD checks, writes reports/image-audit-YYYY-MM-DD.*
npm run audit:images -- --dry
npm run audit:images -- --entity=rivers
```

Requires `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
