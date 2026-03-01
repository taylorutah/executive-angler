# Executive Angler — Project Documentation

## Quick Reference
- **URL:** https://executiveangler.com (Vercel, auto-deploy from `main`)
- **Repo:** github.com/taylorutah/executive-angler
- **Supabase:** https://qlasxtfbodyxbcuchvxz.supabase.co
- **Vercel Project:** `prj_rUGzaVkIpr6VrBQKW7Kyf7CInZZW` / team `team_ysAhFGCZzRV2KEBFc1choVyX`
- **Dev:** `npm run dev` → http://localhost:3000
- **Build:** `npm run build`
- **Seed DB:** `npm run seed` (runs `npx tsx scripts/seed-all.ts`)

## Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.3 |
| Language | TypeScript | 5.x |
| CSS | Tailwind CSS v4 | 4.x (CSS-based `@theme inline`, NOT `tailwind.config.js`) |
| Database | Supabase (PostgreSQL) | @supabase/supabase-js 2.98 |
| Auth | Supabase Auth | @supabase/ssr 0.8 |
| Maps | Mapbox GL JS | 3.19 |
| Animation | Framer Motion | 12.34 |
| Email | Resend | 6.9 (lazy-init, optional) |
| Icons | Lucide React | 0.575 |
| Images | sharp | 0.34 (dev, for next/image optimization) |
| Analytics | @vercel/analytics + @vercel/speed-insights | |
| Fonts | Playfair Display (headings) + Source Sans 3 (body) | Google Fonts via CSS import |

## Project Structure
```
src/
  app/
    page.tsx                    # Homepage — hero, 6 featured sections, CTA
    layout.tsx                  # Root layout with Header/Footer
    globals.css                 # Tailwind v4 @theme inline + custom CSS
    sitemap.ts                  # Dynamic sitemap (all entities)
    robots.ts                   # robots.txt generation
    destinations/
      page.tsx                  # List: 25 destinations, filterable
      [slug]/page.tsx           # Detail: map, rivers, lodges, guides, photos
    rivers/
      page.tsx                  # List: 31 rivers, filterable
      [slug]/page.tsx           # Detail: Mapbox map, access points, hatch chart, photos
    species/
      page.tsx                  # List: 35 species, filterable by family
      [slug]/page.tsx           # Detail: taxonomy, conservation, tips, related content, photos
    lodges/
      page.tsx                  # List: 27 lodges, filterable
      [slug]/page.tsx           # Detail: gallery, amenities, Google Reviews, photos
    guides/
      page.tsx                  # List: 26 guides
      [slug]/page.tsx           # Detail: bio, specialties, Google Reviews, photos
    fly-shops/
      page.tsx                  # List: 27 shops
      [slug]/page.tsx           # Detail: hours, services, brands, Google Reviews, photos
    articles/
      page.tsx                  # List: 16 articles, filterable by category
      [slug]/page.tsx           # Detail: full HTML content, related entities
    login/page.tsx              # Email/password + Google OAuth
    signup/page.tsx             # Registration form
    auth/callback/route.ts      # Supabase OAuth callback handler
    favorites/page.tsx          # Protected — user's saved items
    admin/
      photos/page.tsx           # Photo moderation dashboard (no auth gate yet)
    api/
      favorites/route.ts        # GET/POST/DELETE user favorites (auth required)
      google-reviews/route.ts   # Proxy to Google Places API (requires GOOGLE_PLACES_API_KEY)
      photos/
        submit/route.ts         # POST photo submission + email notification
        review/route.ts         # GET photo approval/rejection via signed URL token
  components/
    layout/
      Header.tsx                # Responsive nav with mega dropdowns, mobile menu
      Footer.tsx                # 4-column footer with nav + social links
    ui/
      Badge.tsx                 # Category/status badges
      Breadcrumbs.tsx           # JSON-LD breadcrumb + visual breadcrumbs
      CommunityPhotos.tsx       # Displays approved photos for any entity (client component)
      EntityCard.tsx            # Reusable card: image, title, subtitle, meta, badges
      FavoriteButton.tsx        # Heart toggle, Supabase auth-aware (client component)
      GoogleReviews.tsx         # Google Places reviews display (graceful empty state)
      HeroSection.tsx           # Full-bleed hero with overlay
      PhotoLightbox.tsx         # Fullscreen photo viewer (client component)
      PhotoSubmissionForm.tsx   # Upload form with EXIF fields (client component, auth-aware)
      QuickFacts.tsx            # Key-value fact grid
      RatingStars.tsx           # Star rating display
      ScrollAnimation.tsx       # Framer Motion scroll-triggered fade-in
    maps/
      MapView.tsx               # Mapbox GL map component
      DynamicMapView.tsx        # Dynamic import wrapper (ssr: false)
    seo/
      JsonLd.tsx                # Schema.org structured data injection
  lib/
    constants.ts                # SITE_NAME, SITE_URL, NAV_LINKS, SOCIAL_LINKS
    utils.ts                    # Utility functions
    supabase/
      client.ts                 # Browser Supabase client
      server.ts                 # Server Supabase client (cookies-based)
      middleware.ts             # Session refresh helper
  data/                         # TypeScript seed data (primary content source)
    destinations.ts             #  900 lines — 25 destinations
    rivers.ts                   # 3168 lines — 31 rivers
    species.ts                  # 2236 lines — 35 species
    lodges.ts                   # 1130 lines — 27 lodges
    guides.ts                   #  680 lines — 26 guides
    fly-shops.ts                # 1320 lines — 27 fly shops
    articles.ts                 # 1299 lines — 16 articles (full HTML content)
  types/
    entities.ts                 # All TypeScript interfaces
    mapbox-point-geometry.d.ts  # Mapbox type shim
scripts/
  seed-all.ts                   # Seeds all src/data/* into Supabase (camelCase→snake_case)
  generate-logo.mjs             # SVG logo generation
supabase/
  schema.sql                    # Full DDL: 11 tables, indexes, RLS, triggers
public/
  images/                       # Local images (hero, logo variants)
  llms.txt                      # LLM-friendly site description
middleware.ts                   # Root middleware — Supabase session refresh on every route
docs/
  Changelog/                    # Session changelogs
```

