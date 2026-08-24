---
type: concept
title: "Website Design Review 2026-08-23"
project: executive-angler
updated: 2026-08-23
tags: [ea, brand, ia, design, website, review]
---

# Website UX / Visual Design Review — 2026-08-23

**Status:** Proposal. Reopens [[IA-Strategy-2026-05]].
**Scope:** UX, IA, visual design, style. Explicitly not SEO.
**Artifact (full document):** https://claude.ai/code/artifact/ad9e0b30-43fe-4f14-9e3c-b040e17487b9

---

## 0. Verdict

**The founder's "50/50 homepage" hypothesis is wrong.** The current site already tried it and became neither thing.

- Public homepage split: **~78% resource / 14% app / 8% ethic** by vertical real estate. **100/0 in the hero** — the app never gets the hero.
- **Two landings.** `/` = public water desk (cached, photographic, searchable). `/today` = private briefing (authenticated, dense). Shared: chrome, search index, type, palette. Different: everything else.
- **Logged-in landing = `/today`, a briefing, not a stats dashboard.** Only candidate with no empty-state problem. Rule confirmed: a trip log is not a home.
- **Visual thesis: Daylight & Dusk.** Light-first for public knowledge, dark instrument register for working surfaces, and **live data is always dark everywhere** — including inset into light pages. The current failure is not dark-vs-light (the site is already light); it's a parchment page laid out as a SaaS feature grid.

**New public essence:** *Executive Angler is where you learn the water — and the private journal that remembers what you learned.*

Retire "the fly fishing intelligence platform" from public surfaces.

---

## 1. Findings that outrank aesthetics

Observed live, 2026-08-23, logged out.

| Finding | Evidence |
|---|---|
| **Search is broken** | `"pmd hatch"` → 22 **fly shops**. `"green river"` → 126 rivers, alphabetical, Green River UT buried. `"pheasant tail"` → 40 flies. Nonsense query `"green riverpheasant tail"` → 72 rivers. **Only one entity type returned per query.** `/search` landing reads "Search across **0** destinations…" and omits flies from the scope list. |
| **Images missing at scale** | ~half of `/rivers` cards, the Madison hero (grey box with a floating photo-credit chip), the featured Alaska destination, the `/articles` editor's pick, many fly thumbnails. |
| **Primary nav has one item** | It says "Flies." No path to rivers, places or articles except the footer. |
| **`/pricing` 404s** | Linked from the footer and specified in the IA doc. Founders' Free Year (free until 2027-05-25) is invisible on the public web. |
| **Copper contrast fails** | `#E8923A` on `#F7F3EC` = **2.21:1**. Used for links, headings, "Search", "Read more", footer links, 404. |
| **Legibility depends on images loading** | `/destinations` renders "Alaska" near-white on cream when the hero fails. |
| **Numbers contradict** | Homepage "200+ rivers" vs `/rivers` "138". Homepage "120+ patterns" vs library "162". |
| **Route duplication** | 7 overlapping fly-box routes (`/flies/boxes`, `/flies/workbench`, `/flies/workspace`, `/flies/shared`, `/my-boxes`, `/my-flies`, `/journal/flies`); two analytics stacks (`/dashboard/*` and `/journal/insights|stats`). |
| **Voice split across 3 pages** | Home "intelligence platform" · About "definitive… world's finest waters" · Articles "curated for the discerning fly fisher". |
| **Privacy risk to audit** | `/anglers/[username]` public profiles exist — check against the v3 redaction matrix. |

---

## 2. Public homepage — "The Water Desk"

11 bands, in order:

1. **Conditions rail** (sticky, dark, 40px) — 6 named rivers, flow + delta + live dot. *Resource*
2. **Hero** — full-bleed river photo 72vh, seasonal editorial headline. **The image is the image** (no 12%-opacity texture). *Resource*
3. **Search field on the photograph** — the primary CTA. 640px. *Resource*
4. **Four doors** — Rivers · Flies · Places · Field Notes, photographic tiles with counts. *Resource*
5. **On the water now** — dark instrument band, 6 river cards, flow + sparkline + temp + hatching chip. *Resource*
6. **This week's read** — one feature at magazine scale + 3 smaller. *Resource*
7. **The fly plate** — 12 macros as a naturalist's specimen plate. *Resource* (best asset, currently absent from `/`)
8. **Where to go** — 3 seasonal places. *Resource*
9. **The journal** — the app band. One band, ~14%. No feature grid. *App*
10. **What we don't do** — typographic privacy stake. *Ethic* (currently buried in body copy)
11. **Footer** — keep 5 columns; rename "Discover"/"Directory" → **Explore** / **Find a guide**; add Learn, App, Pricing.

