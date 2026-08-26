---
type: concept
title: "The Water Desk — page spec (2026-08-26)"
project: executive-angler
updated: 2026-08-26
tags: [ea, brand, design, website, water-desk, spec]
---

# The Water Desk — page spec

**Status:** Current. This is the **build source of truth for pages.**
**Supersedes as a build source:** [[Website-Design-Review-2026-08-23]] — its findings, its reference list and its IA verdict stand; its page specs are replaced by this file.
**Governed by:** [[Brand-Bible-v4]] v4.1 Part II. Every widget name below is defined in §12; every ban is in §11.
**Gate:** [[Anti-Slop-Checklist]]. A page is not done until it passes.

---

## 0. Why this rewrite exists

The 11-band intent from the 2026-08-23 review was right and survives here almost unchanged. What it lacked was resistance: a code model reading "hero, then four doors, then a live band, then features" builds a SaaS landing page and satisfies every line of it. This version states, for each band, **what it must not become** — because that is the half a code model needs and the half the original spec left to taste.

The order below is a **briefing**, not a funnel. Nothing on this page is trying to convert anyone. That is the whole positioning: 78% resource, 14% app, 8% ethic, and the hero is 100% resource.

---

## 1. Homepage — bands in order

### 1. ConditionsBar
ConditionsBar (§12), docked to the header, 40px, six named rivers with live CFS and freshness.

- Dusk object on a Daylight page. Docked, so it is chrome — the §5.7 rail exception.
- **Not:** a marketing ticker, a scrolling marquee, an alert bar, a band that interrupts the reading column.

### 2. Hero — one photograph, full strength, ~72vh
- Eyebrow: 11px small-caps Archivo — `AUGUST 26 · MONTANA · 760 CFS`. Set **on the photograph**, not in an opaque plate floating on it.
- Headline: Fraunces, seasonal, about the water.
- Dek: one Newsreader sentence.
- Caption behaves as a field note: `place · CFS · date`.
- The photograph is served at or above its rendered CSS width. A 557px source painted across 1114 CSS px at DPR 2 is a defect, not a hero.
- Composition: the subject carries the frame. More than ~40% empty sky means the wrong crop, not a bigger headline.
- **No app CTA in the hero.** Never `Download for iPhone` · `Open Web App` · `Start Logging Free`.
- **Search is the CTA**, ~640px, on the photograph.
- **Not:** a centred SaaS hero with two buttons; a photograph faded to 12% behind a headline; text that becomes illegible if the image fails (protect the text locally, do not darken the photograph).

### 3. Four doors — Rivers / Flies / Places / Field Notes
Photographic or TypographicPlate tiles with **honest counts**. If `/rivers` holds 138, the door says 138. Never "200+".

- **Not:** a three-up icon-and-paragraph feature grid; five doors; a door for the app.

### 4. On the water now — **InstrumentWell**
Six RiverChips with sparkline and hatch, inside one InstrumentWell (§12), contained per §5.7 Rule 5.

- **If you are tempted to full-bleed this band, you have failed §5.7.** This is the single most likely place for the seam to break, because a dark band across a light page looks decisive in a mockup and reads as a cliff on the page.
- One well. Not six little dark cards floating on paper.

### 5. This week's read
One feature at magazine scale plus three smaller. Byline on each.

- **Not:** a card grid of four equal tiles; a carousel.

### 6. The fly plate — **FlyPlate**
Twelve macros as a naturalist's specimen plate. The strongest asset the brand owns.

- Ruled grid, no card chrome, no shadows. A #20 midge reads optically smaller than a #4 streamer.
- **Must exist on `/`.** It is currently the band most at risk of being cut for being "quiet".
- **Not:** a shop grid; a hover-zoom gallery; twelve rounded cards.

### 7. Where to go
Three seasonal DestinationPlates.

- **Not:** a booking widget; lodge lifestyle photography; a "plan your trip" funnel.

### 8. The journal — the app band, ~14%
One band. An invitation, in the brand's voice, that says what the journal is and that it costs nothing.

- **Not:** a feature grid; a fake dashboard mockup; a phone-in-hand render; a second App Store CTA; a testimonial.

### 9. What we don't do
The privacy ethic, typographic, public, on paper. Three lines, no icons.

### 10. Footer
Per [[Brand-Bible-v4]] §17. Ground is Paper or Vellum, never Card.

---

### Cut from `/` if still present
Fake dashboard mockup · Pro three-card grid · tying/materials marketing cards · second App Store CTA · contradictory counters · Lucide-on-cream feature rows · any hero CTA in the banned list.

---

## 2. Templates