## TypeScript Interfaces (src/types/entities.ts)
- `Destination` — id, slug, name, region, country, state?, tagline?, description, heroImageUrl, latitude, longitude, bestMonths[], primarySpecies[], licenseInfo?, elevationRange?, climateNotes?, regulationsSummary?, featured
- `River` — id, slug, name, destinationId (FK), description, heroImageUrl, lengthMiles?, flowType, difficulty (beginner|intermediate|advanced), wadingType (wade|float|both), primarySpecies[], regulations?, accessPoints[] (AccessPoint), bestMonths[], latitude, longitude, mapBounds?, hatchChart[] (HatchMonth), featured
- `AccessPoint` — name, latitude, longitude, description?, parking (bool)
- `HatchMonth` — month, hatches[] (HatchEntry)
- `HatchEntry` — insect, size, pattern, timeOfDay?, intensity? (sparse|moderate|heavy)
- `Lodge` — id, slug, name, destinationId (FK), description, heroImageUrl, galleryUrls[], websiteUrl?, phone?, email?, address?, latitude, longitude, priceRange?, priceTier, seasonStart?, seasonEnd?, capacity?, amenities[], nearbyRiverIds[], averageRating?, reviewCount, googlePlaceId?, googleRating?, googleReviewCount?, googleReviewsUrl?, featuredReviews[] (GoogleReview), featured
- `Guide` — id, slug, name, destinationId (FK), bio, specialties[], yearsExperience?, photoUrl?, websiteUrl?, phone?, email?, licenseNumber?, riverIds[], dailyRate?, googlePlaceId?, googleRating?, googleReviewCount?, googleReviewsUrl?, featuredReviews[] (GoogleReview)
- `FlyShop` — id, slug, name, destinationId (FK), description, heroImageUrl?, address, latitude, longitude, phone?, websiteUrl?, hours? (Record<string,string>), services[], brandsCarried[], googlePlaceId?, googleRating?, googleReviewCount?, googleReviewsUrl?, featuredReviews[] (GoogleReview)
- `Article` — id, slug, title, subtitle?, author, category (technique|destination|gear|conservation|culture|species), heroImageUrl, excerpt, content (HTML string), readingTimeMinutes, tags[], relatedDestinationIds[], relatedRiverIds[], publishedAt, featured
- `Species` — id, slug, commonName, scientificName?, family? (trout|salmon|char|grayling|saltwater|warmwater|pike), description?, imageUrl?, illustrationUrl?, nativeRange?, introducedRange?, averageSize?, recordSize?, recordDetails?, preferredHabitat?, preferredFlies[], taxonomy? ({ order, family, genus, species }), conservationStatus?, diet?, spawningInfo?, spawningMonths[], spawningTempF?, lifespan?, waterTemperatureRange?, flyFishingTips?, tackleRecommendations?, funFacts[], relatedDestinationIds[], relatedRiverIds[], distributionCoordinates[] ({ name, latitude, longitude }), featured
- `GoogleReview` — authorName, rating, text, relativeTimeDescription, profilePhotoUrl?, time
- `PhotoSubmission` — id, entityType, entityId, submitterName, submitterEmail, photoUrl, caption?, camera EXIF fields, status (pending|approved|rejected), submittedAt, approvedAt?
- `Review` — id, authorName, rating, title?, body, visitDate?, createdAt

