# Executive Angler — Build Brief III
## Finish The Water Desk

Standing brief. Work it top to bottom. Do not stop between lanes to ask what's next — the queue is at the bottom and it is the answer.

## Decisions already made — do not re-open these

| Question | Decision |
|---|---|
| Public angler profiles | **Stay off, permanently.** `/anglers`, `/anglers/[username]`, `/anglers/[username]/flies` keep returning 404 for everyone. See Lane W. |
| `/destinations` → `/places`, `/articles` → `/field-notes` | **Labels only. URLs do not change.** See Lane E. |
| Unverifiable regulations / fishing facts | **Never edit the text.** Flag it, add `verified_at`, surface "last checked". See Lane V2. |

**Reference specs, read before starting:**
- `Life/Executive-Angler/Brand/Website-Design-Review-2026-08-23.md` — the design spec
- `Life/Executive-Angler/Brand/Brand-Bible-v4.md` — **current.** The Water Desk identity: desk/notebook duality, voice, palette, banned copy, the free-tier position. v3.1 and v3 are superseded (v3 still holds the full redaction matrix).
- `Life/Executive-Angler/Website/Part-3-Contrast-Verdict-2026-08-24.md` — **read this before touching contrast**
- `CLAUDE.md` — repo rules. They win over anything here.

---

# OPERATING MODEL

**One lane, one worktree, one agent.** Never two lanes in a checkout.

```bash
git worktree add ../ea-<lane> -b <branch> origin/main && cd ../ea-<lane> && npm ci
# when merged:
git worktree remove ../ea-<lane>
```

**File ownership is declared per lane. An agent may only edit files its lane owns.** If you need a change in another lane's file, do not make it — open an issue `[cross-lane] <file> — <what>` and stub around it.

Sole owners of the three collision-prone files:

| File | Owner |
|---|---|
| `src/app/globals.css` | **Lane E** |
| `src/components/layout/Header.tsx`, `Footer.tsx`, `MobileTabBar.tsx` | **Lane E** |
| `src/app/sitemap.ts`, `robots.ts`, `llms.txt/route.ts` | **nobody this brief — frozen during the organic recovery** |

Rebase on `origin/main` before opening a PR and again before merge. Never merge `main` into a lane branch. **Push branches and open PRs; never push to `main`** — it auto-deploys to production.

---

# THE VERIFICATION CONTRACT

Every PR runs all of this. A PR that skips a step is not done.

```bash
npm run build                     # must be green
npm test                          # search suite, 24/24
npm run check:hex                 # no new hardcoded hex outside src/data/**
npm run check:contrast            # declared token pairs
npm run check:contrast:rendered   # painted output — see the caveat below
npm run test:visual               # visual regression (built in Lane U3)
npm run test:e2e                  # journey smoke (built in Lane U3)
```

**The contrast caveat.** After Lane V0 lands, `check:contrast:rendered` reports two buckets: `failures` (gating) and `unverifiable` (image-backed, non-gating, generates a visual-review list). **Do not gate CI on `unverifiable`, and do not "fix" a title by repainting it dark just to move the number.** The Part 3 verdict has the arithmetic: a hero title in the 0.8-alpha band of the scrim measures 8.45:1 and is fine; one in the 0.3-alpha band measures 2.14:1 and is a real bug. Judge by position, not by class name.

**Every PR body includes:** what changed · before/after screenshots at 1440 and 390 · the six command results above · any route redirects introduced · the measured numbers the lane asked for.

---

# DO NOT BREAK LOGIN — read before every lane

Auth is the one thing on this site that cannot have a bad day. Several lanes move routes that the auth layer hardcodes. Treat this as a checklist, not advice.

**The files that decide whether people can log in:**

| File | Why it matters |
|---|---|
| `src/middleware.ts` | Broad negative-lookahead matcher — new top-level routes are covered automatically. **Do not narrow it.** |
| `src/lib/supabase/middleware.ts` | `PROTECTED_PATHS` / `PROTECTED_EXACT` / `EMAIL_VERIFIED_REQUIRED` lists, session refresh, and the `/login?redirect=` bounce. **Any lane that adds, renames or deletes an authenticated route must update these lists in the same PR.** |
| `src/app/login/page.tsx` | Line ~36 hardcodes `"/dashboard"` as the post-login default, and line ~142 compares against it. |
| `src/app/signup/page.tsx` | Builds `emailRedirectTo` → `/auth/callback?next=…`. |
| `src/lib/auth-context.tsx` | Shared session state consumed by the header. |

