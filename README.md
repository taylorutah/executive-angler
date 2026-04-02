# Executive Angler

The fly fishing intelligence platform — track sessions, build recipes, analyze your data, fish better.

**Live:** [executiveangler.com](https://www.executiveangler.com)

---

## Stack

- **Next.js 16** — App Router, TypeScript, Turbopack
- **Supabase** — PostgreSQL, Auth, Storage
- **Tailwind CSS v4** — Styling (`@theme inline`, no config file)
- **Mapbox GL JS** — Interactive maps
- **Vercel** — Hosting, auto-deploy from `main`

## Platform

| Platform | Repo | Status |
|----------|------|--------|
| Web | [executive-angler](https://github.com/taylorutah/executive-angler) | Live |
| iOS | [executive-angler-ios](https://github.com/taylorutah/executive-angler-ios) | TestFlight |
| Android | [executive-angler-android](https://github.com/taylorutah/executive-angler-android) | Development |

## Content

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

## Key Features

- **Fishing Journal** — Session logging, catch tracking, multi-photo, Strava-style feed
- **Fly Tying Workbench** — Structured recipe builder, 500+ material autocomplete, PDF export
- **AI Insights** — Rule-based analytics + Claude API pattern analysis (premium)
- **USGS Flow Data** — 70+ gauges, live conditions, personal catch overlay
- **Trophy Wall** — Personal bests by species and river
- **User Reviews** — Rate and review lodges, guides, fly shops
- **Social Feed** — Kudos, comments, follows, DMs

## Development

```bash
npm install
npm run dev       # localhost:3000
npm run build     # production build
npm run seed      # seed data to Supabase (needs SUPABASE_SERVICE_ROLE_KEY)
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_SITE_URL=https://www.executiveangler.com
PHOTO_REVIEW_SECRET=         # HMAC photo approval links
RESEND_API_KEY=              # optional — photo notification emails
```

## Project Docs

- [`CLAUDE.md`](./CLAUDE.md) — Architecture, rules, session log
- [`STATUS.md`](./STATUS.md) — Current state, open items, deployment history
- [`docs/`](./docs/) — Changelogs, SEO docs, feature docs
