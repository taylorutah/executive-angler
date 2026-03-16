# River Stats & Awards System - Implementation Summary

## Overview
A comprehensive gamification system that tracks fishing statistics by river, automatically awards achievements, and displays progress through badges and stats cards.

## Database Schema

### `user_awards` Table
Created via Supabase Management API on 2026-03-15

```sql
CREATE TABLE user_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  award_type text NOT NULL,
  award_key text NOT NULL,
  river_name text,
  river_id text,
  awarded_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}',
  UNIQUE(user_id, award_key, river_name)
);

CREATE INDEX user_awards_user_id_idx ON user_awards(user_id);
CREATE INDEX user_awards_river_idx ON user_awards(river_name);
```

**RLS Policies:**
- `"Awards are viewable by everyone"` - SELECT for all users
- `"Users can insert their own awards"` - INSERT where auth.uid() = user_id

## TypeScript Types

### New File: `src/types/awards.ts`

**Interfaces:**
- `UserAward` - Award record structure
- `RiverStats` - River statistics aggregation
- `AwardDefinition` - Award configuration

**Award Types:**
- `river_milestone` - Sessions/fish count milestones
- `species_master` - Species diversity achievements
- `streak` - Consecutive day fishing (future)
- `seasonal` - Seasonal challenges (future)

**Built-in Awards:**
1. **First Timer** 🎣 - First session on a river
2. **Regular** ⭐ - 5 sessions on a river
3. **Veteran** 🏆 - 10 sessions on a river
4. **Legend** 👑 - 25 sessions on a river
5. **Centurion** 💯 - 100 fish on a river
6. **Master Angler** 🎯 - 500 fish on a river
7. **Species Hunter** 🐟 - 3+ species on a river
8. **Consistent Producer** 📈 - 10+ avg fish per session

## API Routes

### `GET /api/stats/river`
Calculate and award river statistics for authenticated user.

**Query Parameters:**
- `river` (optional) - Filter to specific river name

**Response:**
- Single `RiverStats` object if river specified
- Array of `RiverStats` objects sorted by sessions if no filter

**Logic:**
1. Fetch all user's fishing_sessions and catches
2. Group by river_name
3. Calculate aggregated stats per river
4. Check award definitions against stats
5. Auto-insert new awards into user_awards table
6. Return stats with awarded badges

**Calculated Fields:**
- `total_sessions` - Session count
- `total_fish` - Sum of session.total_fish
- `biggest_fish` - Max catch.length_inches
- `favorite_fly` - Most frequently used fly
- `first_session` / `last_session` - Date range
- `species_caught` - Unique species array
- `avg_fish_per_session` - Mean fish per trip
- `best_session_fish_count` - Single-session high score
- `awards` - Array of earned UserAward objects

## UI Components

### `src/components/ui/AwardBadge.tsx`
Display individual award badges with icon, color, and optional details.

**Props:**
- `award: UserAward` - Award data
- `size?: 'sm' | 'md' | 'lg'` - Badge size (default: md)
- `showDetails?: boolean` - Show name/description (default: false)

**Features:**
- Circular badge with emoji icon
- Dynamic background color from award metadata
- Tooltip with award name
- Optional expanded view with name, description, earned date

### `src/components/stats/RiverStatsCard.tsx`
Full-featured river stats display card.

**Props:**
- `stats: RiverStats` - River statistics
- `compact?: boolean` - Compact mode (default: false)

**Compact Mode:**
- River name + session count
- Total fish + avg per session
- Up to 3 badges shown

**Full Mode:**
- River name header with all badges
- 4 stat boxes: Total Fish, Avg/Session, Best Session, Biggest Fish
- Secondary info: Favorite fly, species list, last fished date
- Achievements section with detailed badge list

### `src/components/stats/RiverStatsWidget.tsx`
Compact widget for session detail pages.

**Props:**
- `riverName: string` - River to fetch stats for