## Database Schema (11 tables)

### Content Tables (public read, admin write)
| Table | Description | Key Columns |
|-------|------------|-------------|
| `destinations` | Geographic regions | slug, name, region, country, state, lat/lng, best_months[], primary_species[], featured |
| `rivers` | Individual waterways | slug, destination_id (FK), length_miles, flow_type, difficulty, wading_type, access_points (jsonb), hatch_chart (jsonb), map_bounds (jsonb), featured |
| `species` | Fish species reference | slug, common_name, scientific_name, family, taxonomy (jsonb), conservation_status, spawning_info, distribution_coordinates (jsonb), related_destination_ids[], related_river_ids[], featured |
| `lodges` | Fishing lodges | slug, destination_id (FK), price_range, price_tier, capacity, amenities[], nearby_river_ids[], google_place_id, featured_reviews (jsonb), featured |
| `guides` | Professional guides | slug, destination_id (FK), specialties[], years_experience, river_ids[], daily_rate, google_place_id, featured_reviews (jsonb) |
| `fly_shops` | Retail shops | slug, destination_id (FK), address, hours (jsonb), services[], brands_carried[], google_place_id, featured_reviews (jsonb) |
| `articles` | Editorial content | slug, title, author, category, content (HTML), reading_time_minutes, tags[], related_destination_ids[], related_river_ids[], featured |
| `photo_submissions` | Community photos | entity_type, entity_id, submitter_name, submitter_email, photo_url, camera EXIF fields, status (pending/approved/rejected), user_id (FK nullable) |

### User Tables (RLS: auth.uid() = user_id)
| Table | Description | RLS |
|-------|------------|-----|
| `user_favorites` | Saved items | SELECT/INSERT/DELETE own only |
| `user_profiles` | User settings | SELECT/INSERT/UPDATE own only |
| `reviews` | User reviews | SELECT public, INSERT/UPDATE/DELETE own only |

### RLS Policy Summary
- All 7 content tables: public read (`for select using (true)`), no public write
- `photo_submissions`: public read WHERE `status = 'approved'`, users can view own, authenticated users can insert
- `user_favorites`: scoped to `auth.uid() = user_id` for select/insert/delete
- `user_profiles`: scoped to `auth.uid() = user_id` for select/insert/update
- `reviews`: public read, `auth.uid() = user_id` for insert/update/delete
- **No admin write policies exist yet** — content is managed via seed data or Supabase dashboard direct access

### Indexes
- All content tables indexed on `slug`
- FK indexes: `rivers.destination_id`, `lodges.destination_id`, `guides.destination_id`
- `articles`: indexed on `category` and `published_at`
- `user_favorites`: indexed on `user_id` and `(entity_type, entity_id)`
- `reviews`: indexed on `(entity_type, entity_id)` and `user_id`
- `photo_submissions`: indexed on `(entity_type, entity_id)`, `status`, `user_id`