**Never the hero CTA:** Download for iPhone · Open Web App · Start Logging Free. All three are above the fold today.

**Cut from `/`:** the fake dashboard mockup, the Pro three-card grid, the tying/materials cards, the second App Store CTA, contradictory counters.

**Mobile:** conditions rail → thumb-scrollable chip strip; search → persistent pill docking to bottom; 4 doors → 2×2; live band → snap carousel; **no bottom app bar for logged-out visitors.**

---

## 3. `/today` and the logged-in inventory

Five collapsible lines: **Unfinished** → **Your water** (flow vs *the last time you fished it*) → **Worth going?** (5-day window) → **Tie next** → **From the desk** (2 editorial items on their rivers — the honest home for the 50/50 instinct).

| Surface | Job | Freq | Register |
|---|---|---|---|
| `/today` | brief the day | daily | hybrid Dusk |
| `/journal` | the record | weekly | workbench |
| `/journal/[id]` | one outing | per trip | workbench + editorial header |
| `/journal/insights` | the season | monthly | workbench (charts allowed here only) |
| `/rivers/mine` | watchlist | weekly | workbench |
| `/flybox` | inventory (consolidates 7 routes) | weekly in season | workbench |
| `/flies/workbench` | tying one pattern | bursts | workbench |
| `/journal/trophy-wall` | the one emotional surface | occasional | **editorial, in the dark** |
| `/plan/[river]` **NEW** | trip brief: window, tie, access, regs, pack | per trip | hybrid |
| `/account` | settings, privacy, export | rare | workbench plain |

---

## 4. Navigation & search

| Zone | Logged out | Logged in |
|---|---|---|
| Primary | Rivers · Flies · Places · Field Notes | Today · Journal · Rivers · Flies |
| Search | **open field, always** (280px) | same + locked "Your journal" group |
| Utility | Theme · Sign in · Get the app | Explore ▾ · Notifications · Avatar |
| Mobile | top bar + sticky pill, **no bottom bar** | bottom bar (5 tabs) |

**The 2026-05 rule is rewritten, not kept or killed:** *commercial directories never return to the primary bar; knowledge categories always live there.* Lodges/guides/shops stay contextual forever (nobody browses 400 lodges alphabetically — they want lodges *on the Madison*). Destinations, articles and species are not directories and belong in primary.

**Search ranking:** Rivers → Flies → **Hatches** (`/flies/hatch/[slug]` exists and is not indexed) → Places → Field notes → Species → Directory → *Your journal*. Within: exact name → prefix → **alias** (PMD, PT, BWO, "the Mo") → body. Show all groups at once, 3 rows each. Relevance floor so nonsense returns nothing.

**Empty state:** six real example queries + 3 most-read rivers + what's hatching. Not a grey magnifying glass.

**Logged-in delta on public pages:** one "Your record here" block, client-rendered after auth, never in cached HTML. River → times fished / best month / top fly / catch markers on flow. Fly → in your box, counts, target. Place → you've fished 3 of these 11 rivers.

---

## 5. Visual system — Daylight & Dusk

### Palette

