# Decision: public angler profiles (`/anglers`, `/anglers/[username]`)

**Status:** resolved — profiles retired  
**Date:** 2026-08-24  
**Lane:** W (Build Brief III)

## Decision

Public angler profiles stay off, permanently.

Being the anti-Fishbrain is the differentiator; a public profile is the surface that erodes it. Nothing in the product needs one. Presence on `/feed` is the only public social surface — river, section, weather, nothing else.

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

Left in place (already a redirect, not a profile): `/anglers/[username]/flies/[slug]` still resolves old bookmarks to `/flies/[slug]` (canonical library). It does not render another angler's journal.

## What we did

`/anglers`, `/anglers/[username]`, and `/anglers/[username]/flies` call `notFound()` for everyone, including the owner. Implementations (`ProfileClient.tsx` and any directory clients) are deleted. Thin route files remain so the URLs stay 404 with `robots: noindex`.

Live `/anglers/${username}` hrefs on `/feed`, comments, notifications, session detail, and account follow tabs were removed or retargeted to `/account` (own follow counts only). Fly permalinks and `/flies/by-id` resolve to `/flies/[slug]`, not angler URLs.

`robots.ts` already disallowed `/anglers/`. Sitemap never listed these URLs.

Follow graph and `like_count` stay. They are not aggregated into rankings or public totals.

`/feed` is unchanged except for the profile href removal. It reads `session_presence` (river, section, weather only) and is the only public social surface.