**Rules:**

1. **Never touch `/auth/callback`, `/verify-email`, `/reset-password`, `/forgot-password`.** Not renamed, not redirected, not wrapped in a route group, not behind a new layout. An email link that 404s is an account nobody can recover.
2. **Lane G owns the `/dashboard` → `/today` move and must change the post-login default in the same PR.** Leaving `login/page.tsx` pointing at `/dashboard` makes every single login a double redirect, and query strings do not always survive a chained 308. Update the string, the comparison on line ~142, and `PROTECTED_EXACT`.
3. **Lane G must add `/today` and `/rivers/mine` to `PROTECTED_PATHS` before they exist.** A private surface that is not in that list is public.
4. **Lane W must remove `/anglers` entries from those lists** when it deletes the routes, or the middleware bounces users to `/login` for a page that no longer exists.
5. **`src/lib/supabase/middleware.ts` line ~155 already redirects authenticated users away from `/`.** Lane F requires `/` to stay byte-identical for everyone and reachable while signed in. **Reconcile it: the logo targets `/today` when authenticated; `/` itself must not auto-redirect.** A logged-in angler who wants to look at the front page is allowed to.
6. **No redirect may chain more than once.** After any lane that adds a redirect, run the loop check below.
7. **Never edit `next.config.ts`'s host redirect** (`executiveangler.com` → `www`). A loop there takes down auth callbacks along with everything else.

**Every PR that touches routing, middleware, or the header runs this before review:**

```bash
npm run test:e2e -- --grep auth      # built in Lane U3
```

covering: sign in with email · sign in with Google · sign up → verify-email → callback · password reset round trip · deep link to a protected page while signed out lands on `/login?redirect=…` and returns there after auth · signed-in user can still open `/` · sign out · session survives a hard refresh. **Any lane that cannot make these pass does not merge.**

---

# STANDING GUARDRAILS

- **Privacy ethic is absolute.** Never surface another angler's fish counts, GPS, spots, trip reports, or any leaderboard. No public catch maps, no social feed, no gamification, no streaks-as-pressure. If a task seems to need it, stop and ask.
- **There is no paid tier** (`afb8286`). No Pro, no `/pricing`, no upgrade prompts, no Founders copy. Former Pro features are just features; a logged-out visitor hitting one gets a **signed-out state, not a paywall**.
- **Banned copy** (Brand Bible v3.1 §6): "the fly fishing intelligence platform" · "definitive" · "the world's finest waters" · "discerning" · "premier" · "curated for the discerning fly fisher" · "tight lines" and every sign-off · "leaderboard" · any Pro/upgrade/gift/Founders language.
- **Don't fabricate fishing facts.** Flag for Taylor instead.
- Surgical changes. Do not refactor adjacent code.

---

# LANE V0 — Land what's outstanding (do this first, one agent, ~30 min)

Three pieces of finished work are waiting. Get them onto `main` before anything else starts, or every lane below rebases onto a moving target.

1. **Merge PR #25** (`fix/type-and-contrast`) — validated, correct.
2. **Merge PR #26** (`fix/images`) — validated, correct. Stacked on #25, so merge in order.
3. **Apply the waiting patch:**
   ```bash
   git checkout -b fix/contrast-compositing origin/main
   git am patches/0001-fix-contrast-composite-sibling-overlays-instead-of-r.patch
   npm run build && npm test && npx eslint scripts/check-contrast-rendered.ts
   git push -u origin HEAD
   ```
   It rewrites the rendered-contrast checker to composite absolutely-positioned sibling scrims, sample `linear-gradient` stops at the element's actual vertical position, evaluate the worst case with the photo absent, and bucket image-backed text as `unverifiable`. It also fixes the credit chips in `HeroSection` (`text-white/50` on `bg-black/40` ≈ 3.26:1 at 10px). Verified: `tsc` clean, `eslint` clean, tests 24/24, and the injected browser string parse-checked with `new Function()`.

   **Keep that parse check permanently** — add it as a test. It caught a backtick inside a comment that silently terminated the `SAMPLE_PAGE` template literal, which `tsc` passed.