| Token | Hex | Role |
|---|---|---|
| Paper | `#FAF7F2` | Daylight ground |
| Vellum | `#F2EDE4` | raised (today's Parchment, demoted) |
| Ink | `#14181A` | headings — 16.7:1 |
| Graphite | `#3E4649` | body — 9.0:1 |
| Slate | `#6C7679` | meta — 4.4:1 |
| **Copper 700** | `#A85C18` | **action only, on light** — 4.7:1 (replaces `#E8923A` for text on light) |
| Copper 400 | `#E8923A` | action on dark — 7.8:1 |
| **Teal 700** | `#0E7C93` | **live data only** — 4.6:1 |
| Teal 300 | `#22C1DE` | live data on dark — 8.8:1 |
| **Riverbed** | `#0B1112` | Dusk ground — **replaces Abyss `#0D1117`, which is GitHub's background** |
| Pool | `#131B1D` | Dusk surface / zebra |
| Shelf | `#1C2629` | Dusk raised (replaces `#1F2937` = Tailwind slate-800) |
| Chalk | `#EEF2F1` | text on Dusk |
| Rise | `#1F7A3D` / `#3FB863` | positive |
| Cutthroat | `#B3261E` / `#F87171` | negative |

**Rule:** copper is the action colour and nothing else. Headings are Ink. Links are Ink + underline, copper on hover. Live readings are Teal.

### Type

- **Display: Fraunces** (variable — opsz/soft/wonk, 300–900). Not another didone, not another condensed gothic.
- **Long-form body: Newsreader** (opsz axis, built for screen reading). Only where >200 words.
- **UI & data: Archivo** (100–900 + Narrow, tabular figures built in). Over Inter and Space Grotesk.
- **IBM Plex Mono: demoted to identifiers only** — gauge IDs, coordinates, hook sizes, keys. **Mono is for identifiers, not quantities**; quantities need `tabular-nums` + right alignment.
- **Kill:** DM Serif Display, DM Sans / Aktiv Grotesk ambiguity.
- *Tradeoff:* dropping Newsreader and setting long-form in Fraunces text-optical-size is defensible and one font lighter.

### Photography
One hero per page at full strength. Cool shadows / warm highlights / desaturated greens. Fly macros cut out on paper, 1:1, consistent scale and lighting. **Keep scientific illustration for species** — the most distinctive thing in the identity. Maps two-tone (Vellum land / Teal water). Never: faded photo behind a headline · text whose legibility needs an image · data on a photograph · grip-and-grin · **a card with no image** (render a typographic plate instead).

### Motion
120–180ms ease-out on hover/press; one 400ms crossfade on a live value. **Never animates:** page transitions, scroll reveals, parallax, number count-ups, charts drawing, the logo, data tables.

### Density
Same scale, same accent, same mark. Daylight 1.62 leading / 24px gutters / 68ch. Dusk 1.35 leading / 12px gutters / 32px rows. Feels like *the lights came down*, not a different website.

### References
NYT Cooking (recipe box = the river module) · The Athletic (stats inside prose) · AllTrails (explore vs mine) · Linear (density, tables — **not** its dark marketing aesthetic) · Windy (beautiful live data) · Field Mag (photography on a budget) · Aesop (specimen typography, the fly plates) · USGS/NOAA (time+source stamps — **you already do this; protect it**).
**Do not become:** Orvis · Fishbrain · Hatch/MidCurrent · Patagonia · Arc'teryx · Strava.

### The name
Can't rename; counter it in the experience: (1) kill the status register — "definitive", "finest", "discerning", "premier"; (2) lead with water and craft, never people and status; (3) demote the wordmark — mark-only in chrome, full lockup in editorial/footer; (4) **put a visible beginner path (`/learn`) in primary IA.**

---

## 6. Templates

Homepage · `/today` · **River** (most important — where strangers land) · Place · Fly pattern (specimen-first + dark variant table) · Field note · **Index/browse** (one template, real filters incl. flow state; keep the 4 view-density toggles from `/flies/library` and roll out to rivers; **delete the 6-link SEO strip under every hero**) · Session detail (never a landing) · Search results (all types at once) · **`/app`** (new — everything product moves here) and **`/pricing`** (currently 404).

---

## 7. Phases

**Phase 1 — identity fix.** Tokens + type · header/nav/footer · **search rebuild** · new `/` · `/today` split · `/app` · `/pricing` · **image audit + typographic fallback plate**.
→ *A stranger understands in one screen that this is a place about rivers. Search returns what they typed. Nothing is grey.*

**Phase 2 — the pages people land on.** River / fly / place templates · shared dark live-conditions inset · "your record here" · photography pass · fly plate system · two-tone map · seasonal chart.
→ *Pages arriving from search finally look like the homepage promised; the two silos feel like one product.*

**Phase 3 — depth and the instrument.** Index/browse with filters + view toggles · field note & author templates · search results · session detail · route consolidation · workbench polish · `/learn` · `/plan/[river]`.
→ *Filtering answers real questions; the journal feels like an instrument; beginners have a front door.*

**Do first, before design:** the image audit and the search index (flies + hatches + alias table + ranking). A new visual system over a broken search and grey rectangles reads *worse* than today, because it raises an expectation it fails.

---

## See Also
- [[Brand/IA-Strategy-2026-05]] — the 2026-05 reset this reopens
- [[Brand/Brand-Bible-v3]] — voice + privacy ethic (unchanged by this review)
- [[Brand/Workbench-Style-Guide]] — Dusk register descends from this
- [[Website/Strategy]] — 2026-03 doc; its public catch maps / leaderboards section is superseded by the 2026-05 privacy overhaul

## Timeline

- **2026-08-23** | Review produced from a live logged-out tour of `/`, `/about`, `/rivers`, `/rivers/madison-river`, `/flies`, `/flies/library`, `/articles`, `/destinations`, `/destinations/new-zealand`, `/search`, `/login`, `/pricing` at 1440 and mobile, plus the app route tree.