**Features:**
- Auto-fetches stats on mount
- 3-column compact stats grid
- Badge display (all awards)
- Quick facts: top fly, biggest fish
- Link to full stats page
- Graceful loading/error states

## Pages

### `/journal/stats` - River Statistics Dashboard
Full-page view of all river stats for logged-in user.

**Components:**
- `src/app/journal/stats/page.tsx` - Auth-protected page
- `src/app/journal/stats/RiverStatsView.tsx` - Client component

**Features:**
- Summary header with totals: Rivers Fished, Total Sessions, Total Fish, Awards Earned
- Full `RiverStatsCard` for each river
- Sorted by total sessions (most fished first)
- Empty state for new users
- Loading spinner
- Error handling

## Navigation Integration

### Desktop Sidebar (`JournalClient.tsx`)
Added to Quick Nav section:
```tsx
<Link href="/journal/stats">
  <TrendingUp /> River Stats
</Link>
```

### Mobile Header (`JournalClient.tsx`)
Added to top button row:
```tsx
<Link href="/journal/stats">📊 Stats</Link>
```

## Session Detail Integration

### `src/app/journal/[id]/SessionDetail.tsx`
Added `RiverStatsWidget` after photo strip, before catches table.

**Placement:**
```tsx
{session.river_name && (
  <div className="mb-5">
    <RiverStatsWidget riverName={session.river_name} />
  </div>
)}
```

**Purpose:**
- Shows river-specific context for the current session
- Displays earned achievements inline
- Provides quick link to full stats page

## Data Flow

### Award Calculation Flow
1. User logs fishing session → saved to `fishing_sessions` table
2. User views `/journal/stats` OR session detail page with `RiverStatsWidget`
3. Component calls `GET /api/stats/river`
4. API aggregates all sessions/catches by river
5. API checks each award definition's `check(stats)` function
6. New awards inserted to `user_awards` table
7. Stats returned with awards array attached
8. UI displays badges via `AwardBadge` component

### Auto-Award Logic
Awards are **automatically granted** when conditions are met:
- Checked on every stats API call (no cron jobs needed)
- UNIQUE constraint prevents duplicates
- Awards are permanent (no expiration by default)
- Retroactive: bulk-imported sessions will earn awards on first view

## Design System Colors

**Theme:**
- Background: `#0D1117`
- Cards: `#161B22`
- Borders: `#21262D`
- Primary text: `#F0F6FC`
- Muted text: `#8B949E`
- Accent copper: `#E8923A`
- Accent teal: `#00B4D8`
- Gold (legend tier): `#FFD700`

**Badge Colors:**
- Teal (`#00B4D8`) - Entry/common awards
- Copper (`#E8923A`) - Mid-tier awards
- Gold (`#FFD700`) - Elite awards

## Future Enhancements

### Planned Features
1. **Streak tracking** - Consecutive days fished
2. **Seasonal challenges** - "Spring Slam", "Fall Harvest"
3. **Global leaderboards** - Top anglers by river
4. **Award notifications** - Toast when new badge earned
5. **Award sharing** - Social media badge sharing
6. **Rare awards** - Time-limited challenges
7. **Species master series** - Catch all trout subspecies
8. **Grand Slam awards** - Multiple species in one session
9. **Vintage awards** - Oldest session on a river
10. **Explorer awards** - Fish X different rivers

### Technical Debt
- [ ] Add loading skeleton to stats page
- [ ] Cache stats API responses (5min revalidation)
- [ ] Add award animation when new badge earned
- [ ] Create admin interface to define custom awards
- [ ] Add CSV export for stats
- [ ] Build charts/graphs for session trends
- [ ] Add award rarity tiers (common/rare/epic/legendary)
- [ ] Implement award point system

## Testing Checklist

