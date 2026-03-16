# River Stats & Awards - UI Guide

## User Journey

### 1. Navigation Access

**Desktop Sidebar**
```
┌─────────────────────────┐
│  👤 User Profile        │
│  📊 Sessions: 42        │
│  🐟 Fish: 287           │
│  🏞️ Rivers: 8           │
├─────────────────────────┤
│  📖 Journal             │
│  📈 River Stats    ← NEW│
│  🪰 My Fly Box          │
│  🎣 Gear Box            │
│  ❤️ Favorites           │
│  ⚙️ Settings            │
└─────────────────────────┘
```

**Mobile Header**
```
┌─────────────────────────────────────┐
│ 📊 Stats | 🪰 Flies | 🎣 Gear | +Log│ ← NEW
└─────────────────────────────────────┘
```

### 2. River Stats Dashboard (`/journal/stats`)

```
┌────────────────────────────────────────────────────────┐
│  📈 Your River Stats                                   │
├────────────────────────────────────────────────────────┤
│  Rivers Fished: 8    Total Sessions: 42               │
│  Total Fish: 287     Awards Earned: 12                │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Provo River                             🎯 💯 👑 ⭐ 🎣│
│  28 sessions · 189 fish                                │
├────────────────────────────────────────────────────────┤
│  ┌──────────┬──────────┬──────────┬──────────┐       │
│  │ 189      │ 6.8      │ 22       │ 18.5"    │       │
│  │ Total    │ Avg/Trip │ Best Day │ Biggest  │       │
│  └──────────┴──────────┴──────────┴──────────┘       │
├────────────────────────────────────────────────────────┤
│  Favorite Fly: Zebra Midge                            │
│  Species (3): Rainbow, Brown, Cutthroat               │
│  Last Fished: Mar 10, 2026                            │
├────────────────────────────────────────────────────────┤
│  ⭐ Achievements                                       │
│  🎣 First Timer                                       │
│     First session on this river                       │
│     Earned Mar 5, 2025                                │
│                                                        │
│  ⭐ Regular                                            │
│     5 sessions on this river                          │
│     Earned Jun 12, 2025                               │
│                                                        │
│  🏆 Veteran                                            │
│     10 sessions on this river                         │
│     Earned Sep 3, 2025                                │
│                                                        │
│  👑 Legend                                             │
│     25 sessions on this river                         │
│     Earned Feb 8, 2026                                │
│                                                        │
│  💯 Centurion                                          │
│     100 fish caught on this river                     │
│     Earned Dec 15, 2025                               │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Green River                                  🏆 ⭐ 🎣│
│  12 sessions · 84 fish                                 │
│  ...                                                   │
└────────────────────────────────────────────────────────┘
```

### 3. Session Detail Widget

When viewing a single session (`/journal/[id]`):

```
┌────────────────────────────────────────────────────────┐
│  Session: Provo River - Below Jordanelle               │
│  March 10, 2026                                        │
│                                                        │
│  Notes: Great BWO hatch mid-morning. Water clarity... │
│                                                        │
│  Stats:  22 Fish  |  41°F  |  18.5"  |  Clear        │
│  Flies:  🪰 Zebra Midge  🪰 Pheasant Tail            │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  📈 Provo River Stats             View All →          │
├────────────────────────────────────────────────────────┤
│  ┌──────────┬──────────┬──────────┐                  │
│  │ 28       │ 189      │ 6.8      │                  │
│  │ Sessions │ Total    │ Avg/Trip │                  │
│  └──────────┴──────────┴──────────┘                  │
├────────────────────────────────────────────────────────┤
│  Achievements (5)                                      │
│  🎣 ⭐ 🏆 👑 💯                                       │
├────────────────────────────────────────────────────────┤
│  Top Fly: Zebra Midge                                 │
│  Biggest: 18.5"                                       │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Photos (8) · tap to expand                           │
│  [img] [img] [img] [img] [img] [img] [img] [img]     │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Fish Caught                                  22 total │
│  ┌──────────┬────────┬────────────┬──────┬──────┐    │
│  │ Species  │ Length │ Fly        │ Pos  │ Time │    │
│  ├──────────┼────────┼────────────┼──────┼──────┤    │
│  │ Rainbow  │ 14.5"  │ Zebra Mid. │ #1   │ 9:15 │    │
│  │ Brown    │ 18.5"  │ Pheas. Tail│ #2   │ 9:42 │    │
│  └──────────┴────────┴────────────┴──────┴──────┘    │
└────────────────────────────────────────────────────────┘
```