4. Then re-run `check:contrast:rendered` and post the **new** failure and unverifiable counts. That is the real baseline; 1,446 was not.

---

# LANE U3 — Visual regression + e2e harness (second, before any visual lane)

`branch: test/harness` · owns `tests/**`, `playwright.config.ts`, test scripts in `package.json`

Build the safety net **before** the lanes that change everything visually. Two regressions have already reached production this week (the type inversion, the invisible `h1`); both would have been caught here.

**Visual regression** — Playwright screenshots, committed baselines:
- Routes: `/`, `/rivers`, `/rivers/madison-river`, `/flies`, `/flies/library`, `/flies/pheasant-tail`, `/destinations`, `/destinations/new-zealand`, `/articles`, `/search?q=green+river`, `/login`, `/journal`, `/dashboard`, `/styleguide`
- 1440 and 390. Full-page. Mask timestamps, live flow values, and anything else non-deterministic — a flaky baseline is worse than none.
- Deterministic fixtures: freeze the clock, stub `/api/search-index` and the USGS calls.
- `npm run test:visual` and `npm run test:visual -- --update-snapshots`.

**Journey smoke tests** — the five journeys from the design review:
1. stranger lands on a river page → sees flow, hatch, access
2. stranger searches "pmd hatch" → gets hatches and flies, **not fly shops**
3. stranger searches "green river" → Green River is result 1
4. logged-out visitor cannot see any journal surface
5. authenticated user reaches `/today` from the logo

Use the QA account in `CLAUDE.md`. `npm run test:e2e`.

**Also:** a `font-census` assertion — on `/`, `/rivers/madison-river`, `/flies/library`, assert Archivo is the dominant computed family, Fraunces appears only on headings, and Newsreader appears **only** inside `.prose` / `.article-body`. That is a one-line test that permanently prevents the regression that cost a day.

---

# WAVE 1 — the identity fix

## LANE E — The navigation (serialising; F, G, H wait for it)
`branch: phase1/chrome` · owns `Header.tsx`, `Footer.tsx`, `MobileTabBar.tsx`, the new nav components, `globals.css`

**This is the most important lane in the brief.** The bar currently contains one item — "Flies" — so a visitor standing on `/rivers`, a page listing 138 rivers, has no navigational evidence that rivers exist. Everything else in The Water Desk is downstream of fixing that. Build it properly; do not treat it as plumbing between the homepage and the templates.

### The primary bar — logged out

```
[mark]   Rivers   Flies   Places   Field Notes  │  Learn      [ search input ]   Sign in   [ Get the app ]
         └──────── four nouns ────────┘  hairline  └ a path ┘
```

**Four nouns and a path.** Rivers, Flies, Places and Field Notes are *things you browse*. Learn is a *route through them* — a different kind of object, so it gets a 1px hairline divider before it rather than pretending to be a fifth category. That divider is the whole design idea: it lets a beginner see a door without diluting the four categories a returning reader scans for.

- **Labels only — the routes do not change.** Places → `/destinations`, Field Notes → `/articles`. See the decisions table.
- **Learn earns its slot** because the name reads exclusive and the single most effective counter to that is a visible beginner path (Brand Bible v4 §8). It is not decoration.
- Counts are **not** in the bar. They live on the four-doors band on `/` and on each index hero.

### The primary bar — logged in

```
[mark]   Today   Journal   Rivers   Flies   │   [ search input ]   Explore ▾   🔔   ( avatar )
```

`Explore ▾` is the **only** dropdown in the system, it lives in the utility zone, and it holds Places · Field Notes · Learn · Species · Lodges · Guides · Fly shops. The resource stays one click away without spending primary real estate a daily user does not need.

### Search is a first-class control, not an icon