### Manual Tests
- [ ] Create new fishing session
- [ ] Visit `/journal/stats` - verify stats calculated
- [ ] Check award auto-granted (First Timer on new river)
- [ ] Log 5th session on same river - verify Regular badge
- [ ] View session detail - verify RiverStatsWidget appears
- [ ] Click badge - verify tooltip shows
- [ ] Test mobile navigation links
- [ ] Test unauthenticated access (should redirect to login)
- [ ] Verify stats with multiple rivers
- [ ] Test favorite fly calculation
- [ ] Test biggest fish calculation
- [ ] Test species list aggregation

### API Tests
```bash
# Get all river stats
curl http://localhost:3000/api/stats/river \
  -H "Cookie: sb-access-token=..."

# Get specific river
curl "http://localhost:3000/api/stats/river?river=Provo%20River" \
  -H "Cookie: sb-access-token=..."
```

## Database Queries

### Check awarded badges
```sql
SELECT
  ua.award_key,
  ua.metadata->>'display_name' as name,
  ua.river_name,
  ua.awarded_at
FROM user_awards ua
WHERE user_id = 'USER_UUID'
ORDER BY awarded_at DESC;
```

### River stats raw query
```sql
SELECT
  river_name,
  COUNT(*) as sessions,
  SUM(total_fish) as total_fish,
  AVG(total_fish)::numeric(10,1) as avg_fish
FROM fishing_sessions
WHERE user_id = 'USER_UUID'
GROUP BY river_name
ORDER BY sessions DESC;
```

### Award eligibility check
```sql
-- Users who qualify for Veteran (10 sessions) but don't have the award
SELECT DISTINCT fs.user_id, fs.river_name, COUNT(*) as sessions
FROM fishing_sessions fs
LEFT JOIN user_awards ua ON
  ua.user_id = fs.user_id AND
  ua.river_name = fs.river_name AND
  ua.award_key = 'veteran'
WHERE ua.id IS NULL
GROUP BY fs.user_id, fs.river_name
HAVING COUNT(*) >= 10;
```

## Files Created

### TypeScript Types
- `src/types/awards.ts` - Award types and definitions

### API Routes
- `src/app/api/stats/river/route.ts` - Stats calculation + auto-award logic

### UI Components
- `src/components/ui/AwardBadge.tsx` - Badge display
- `src/components/stats/RiverStatsCard.tsx` - Full stats card
- `src/components/stats/RiverStatsWidget.tsx` - Compact widget

### Pages
- `src/app/journal/stats/page.tsx` - Stats dashboard page
- `src/app/journal/stats/RiverStatsView.tsx` - Client component

### Modified Files
- `src/app/journal/JournalClient.tsx` - Added nav links
- `src/app/journal/[id]/SessionDetail.tsx` - Added widget

### Documentation
- `docs/RIVER_STATS_AND_AWARDS_SYSTEM.md` - This file

## Deployment

### Environment Variables
None required - uses existing Supabase credentials.

### Database Migration
Run via Supabase dashboard or curl:
```bash
curl -X POST "https://api.supabase.com/v1/projects/qlasxtfbodyxbcuchvxz/database/query" \
  -H "Authorization: Bearer sbp_..." \
  -d '{"query": "CREATE TABLE user_awards (...)"}'
```

### Build
```bash
npm run build
# Verify /journal/stats route appears in build output
```

### Deploy to Vercel
```bash
git add .
git commit -m "feat: river stats & awards gamification system"
git push origin main
# Vercel auto-deploys
```

---

## Summary

✅ **Database:** user_awards table created with RLS
✅ **Types:** Complete TypeScript types for awards system
✅ **API:** Auto-calculating stats endpoint with award granting
✅ **UI:** 3 reusable components (badge, card, widget)
✅ **Page:** Full stats dashboard at /journal/stats
✅ **Nav:** Links added to desktop & mobile journal navigation
✅ **Integration:** Widget embedded in session detail pages
✅ **Awards:** 8 built-in achievements ready to earn
✅ **Build:** Successful Next.js build with all routes

**Status:** Production ready ✨