### Triggers
All tables with `updated_at` columns have `update_updated_at_column()` before-update trigger.

## Auth
- **Provider:** Supabase Auth via `@supabase/ssr`
- **Methods:** Email/password + Google OAuth (Google OAuth needs Cloud credentials configured in Supabase dashboard)
- **Middleware:** `src/middleware.ts` → calls `updateSession()` from `src/lib/supabase/middleware.ts` on every request to refresh session cookies
- **Protected routes:** Only `/favorites` requires authentication (redirects to `/login`)
- **OAuth callback:** `src/app/auth/callback/route.ts` exchanges auth code for session
- All public content readable without login

## Content Data Model
All content lives as TypeScript constants in `src/data/`. Pages use `generateStaticParams()` to pre-render at build time. The seed script (`scripts/seed-all.ts`) can push this data to Supabase, but **pages currently read from the TS files, NOT from Supabase queries**. The only Supabase reads at runtime are `user_favorites`, `photo_submissions` (approved), and `reviews`.

### Content Counts
| Entity | Count | Featured |
|--------|-------|----------|
| Destinations | 25 | 6 |
| Rivers | 31 | 4 |
| Species | 35 | 6 |
| Lodges | 27 | 3 |
| Guides | 26 | — |
| Fly Shops | 27 | — |
| Articles | 16 | 3 |

### Species Families (35 total)
trout (10), salmon (5), char (5), grayling (2), saltwater (5), warmwater (5), pike (3)

### Article Categories (16 total)
technique (6), destination (3), gear (2), conservation (2), culture (2), species (1)

## Component Integration Map
Every entity detail page includes:
- `JsonLd` — Schema.org structured data
- `Breadcrumbs` — visual + JSON-LD
- `FavoriteButton` — auth-aware heart toggle
- `CommunityPhotos` — approved community photos from Supabase
- `PhotoSubmissionForm` — upload form (requires Supabase auth)

Lodges, Guides, and Fly Shops additionally include:
- `GoogleReviews` — displays Google Places reviews (requires `GOOGLE_PLACES_API_KEY`, shows graceful empty state without it)

Rivers and Destinations additionally include:
- `DynamicMapView` — Mapbox GL interactive map with markers

## Environment Variables
```bash
# Required for basic functionality
NEXT_PUBLIC_SUPABASE_URL=https://qlasxtfbodyxbcuchvxz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_MAPBOX_TOKEN=<mapbox public token>
NEXT_PUBLIC_SITE_URL=https://executiveangler.com

# Optional — features degrade gracefully without these
GOOGLE_PLACES_API_KEY=<key>         # Google Reviews component — shows empty state without it
RESEND_API_KEY=<key>                # Photo approval email notifications — silently skipped without it
PHOTO_REVIEW_SECRET=<secret>        # HMAC token for signed photo approval/rejection URLs
```

## Key Patterns & Gotchas

### Tailwind v4 — NO tailwind.config file
- Config is in `src/app/globals.css` using `@theme inline { }` — there is **NO** `tailwind.config.js` or `.ts`
- Custom colors: `forest`, `forest-light`, `forest-dark`, `river`, `river-light`, `river-dark`, `cream`, `cream-dark`, `gold`, `gold-light`, plus `slate-100` through `slate-950`
- Custom fonts: `font-heading` (Playfair Display), `font-sans` (Source Sans 3)
- If you need to add theme values, edit `@theme inline { }` in `globals.css`

### Images — Almost All Placeholders
- All entity images are Unsplash URL placeholders (comments in data files note this)
- `next/image` used everywhere with `sizes` attributes
- `next.config.ts` remote patterns: `images.unsplash.com`, `plus.unsplash.com`, `qlasxtfbodyxbcuchvxz.supabase.co/storage/**`
- Only real local image: `/public/images/madison-river-three-dollar-bridge.jpg` (homepage hero)
- Logo files: `logo.svg`, `logo-1200.png`, `logo-source.jpg` in `/public/images/`