- **Desktop:** a real `<input>`, always visible, 280px, placeholder `River, fly, hatch, place`. Never a magnifying glass alone — that was the original sin.
- **Mobile:** a pill in the top bar that expands to a full-screen overlay.
- `/` focuses the header field from anywhere. `⌘K` opens the palette. Both already share `src/lib/search/rank.ts` — do not fork the ranking.
- Focus expands the field to show grouped type-ahead results using the Phase 0 group order.

### States — specify all of them, none are optional

| State | Treatment |
|---|---|
| Default | Archivo 15px, `--text-body` |
| Hover | `--text-primary`, 120ms ease-out. No underline slide, no colour wipe. |
| **Focus-visible** | 2px `--signal-live` ring, 3px offset. Must be visible on every item including the mark, the search input, and the avatar. |
| **Current page** | 2px `--action` underline sitting on the bar's bottom rule, plus `aria-current="page"`. **A nav that cannot tell you where you are is not finished.** Section pages count as current — `/rivers/madison-river` lights "Rivers". |
| Scrolled | Bar keeps its height. Add a 1px `--rule` bottom border and a `--surface-page` fill once `scrollY > 8`. **The bar never shrinks, never hides, never reappears on scroll-up.** |
| Disabled | Does not exist. Remove the item instead. |

### Mobile

**Logged out — no bottom tab bar.** Dressing a stranger's reading experience in logged-in app chrome is the most damaging thing the current mobile site does. Top bar: mark · search pill · `Menu`.

`Menu` opens a **full-height sheet**, not a hamburger drawer:
- The four categories as 56px tappable rows with a one-line descriptor each
- A rule, then **Learn**
- A rule, then Sign in and Get the app
- Proper `role="dialog"`, focus trap, `Esc` closes, body scroll locked, first focusable element focused on open, focus returned to the trigger on close.

**Logged in — bottom tab bar:** Today · Journal · Rivers · Flies · Me. 48px minimum targets, safe-area inset respected, active tab in `--action`.

### The footer

Keep five columns — it is the strongest IA object on the site. Changes:
- **Discover → Explore**, **Directory → Find a guide.** A reader cannot currently tell those two apart.
- Add **Learn** and **App**. There is no `/pricing`.
- **Delete the six-link SEO strip** that sits under the hero of `/rivers`, `/flies/library` and `/destinations` — the same six links on all three pages, related to none of them.

### Accessibility — part of the definition of done

`<nav aria-label="Primary">` · `aria-current="page"` on the active item · a skip-to-content link as the first focusable element · full keyboard reachability with a visible focus ring at every stop · the mobile sheet and `Explore ▾` both operable by keyboard and dismissible with `Esc` · the mark is a link to `/` (or `/today` when authenticated) with an accessible name, not an unlabelled image.

### Never in the navigation

Browse-all lodges, guides or fly shops (commercial directories are reached in context — lodges *on the Madison*, never 400 alphabetically) · the gear catalogue · the theme toggle (dead since Lane A removed `ea-theme` — remove the orphaned control) · anything Pro, pricing or upgrade.

### Deliberately deferred

Small dropdown panels under the four primary nouns (max 6 links: "Browse all 138 · Near me · By state · By hatch · Live now"). **Ship flat first.** Half those links are filter states that do not exist until Lane L, and a dropdown pointing at nothing is worse than no dropdown. Revisit after L merges.

### Acceptance

- Rivers, flies, places and field notes reachable in **one click from any public page**.
- **Zero route changes.** `git diff` must show no edits to `sitemap.ts`, `robots.ts`, or `llms.txt`.
- Current-page state correct on an index, a detail page, and a search result.
- Full keyboard pass at 1440 and 390, focus ring visible at every stop.
- Auth suite green — the header renders the session control, and `src/lib/auth-context.tsx` must not be restructured by this lane.
- Lighthouse SEO does not drop.

---

## LANE F — The public homepage
`branch: phase1/homepage` · owns `src/app/page.tsx` + its section components

Eleven bands. Target **~78% resource / 14% app / 8% ethic** by vertical pixels at 1440 — measure it, state it in the PR.

