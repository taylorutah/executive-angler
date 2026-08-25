---
type: concept
title: "Brand Bible v4 — The Water Desk"
project: executive-angler
updated: 2026-08-25
tags: [ea, brand, privacy, water-desk, design-system]
---

# Executive Angler — Brand Bible v4
## The Water Desk edition

**Status:** Current. Supersedes [[Brand-Bible-v3.1]] and [[Brand-Bible-v3]] — archive both.
**Revised 2026-08-25 — §5.1 token table corrected to shipped values (five rows held pre-fix hexes); §5.6 added.**
**Companion specs:** [[Website-Design-Review-2026-08-23]] (design) · [[EA-Build-Brief-III-2026-08-24]] (build) · [[Workbench-Style-Guide]] (needs a token refresh)

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

Re-chromatised 2026-08-25. The previous copper sat 22° from paper and at chroma 0.120 — AA-legal and visually absent. Copper moved toward red-orange (hue 40) and chroma 0.160; paper's chroma dropped so the ground stops competing. Contrast improved; presence is the point.

| Token | Hex | OKLCH | Role |
|---|---|---|---|
| Paper | `#F8F6F4` | 0.974 / 0.003 / 67.8 | Daylight ground — ink on it 16.64:1 |
| Vellum | `#F2EDE4` | 0.948 / 0.013 / 82.4 | raised, alternating bands |
| Card | `#FFFFFF` | — | |
| Rule | `#E2DACD` | — | borders |
| Ink | `#141814` | 0.203 / 0.010 / 145.2 | headings |
| Graphite | `#3E4649` | 0.388 / 0.012 / 222.3 | body — 9.0:1 |
| Slate | `#5E6669` | 0.504 / 0.011 / 222.2 | meta, labels — **never running text** |
| **Copper 700** | `#B4410D` | **0.530 / 0.160 / 40.1** | **action only, on light** — 5.26:1 paper, 4.86:1 vellum; white on it 5.67:1 |
| Copper 400 | `#FD8358` | 0.739 / 0.160 / 39.8 | action on dark — 7.76:1 riverbed, 7.12:1 pool, 6.30:1 shelf |
| Copper hover 700 | `#9B3300` | 0.469 / 0.148 / 39.9 | `--action-hover` Daylight (target 0.47 / 0.16 / 40 clips; max in-gamut chroma) |
| Copper hover 400 | `#FE9A77` | 0.782 / 0.130 / 40.0 | `--action-hover` Dusk |
| **Teal 700** | `#0C7286` | 0.510 / 0.088 / 216.1 | **live data only**, on light — 5.17:1 paper, 4.78:1 vellum |
| Teal 300 | `#00BCC5` | 0.723 / 0.123 / 200.9 | live data on dark — 8.16:1 riverbed, 7.49:1 pool, 6.62:1 shelf. Target was oklch(0.72 0.13 200); sRGB clips chroma slightly |
| Riverbed | `#0B1112` | 0.172 / 0.010 / 208.8 | Dusk ground |
| Pool | `#131B1D` | 0.215 / 0.012 / 214.7 | Dusk surface, zebra rows |
| Shelf | `#1C2629` | 0.260 / 0.015 / 218.0 | Dusk raised, inputs |
| Chalk | `#EEF2F1` | 0.958 / 0.004 / 179.7 | text on Dusk |
| Fog | `#8B979A` | 0.668 / 0.015 / 214.4 | meta on Dusk — 6.3:1 |
| Rise | `#1F7A3D` / `#3FB863` | — | positive delta |
| Cutthroat | `#B3261E` / `#F87171` | — | error, destructive |