### Mapbox — Dynamic Import Required
- `MapView.tsx` is the actual map; `DynamicMapView.tsx` wraps it with `dynamic(() => import(...), { ssr: false })`
- Always import `DynamicMapView`, never `MapView` directly in pages
- Requires `NEXT_PUBLIC_MAPBOX_TOKEN` — maps render blank without it
- River pages: markers for access points + river bounds
- Destination pages: region overview bounds

### Resend — Lazy Initialization
- Used in `api/photos/submit/route.ts` and `api/photos/review/route.ts`
- Initialized via `getResend()` function that returns `null` when `RESEND_API_KEY` is missing
- Called with optional chaining: `resend?.emails.send()`
- Build will NOT fail without the key; emails just won't send
- **Sender domain must be verified in Resend dashboard** before emails will actually deliver

### Photo System Flow
1. Authenticated user fills `PhotoSubmissionForm` → file uploaded to Supabase Storage bucket `photo-submissions` → row inserted into `photo_submissions` table with status `pending`
2. If Resend is configured: admin email receives notification with signed approve/reject links
3. Admin clicks link → `GET /api/photos/review?token=<HMAC>&action=approve&id=<uuid>` → updates row status
4. `CommunityPhotos` component queries Supabase for `photo_submissions` where `status = 'approved'` and matching `entity_type`/`entity_id`
5. Admin dashboard at `/admin/photos` shows all pending submissions
6. **Important:** The admin dashboard has NO authentication gate — anyone with the URL can view it. The approve/reject links DO require valid HMAC tokens.

### Static Generation
- All entity pages use `generateStaticParams()` reading from `src/data/*` TypeScript constants
- Pages are pre-rendered at build time as static HTML (200+ pages)
- API routes (`/api/*`) are serverless functions
- **Pages do NOT query Supabase for content** — only for user data (favorites, photos, reviews)

### Homepage Section Backgrounds (alternating)
1. Hero (full-bleed image)
2. Featured Destinations → `bg-cream`
3. Legendary Rivers → `bg-white`
4. Popular Species → `bg-cream`
5. Premier Lodges → `bg-white`
6. Latest Articles → `bg-cream`
7. CTA → full-bleed image

### Nav Structure (src/lib/constants.ts)
Destinations (mega: Montana, Wyoming, Colorado, Idaho, Alaska, New Zealand, View All) → Rivers (mega: Madison, Yellowstone, Gallatin, Missouri, View All) → Species (mega: Trout, Salmon, Saltwater, Warmwater, View All) → Lodges → Guides → Articles (mega: Techniques, Destinations, Gear, Conservation, View All) → Fly Shops

## Known Issues & Missing Pieces
1. **All images except hero are Unsplash placeholders** — need real photography or licensed stock
2. **Admin dashboard (`/admin/photos`) has NO authentication gate** — anyone with the URL can view pending photos
3. **Supabase Storage bucket `photo-submissions` must be created manually** via Supabase dashboard (settings: public bucket, 10MB file size limit, allowed MIME: image/jpeg, image/png, image/webp)
4. **Google OAuth not configured** — needs Google Cloud OAuth credentials added in Supabase Auth dashboard
5. **Pages read from TypeScript files, not Supabase** — the seed script exists but pages are not wired to query the database; migrating to Supabase reads is a future task
6. **No `/about` or `/contact` pages** — sitemap references them but they don't exist
7. **No search functionality** — not implemented
8. **No admin content management** — all content changes require editing `src/data/*.ts` files and redeploying
9. **Resend sender domain not verified** — photo notification emails will fail until configured in Resend dashboard
10. **Google Places API key not set** — `GoogleReviews` component shows empty state on all entities
11. **`PHOTO_REVIEW_SECRET` not set** — photo approval HMAC links will not generate correctly without it
12. **No user review submission UI** — database table and RLS exist but no form/page to write reviews

## Deployment
- Vercel auto-deploys on push to `main`
- Build command: `next build` (Vercel default)
- Output: ~200 static HTML pages + 4 serverless API routes
- No special build-time env vars beyond the `NEXT_PUBLIC_*` ones
- Serverless functions need `RESEND_API_KEY`, `GOOGLE_PLACES_API_KEY`, `PHOTO_REVIEW_SECRET` set in Vercel dashboard for full functionality

## Change Log
See `docs/Changelog/` for session-by-session details.