| # | Band | Spec |
|---|---|---|
| 1 | **Conditions rail** | Sticky, 40px, **Dusk**. Six named rivers: name, flow, delta, live dot, time+source stamp. Chip rail scrolls horizontally on mobile. Chip → river page. The tech thesis stated before a single marketing word, and the one thing on the internet only this site can put here. |
| 2 | **Hero** | Full-bleed river photograph, 72vh desktop / 60svh mobile. Fraunces headline in the register of *"The Madison is at 760 and the caddis are late."* Seasonal, specific, human-edited — put the string in one exported constant. **The image is the image** — never a 12%-opacity texture behind text. |
| 3 | **Search on the photograph** | 640px: *Search a river, a fly, a hatch, a place.* **The primary CTA.** Secondary text link: *Browse 138 rivers →* |
| 4 | **Four doors** | Rivers · Flies · Places · Field Notes as tall photographic tiles with live counts. Not icon cards. 2×2 on mobile. |
| 5 | **On the water now** | **Dusk** instrument band inset in the page. Six river cards: flow, 12-month sparkline, water temp, hatching chip, source stamp. Snap-scroll carousel on mobile. |
| 6 | **This week's read** | One field note at full magazine scale — bleed image, Fraunces title, Newsreader deck (`.prose`), byline — plus three smaller. |
| 7 | **The fly plate** | Twelve macros cut out on Paper, laid out like a naturalist's specimen plate, size + imitation in small caps. 3-up mobile. **The best-looking asset the site owns appears nowhere on the homepage today.** |
| 8 | **Where to go** | Three places, seasonal framing ("best in September"), full photographic scale. |
| 9 | **The journal** | The app band. **One** band, ~14%. Dusk. One sentence about keeping a record the water can't remember for you, one device shot, the privacy line, two CTAs. **No feature grid, no checklist, no second phone mockup.** |
| 10 | **What we don't do** | Purely typographic, no image, no card. Three lines: we never publish your spots · we never publish your counts · there is no leaderboard here. The most differentiated sentence the brand owns, currently buried in body copy — and the app pitch delivered as a value instead of a feature, which is the only version a stranger believes. |
| 11 | **Footer** | From Lane E. |

**Must not appear above the fold:** "Download for iPhone", "Open Web App", "Start Logging Free". All three are there today.

**Delete:** the fake logged-in dashboard phone mockup · the three-card Pro/intelligence grid · the workbench and materials cards · the second App Store CTA.

**Fix the counters.** Homepage says "200+ rivers" and "120+ patterns"; `/rivers` says 138 and `/flies/library` says 162. Derive every count from data at build time.

**Fix the banned copy while you're here:** the subhead still reads "The fly fishing intelligence platform." Also update `SITE_DESCRIPTION` in `src/lib/constants.ts` ("The definitive fly fishing resource…") and the `package.json` description.

Authenticated visitors are sent to `/today` by the logo, but `/` stays **byte-identical for everyone**. Do not personalise the public front page.

**Acceptance:** LCP element is the hero photograph, not a skeleton.

---

## LANE G — `/today` and the logged-in split
`branch: phase1/today`

Replace the `/dashboard` stats grid with a **briefing**. Five lines, single column at 780px — a briefing reads top to bottom, it is not a card grid. **Every line collapses completely when it has nothing to say.** Dusk register.

1. **Unfinished** — open session, catches missing a fly, an outing with no notes. Dismissible.
2. **Your water** — the 3–6 watched rivers. Flow now, and the number no competitor can compute: **flow relative to the last time you personally fished it**, and to the conditions your best days happened in.
3. **Worth going?** — five-day best-window read on the top watched river, from their own history. One sentence and one small chart.
4. **Tie next** — two or three patterns they're short on for what's hatching where they fish. Closes the tie → fish → log → learn loop.
5. **From the desk** — two field notes chosen against their rivers and species. **Editorial register, in the dark.** The one place the two silos genuinely merge.

- `/dashboard` → permanent redirect to `/today`. Logo targets `/today` when authenticated, `/` when not.
- Add `/rivers/mine` (watchlist; `/favorites` already redirects after Lane D).
- **The test:** at 1440, a user with two watched rivers answers "should I go Thursday" **without scrolling**.
- **Acceptance:** `/today` renders correctly and usefully for a user with **zero sessions** — that is the whole reason it beat the stats dashboard. Screenshot that state.

