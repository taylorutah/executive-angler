---
type: concept
title: "Brand Bible v4.1 — The Water Desk, composition edition"
project: executive-angler
updated: 2026-08-26
tags: [ea, brand, privacy, water-desk, design-system]
---

# Executive Angler — Brand Bible v4.1
## The Water Desk — composition edition

**Status:** Current. Supersedes [[Brand-Bible-v3.1]] and [[Brand-Bible-v3]] — archive both.
**Revised 2026-08-26 — promoted to v4.1. Part II added: anti-slop, named widgets, density, iconography, footer, chrome, and the test for "perfect". §5.5 geometry corrected, §5.7 given measurable containment values, §5.4 motion corrected. Part I is unchanged v4 content.**
**Revised 2026-08-25 — §5.1 token table corrected to shipped values; §5.5 geometry; §5.7 how the registers meet.**
**Companion specs:** [[Water-Desk-Spec-2026-08-26]] (the build source of truth for pages) · [[Anti-Slop-Checklist]] (the gate Cursor runs) · [[Workbench-Style-Guide]] (Dusk register) · [[EA-Build-Brief-III-2026-08-24]] (build)
**Superseded as a build source:** [[Website-Design-Review-2026-08-23]] — kept for its findings and its reference list; the page specs in it are replaced by the Water Desk spec.

---

## 0. The one sentence

> **Executive Angler is where you learn the water — and the private journal that remembers what you learned.**

The resource is the promise. The journal is the reward. In that order, on every public surface, without exception.

---

## 1. The Water Desk — what we actually are

A **desk** is where someone who knows the water sits: charts on the wall, a gauge ticking in the corner, a fly plate under glass, and a notebook that is nobody else's business. That is the whole brand in one image, and it resolves the collision that produced two products wearing one coat of paint.

| | The public desk | The private notebook |
|---|---|---|
| Who it's for | Anyone who cares about fly fishing | People who log their days |
| What it does | Rivers, flies, hatches, places, technique | Sessions, catches, insights, the tying bench |
| How it feels | **Daylight** — paper, photography, editorial serif | **Dusk** — dark instrument, tabular figures, keyboard |
| Where it lives | `/`, `/rivers`, `/flies`, `/destinations`, `/articles`, `/learn` | `/today`, `/journal`, `/flybox`, `/rivers/mine` |
| Who can see it | Everyone, byte-identical | Only you. Not aggregated, not ranked, not published |

**The seam between them is the whole product.** A public river page that quietly gains *your* record when you sign in is the thing no competitor can copy — because Fishbrain would publish it and Hatch Magazine has no data.

### Not a compromise
The public homepage is **~78% resource, 14% app, 8% ethic**, and the hero is 100% resource. Equal weight was tried and produced a page that served a bottom-of-funnel pitch to a top-of-funnel audience. Where 50/50 is *true* is `/today`, for a logged-in angler: what does the water say, and what does my record say.

---

## 2. The privacy ethic (foundational — unchanged since v3)

**Executive Angler does not publicize spots, fish counts, or trip reports. Ever.**

| Public | Private |
|---|---|
| The river you're fishing (presence, opt-in) | Where on the river you are (GPS) |
| The section, when you choose to show it | Your fish count |
| General weather | Your water temp, clarity, readings |
| Your own trophy wall | Your catches, photos, notes |
| Recent fly identifications (names + sizes, no counts) | Per-fly pressure |
| Your name and avatar when broadcasting presence | Your trip notes |

The full viewer-by-field matrix in [[Brand-Bible-v3]] §3 carries forward verbatim and governs every public surface.

**Resolved 2026-08-24: public angler profiles are retired permanently.** `/anglers` exposed another angler's fish counts, spots, session dates, home location, awards, and fly inventory — six of the seven things this section forbids. Being the anti-Fishbrain is the differentiator; a public profile is the surface that erodes it. **Presence on `/feed` — river, section, weather, nothing else — is the only public social surface.** Kudos and the follow graph survive on the condition that nothing ever aggregates them into a ranking or a public total.

**Free does not mean crowdsourced.** The intelligence layer deepens *your* data and never harvests anyone else's. That was true when it was a paid tier and it is still true now that it isn't.

---

## 3. Pillars — the site and the app rank differently

v3 ranked Content fourth and called it "supporting." For the website that is now inverted. The app's internal order is unchanged.

| | Website (public) | App (product) |
|---|---|---|
| 1 | **Rivers** — the reference | **Journal** |
| 2 | **Flies & hatches** — the reference | **Rivers** |
| 3 | **Places & field notes** | **Flies** |
| 4 | **The journal** — invitation, never brochure | **Presence** |

The 2026-05 "SEO-only" label on destinations, species, articles, lodges, guides and shops is **retired**. It made the knowledge base ineligible for design investment, which is how the site ended up with a one-item navigation bar. The replacement rule: *commercial directories never sit in the primary bar; knowledge categories always do.*

---