**Retired:** Abyss `#0D1117` (GitHub's background — the reason the workbench read as a dev tool), Depth `#161B22`, Stone `#1F2937` (Tailwind slate-800), the `#D4751F` light copper, Copper 700 `#9E5615`, Copper 400 `#E8923A`, Paper `#FAF6F0`, Teal 300 `#22C1DE` (neon cyan at hue 214), hover literals `#8A4A12` / `#F0A65A` / `#C97726`.

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

One hero per page **at full strength** — the image is the image, never faded to 12% behind a headline. Cool shadows, warm highlights, greens held down so copper reads. Water, light, structure; people only as distant silhouettes.

**Fly macros** cut out on paper, 1:1, light from upper left, no drop shadow, scaled so a #20 midge reads smaller than a #4 streamer. This is the strongest asset the brand owns and it is why the fly plate works. **Species keep scientific illustration** — the most distinctive choice in the identity.

**Never:** text whose legibility depends on an image loading · data overlaid on a photograph · grip-and-grin or any held fish on a public surface · lodge lifestyle photography · a card with no image (render the typographic plate instead).

### 5.4 Motion

120–180ms ease-out on hover and press. One 400ms crossfade when a live reading updates. That is the entire budget.

**Never animates:** page transitions, scroll reveals, parallax, number count-ups, charts drawing themselves, the logo, anything in a data table. A count-up on a flow reading is a lie about how the data arrived.

### 5.5 Logo

Mark-only in app chrome and small headers. The full lockup is reserved for editorial contexts and the footer, so the word "Executive" is not the first thing on every screen.

### 5.6 How the registers meet

Dusk is an instrument, not a floor. Live data lives in a **contained dark panel** — inset from the page gutter, radiused, with a defined edge and its own shadow — sitting on the paper page the way an instrument sits on a desk. Dusk never full-bleeds across a public editorial page and never splits it in half. The paper register is the page; Dusk is an object on it.

**Rule 1 — Containment.** A Dusk panel on a Daylight page is inset on all four sides, has `border-radius`, a `--border-rule` edge, and a shadow lifting it off the paper. Its parent stays Daylight. `.register-dusk` goes on the panel, never on the section containing it.

**Rule 2 — One hue across registers.** A control that exists in both registers uses the same accent hue, tonally adjusted for its ground — never a different colour. Copper is `#9E5615` on paper and `#E8923A` on riverbed, both bound through `--action`. No component hardcodes either.

**Rule 3 — No status colour outside the palette, and no stoplight.** Flow state is carried by the copper/teal system and by type weight, not by green. `--state-positive` means a positive **delta**, not a healthy river. A flow reading is a measurement, not a success. `--action` is the action colour and is never a status colour.

**Rule 4 — One render per control.** A control that appears in both the Daylight page and the Dusk panel is a duplicate, not a convenience. Render it once, in the register that owns it.

**Where Dusk owns the whole ground.** On `/today`, `/journal`, `/flybox`, and `/rivers/mine` — the private notebook — the page *is* Dusk. There is no seam to manage.

**The one exception.** A thin Dusk **rail** docked to the header (the ~40px sticky conditions ticker) is chrome, not content, and is exempt. The test is whether it sits against the header or interrupts the reading column: a rail is docked; a band interrupts.

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

## See Also
- [[Website-Design-Review-2026-08-23]] — the design spec this identity is built on
- [[EA-Build-Brief-III-2026-08-24]] — the build plan
- [[Part-3-Contrast-Verdict-2026-08-24]] — why the contrast checker needs compositing
- [[Brand-Bible-v3]] — superseded; retains the full redaction matrix
- [[Workbench-Style-Guide]] — the Dusk register descends from this; needs a token refresh
- [[IA-Strategy-2026-05]] — reopened; its "SEO-only" label is retired

## Timeline

- **2026-08-25** | Palette re-chromatised. Copper 700 / paper / copper 400 / teal 300 / action-hover rewritten because AA compliance had been achieved at the cost of presence: the old copper (`#9E5615`, chroma 0.120, hue 56) sat 22° from paper and could not carry a composition. New copper is hue 40 / chroma 0.160; paper chroma dropped to 0.003; teal 300 pulled from neon cyan (hue 214) to water (hue 200). Contrast improved on every legal pair.
- **2026-08-25** | §5.1 token table corrected to shipped `globals.css` values (Paper, Ink, Slate, Copper 700, Teal 700). Copper 400 and Teal 300 unchanged. §5.6 added: Dusk is an instrument on the paper page, not a floor.
- **2026-08-24** | v4 created. Reorganised around The Water Desk: the desk/notebook duality as the organising idea, the 78/14/8 ratio and Daylight/Dusk promoted into the identity, public angler profiles formally retired, the newcomer made a first-class design target, Inter added to the retired-type list, the domain move deferred pending organic recovery.