---

## LANE H — `/app` product page
`branch: phase1/app-page`

Everything currently on `/` that is about the product moves here and gets room: what logging feels like (one tap, GPS, weather), the Apple Watch, the fly box and workbench, insights, the privacy contract in full, import/export, Android status. Real screenshots at real scale, **one claim per screenshot**. **Dusk register** — the app is dark, so this is the one public page that inverts.

One honest line here and in the footer: **every feature, free.** Then confirm no stale Pro/upgrade/Founders copy survives anywhere public — the leftover `PRO` pills in `PersonalFlowOverlay` and `BestWindowCalculator` are yours to remove.

---

## LANE W — Retire public angler profiles
`branch: phase1/anglers-retire` · owns `src/app/anglers/**`, `docs/decisions/anglers-public-profiles.md`

**Decided: they stay off.** Being the anti-Fishbrain is the differentiator; a public profile is the surface that erodes it, and nothing in the product needs one.

The routes already `notFound()`. Finish the job:
- Delete the implementations — `src/app/anglers/page.tsx`, `[username]/page.tsx`, `[username]/flies/page.tsx` and their clients. Keep `/anglers/[username]/flies/[slug]` as the redirect to `/flies/[slug]` so old bookmarks still resolve.
- Sweep for any other surface reading `stats.fish`, per-session `total_fish`, `river_name`, `home_location`, or `user_awards` for a viewer who is not the owner. **The decision doc warns its list is not exhaustive — verify, don't assume.**
- **Do not touch `/feed`.** It reads from the `session_presence` view, shows river + section + weather only, and is correct. Presence is the one public social surface the brand bible permits.
- The follow graph and `like_count` stay. They are permitted as long as nothing ever aggregates them into a ranking or a public total.
- Update the decision doc: status `resolved — profiles retired`, with the date and this rationale.

---

# WAVE 2 — templates (needs E; I, J, K parallel)

## LANE I — River template
`branch: phase2/river` · **the most important template on the site — most strangers arrive here**

Order: full-bleed photograph with the river's name **over** it in Fraunces (not below it in sans, as now) · section selector · **the dark live-conditions inset at full content width**, not squeezed into a 400px sidebar · overview prose in `.prose` at 68ch, **expanded by default, no gradient fade** · hatch chart as a real seasonal grid · access points with a two-tone map · flies fishing now · regulations · lodges, guides and shops on this river · nearby rivers.

**Specific fixes:** the overview truncates behind a near-black gradient painted on a cream page. The season module shows the **off** months as chips, so the best months read as unavailable. The "Calculating your best window…" panel spins forever for anonymous visitors — replace with a designed **signed-out** state that says what it would tell them and that it costs nothing.

**Logged-in delta:** the **"Your record here"** block, directly beneath the live inset — times fished · your best month here · your top fly · your catches overlaid on the flow chart · *Log a session here*. **Client-rendered after auth, never in cached HTML, never visible to anyone else.** The public half of the page stays byte-identical for everyone.

## LANE J — Fly pattern template
`branch: phase2/fly`

Specimen-first. Macro at 50% viewport width on Paper, name in Fraunces, sizes and imitation as a specification block. Then the **variant table in the Dusk register** — the one public page with a genuine workbench module, and the switch is the point. Then recipe, materials linked into the database, tying video, and **"fishing now on"** — river names and sizes only, **no counts**. Editorial history below a hard rule, in `.prose`.

**Logged-in delta:** stock counts populate the variant table inline; "add to box" becomes a real inline edit.

## LANE K — Place template
`branch: phase2/place`

The New Zealand page already has magazine-grade writing; the vessel doesn't deserve it. Full-bleed hero at 70vh with place name and one-line deck · "best months" as a real seasonal chart, not a sidebar card · the essay in `.prose` at 68ch with pull quotes and inline photographs · **the rivers of this place as a proper card grid** (they are the reason to be here) · then lodges, guides, shops as supporting infrastructure.

**Logged-in delta:** "you've fished 3 of these 11 rivers," with those three marked.

---

# WAVE 3 — depth (all parallel, any order)

