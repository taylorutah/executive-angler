# Executive Angler QA Report — 2026-08-31

**Correction (2026-08-31, Taylor):** The live river catalog is **187**. That is not an inventory lie. The 49 rivers added 2026-08-30 (including Asay Creek) stay in listings, sitemap, advertised counts, homepage, `/about`, and `llms.txt` even when they have no usable hero. Do not noindex them for a missing photograph. Matching destination count is the live destinations table (**53** at the time of this correction). The original sitemap/`llms.txt` 138/52 gap was stale ISR, not a reason to hide rivers.

Checked against live `https://www.executiveangler.com` (Vercel, `cle1`), production Supabase `qlasxtfbodyxbcuchvxz`, USGS Water Services IV at ~19:00 America/Denver on 2026-08-30, and Montana FWP FAS GIS (`fwp-gis.mt.gov` layer `fwplnd/fwpLands/MapServer/1`). Repo HEAD at review: `28d9801`.

Do not treat this as a vibe check. Inventory, ticker CFS, and Madison/Montana pins were measured. Pins outside Montana were not all walked against every state GIS layer; those rows are marked **Unverified**.

## Executive verdict

Do not promote until the remaining P0s are closed. The live catalog is **187 rivers / 53 destinations**. Homepage, `/rivers`, and `/about` already advertise that catalog; sitemap and `llms.txt` were a day behind because of ISR, not because 187 was wrong. On the flagship Madison page the hero photograph is Three Dollar Bridge and the live CFS is the Hebgen gauge, but Three Dollar Bridge is missing from the access list and four named FAS pins sit 1.0–6.5 km off the official FWP coordinates. On the flagship Madison page the hero photograph is Three Dollar Bridge and the live CFS is the Hebgen gauge, but Three Dollar Bridge is missing from the access list and four named FAS pins sit 1.0–6.5 km off the official FWP coordinates. The same class of error repeats on Bitterroot, Blackfoot, Bighorn, Missouri, Yellowstone, Big Hole, and Beaverhead. A site whose brand promise is accuracy cannot ship “Lyons Bridge FAS” 4.4 km from Lyons Bridge.

## Scorecard
Inventory integrity:  3/10
Maps & access:        3/10
Image accuracy:       5/10
Visual & brand:       7/10
Content & regs:       5/10
UX & a11y:            6/10
Code quality:         6/10
Speed:                4/10
SEO & GEO:            4/10
Privacy & legal:      6/10
Overall:              49/100

## P0 — fix before anything else