## Award Badge Styles

### Size Variants
```
Small (8x8):   🎣
Medium (12x12): 🏆
Large (16x16):  👑
```

### Color Tiers
- **Teal** (#00B4D8) - Entry awards (First Timer, Centurion)
- **Copper** (#E8923A) - Mid-tier (Regular, Veteran, Master Angler)
- **Gold** (#FFD700) - Elite (Legend)

### Badge Display Modes

**Icon Only (compact)**
```
🎣 ⭐ 🏆
```

**With Details**
```
┌─────────────────────────────────────┐
│ 🏆  Veteran                         │
│     10 sessions on this river       │
│     Earned Sep 3, 2025              │
└─────────────────────────────────────┘
```

## Complete Award List

| Award | Icon | Tier | Requirement |
|-------|------|------|-------------|
| First Timer | 🎣 | Teal | 1 session on river |
| Regular | ⭐ | Copper | 5 sessions on river |
| Veteran | 🏆 | Copper | 10 sessions on river |
| Legend | 👑 | Gold | 25 sessions on river |
| Centurion | 💯 | Teal | 100 fish on river |
| Master Angler | 🎯 | Copper | 500 fish on river |
| Species Hunter | 🐟 | Teal | 3+ species on river |
| Consistent Producer | 📈 | Teal | 10+ avg fish/session |

## Interactive Elements

### Clickable Areas
- Badge tooltips (hover for award name)
- "View All →" link in widget → opens `/journal/stats`
- River name in stats card → future: link to river detail page
- Award badges → future: show achievement details modal

### Auto-Update Behavior
- Stats recalculated on every page load
- Awards granted automatically when threshold met
- No manual "claim" button needed
- Retroactive: bulk imports earn awards on first stats view

## Responsive Behavior

### Desktop (≥1024px)
- Full stats cards with all details
- Sidebar navigation always visible
- 4-column stat boxes

### Tablet (768px - 1023px)
- Compact stats cards
- 2-column stat boxes
- Sidebar hidden, top nav only

### Mobile (<768px)
- Minimal stats widget
- 2-column grid for stats
- Horizontal scroll for badges
- Abbreviated labels

## Loading States

### Stats Page
```
┌────────────────────────────────────┐
│         ⏳ Loading...              │
└────────────────────────────────────┘
```

### Widget (inline)
```
┌────────────────────────────────────┐
│  📈 Provo River Stats              │
│         ⏳                         │
└────────────────────────────────────┘
```

### Error State
```
┌────────────────────────────────────┐
│  ⚠️ Failed to load stats           │
│  (silently hidden for widget)      │
└────────────────────────────────────┘
```

## Empty States

### New User (no sessions)
```
┌────────────────────────────────────┐
│         📈                         │
│    No stats yet                    │
│                                    │
│  Log some fishing sessions to      │
│  see your river stats!             │
└────────────────────────────────────┘
```

## Performance Notes

- Stats calculated on-demand (no caching yet)
- Award checks run on every stats fetch
- UNIQUE constraint prevents duplicate awards
- API response ~200-500ms for 50+ sessions
- Consider adding 5min cache in future

## Accessibility

- All badges have `title` attributes for tooltips
- Semantic HTML with proper heading hierarchy
- Color contrast meets WCAG AA (tested)
- Keyboard navigation supported on all links
- Screen readers: badge icons + text labels

---

## Quick Testing Script

```bash
# 1. Create test session
curl -X POST http://localhost:3000/api/fishing/session \
  -H "Cookie: sb-access-token=..." \
  -d '{"river_name":"Test River","date":"2026-03-15","total_fish":10}'

# 2. Fetch stats
curl http://localhost:3000/api/stats/river \
  -H "Cookie: sb-access-token=..."

# 3. Check awards granted
# Should see "First Timer" badge in response
```

## Visual Design Checklist

✅ Dark theme (#0D1117 background)
✅ Copper/teal accent colors
✅ Card-based layout with borders
✅ Large stat numbers (Strava-style)
✅ Emoji icons for visual interest
✅ Rounded corners (12px radius)
✅ Subtle hover states
✅ Consistent spacing (Tailwind scale)
✅ Mobile-first responsive
✅ Loading spinners for async content
