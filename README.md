# Executive Angler

The world's definitive fly fishing resource — destinations, rivers, lodges, guides, fly shops, and species information for serious fly fishers.

**Live:** [executiveangler.com](https://executiveangler.com)

---

## Stack

- **Next.js 15** — App Router, TypeScript, ISR
- **Supabase** — PostgreSQL data layer, Auth, Storage
- **Tailwind CSS v4** — Styling
- **Mapbox GL JS** — Interactive maps on river and destination pages
- **Vercel** — Hosting, auto-deploy from `main`

## Content

| Entity | Count |
|--------|-------|
| Destinations | 31 |
| Rivers | 38 |
| Species | 35 |
| Lodges | 32 |
| Guides | 31 |
| Fly Shops | 49 |
| Articles | 16 |

All content served from Supabase with ISR caching. Static TypeScript fallbacks on every query — site never breaks if Supabase is down.

## Development

```bash
npm install
npm run dev       # localhost:3000
npm run build     # production build
npm run seed      # seed static data to Supabase (needs SUPABASE_SERVICE_ROLE_KEY)
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_SITE_URL=https://executiveangler.com
RESEND_API_KEY=          # optional — photo submission emails
PHOTO_REVIEW_SECRET=     # optional — HMAC photo approval links
```

## Project Docs

- [`CLAUDE.md`](./CLAUDE.md) — architecture, rules, session log
- [`STATUS.md`](./STATUS.md) — current state, open items, deployment history
- [`docs/Changelog/`](./docs/Changelog/) — session-by-session changelog