- [`/`](https://www.executiveangler.com/) / [`/rivers`](https://www.executiveangler.com/rivers) / [`/about`](https://www.executiveangler.com/about) vs [`/sitemap.xml`](https://www.executiveangler.com/sitemap.xml) / [`/llms.txt`](https://www.executiveangler.com/llms.txt) — **stale sitemap/llms ISR, not a 187 lie**. Live HTML titles: “187 Rivers, 162 Flies, and Hatches”; `/rivers` H1 “187 rivers, documented”; `/about` “187 rivers” and “53 destinations”. Production DB: `rivers=187`, `destinations=53`. Sitemap/`llms.txt` still showed 138/52 because those routes were on a longer revalidate window. **Correction:** keep all 187 rivers (and 53 destinations) in listings, sitemap, counts, and `llms.txt`. Do not hold hero-less rivers out of the catalog. Fix: align sitemap/`llms.txt` `revalidate` with listing so crawlers see the same 187/53 as the HTML.
- [`/rivers/madison-river`](https://www.executiveangler.com/rivers/madison-river) — **Three Dollar Bridge missing from access**. Homepage copy: “The photograph is Three Dollar Bridge. The number in the eyebrow is the gauge, not a guess.” FWP Three Dollar Bridge FAS is 44.83193, −111.51416 ([FishMT 39754533](https://myfwp.mt.gov/fishMT/fas/39754533)). The Madison access list is Quake Lake, Lyons, McAtee, Varney, Ennis, Valley Garden, Beartrap. Raynolds’ Pass FAS (44.82871, −111.47932) is also absent. Fix: add the official FAS rows; do not invent extra holes.
- [`/rivers/madison-river`](https://www.executiveangler.com/rivers/madison-river) — **named FAS pins are not on the ramps**. Measured against FWP GIS:

  | Access | EA coords | FWP coords | Delta | Verdict |
  |---|---|---|---|---|
  | Lyons Bridge FAS | 44.9383, −111.5906 | 44.89910, −111.59260 | **4,362 m** | Fail |
  | McAtee Bridge FAS | 45.0833, −111.65 | 45.09665, −111.66152 | **1,738 m** | Fail |
  | Varney Bridge FAS | 45.2083, −111.6833 | 45.22900, −111.75196 | **5,849 m** | Fail |
  | Valley Garden FAS | 45.4167, −111.75 | 45.36726, −111.70540 | **6,509 m** | Fail |
  | Ennis Bridge FAS | 45.35, −111.7333 | 45.34443, −111.72310 | 1,011 m | Fail (town-level, not the FAS lot) |

  Sources: [Lyons](https://myfwp.mt.gov/fwpPub/landsMgmt/siteDetail.action?lmsId=39753518), [McAtee](https://myfwp.mt.gov/fishMT/fas/39753516), [Varney](https://myfwp.mt.gov/fwpPub/landsMgmt/siteDetail.action?lmsId=39753404), [Valley Garden](https://myfwp.mt.gov/fishMT/fas/39753456), [Ennis](https://myfwp.mt.gov/fishMT/fas/39753534), FWP GIS layer above. Coords look like degree-minute rounding (`45.0833` = 45°05′), not surveyed lots. Fix: replace with FWP GIS points; label land status (FAS / USFS / NPS / private).
- Montana flagship access — **same pin-error class, worse deltas** (FWP name match, same-site only; false-positive name collisions dropped):

  | River | Access | Delta vs FWP | Source |
  |---|---|---|---|
  | Bitterroot | Wally Crawford FAS | **66.4 km** | [FishMT Wally Crawford](https://myfwp.mt.gov/fishMT/fas/) / GIS 46.09179, −114.17494 vs EA 46.682, −114.04 |
  | Blackfoot | River Junction FAS | **50.5 km** | GIS 46.98574, −113.13638 vs EA 46.953, −113.8 |
  | Bighorn (MT) | Bighorn FAS (13-Mile) | **37.1 km** | [FishMT 39753822](https://myfwp.mt.gov/fishMT/fas/39753822) 45.41460, −107.78649 vs EA 45.179, −107.45 |
  | Missouri | Mountain Palace FAS | **34.3 km** | GIS 47.16256, −111.82311 vs EA 46.8833, −112.0167 |
  | Big Hole | Maiden Rock FAS | **25.1 km** | GIS Maidenrock 45.65559, −112.69612 vs EA 45.7333, −113.0 |
  | Beaverhead | Henneberry Bridge FAS | **24.1 km** | GIS 45.05970, −112.81503 vs EA 45.1834, −112.5622 |
  | Ruby | Vigilante FAS | **25.5 km** | GIS 45.25994, −112.10057 vs EA 45.481, −112.015 |
  | Missouri | Craig FAS | **16.8 km** | GIS 47.07256, −111.96305 vs EA 46.9333, −112.05 |
  | Yellowstone | Mallard's Rest FAS | **12.3 km** | GIS 45.48483, −110.62164 vs EA 45.5833, −110.55 |
  | Yellowstone | Loch Leven FAS | **5.3 km** | GIS 45.45722, −110.62424 vs EA 45.4833, −110.5667 |

  Afterbay Dam Launch (EA 45.3025, −107.528) vs Yellowtail Afterbay (~45.318, −107.924) is ~31 km east of the dam — **Unverified against NPS river-launch GIS**, but it is not on the Afterbay lot. Fix: rebuild Montana access from FWP/NPS/USFS GIS, not rounded seed coords.
- 49 new river pages (e.g. [`/rivers/asay-creek`](https://www.executiveangler.com/rivers/asay-creek), [`/rivers/smith-river-montana`](https://www.executiveangler.com/rivers/smith-river-montana)) — **no hero photograph**. DB `hero_image_url` is null on all 49. Live Asay HTML alts show “Big Cottonwood Creek” and “Green River” (nearby cards), not Asay. **Correction:** these 49 stay in the public catalog (listings, sitemap, counts, `index, follow`). Do not noindex or hold them out for a missing hero. Fix the neighbor-hero stand-in in the photo UI; do not shrink the catalog.
- [`robots.txt`](https://www.executiveangler.com/robots.txt) — **AI crawlers are not bound by the private-path Disallows**. `User-Agent: *` disallows `/journal/`, `/account/`, `/api/`, `/admin/`, `/search`, etc. Separate groups for GPTBot, ClaudeBot, PerplexityBot, ChatGPT-User, Anthropic-AI, Google-Extended, Applebot-Extended, CCBot list only `Allow: /`. A more specific group **replaces** `*` (robots.txt spec). Those bots may fetch journal and account URLs. `/journal` and `/account` also inherit root `robots: index, follow` (no metadata noindex on the index pages). Footer and logged-out nav still link Journal. Fix: copy the `*` disallow list into every bot group; set `noindex` on `/journal`, `/account`, `/feed`.

## P1

- Homepage HTML is `cache-control: private, no-cache, no-store` (`x-vercel-cache: MISS`, TTFB **679 ms** this check). `/rivers` and `/rivers/madison-river` are public ISR (TTFB 199 ms / 64 ms). Cause: `getGaugeSnapshots()` / `getFlagshipHistories()` call `unstable_noStore()` (`src/components/home/conditions.ts`), which opts the entire `/` render out of the `revalidate = 3600` on `src/app/page.tsx`. Public reference pages should be CDN-cached; the rail should fetch `/api/river-conditions` (already `s-maxage=900`).
- Sitemap `lastmod` is `new Date()` for almost every URL (build stamp `2026-08-30T16:29:12.829Z`). Articles use `publishedAt`. Flows must not bump `lastmod` hourly. Policy: `lastmod` = content `updated_at`, not request time; sitemap ISR ≤ listing ISR.
- Missing river slugs return **HTTP 200** with title “River Not Found” and no `noindex`: `/rivers/fryingpan-river`, `/rivers/battenkill`, `/rivers/this-slug-does-not-exist-qa` (56 KB). `notFound()` is in source (`src/app/rivers/[slug]/page.tsx`); production is serving 200. Fryingpan (CO flagship tailwater) has no row. Battenkill exists as [`/rivers/batten-kill-vermont`](https://www.executiveangler.com/rivers/batten-kill-vermont) only. Fix: real 404/410 + redirects from old names; add Fryingpan or noindex a stub.
- Madison gauge binding is the right *family* but not the gauge most anglers open for the 50-mile riffle. Live bindings: `06038500` Below Hebgen (ticker **760 CFS** at 18:45 MDT — matches USGS IV exactly), `06040000` Near Cameron, `06041000` Below Ennis Lake. **Kirby Ranch `06038800` is omitted** (909 CFS at 18:30 MDT). Labeling 06038500 “Upper Madison (50-Mile Riffle)” is Hebgen release, not Kirby. Missouri ticker uses Hauser `06065500` (3,430 CFS) as primary; Craig anglers use Holter `06066500` (3,690 CFS). South Fork Snake has **no gauge** in DB (Heise `13037500` is the usual).
- 232 of 650 access points have ≤2 decimal degrees (~1.1 km). Quake Lake (44.8406, −111.4261) is unlabeled land status (lake/slide vs FAS). Gallatin “Gallatin Gateway (Squaw Creek Bridge)” uses the retired creek name (Storm Castle). Firehole `flow_type` is `spring creek` — it is a geothermal freestone, not a spring creek.
- [`/green-river`](https://www.executiveangler.com/rivers/green-river) title is “Wyoming & Utah” and the access list spans Green River Lakes (269 km from the page centroid) through Fontenelle to Flaming Gorge A/B/C. Gauge `09234500` Greendale, UT is correct for the tailwater and matched the ticker (**2,750 CFS**). The slug without a state is honest only if the page is explicitly one river with two fisheries; it currently reads as one pin-set. Fontenelle/Warren Bridge must not be implied as Flaming Gorge public ramps.
- Image rights / subject: Madison OG and hero src are `/images/madison-river-three-dollar-bridge.jpg` (local file present). Lodge cards on Madison use Unsplash (`photo-1670774923640-a78a5ed24d93`, `photo-1749063240044-82d7db59879d`) — **Unverified** as Lone Mountain Ranch / Firehole Ranch. Smith River (new, no owned hero) still indexable. Footer decorative band is `/images/mongolia-river-aerial.jpg` (`alt=""`) sitewide — not a Madison hero bug.
- Hero `alt` on Madison is “River Madison — fly fishing” / “Madison River fly fishing”, not “Madison River at Three Dollar Bridge, looking downstream”. `src/app/rivers/[slug]/page.tsx` falls back to `` `${river.name} fly fishing` ``.
- Regulations are a static paragraph (“Check Montana FWP…”) with **no retrieved-on date** and no agency URL. Stale-regs class. Same pattern on other rivers.
- `/plan/[river]` is prerendered for every river and **not in the sitemap** (frozen `sitemap.ts` note in project docs). Soft-404s and thin new rivers are indexable; trip briefs are invisible. Invert that.
- No CSP (`next.config.ts` CSP is SVG-only). USGS proxies (`/api/river-conditions/[riverId]`, `/api/rivers/flow-states`) are public with no rate limit. Auth login has no brute-force limit (`track-login` is a geo stamp). EXIF strip is canvas-only on some clients; `api/photos/session` and `api/user/avatar` store raw bytes.
- `scripts/check-river-integrity.ts` still uses 138 as a **minimum** floor (187 passes). Do not treat that floor as the advertised catalog size.
- `constants.ts` `NAV_LINKS` still has Gear → `/account/gear` and Feed → `/feed`. Live chrome uses `PUBLIC_NOUNS` (Rivers / Flies / Places / Field Notes / Learn) — leftover public pointers at private routes if anything still imports `NAV_LINKS`.
- Search `?q=henrys` SSR HTML does not contain “Henry” / “fork” (client index). Keyboard/typo tolerance **Unverified** in this pass without a hydrated browser run.
- Duplicate / near-duplicate slugs that are *correctly* split (keep): `au-sable-river` vs `ausable-river-new-york`; `bighorn-river-montana` vs `bighorn-river-wyoming`; `truckee-river` vs `truckee-river-nevada`. `green-river` has no Wyoming-only sibling. No exact slug duplicates in DB.

## P2

- Ticker chips (desktop HTML): Madison 760, Green 2,750, Henry’s Fork 655, Yellowstone 1,910, Snake 4,880, Missouri 3,430 — all matched the primary USGS IV at check time. Truncation (“Snake 4,88…”) was **not** in the desktop HTML; mobile overflow is **Unverified** until a 390px screenshot.
- 12 access points sit >80 km from the river centroid (Green WY headwaters on the UT page; Salmon Riggins vs North Fork; James River Belle Isle vs stated center). Long rivers need sectioned maps, not one bbox.
- Slough Creek First/Second/Third Meadow pins are guidebook-public trail destinations, not secret holes — acceptable, but they are more specific than FAS lots. Keep them named as meadows/trailheads, never as catch spots.
- No Delaware East/West Branch pages. No `/rivers/fryingpan-river` row.
- `getAllRivers()` has no published/hero/status filter — stubs inflate 187 the hour they are inserted.
- Root `error.tsx` only; no route-level boundary around map, ticker, or journal.
- Access types are almost all missing (`type` empty on the 650-row dump). Public vs private is not explicit on the Madison list.
- Article count: DB 24, sitemap 24, homepage CategoryIndex uses `articles.length` (live). Snapshot “25” is stale. Species: DB 35, about “35+”, sitemap 35. Guides 106 / shops 230 / lodges 32 match sitemap. Flies: 162 approved pages + 8 category + 138 `/flies/for/` + 183 `/flies/hatch/` = 492 `/flies/` sitemap paths (includes library).
- CLAUDE.md still lists Newsreader / Archivo / IBM Plex Mono. `DESIGN.md` + `layout.tsx` are Fraunces + Inter only. Inter is correct per current law, not a brand fail.
- Privacy page covers GPS and journal visibility; it does **not** mention EXIF stripping or USGS. It allows sessions set to “public” with aggregate catch data — product must not grow a public leaderboard from that sentence.

## P3

- Overline tracking / eyebrow consistency is tokenized (`ea-overline`, `--text-3` #6E746F at 4.54:1 on `--paper` — AA on paper after the 2026-08-28 amendment). Ink-band overlines **Unverified**.
- Footer columns are real links (Explore / Learn / Directory / notebook / Company). Mongolia aerial as the one ink-band photograph is a design ruling (2026-08-28), not a river-page mismatch.
- Sitemap Host + Sitemap directives are present. HSTS `max-age=63072000`. Apex `https://executiveangler.com/` → 308 → `https://www.executiveangler.com/`. `http://www` → https www.

## Maps & access audit

Method: every `/rivers/*` slug from the DB (187) was HTTP-checked (all **200**). All 650 access points were extracted from production `rivers.access_points`. Montana pins were matched to FWP GIS by name. Madison + selected high-risk rows were checked against FishMT pages. Other states: coordinates stored as numbers (no NaN / 0,0); official lot deltas **Unverified** except where noted.

### Madison River (full)

| Access name | Stated coords | Verified coords | Delta (m) | Land status | Pass/fail | Source | Notes |
|---|---|---|---|---|---|---|---|
| Three Dollar Bridge | — | 44.83194, −111.51417 | — | MT FWP FAS, toilet, winter walk-in 0.5 mi; Stage I fire restriction as of 2026-08-20 | **Fail (missing)** | https://myfwp.mt.gov/fishMT/fas/39754533 | Homepage hero subject |
| Raynolds' Pass FAS | — | 44.82871, −111.47933 | — | MT FWP FAS, ramp, camping | **Fail (missing)** | https://myfwp.mt.gov/fishMT/fas/39753440 | One mile above Three Dollar |
| Quake Lake | 44.8406, −111.4261 | Unverified lot | — | Not an FWP FAS under this name | **Unverified** | — | May be slide/lake centroid; do not imply a ramp |
| Lyons Bridge FAS | 44.9383, −111.5906 | 44.89910, −111.59260 | 4362 | FWP/USFS, concrete ramp, toilet | **Fail** | https://myfwp.mt.gov/fwpPub/landsMgmt/siteDetail.action?lmsId=39753518 | Pin is ~4.4 km north of the bridge |
| McAtee Bridge FAS | 45.0833, −111.65 | 45.09665, −111.66152 | 1738 | FWP FAS, gravel ramp, toilet | **Fail** | https://myfwp.mt.gov/fishMT/fas/39753516 | Degree-minute rounding |
| Varney Bridge FAS | 45.2083, −111.6833 | 45.22900, −111.75196 | 5849 | FWP FAS, concrete ramp, camping | **Fail** | https://myfwp.mt.gov/fwpPub/landsMgmt/siteDetail.action?lmsId=39753404 | ~5.8 km east of the river |
| Ennis Bridge FAS | 45.35, −111.7333 | 45.34443, −111.72310 | 1011 | FWP Ennis FAS; seasonal 4/27–11/30 | **Fail** | https://myfwp.mt.gov/fishMT/fas/39753534 | Town, not the lot; seasonality not on page |
| Valley Garden FAS | 45.4167, −111.75 | 45.36726, −111.70540 | 6509 | FWP FAS, gravel ramp, camping | **Fail** | https://myfwp.mt.gov/fishMT/fas/39753456 | ~6.5 km off |
| Beartrap Canyon | 45.5167, −111.65 | Unverified trailhead | — | BLM/state canyon below Ennis Dam | **Unverified** | USGS 06041000 is 45.49023, −111.63451 | Parking=false is honest; pin precision is not |

Map chrome: Madison HTML includes Mapbox (`LazyMapView`). Basemap attribution, pinch-zoom, and no-JS coordinate list were **not** exercised in a browser in this pass (access names *are* in the HTML list — map is not the only source). Pins↔list are 1:1 for the seven rows that exist; the missing official sites are list gaps, not orphan pins.

### Gauge binding (flagship ticker) — 2026-08-30 ~19:00 MDT

| Chip | Page | Primary site | USGS name | Page/ticker CFS | USGS IV | Pass/fail |
|---|---|---|---|---|---|---|
| Madison | /rivers/madison-river | 06038500 | Madison River bl Hebgen Lake nr Grayling MT | 760 | 760 @ 18:45 MDT | **Pass** (wrong *section label*; missing Kirby 06038800) |
| Green | /rivers/green-river | 09234500 | GREEN RIVER NEAR GREENDALE, UT | 2,750 | 2,750 @ 18:30 MDT | **Pass** |
| Henry’s Fork | /rivers/henrys-fork | 13042500 | HENRYS FORK NR ISLAND PARK ID | 655 | 655 @ 18:45 MDT | **Pass** |
| Yellowstone | /rivers/yellowstone-river | 06191500 | Yellowstone River at Corwin Springs MT | 1,910 | 1,910 @ 19:00 MDT | **Pass** |
| Snake | /rivers/snake-river-wyoming | 13011000 | SNAKE RIVER NEAR MORAN, WY | 4,880 | 4,880 @ 18:45 MDT | **Pass** |
| Missouri | /rivers/missouri-river | 06065500 | Missouri River bl Hauser Dam near Helena MT | 3,430 | 3,430 @ 19:00 MDT | **Pass** (Craig section should prefer Holter 06066500) |

154 distinct `usgs_gauge_id` values are well-formed site IDs. Asay Creek `10174000` is a real NWIS station (37.5499807, −112.5174323) with **no IV values** at check time — page must not invent CFS. 90 rivers have no gauge; that is acceptable if the UI stays blank.

### Other high-risk rivers (access)

| River | Access highlight | Stated | Official / note | Delta | Pass/fail |
|---|---|---|---|---|---|
| Gallatin | Greek Creek Campground | 45.3833, −111.2333 | 45.3725, −111.1764 (paddling gazetteer, not FWP GIS) | ~4.6 km | Fail if treated as a lot; **Unverified** FWP |
| Gallatin | Moose Creek Flat | 45.45, −111.25 | USFS 45.3560, −111.1721 | ~12 km | **Fail** |
| Gallatin | Squaw Creek Bridge | 45.5667, −111.2333 | Creek renamed Storm Castle | — | **Fail** (name) |
| Yellowstone | Carbella FAS | 45.6667, −110.6167 | No FWP name hit in this dump | — | **Unverified** |
| Missouri | Holter Dam | 46.9833, −112.0333 | Near Holter; not a named FAS match | — | **Unverified** lot |
| Bighorn MT | Afterbay Dam Launch | 45.3025, −107.528 | Afterbay ~45.318, −107.924 | ~31 km | **Fail** |
| Henry’s Fork | Last Chance / Harriman / Box Canyon | 2-decimal | Classic public accesses; lot-level **Unverified** | — | Unverified |
| Au Sable (MI) | Burton's Landing | 44.6667, −84.6333 | Holy Water put-in; lot **Unverified** | — | Unverified |
| Ausable (NY) | Wilmington Notch | 44.3456, −73.8765 | Plausible Adirondack reach | — | Unverified |
| Lees Ferry | Lee s Ferry Launch Ramp | 36.86, −111.59 | NPS Lees Ferry ~36.865, −111.588 | ~0.5 km-class | Likely pass; confirm NPS |
| Provo | Deer Creek / Vivian Park / Midway set | mixed | Names match UDWR public accesses | — | Unverified lots |
| Destinations / lodges / shops | — | — | State-centroid risk **not fully walked** | — | Unverified (Missouri dest created 2026-08-30, `hero_image_url` null) |

Full river inventory (slug, sitemap, listing, hero): `docs/qa/inventory-rivers-2026-08-31.csv`.

## Image mismatch log

| Page URL | Image src | Intended subject | Actual subject | Pass/fail | Fix |
|---|---|---|---|---|---|
| https://www.executiveangler.com/ | `/images/madison-river-three-dollar-bridge.jpg` | Three Dollar Bridge, Madison | Named local asset; caption “Three Dollar Bridge · 760 CFS · Aug 30” | **Pass** (photo content visually confirmed only if screenshot matches; file + copy agree) | Keep; do not rotate without recaptioning |
| https://www.executiveangler.com/rivers/madison-river | same file | Madison River | same | **Pass** as file identity | Specific alt |
| https://www.executiveangler.com/rivers/madison-river | Unsplash `photo-1670774923640…`, `photo-1749063240044…` | Lone Mountain Ranch, Firehole Ranch | Unsplash stock — **Unverified** property | Fail if not the lodge | Replace with licensed property photos or drop |
| https://www.executiveangler.com/rivers/asay-creek | *(no hero)*; nearby `/images/rivers/big-cottonwood-creek-hero.jpg`, `green-river-hero.jpg` | Asay Creek, Hatch UT | Empty hero; neighbor rivers | **Fail** | Own photo or noindex |
| https://www.executiveangler.com/rivers/smith-river-montana | *(no hero)*; same Unsplash lodge IDs as Madison | Smith River, MT | Empty hero | **Fail** | Own photo or noindex |
| 47 other 2026-08-30 rivers | null `hero_image_url` | Named water | None | **Fail** | Same |
| All pages (footer) | `/images/mongolia-river-aerial.jpg` | Decorative ink band | Mongolia aerial, `alt=""` | Pass as decorative | Do not let it become an LCP hero |
| `/rivers/green-river` | `/images/rivers/green-river-hero.jpg` | Green (UT/WY) | File identity only | **Unverified** subject | Confirm Flaming Gorge vs WY headwaters |

Broken-hero intermittency on Madison was **not** reproduced: hero src returned in HTML with the Three Dollar Bridge file. Treat historical blank heroes as a regression to watch (client `onError` → `PlateFallback` in `RiverHeroImage.tsx`).

Community pipeline: not exercised end-to-end. Code review: approved-only read; rejected should not render. EXIF not stripped server-side.

## Visual / brand notes

`DESIGN.md` is a single system: `--paper` `#FAF9F5`, Fraunces display, Inter UI, `--accent` `#1E4D3B`, `--ember` `#C05B23` once per screen, light theme only, `prefers-reduced-motion` in `globals.css`. That matches the cream / serif / forest / rust brief. Inter is **required** by DESIGN.md (CLAUDE.md type list is stale).

What the HTML and tokens support, without pretending a full visual pass is done:

- Header nouns in code: Rivers / Flies / Places / Field Notes / Learn + search + auth. Active underline via `section` prefixes (`src/components/layout/nav/links.ts`).
- Skip link exists (`SkipLink.tsx`, Madison HTML contains “Skip to content”).
- Focus rings are `--accent` (`FOCUS_VISIBLE`), not default purple — in code. **Unverified** in a real keyboard pass.
- Ticker is a separate `ConditionsRail` + `OnTheWaterNow` well, not a collision in markup. Mobile wrap/truncate **Unverified**.
- No dark mode (correct).
- 404 for unknown slugs is a titled “River Not Found” document at HTTP 200 — looks like a page, not a designed 404 status.
- Empty hero on new rivers: `PlateFallback` path exists; Asay live HTML did not show a hero `<img>` for Asay itself.

Template scores (provisional; raise after screenshots):

| Template | Fidelity | Consistency | Trust | Distraction |
|---|---|---|---|---|
| Homepage | 8 | 8 | 4 (187 vs 138; no-store) | 7 |
| /rivers | 7 | 8 | 3 (count + stubs) | 7 |
| Madison | 7 | 8 | 2 (pins + missing 3$) | 7 |
| Asay Creek | 3 | 6 | 2 | 6 |
| Flies library | 7 | 8 | 7 (162 matches DB) | 7 |
| Destination MT | 7 | 8 | 6 | 7 |
| About | 7 | 8 | 3 (53 vs 52 sitemap) | 8 |
| Journal (logged-out) | — | — | 8 (307 → login) | — |
| 404 | 4 | 5 | 3 (200) | 6 |

Screenshot set: capture homepage ticker at 390px, Madison map+access, Asay empty hero, River Not Found, `/rivers` “187” H1 vs sitemap. Attach to the PR when the visual agent finishes.

## Performance

Measured from this environment (not a Lighthouse lab, not CrUX). Treat as field-like TTFB only.

| Template | TTFB | Total | Size | Cache | LCP risk |
|---|---|---|---|---|---|
| `/` | 0.68 s | 0.70 s | 187 KB HTML | **private, no-store, MISS** | Hero photo + fonts + no-store HTML |
| `/rivers` | 0.20 s | 0.20 s | 315 KB | public, PRERENDER | Card grid images |
| `/rivers/madison-river` | 0.06 s | 0.08 s | 280 KB | public, HIT | Hero `priority` + `sizes=100vw` |
| `/rivers/asay-creek` | 0.06 s | 0.07 s | 165 KB | public, HIT | No LCP photo |
| `/flies/library` | 0.17 s | 0.18 s | 179 KB | public, PRERENDER | Plate grid |
| `/destinations/montana` | 0.20 s | 0.20 s | 236 KB | public, PRERENDER | Hero |

**Cache policy recommendation**

| Route class | Policy |
|---|---|
| `/`, public marketing | ISR 3600 on the shell. Live CFS via client or `/api/river-conditions` (`s-maxage=900`). Remove `noStore()` from the page render path. |
| `/rivers`, `/rivers/[slug]`, destinations, flies, articles | Keep `revalidate=3600`. `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` if you want CDN HTML. |
| `/sitemap.xml`, `/llms.txt` | Same window as listing (3600) or on-demand `revalidatePath` when rivers are published. `lastmod` = row `updated_at`. |
| `/journal`, `/account`, `/flybox`, `/rivers/mine` | `force-dynamic` + `private, no-store` + `noindex`. |
| USGS proxies | Keep short TTL; add rate limits. |

Fonts: Fraunces + Inter, `display: "swap"`. Two-family preload **Unverified** in this HTML parse. GA4 `G-RY19PKC2WQ` is `afterInteractive` in root layout. Map is `LazyMapView` on the detail page, not the 187-card index — good.

INP/CLS: **Unverified** (no Lighthouse). CLS risk: hero `fill` + reserved `60svh` / `72vh` on river pages; ticker height on homepage.

## SEO

- Titles: Madison `Madison River Fly Fishing Guide | Executive Angler` (unique, H1 once). Homepage and `/rivers` titles embed **187**. `/flies/library`: “162 Trout Fly Patterns”. Canonical www on sampled pages.
- Indexation: public entity pages `index, follow`. Search `noindex, follow`. Login `noindex, nofollow`. Journal index / account: **no metadata noindex** (redirect to login). Soft-404 rivers: 200 + indexable. 49 new rivers: indexable, not in sitemap — Google can discover them via `/rivers` links and then see thin/no-hero pages.
- AI/GEO: `llms.txt` is honest about 138 (stale) and forbids citing live reports. `robots.txt` Host + Sitemap set; AI bots allowed on public pages **and** (see P0) on private paths.
- Schema on Madison: `WebSite`, `Organization`, `BodyOfWater`+`Place`, `BreadcrumbList`. No fake `AggregateRating` seen. FAQPage not on the river.
- OG image on Madison is the Three Dollar Bridge file (correct subject). Default OG in root layout is the same file for the whole site — destination/fly pages should not inherit Madison as OG if they have their own hero.
- Keyword cannibalization: Madison river page + `/articles/best-flies-for-the-madison-river-2026` + `/flies/for/madison-river` + `/destinations/montana` + `/plan/madison-river`. Assign primary to `/rivers/madison-river`.
- Apex → www and HTTP → HTTPS work. HSTS present.

## Code

- `src/app/sitemap.ts` — `revalidate = 86400`; `lastModified: now` for rivers; same `getAllRivers()` as listing. Frozen file in project docs; still the 187 vs 138 machine.
- `src/app/llms.txt/route.ts` — `revalidate = 86400`; live `catalogCounts()` when it eventually refreshes.
- `src/app/page.tsx` + `src/components/home/conditions.ts` — `noStore()` on gauge reads; homepage uncacheable.
- `src/lib/db/rivers.ts` — `select('*')` no publish filter; `Number(latitude)` / `Number(longitude)`; `accessPoints` passed through as JSONB.
- `src/app/rivers/page.tsx` / `generateMetadata` — title uses `rivers.length`.
- `src/app/robots.ts` — AI bot groups without Disallow.
- `src/app/journal/page.tsx`, `src/app/account/page.tsx`, `src/app/feed/page.tsx` — missing `robots: noindex`.
- `src/components/ui/RiverHeroImage.tsx` — generic alt; `priority` on LCP; error → fallback.
- `src/app/rivers/[slug]/page.tsx` — `notFound()` present; production 200 on missing slugs still observed.
- `src/components/layout/Footer.tsx` — Journal link; Mongolia decorative photo.
- `next.config.ts` — duplicate `upload.wikimedia.org` remotePattern; no document security headers.
- Tests exist for USGS site-id hygiene (`src/lib/search/index.test.ts`) and home-rail gauges; **no** sitemap-count vs DB test.
- `console.log` leftovers are concentrated in email/auth/notification routes, not river pages.

## What is already strong

- Brand tokens are law, not a pile of defaults: paper, forest accent, ember rationed, no dark-mode fake.
- Homepage ticker CFS matched USGS IV on all six primaries at check time. Greendale, Island Park, Corwin Springs, Moran, Hauser, Hebgen are the right *stations* for those chips.
- Green (UT) vs a random WY Green gauge: Flaming Gorge `09234500`, not Warren Bridge.
- Au Sable (MI) / Ausable (NY) and Bighorn MT / WY are split on purpose.
- Journal and account **redirect** unauthenticated users (307). Session GPS is described as private; `session_presence` SQL excludes lat/lng.
- Skip link, reduced-motion, `aria-expanded` on Explore/Filters exist in source.
- HSTS, www canonical, Host + Sitemap, structured `BodyOfWater` + breadcrumbs.
- Map is lazy on the detail page; the index does not boot 187 Mapbox maps.
- Copy voice on the homepage and Madison (“we do not publish other anglers’ spots”) matches the product rule. Do not rewrite it into marketing.

## Suggested fix order (7-day)

Day 1: Align sitemap/`llms.txt` ISR with the live catalog (**187 rivers / 53 destinations**). Do not hold hero-less rivers out of `getAllRivers()` / listing / homepage math. Do not noindex those stubs for a missing photograph. Copy `*` Disallows into every AI bot group; `noindex` journal/account/feed.

Day 2: Madison access rebuild from FWP GIS — add Three Dollar Bridge + Raynolds’ Pass; move Lyons/McAtee/Varney/Valley Garden/Ennis onto the official lots; add Kirby Ranch `06038800`; specific hero alt.

Day 3: Montana FAS sweep (Bitterroot Wally Crawford, Blackfoot River Junction, Bighorn Afterbay/13-Mile, Missouri Craig/Mountain Palace, Yellowstone Mallard's Rest/Loch Leven, Big Hole Maiden Rock, Beaverhead Henneberry). Write a fixture test: name + coords must sit within 75 m of FWP GIS.

Day 4: Soft-404 → real 404/410; Fryingpan page or redirect; `/plan` indexation policy; regulations block = agency link + retrieved-on date + “verify with the agency”.

Day 5: Homepage cache split (ISR shell + client gauge rail). Sitemap `revalidate=3600` and `lastmod=updated_at`. Rate-limit USGS proxies. Server-side EXIF strip.

Day 6: Image pass — no Unsplash lodge stand-ins; no neighbor-river heroes; OG per entity. Firehole flow type. Gallatin name. Green River sectioned (WY freestone vs FG tailwater) or two pages.

Day 7: Lighthouse+CrUX on `/`, `/rivers`, Madison, flies library, Montana. Keyboard/search/`henrys` typo. 390px ticker. WCAG re-check of ink-band overlines. Only then talk about promotion.

---

### Inventory reconciliation (live, 2026-08-31)

| Collection | Homepage / listing | About | llms.txt | Sitemap `<loc>` | Production DB |
|---|---|---|---|---|---|
| Rivers | **187** | **187** | 138 | **138** `/rivers/` | **187** |
| Flies (canonical) | **162** | — | 162 | 162 `/flies/{slug}` (+ 330 hatch/for/category) | 162 approved / 213 all |
| Destinations |  (CategoryIndex uses live length) | **53** | 52 | **52** `/destinations/` | **53** (Missouri added 16:29:39Z, null hero) |
| Species | — | 35+ | — | 35 | 35 |
| Articles | live length | — | 24 | 24 | 24 |
| Fly shops | — | listed | — | 230 | 230 |
| Guides | — | listed | 106 | 106 | 106 |
| Lodges | — | listed | — | 32 | 32 |

Sitemap total URLs: **1122**. Unique `lastmod` values: 25 (articles + one build stamp).

Private paths: `/journal` 307 → login; `/account` 307 → login; `/search` 200 `noindex, follow`; `/api/` and `/admin/` disallowed for `*` only.