## 4. Audience

Unchanged from v3 §4: **the intentional angler**, defined by mindset rather than income, age or experience — the veteran, the progressing angler, and the newcomer. Guides and fly shops are the B2B layer.

**One addition.** The newcomer is now a first-class design target, not a footnote, because the name works against them. `/learn` is a real node in the information architecture — not an article tag — and it ends by handing them two objects (a fly list and a river list), not a signup form.

---

## 5. Visual identity — Daylight & Dusk

**One spine, two registers, and the gear-shift is visible.** Live data is always Dusk, *everywhere*, including inset into a Daylight page. That is the system's one memorable idea: instruments read as instruments regardless of which page they sit on.

### 5.1 Colour

Re-chromatised 2026-08-25, then corrected the same day. Paper stays `#FAF6F0` — measured against runcabinet.com it is effectively the same ground (Cabinet `#FAF6F1`). The dead page was not the cream. It was Ink at hue 145 (green-black) and Graphite/Slate at hue 222 (blue) sitting on a warm ground 127° away. Ink/Graphite/Slate now share paper's warm family (hue ~50). Copper and teal changes stand.

| Token | Hex | OKLCH | Role |
|---|---|---|---|
| Paper | `#FAF6F0` | 0.975 / 0.009 / 78.3 | Daylight ground — same colour as Cabinet's, kept on purpose |
| Vellum | `#F2EDE4` | 0.948 / 0.013 / 82.4 | raised, alternating bands |
| Card | `#FFFFFF` | — | |
| Rule | `#E2DACD` | — | borders |
| Ink | `#2C211B` | 0.259 / 0.020 / 50.1 | headings — oklch(0.26 0.02 50); 14.55:1 on paper (was 16.64:1 and harsher) |
| Graphite | `#4F4540` | 0.399 / 0.016 / 48.3 | body — target oklch(0.40 0.016 50); 8.64:1 paper, 7.98:1 vellum |
| Slate | `#6D645F` | 0.510 / 0.014 / 51.1 | meta, labels — target oklch(0.51 0.014 50); 5.36:1 paper, 4.95:1 vellum — **never running text** |
| **Copper 700** | `#B4410D` | **0.530 / 0.160 / 40.1** | **action only, on light** — 5.26:1 paper, 4.86:1 vellum; white on it 5.67:1 |
| Copper 400 | `#E97C48` | 0.700 / 0.150 / 45.0 | action on dark — 6.75:1 riverbed, 5.48:1 shelf; hue 45 so L 0.70 does not read salmon |
| Copper hover 700 | `#9B3300` | 0.469 / 0.148 / 39.9 | `--action-hover` Daylight (target 0.47 / 0.16 / 40 clips; max in-gamut chroma) |
| Copper hover 400 | `#FE9A77` | 0.782 / 0.130 / 40.0 | `--action-hover` Dusk |
| **Teal 700** | `#086B6C` | 0.479 / 0.080 / 196.0 | **live data only**, on light — 5.86:1 paper, 5.41:1 vellum; hue 196 with teal-300 at 201 |
| Teal 300 | `#00BCC5` | 0.723 / 0.123 / 200.9 | live data on dark — 8.16:1 riverbed, 7.49:1 pool, 6.62:1 shelf. Target was oklch(0.72 0.13 200); sRGB clips chroma slightly |
| Riverbed | `#0B1112` | 0.172 / 0.010 / 208.8 | Dusk ground |
| Pool | `#131B1D` | 0.215 / 0.012 / 214.7 | Dusk surface, zebra rows |
| Shelf | `#1C2629` | 0.260 / 0.015 / 218.0 | Dusk raised, inputs |
| Chalk | `#EEF2F1` | 0.958 / 0.004 / 179.7 | text on Dusk |
| Fog | `#8B979A` | 0.668 / 0.015 / 214.4 | meta on Dusk — 6.3:1 |
| Rise | `#1F7A3D` / `#3FB863` | — | positive delta |
| Cutthroat | `#B3261E` / `#F87171` | — | error, destructive |

