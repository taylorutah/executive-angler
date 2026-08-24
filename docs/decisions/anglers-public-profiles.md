# Decision: public angler profiles (`/anglers`, `/anglers/[username]`)

**Status:** disabled pending Taylor's decision  
**Date:** 2026-08-24  
**Lane:** Wave 0 / Phase 1 routes (Lane D)

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

`/anglers`, `/anglers/[username]`, and `/anglers/[username]/flies` now call `notFound()` for everyone, including the owner. Implementations were not deleted, so the routes can be restored after a product decision.

`robots.ts` already disallowed `/anglers/`. Sitemap never listed these URLs.

## Open question for Taylor

Should a public angler profile exist at all? If yes, which fields are allowed (display name / avatar / bio only)? Owner-only view of `/anglers/[username]` vs. keep 404 until a private profile lives under `/account`?