### 2.1 River dossier — the most important template
This is where strangers land and it is where the seam failed.

- **Header:** magazine — photograph, Fraunces name, field-note dek.
- **Sidebar:** exactly **one** InstrumentWell holding map, Gauge, HatchCalendar, regulations, access, and the section switcher.
- **Section switcher renders once.** Not outlined pills in the light band and tabs in the dark panel. Pick the register that owns the control — the well — and render it there.
- **Main column:** how it fishes this month, RecipeStrips, related field notes. Prose at ~68ch.
- **Signed in:** YourRecord, client-rendered after auth, never in cached HTML.
- **Verification:** load `/rivers/arkansas-river-colorado` and confirm paper does not cliff into riverbed in one pixel row; confirm the well satisfies all five values in §5.7 Rule 5; confirm one section switcher; confirm no off-palette status colour.

### 2.2 Indexes — `/rivers`, `/flies/library`, `/destinations`, `/species`
Instrument lists, not marketed card galleries.

- Sticky filters. View-density toggles. Scan-dense rows.
- Live cells render as RiverChips or small wells, never as SaaS metric cards.
- Every card either loads its image or renders a TypographicPlate. **No grey rectangles, ever.**
- Counts in the `<h1>` and in `<title>` agree with the database.
- **Not:** landing-page padding; 12px cards; a pill for every attribute; a 6-link strip under the hero.

### 2.3 Fly pattern
Specimen-first: the macro at 1:1 on paper, then RecipeStrip, then the variant table.

- On public routes the variant table is an InstrumentWell. On workbench routes the page is whole-page Dusk.
- **Not:** a product page; a shop CTA; a hero photo of a fly in a hand.

### 2.4 Place / destination
DestinationPlate header, rivers list, season, species. Directories (guides, lodges, shops) appear **contextually** — "lodges on the Madison" — never as a browsable alphabetical wall.

### 2.5 Field note / article
Editorial density. Newsreader `.prose`, ~68ch, one hero at full strength, byline, field-note captions. Related objects at the end — a fly list and a river list — not a subscribe form.

### 2.6 `/today` — the private briefing
Five collapsible lines, in order:

1. **Unfinished** — sessions you didn't close out
2. **Your water** — flow now vs the last time *you* fished it
3. **Worth going?** — the five-day window
4. **Tie next** — from your box and the hatch
5. **From the desk** — two editorial items on your rivers

A briefing, not a stats dashboard. **A trip log is not a home.** Whole-page Dusk. No charts here; charts live on `/journal/insights`.

### 2.7 `/learn`
The beginner's front door, a real node in the IA. It **ends by handing over two objects** — a fly list and a river list. Not a signup form, not a course funnel, not a wizard.

---

## 3. Mobile (390)

- ConditionsBar → thumb-scrollable chip strip.
- Search → persistent pill.
- Four doors → 2×2.
- The live well stacks; it does not become a snap carousel of mystery cards.
- Gauges stay tabular and readable — never shrink a CFS reading below body size.
- **No bottom app bar for logged-out visitors.** Logged in: 5 tabs.
- Every image that loads at 1440 loads at 390. Image loading that depends on viewport width is a defect — measured 2026-08-26: 24 of 28 `/rivers` card images issued no network request at a 1114px viewport while all 28 loaded at 1800px.

---

## 4. What does not change

No route renames. `sitemap.ts` / `robots.ts` / `llms.txt` stay frozen. No SEO work. No paid tier. No public fish counts, GPS, named spots, trip reports, or leaderboards. Public angler profiles stay retired. We host every image. Don't break logins. Never fabricate fishing facts — an honest empty cell beats invented content.

---

## See Also
- [[Brand-Bible-v4]] — v4.1; Part II defines every widget and every ban used here
- [[Anti-Slop-Checklist]] — the gate this spec is verified against
- [[Workbench-Style-Guide]] — the Dusk notebook register
- [[Website-Design-Review-2026-08-23]] — superseded as a build source; findings and references still stand
- [[Plan-Locked-2026-08-25]] — sequencing and operating model
- [[Part-3-Contrast-Verdict-2026-08-24]] — why hero titles must not be repainted

---


<!-- timeline -->

- **2026-08-26** | Written to replace the page specs in the 2026-08-23 review as the build source of truth. Each band now carries an explicit "not" clause, because the original band list is satisfiable by a SaaS landing page. Band count 11 → 10: search folded into the hero as the CTA rather than standing as its own band. Hero gained a resolution floor and a crop rule after measuring a 557px source painted at 1114 CSS px on production. Mobile gained the viewport-dependent image-loading defect measured the same day.