**Retired:** Abyss `#0D1117` (GitHub's background — the reason the workbench read as a dev tool), Depth `#161B22`, Stone `#1F2937` (Tailwind slate-800), the `#D4751F` light copper, Copper 700 `#9E5615`, Copper 400 `#E8923A`, Copper 400 `#FD8358` (hue 40 at L 0.74 reads salmon), Ink `#141814` (hue 145 green-black), Graphite `#3E4649` / Slate `#5E6669` (hue 222 blue), Teal 700 `#0C7286` (hue 216, 15° from teal-300), Teal 300 `#22C1DE` (neon cyan at hue 214), hover literals `#8A4A12` / `#F0A65A` / `#C97726`. Paper `#FAF6F0` is **not** retired — a same-day `#F8F6F4` experiment was cancelled; Cabinet's ground is the same colour.

**The rule that outranks the hexes:** copper is the action colour and nothing else. Headings are Ink. Links are Ink with a 1px underline that turns Copper on hover. Live readings are Teal. When everything is the accent, nothing is. AA compliance is not visual presence.

### 5.2 Type

| Role | Face | Where |
|---|---|---|
| Display | **Fraunces** (variable: opsz, SOFT, WONK) | headings, titles |
| Long-form | **Newsreader** (variable opsz) | `.prose` / `.article-body` **only** |
| Interface & data | **Archivo** | **the `body` default** — nav, labels, buttons, tables, all numerics via `tabular-nums` |
| Identifiers | **IBM Plex Mono** | gauge IDs, coordinates, hook sizes, keys, URLs |

**Interface is the default; serif is opt-in.** Binding `--font-body` to the display face set the entire site in Fraunces and cost a day. There is now a permanent census assertion in CI.

**Mono is for identifiers, not quantities.** A column of flow readings needs tabular figures and right alignment, not a monospace face.

**Retired:** DM Serif Display, DM Sans, Aktiv Grotesk, Inter.

### 5.3 Photography

**We host every image.** No hotlinking to third parties. Unsplash and Wikimedia files whose licence we can read are ingested into our storage (EXIF including GPS stripped, blur hash stored, credit on the row). A row without a readable licence does not publish. Gear-brand and lodge photography is not bulk-downloaded — ask, substitute, or ship the typographic plate. Google OAuth avatars are the one fetch exception; cache them to storage on first login.

One hero per page **at full strength** — the image is the image, never faded to 12% behind a headline. Homepage wash is `--scrim-light` (0 / 0.10@50% / 0.45 on `rgba(15,43,31)`). `--scrim-standard` is 0.10 / 0.40@60% / 0.70. `--scrim-heavy` (0.30 / 0.50@40% / 0.80) requires written justification. Protect headline text locally if the light wash cannot carry it — do not darken the photograph. Cool shadows, warm highlights, greens held down so copper reads. Water, light, structure; people only as distant silhouettes.

**Fly macros** cut out on paper, 1:1, light from upper left, no drop shadow, scaled so a #20 midge reads smaller than a #4 streamer. This is the strongest asset the brand owns and it is why the fly plate works. **Species keep scientific illustration** — the most distinctive choice in the identity.

**Never:** text whose legibility depends on an image loading · data overlaid on a photograph · grip-and-grin or any held fish on a public surface · lodge lifestyle photography · a card with no image (render the typographic plate instead).

### 5.4 Motion

> **Corrected by §14 (v4.1, 2026-08-26).** Items 3 and 4 below — the 400ms photo zoom and the staged entrance — are retired, along with `--elev-3`, `--elev-4`, `--elev-glow` and `--elev-glow-strong`. Read §14 as the operative budget; this section is kept for the reasoning that produced it.

The original budget — 120–180ms ease-out on hover and press, one 400ms crossfade when a live reading updates — stopped cheap animation and produced a flat, lifeless page. The budget is now the tokens in `globals.css`, not one-off classes.

**Still in budget (tokens, both registers):**

1. **Depth scale.** `--elev-1` through `--elev-4` — inset top highlight (white on Daylight, warm vellum on Dusk) plus a 1px light ring, then layered contact + ambient shadows, copper-tinted on Daylight, riverbed-tinted on Dusk. Tailwind `shadow-sm|md|lg|xl` bind to these. No raw `rgba` drop shadows.
2. **Ground wash.** `--surface-page-wash` — a ~1.5% lighter top falling to the base colour. Imperceptible as a gradient, perceptible as depth. `--surface-page` stays the solid darkest hex; that is what contrast is measured against.
3. **Photograph treatment.** Hero and card scrims are gradients — transparent at the top, readable ground at the bottom where text sits. On a card or tile whose whole surface is a link, the image scales to `--photo-zoom-scale` (1.03) over `--photo-zoom-duration` (400ms) on `--ease-out-expo`. The container clips overflow.
4. **Staged entrance.** Content blocks fade in and rise `--enter-rise` (12px), `--enter-stagger` (60ms) between siblings, `--enter-duration` (500ms), once on first intersection, never again on re-scroll. IntersectionObserver only. Entirely absent under `prefers-reduced-motion`.

Hover and press remain 120–180ms ease-out (`--hover-duration` / `--hover-ease`). Live readings still crossfade once at `--crossfade-duration` (400ms). Cursor-parallax on the hero photograph was tried and cut — a portfolio flourish, not a field guide.

**Never animates — this list is not permission to animate everything:**

- Count-ups on live readings (a count-up is a lie about how the data arrived)
- Parallax on text
- Scroll-jacking
- Charts drawing themselves
- The logo
- Anything inside a data table
- Page transitions

`prefers-reduced-motion: reduce` fully disables items 3 (image scale) and 4 (entrance). Scrim gradients stay — they are not motion.

### 5.5 Geometry — corrected 2026-08-26

Four radius tokens, each scoped. Not "round everything," and not a 12px default.

| Token | Value | Applies to |
|---|---|---|
| `--radius-chip` | 9999px | Filter chips, category chips, tags, count badges — **and nothing else**. A pill is a chip; a card is not a chip. |
| `--radius-surface` | **6px** | Cards, modals, images. Was 12px; 12px is the template tell named in §11.2. |
| `--radius-instrument` | **4px** | The InstrumentWell and anything inside it. |
| `--radius-media` | 4px | Inline thumbnails and fly plates. |

Buttons, the search field, and the primary nav stay flat at 4px. Pill-nav is a SaaS idiom; the masthead stays flat text with an underline.

**Retired 2026-08-26:** `--radius-control` at 9999px applied to anything that is not a chip; `--radius-surface` at 12px.

### 5.6 Logo

Mark-only in app chrome and small headers. The full lockup is reserved for editorial contexts and the footer, so the word "Executive" is not the first thing on every screen.

### 5.7 How the registers meet

Dusk is an instrument, not a floor. Live data lives in a **contained dark panel** — inset from the page gutter, radiused, with a defined edge and its own shadow — sitting on the paper page the way an instrument sits on a desk. Dusk never full-bleeds across a public editorial page and never splits it in half. The paper register is the page; Dusk is an object on it.

**Rule 1 — Containment.** A Dusk panel on a Daylight page is inset on all four sides, has `border-radius`, a `--border-rule` edge, and a shadow lifting it off the paper. Its parent stays Daylight. `.register-dusk` goes on the panel, never on the section containing it.

**Rule 2 — One hue across registers.** A control that exists in both registers uses the same accent hue, tonally adjusted for its ground — never a different colour. Copper is `#9E5615` on paper and `#E8923A` on riverbed, both bound through `--action`. No component hardcodes either.

**Rule 3 — No status colour outside the palette, and no stoplight.** Flow state is carried by the copper/teal system and by type weight, not by green. `--state-positive` means a positive **delta**, not a healthy river. A flow reading is a measurement, not a success. `--action` is the action colour and is never a status colour.

**Rule 4 — One render per control.** A control that appears in both the Daylight page and the Dusk panel is a duplicate, not a convenience. Render it once, in the register that owns it.

**Where Dusk owns the whole ground.** On `/today`, `/journal`, `/flybox`, and `/rivers/mine` — the private notebook — the page *is* Dusk. There is no seam to manage.

**The one exception.** A thin Dusk **rail** docked to the header (the ~40px sticky conditions ticker) is chrome, not content, and is exempt. The test is whether it sits against the header or interrupts the reading column: a rail is docked; a band interrupts.

**Rule 5 — Measurable containment (added 2026-08-26).** "Inset and radiused" is not a vibe. A Dusk panel on a Daylight page must satisfy all five, and QA measures them:

| Property | Value |
|---|---|
| Horizontal inset | `margin-inline: var(--gutter)` minimum, or a max-width instrument well. Never edge-to-edge. |
| Vertical inset | ≥ 24px of paper above and below the panel. |
| Radius | `--radius-instrument` (4px). Not 12. Not a pill. |
| Edge | 1px `--border-rule`, always present. |
| Shadow | `--elev-1` only — a whisper. Never `--elev-3`/`--elev-4`, never a glow. |

If you are tempted to full-bleed a live-data band across a public page, that is the failure this rule exists to stop.

---

## 6. Voice

**The knowledgeable friend who keeps your secrets.** Not a professor, not a bro, not a concierge. Confident, inclusive, data-forward, direct, warm. The Do/Don't table in [[Brand-Bible-v3]] §6 carries forward.

### Banned

**Sign-offs and clichés:** "tight lines", "see you on the water", "bend a rod", "fish on", "good fishing". Default to no sign-off.

**Dead features:** "leaderboard", "river champion", "hot hand", "trip reports", "see the patterns" (use "see *your* patterns"), any competitive framing against other anglers.

**The status register** — the name already leans corporate; copy must not amplify it: "definitive" · "the world's finest waters" · "curated for the discerning fly fisher" · "premier" · "elite" · "exclusive" · "serious anglers only".

**Dead positioning:** "the fly fishing intelligence platform" · any Pro, upgrade, premium, Founders or gift language.

✅ Replace with plain competence: *"138 rivers, documented."* · *"Every feature, free."* · *"We never publish locations or fish counts."*

---

## 7. Pricing

**Everything is free.** Commit `afb8286` (2026-06-30) removed the Pro tier, Stripe, and `/pricing`, `/gift`, `/founding`, `/redeem`, `/refund-policy`.

The line is *every feature, free* — said once, plainly, on `/app` and in the footer. Not a banner, not a badge, not a countdown. Former Pro features are simply features; where a logged-out visitor meets one, that is a **signed-out state, not a paywall**: say what it would tell them and that it costs nothing.

Dormant: the `subscriptions` table and `profiles.is_premium` remain unused, with an optional drop migration that has not been run. **If a paid tier ever returns it is a fresh decision with a fresh document.** Do not reason from v3 §7.

---

## 8. The name

"Executive Angler" reads corporate, exclusive, male and lodge-booking — the register this document forbids. Not renaming. Four counters, in the experience:

1. **Kill the status register in copy** (§6). Highest leverage, costs nothing.
2. **Lead with water and craft, never people and status.** No lodge lifestyle photography, ever.
3. **Demote the wordmark** — mark-only in chrome, full lockup in editorial and footer.
4. **A visible beginner path** (`/learn`) in the primary information architecture.

**Domain:** not bound to `executiveangler.com`. Current recommendation `currentseam.com` — a current seam is where fast and slow water meet and where trout hold; every angler knows the phrase, none feels excluded by it, and "seam" describes a product joining a public resource to a private notebook. **Deferred:** the site is mid-recovery on organic and a domain move touches the redirect map, the Supabase storage host `api.executiveangler.com`, the iOS app's storage URLs, the App Store listing and the sending domain. Revisit when 28-day clicks clear 50.

---

## 9. Competitive position

| Competitor | Their lane | Ours |
|---|---|---|
| Fishbrain | Social fishing, spot sharing | **The anti-Fishbrain.** Spots private, counts private, ethic on the sleeve |
| Strava | Activity tracking | What they do for running, minus leaderboards and spot-sharing, plus a tying bench |
| onX Fish | Premium maps, spot data | We respect water they monetise. Hatch charts and flow, never marked-up hot spots |
| Hatch Magazine / MidCurrent | Editorial | **Changed:** the website now competes as a reference. The difference is ours is wired to live water and to your own record; theirs is a blog |
| Fly-tying apps | Recipe databases | We close the loop: tie → fish → log → learn → tie better |

---

## 10. Platform

| Platform | Role | Register |
|---|---|---|
| Web (public) | The desk — the reference, and where strangers arrive | Daylight |
| Web (authed) | The notebook — `/today`, journal, fly box, workbench | Dusk |
| iOS + watchOS | Primary logging tool. Live. **Best-in-class; the web must not water it down** | Dusk |
| Android | Code-complete, not yet shipped | Dusk |

---


---

# Part II — Composition law (added v4.1, 2026-08-26)

Part I says what the brand *is*. Part II says what a page is allowed to *look like*. It exists because v4 specified tokens and voice and the site still shipped as a competent template: the tokens were obeyed and the composition was invented. Tokens without widget law is how this site became AI garbage.

Everything in Part II is binding on Cursor prompts, on QA, and on this document's own future revisions.

## 11. Anti-slop — if any of these ship, the design has failed

Measured on production 2026-08-26; every entry below has evidence in [[Anti-Slop-Checklist]] §0.

### 11.1 Type and chrome

- Inter, Roboto, Open Sans, Lato, Poppins, Montserrat, Space Grotesk, Geist, Plus Jakarta, `system-ui` as a design face, DM Serif Display, DM Sans. All retired; the CI font census already asserts this and it stays.
- **Lucide / Heroicons / Feather used raw as the icon language.** A generic 24px outline stroke on a Fraunces page is the cheapest tell on the site and it is currently the loudest: 35 Lucide glyphs of 49 SVGs on `/rivers/madison-river`, 29 of 35 on `/rivers/arkansas-river-colorado`.
- Emoji as UI icons.
- The full wordmark in chrome. §5.6 already says mark-only; the header currently paints `EXECUTIVE ANGLER` on every public page.

### 11.2 Layout

- Three-up equal feature cards with icon + heading + paragraph. Five such grids ≥700px wide currently render on `/`.
- Bento grids used as decoration.
- Glassmorphism, gradient orbs, mesh gradients, purple/teal marketing gradients.
- **Card radius ≥ 12px.** 26 elements per index page currently sit at 12px.
- **Heavy drop shadows.** 24 elements per index page currently carry ≥20px blur.
- Floating pill navs, sticky glass headers.
- Centred SaaS hero with two buttons.
- Fake dashboard mockups, an app-store wall above the fold, testimonial sliders.
- Horizontal mystery carousels of content cards on desktop.
- SEO link strips under heroes.

### 11.3 Motion

- Bounce, spring, elastic, parallax.
- **Scroll-reveal staggers on every block.** Retired in v4.1 — see §14.
- Number count-ups on CFS. A count-up is a lie about how the data arrived.
- Charts that draw themselves, page-transition theatre, looping decorative motion.

### 11.4 Colour misuse

- Copper on headings, copper as a large fill, copper as brand wash. Copper is the action colour and nothing else.
- Teal as links or buttons. Teal is live data and nothing else.
- Off-palette greens and ambers for "Normal" / "Good" / "Low".
- Pure `#000` / `#fff` as a page ground. **The footer currently paints `#FFFFFF` as its ground** — Card is a card colour, not a page colour.
- GitHub Abyss `#0D1117`, Tailwind slate-800 `#1F2937`.
- **Copper glow.** `--elev-glow` / `--elev-glow-strong` (30–40px copper bloom) are retired in v4.1.

### 11.5 Copy and product

- Get started · Learn more · Unlock insights · Dashboard · Community · Feed · Gamify as chrome labels.
- Grip-and-grin, lodge lifestyle, any held fish on a public surface.
- Text whose legibility depends on a photo loading. Data overlaid on a photograph.
- A card with no image and no typographic plate.
- Counts that contradict each other. `/flies/library` currently titles itself "120+ Proven Patterns" over a library of 162.
- The same control rendered twice. `/rivers/madison-river` currently renders "Create a free account" three times.

---

## 12. Named widgets

This is the section that moves the UX needle. Cursor invents a generic card whenever a component is unnamed. Every widget below is a named component with a fixed anatomy and a fixed set of states.

**Required states for every widget:** default · hover · active/pressed · live · stale · empty · error.

**Interaction law, identical everywhere:**
- Hover = the 1px rule darkens one step, 140ms ease-out. No glow. No scale. Lift ≤ 2px, and only where a surface genuinely sits above the page.
- Keyboard focus = a visible Ink (Daylight) or Copper (Dusk) ring, never `outline: none`.
- Stale = the freshness stamp changes wording ("gauge 3h ago"), never a colour change to the number.
- Empty = a sentence that says what would be here and why it isn't. Never a grey box, never a dash alone, never invented data.

| Widget | Anatomy | Hero number |
|---|---|---|
| **ConditionsBar** | Sticky rail docked to the header, 40px. Date · region · featured water · CFS in tabular figures · freshness stamp. A Dusk object on Daylight pages. Not a marketing ticker, not a band. | CFS |
| **RiverChip** | Name, state, live CFS, 24h delta (Rise/Cutthroat + `+`/`−` + the word "rising" / "dropping" / "steady"), hatch pill. | CFS |
| **Gauge** | Large tabular CFS, sparkline, source stamp (`USGS 06038500`, Plex Mono). Caption states that the number is the gauge, not a guess. Never a count-up. | CFS |
| **InstrumentWell** | The contained Dusk panel. Inset on all four sides, `--radius-instrument`, 1px `--border-rule` edge, `--elev-1` only. Holds Gauge, hatch matrix, section tabs. **One well per page region.** | — |
| **HatchCalendar** | Month matrix, current month marked, species and flies on hover/focus. Not a GitHub contribution graph — no colour-ramp heat cells. | — |
| **FlyCard** | Pattern name, size range, type, 1:1 macro on paper, light from upper left, no drop shadow. A #20 midge renders optically smaller than a #4 streamer. | hook size |
| **FlyPlate** | Twelve macros as a naturalist's specimen plate, ruled grid, no card chrome. The strongest asset the brand owns. **Must exist on `/`.** | — |
| **RecipeStrip** | Hook / thread / bead / dubbing as a bill of materials, Plex Mono for sizes. | — |
| **SessionRow** | Date, water, duration, lock glyph. Catch count renders **only to the owner**. | duration |
| **DestinationPlate** | Place, best months, primary species. Not a booking widget. No lodge lifestyle photograph. | months |
| **SpeciesDossier** | Common name + latin, conservation chip, scientific illustration. Keep the illustration — it is the most distinctive choice in the identity. | — |
| **TypographicPlate** | The fallback when no licensed image exists: name set in Fraunces on Vellum with a ruled border. Never a grey box, never a Lucide placeholder. | — |
| **YourRecord** | Client-rendered after auth, never in cached HTML. River: times fished / best month / top fly. Fly: in your box. Place: n of m rivers fished. | the count |
| **SearchField** | Command quality. Scopes: Rivers, Flies, Hatches, Places, Notes, Species, Directory, and (signed in) Journal. All groups at once, three rows each, with a relevance floor so nonsense returns nothing. Empty state = six real example queries, not a magnifying glass. | — |

**Every widget declares which number is the hero.** If everything is the accent, nothing is.

---

## 13. Density by page type

| Type | Routes | Density | Dusk |
|---|---|---|---|
| **Editorial** | `/`, `/articles/*`, `/learn`, `/about` | Photography at full strength. Display 3× body. 11px small-caps Archivo eyebrows. 1.62 leading, 24px gutters, ~68ch measure. | Instruments inset only |
| **Index** | `/rivers`, `/flies/library`, `/destinations`, `/species` | Scan-dense. Sticky filters. View-density toggles. **Not padded like a landing page** — an index is a list of instruments, not a marketed card gallery. | Live cells as chips or small wells |
| **Dossier** | one river / fly / place / species | Magazine header + **one** InstrumentWell in the sidebar (map, Gauge, season, regs). Main column is prose. | Well, never floor |
| **Notebook** | `/today`, `/journal`, `/flybox`, `/rivers/mine`, workbench | Whole-page Dusk. Tables at 32px rows, 1.35 leading, 12px gutters. Charts only on `/journal/insights`. | Floor allowed |

The gear-shift between Daylight and Dusk is **density and ground**, not a second website: same type scale, same accent, same mark.

---

## 14. Motion — v4.1 correction

v4 §5.4 expanded the budget to four token families after the two-item budget was judged "flat and lifeless". Two of those four are the scroll-reveal idiom this pass exists to remove. The budget is corrected, not re-litigated.

**In budget:**

1. **Hover and press** — 120–180ms ease-out (`--hover-duration` / `--hover-ease`). Expressed as a 1px rule darkening, never a glow or a scale.
2. **Live crossfade** — one 400ms crossfade when a reading updates (`--crossfade-duration`).
3. **Ground wash** — `--surface-page-wash`. Not motion; kept.
4. **Photograph scrims** — gradients. Not motion; kept.
5. **Depth scale** — `--elev-1` and `--elev-2` only: a hairline contact shadow and a 1px light ring. `--elev-3`, `--elev-4`, `--elev-glow` and `--elev-glow-strong` are **retired**.

**Retired in v4.1:**

- **Staged entrance** (`--enter-duration` / `--enter-rise` / `--enter-stagger`). This is the scroll-reveal stagger named in §11.3. A page that needs to animate itself into existence is admitting the composition does not hold still.
- **Photo zoom on hover** (`--photo-zoom-scale` 1.03 over 400ms). Out of the hover budget and a portfolio flourish. Card hover is the rule darkening.

**Never animates:** page transitions, scroll reveals, parallax, number count-ups, charts drawing themselves, the logo, anything inside a data table.

`prefers-reduced-motion: reduce` is honoured on everything that remains.

**If the page reads flat once these are removed, the fix is composition — scale contrast, rule weight, photography, density — not animation.**

---

## 15. Surfaces and light

Depth comes from three things and no others: **paper grain** (faint, never a texture overlay that fights a photograph), **1px rules** at Rule / Ink 8–12% opacity, and **grouping**. Not elevation theatre.

Almost square. Radius is scoped, not global — see §5.5 as corrected in v4.1.

---

## 16. Iconography

The current set is generic and it is the loudest remaining tell. Replace it with **one** hostable set.

- **Weight:** custom 1.5px stroke, slightly inked, optical sizes ~16 / 20 / 24. Not a 2px generic outline.
- **Metaphors from the desk:** gauge, current seam, hackle, hook, vise, hatch, lock (privacy), paper map, rule, notebook. **Not:** rocket, sparkle, chart-up, users-three, glowing bolt, generic pin.
- **Registers:** the same set in Daylight (Ink) and Dusk (Chalk / Fog). Active = Copper. Live = a single Teal dot, never a teal icon soup.
- **Licence:** one we can host. No runtime CDN. No icon font.
- **Fallback:** a missing icon renders a typographic mark — a small-caps abbreviation — never a broken square.
- **Social glyphs are icons too.** Four generic marks in rounded grey squares in the footer are the same failure at the bottom of the page.

---

## 17. Footer as an object

Not a junk drawer. Four deliberate groups, then a quiet ethic line.

1. **The desk** — Rivers, Flies, Places, Field Notes, Learn
2. **The notebook** — App, Journal (signed out: what it is, and that it is free), Today
3. **Find** — Guides, Lodges, Shops. Contextual directories; never primary nav.
4. **House** — About, Privacy, What we don't do, Contact

The mark and the full lockup appear **only** here and in editorial. Two lines, said plainly once: *Every feature, free.* and *We never publish locations or fish counts.*

**Ground is Paper or Vellum, never Card.** A white slab under a cream page is a seam, not a footer.

**Kill:** vestigial `/pricing`, duplicate Discover / Directory labels, dead Pro links, an app-store badge wall (a single quiet App link is the whole app presence in the footer), and legal sludge sitting as a peer of Rivers.

---

## 18. Chrome

- **Logged out, primary:** Rivers · Flies · Places · Field Notes, then a 1px `--border-rule`, then **Learn**. Learn is a door, not a fifth category.
- **Logged in, primary:** Today · Journal · Rivers · Flies.
- **Search always open**, ~280px.
- **Mark only.** The word "Executive" is not the first thing on every screen.
- **Mobile, logged out:** no bottom app bar. **Logged in:** 5-tab bar.
- Commercial directories never appear in the primary bar.
- The app CTA is not chrome. `Get the app` as a filled copper button on every public page is app marketing wearing navigation's clothes; it belongs in the journal band and the footer.

---

## 19. What "perfect" means — the test, not the vibe

A page is done when all of the following are true, measured rather than asserted, at 1440 and 390, signed in and signed out:

1. The register seam is an **object on paper**, not a cliff. No full-bleed Dusk on a public editorial page.
2. Every control renders **once**.
3. Zero raw Lucide/Heroicons/Feather glyphs.
4. No three-up icon-and-paragraph grid.
5. Copper appears **only** on actions; teal **only** on live data.
6. No count-up, no scroll-reveal stagger, no glow.
7. Every empty state is honest and worded.
8. Every image either loads and is captioned, or renders a TypographicPlate.
9. Every image is served at or above its rendered CSS width.
10. Banned-copy grep is clean.
11. Counts agree with the database everywhere they appear, including `<title>`.
12. The page is recognisable as this brand with the photographs removed.

Item 12 is the real test. If the page collapses into a template when the pictures are gone, the pictures were carrying a composition that does not exist.

## See Also
- [[Website-Design-Review-2026-08-23]] — the design spec this identity is built on
- [[EA-Build-Brief-III-2026-08-24]] — the build plan
- [[Part-3-Contrast-Verdict-2026-08-24]] — why the contrast checker needs compositing
- [[Brand-Bible-v3]] — superseded; retains the full redaction matrix
- [[Workbench-Style-Guide]] — the Dusk register descends from this; needs a token refresh
- [[IA-Strategy-2026-05]] — reopened; its "SEO-only" label is retired

## Timeline

- **2026-08-26** | Promoted to **v4.1 — composition edition**. Part II added (§11 anti-slop with production evidence, §12 named widgets with required states, §13 density by page type, §14 motion correction, §15 surfaces, §16 iconography, §17 footer as an object, §18 chrome, §19 the test for "perfect"). §5.5 geometry corrected — `--radius-surface` 12px → 6px, `--radius-instrument` 4px added, `--radius-control` renamed `--radius-chip` and scoped to chips. §5.7 gained Rule 5, measurable containment. §5.4 motion corrected: staged entrance (`--enter-*`), 400ms photo zoom, `--elev-3`/`--elev-4` and `--elev-glow*` retired — the staged entrance was the scroll-reveal stagger this pass exists to remove. Written from a measured tour of production at 1114/1512/1800/500px: 35 Lucide glyphs on `/rivers/madison-river`, 24 elements per index page at ≥20px shadow blur, 26 at 12px radius, 74 pill-radius elements on `/rivers`, a `#FFFFFF` footer ground, a 557px hero source painted at 1114 CSS px, and "Create a free account" rendered three times on one page.
- **2026-08-26** | Copper 400 moved to `#E97C48` (oklch 0.700 / 0.150 / 45) so the light step stays copper, not salmon. Teal 700 moved to `#086B6C` (oklch 0.479 / 0.080 / 196) to sit with teal-300 at hue 201. Hero scrims tokenised: `--scrim-light` on the homepage (0 / 0.10@50% / 0.45); river pages keep the pre-token overlay; `--scrim-heavy` requires written justification.
- **2026-08-25** | Geometry tokens shipped narrow: `--radius-control` only on chips, tags, and count badges. Hero cursor-parallax cut. Homepage hero italic on the closing clause only, in white (AA on the scrim). Pill nav cancelled — masthead stays flat text. The production olive void was the forest scrim at 0.28 from the first pixel, not a missing JPEG.
- **2026-08-25** | Ink/Graphite/Slate pulled into paper's warm family (hue ~50) after measuring runcabinet.com. Cabinet's ground is `#FAF6F1` and its display face is Fraunces — the same paper and the same type we already had. Their text is `#3B2F2F` (hue 18, warm). Ours was `#141814` at hue 145 (green) on a warm cream, 127° apart, and 16.66:1 — harsher, not better. Paper change to `#F8F6F4` cancelled. Ink is now `#2C211B` (14.55:1). `--elev-*` gained an inset top highlight.
- **2026-08-25** | Motion budget widened because the original §5.4 rule — 120–180ms hover/press plus one 400ms live-reading crossfade — produced a flat, lifeless page. Depth scale, ground wash, photograph treatment, staged entrance, and 2–4px hero parallax are now in budget as tokens. The banned list (count-ups, text parallax, scroll-jacking, self-drawing charts, animated logo, table motion) stays explicit.
- **2026-08-25** | Palette re-chromatised. Copper 700 / copper 400 / teal 300 / action-hover rewritten because AA compliance had been achieved at the cost of presence: the old copper (`#9E5615`, chroma 0.120, hue 56) sat 22° from paper and could not carry a composition. New copper is hue 40 / chroma 0.160; teal 300 pulled from neon cyan (hue 214) to water (hue 200). Paper stayed `#FAF6F0`.
- **2026-08-25** | §5.1 token table corrected to shipped `globals.css` values (Paper, Ink, Slate, Copper 700, Teal 700). Copper 400 and Teal 300 unchanged. §5.6 added: Dusk is an instrument on the paper page, not a floor.
- **2026-08-24** | v4 created. Reorganised around The Water Desk: the desk/notebook duality as the organising idea, the 78/14/8 ratio and Daylight/Dusk promoted into the identity, public angler profiles formally retired, the newcomer made a first-class design target, Inter added to the retired-type list, the domain move deferred pending organic recovery.