## LANE L — Index / browse + filters
One template for rivers, flies, places. Editorial header · **a real filter bar** · results · load-more.
**Rivers:** state · water type · species · difficulty · **flow state (low / normal / high / blown)** · near me. *Every one of those is already printed on the cards and none is filterable today.* **Flies:** existing chips plus hatch, size range, and "can I tie it with what I own" for authenticated users. **Places:** region · season · species · trip length.
**Keep the four view-density toggles from `/flies/library`** and roll them out to rivers and places — the best interaction on the current site, and the density switch made user-controllable.

## LANE M — Field note + author templates
Bleed image · Fraunces title 56px · deck · byline with read time · **`.prose` at 19px / 1.7 / 68ch** · inline stat blocks and pull quotes as the only interruptions · captions in Archivo 13px. Wire up `/authors` (it exists and is unused). End on **two related rivers and two related flies** — not "more articles", which sends readers sideways instead of deeper.

## LANE N — Search results page
Query echoed in the field, never in a heading. **All types at once**, grouped in the Phase 0 ranked order, three rows per group, "see all N". Each row carries what makes its type worth choosing: rivers show live flow, flies show the macro, places show a photograph, field notes show read time. Type chips **narrow**, never the only view. Empty state teaches: six real example queries, the three most-read rivers, what's hatching now.

## LANE O — Session detail
A dashboard for **one day**. Editorial header — date, river, one photograph the angler took, the route as a two-tone map — then hard workbench: catches as a 32px table (time, species, length, fly, section), conditions as they were, gear used, notes. Right rail: totals, best fish, that day's flow trace with catch markers. Prev/next day. **Never reachable as a landing.**

## LANE P — Workbench polish
32px rows, zebra Pool/Riverbed, tabular numerics right-aligned via `.num`, inline edit with optimistic update and green/red flash, bulk-action toolbar, and the keyboard map: `↑↓`/`j k` move, `Space` selects, `↵` activates, `/` focuses filter, `Esc` cancels, `⌘K` search. Apply to `/journal`, `/flybox`, `/rivers/mine`, gear.

## LANE Q — `/learn` — the beginner spine
A real IA node, not an article tag. What gear actually matters · how to read water · your first five flies (**the fly plate, doing work**) · rivers near you that forgive beginners · catch-and-release etiquette. **It ends at two objects, not a signup:** a fly list and a river list. "Keep this list" is the account. The single most effective counter to a name that reads exclusive.

## LANE R — `/plan/[river]` — the trip brief
The object that turns reading into going. Window · flies to tie · access · regs · pack list. Hybrid register. Reached from a river page and from `/today` line 3.

---

# WAVE 4 — retention (needs G)

- **T1 Watchlist alerts** — watch from a river page or search result. Opt-in conditions: threshold crossed · >25% move in 24h · **flow entering the band your own best days happened in** · a hatch opening · blown → fishable. Evaluate on a Vercel cron, not page load. **Debounce hard: one alert per river per 24h, three per user per day.** Never reference another angler.
- **T2 Weekly digest** — one email, Sunday evening, opt-in, working one-click unsubscribe. Their watched rivers, what's hatching where they fish, one pattern they're short on, one field note. **Send nothing to a user with zero watched rivers and zero sessions.** No guilt-trip copy if they didn't fish — this is not a streak product. Build on the existing Resend setup.
- **T3 Notification centre** — make `/notifications` real; one preferences surface under `/account`. **Every channel defaults to off** except the digest opt-in taken at signup.
- **T4 First run** — three skippable steps: pick your water (geolocation or ZIP, 1–5 rivers) → species and water type → the privacy contract with defaults visible and already correct. Land on `/today` with lines 2 and 5 populated. **No tour, no coach marks, no confetti.**

---

# WAVE 5 — trust and speed (parallel with 3 and 4)

