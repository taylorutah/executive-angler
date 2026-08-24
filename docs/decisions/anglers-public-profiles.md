# Decision: public angler profiles (`/anglers`, `/anglers/[username]`)

**Status:** resolved — profiles retired  
**Date:** 2026-08-24  
**Lane:** Wave 0 / Phase 1 routes (Lane W)

## Rationale

Being the anti-Fishbrain is the differentiator; a public profile is the surface that erodes it. Implementations deleted; slug-level fly redirects kept; `/feed` untouched.

## What these routes exposed

Brand Bible v3 §3 / the brief: never surface another angler's fish counts, GPS, spots, trip reports, or leaderboard.

Before this change, the public routes leaked:

| Surface | Field | Why it is a leak |
|---|---|---|
| `/anglers/[username]` | `stats.fish` (sum of `total_fish`) | another angler's fish counts |
| `/anglers/[username]` | per-session `total_fish` | another angler's fish counts |
| `/anglers/[username]` | per-session `river_name` | spots |
| `/anglers/[username]` | session `date` / `created_at` | trip reports |
| `/anglers/[username]` | `home_location` | location of another angler |
| `/anglers` | awards / crowns (`user_awards`, milestone badges) | gamification / leaderboard |
| `/anglers` | `home_location` | location of another angler |
| `/anglers/[username]/flies` | public pattern index for that angler | public inventory of another angler's flies |

Do not treat this list as exhaustive of every column on `profiles` or `fishing_sessions`. Only the fields above were observed on these pages.

## What we did

Deleted the implementations:

- `src/app/anglers/page.tsx`
- `src/app/anglers/[username]/page.tsx`
- `src/app/anglers/[username]/flies/page.tsx`
- `src/app/anglers/[username]/ProfileClient.tsx`

Those URLs now 404 via Next's `not-found.tsx`. That is correct.

Slug-level fly redirects kept: `/anglers/[username]/flies/[slug]` still resolves old bookmarks to `/flies/[slug]` (canonical library). It does not render another angler's journal.

`/feed` was not touched. Presence — river, section, weather, `like_count` — remains the only public social surface. The follow graph stays; nothing aggregates it into a ranking or a public total.

Live hrefs that pointed at deleted profile routes were replaced with a non-link, `/account` (owner's own identity only), `/feed` (presence), or `/journal/[id]` (session-scoped notifications).

`robots.ts` already disallowed `/anglers/`. Sitemap never listed these URLs.
