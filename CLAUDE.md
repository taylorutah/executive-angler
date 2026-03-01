# Executive Angler — Project Documentation

## Quick Reference
- **URL:** https://executiveangler.com (Vercel)
- **Repo:** github.com/taylorutah/executive-angler
- **Supabase:** https://qlasxtfbodyxbcuchvxz.supabase.co
- **Dev:** `npm run dev` (http://localhost:3000)
- **Build:** `npm run build`

## Tech Stack
- Next.js 16 + React 19 + TypeScript 5
- Tailwind CSS v4 (CSS-based config with @theme inline)
- Supabase (PostgreSQL + Auth)
- Mapbox GL JS (interactive maps)
- Framer Motion (animations)
- Vercel (hosting, auto-deploy from main)
- Fonts: Playfair Display (headings) + Source Sans 3 (body)

## Project Structure
```
src/
  app/              # Next.js App Router pages
    destinations/   # Destination pages
    rivers/         # River pages with Mapbox maps
    lodges/         # Lodge pages
    guides/         # Guide profiles
    fly-shops/      # Fly shop pages
    articles/       # Article/instruction pages
    login/          # Auth pages
    signup/
    auth/callback/  # OAuth callback
    favorites/      # Protected - user favorites
    api/            # API routes
  components/
    layout/         # Header, Footer, MobileMenu
    ui/             # Shared UI components
    maps/           # Mapbox components
    content/        # Article/content components
    seo/            # Schema.org, structured data
  lib/
    supabase/       # Client, server, middleware
    utils.ts        # Utility functions
    constants.ts    # Site-wide constants
  data/             # Seed data (TypeScript constants)
  types/            # TypeScript type definitions
supabase/
  schema.sql        # Database DDL + RLS
  seed.sql          # Initial data
docs/
  Changelog/        # Session changelogs
```

## Database Schema
- `destinations` — Geographic regions (country/state level)
- `rivers` — Individual waterways with GPS, hatch data
- `lodges` — Fishing lodges with pricing, amenities
- `guides` — Professional guides with specialties
- `fly_shops` — Retail fly shops with services
- `articles` — Long-form editorial content
- `species` — Fish species reference
- `user_favorites` — User saved items (RLS: user_id)
- `user_profiles` — User settings (RLS: user_id)
- `reviews` — User reviews (RLS: user_id for write, public read)

## Auth
- Open signup (email/password + Google OAuth)
- Supabase Auth via @supabase/ssr
- Middleware refreshes sessions on all routes
- Only /favorites and /account require authentication
- All public content is readable without login

## Key Patterns
- Seed data lives in `src/data/` as TypeScript constants (primary source for session 1)
- All images use `next/image` — PLACEHOLDER images from Unsplash marked with comments
- Mapbox components use dynamic import with `ssr: false`
- Every entity page has Schema.org structured data via `JsonLd` component
- Content tables have public read RLS; user tables use `auth.uid() = user_id`

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_MAPBOX_TOKEN
NEXT_PUBLIC_SITE_URL
```

## Change Log
### 2026-03-01 — Initial Build
- Project scaffolded with Next.js 16, Tailwind v4, Supabase
- Full database schema with RLS policies
- Homepage, destination (Montana), river (Madison), lodge, guide, fly shop pages
- Euro Nymphing article (2000+ words)
- Mapbox integration for river/destination maps
- User auth flow (login, signup, favorites)
- SEO: sitemap, robots, llms.txt, Schema.org on all pages
- Deployed to Vercel, pushed to GitHub