- **U1 Performance** — budgets in CI: LCP < 2.0s, CLS < 0.05, INP < 200ms on `/`, `/rivers`, `/rivers/[slug]`, `/flies/library` at mobile throttling. **Kill the river-page grey skeletons** — server-render the numbers already in hand, reserve skeletons for the chart. Verify `LazyMapView` / `LazyFlowChart` actually defer and measure the saving. Report bundle size per route.
- **U2 Accessibility** — landmarks, one `h1` per page, sane heading order, focus-visible everywhere, keyboard reach for the section selector and density toggles, `aria-live` on live flow, real alt text (the river hero alt is `"River Madison — fly fishing"`, machine-generated and backwards), form labels, skip-to-content. Add `@axe-core/playwright` to the U3 crawl; fail CI on serious violations.
- **U4 Observability** — error tracking with source maps; event taxonomy (page view, search, **search-zero-result**, river watch, session start, fly added). **Log every zero-result query and every query where nobody clicks, and surface it at `/admin/search-insights`. That ranked list is the content roadmap** — anglers telling you in their own words what the reference is missing. No journal contents, coordinates, or catch data in any event payload.

---

# WAVE 6 — content operations

- **V1 Image backfill** — bulk ingest, resize, **strip EXIF including GPS (non-negotiable)**, blur hashes, Supabase storage, credit + licence fields. Priority: 107 fly shops → 76 guides → 36 flies → 9 destinations. Do not ingest an image whose licence you cannot state. Enable the rehost button in `/admin/content/images` only once the EXIF strip is proven.
- **V2 River data QA** — 138 rivers; the reference is only as good as its worst row. Verify USGS gauge mapping (a wrong gauge is worse than none), section definitions, and access-point coordinates.
  **Regulations — the standing rule:** *never edit or generate regulation text.* Add a `verified_at` column per river, surface "last checked <date>" on the page, and produce a review queue at `/admin/content/rivers` ranked by staleness, listing every river whose regulations are generic (the Madison currently reads "Check Montana FWP for current regulations" — a page telling the reader to go elsewhere), empty, or unverified. Taylor decides what gets rewritten; the agent's job is to make the gap visible, never to fill it. The same rule covers hatch timing, species presence, and access legality: **flag, don't invent.**
  Also: 6 river *thumbnail* nulls, and 9 dead Wikimedia species images the Phase 0 sample missed.
- **V3 Hatches become real pages** — `/flies/hatch/[slug]` exists and Phase 0 derives hatch docs at index time. Promote to a first-class type: the insect, life stages, emergence by region, water it favours, what to fish at each stage, which of the 138 rivers carry it. Link bidirectionally from river hatch charts and fly `imitates`. **The highest-value content gap in the reference.**
- **V4 Editorial workflow** — author pages, a related-content engine keyed on rivers/species/hatches rather than tags, draft/publish state, `reviewed_at` on evergreen pieces.
- **V5 Fly macro normalisation** — 124 of 126 hero macros are stored 3:2, not 1:1 cutouts. Re-crop to square on a paper ground, consistent light from upper left, scaled so a #20 midge reads smaller than a #4 streamer. This is what makes Lane F's fly plate work.

---

# THE QUEUE

```
1   V0   land #25, #26, the contrast patch          1 agent, first
2   U3   visual regression + e2e harness            1 agent, before any visual lane
3   E    chrome  ·  W  retire angler profiles       E serialises; W parallel
4   F  G  H                                         3 agents
5   I  J  K                                         3 agents
6   L M N O P Q R                                   parallel, any order
7   T1 T2 T3 T4  ·  U1 U2 U4  ·  V1 V2 V3 V4 V5     parallel, as wide as you have agents
```

Waves 4, 5 and 6 depend on nothing but G (for T1–T4). **Once E is merged, run everything downstream as wide as you can.** Never idle: if a lane is blocked, post the blocker and take the next unstarted lane.

## Before you write code, post one message covering

1. The `check:contrast:rendered` failure and unverifiable counts **after** V0. That is the real baseline.
2. Whether `/destinations` → `/places` and `/articles` → `/field-notes` collides with the Phase 0 SEO work on `main`, and what breaks.
3. What `/anglers/[username]` exposes publicly, field by field, against the redaction matrix in Brand Bible v3 §3. **Report — do not delete it unilaterally.**
4. Your visual-regression baseline storage cost and your plan for masking non-deterministic regions.
5. Anything in the repo that contradicts this brief.

Then start V0.
