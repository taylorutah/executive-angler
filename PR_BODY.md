# River template — The Water Desk (Lane I)

Draft against `main`. Do not merge until Wave 2 review.

The most-visited template is now in spec order: name **over** the photograph, section selector, dusk live inset at full content width, overview in `.prose` at 68ch, a real hatch grid, a two-tone access map, flies fishing now, regulations, lodges/guides/shops on this river, nearby rivers.

#30 already made this page *correct* (chart height, guest insights). This lane makes it *right*.

## What changed

- **Hero.** Full-bleed photograph (`60svh` / `72vh`) with the river name in Fraunces sitting in the 0.8-alpha band of `.hero-overlay`. Title is not below the image in sans. Hero text was **not** repainted dark.
- **Photo credit.** Opaque paper pill + ink (17.94:1), not the heavy solid-ink bar. Lighter on the photograph; still contrasting.
- **Section selector.** Existing `RiverSectionPills` stays immediately under the hero.
- **Live inset.** Dusk register (`register-dusk`) at full content width: streamflow, gage, water temp, weather, then the hydrograph. No 400px sidebar.
- **Your record here.** Client island under the inset. Times fished · best month · top fly · *Log a session here*. Returns `null` until auth resolves, so personal stats never land in cached HTML. Public half stays byte-identical.
- **Signed-out states.** `PersonalFlowOverlay` and `BestWindowCalculator` from #30 stay. No paywall. No Pro.
- **Overview.** `.prose` at 68ch, expanded, no gradient fade.
- **Hatch chart.** Seasonal insect × month grid. Best months are the *on* headers (copper), not leftover chips.
- **Access.** Two-tone Mapbox desk palette — Vellum land, Teal water.
- **On this river / Nearby rivers.** Lodges, guides, and shops grouped; destination siblings listed.

**Routes:** none renamed, none redirected. `sitemap.ts` / `robots.ts` / `llms.txt` / `next.config` / auth callback untouched.

## Screenshots (signed out)

| Viewport | Path |
|---|---|
| 1440 | `/cursor/stores/self/artifacts/lane-i/madison-river-1440.png` |
| 390 | `/cursor/stores/self/artifacts/lane-i/madison-river-390.png` |

## Gates

| Command | Result |
|---|---|
| `npm run build` | green |
| `npm test` | 27/27 |
| `npm run check:hex` | OK — no new arbitrary-hex utilities |
| `npm run check:contrast` | 18/18 token pairs |
| `check:contrast:rendered` on `/rivers/madison-river` @1440 and @390 | **0 fail · 0 unverifiable** (after credit/hatch/Report fixes) |
| `npm run test:visual` / `test:e2e` | not in this worktree (Lane U3) |

## Measured contrast (this page)

- Hero `h1` in the 0.8 band: designed 8.45:1 on Vellum if the photo never loads. Not repainted.
- Credit chip: ink on card **17.94:1**.
- Painted sample of `/rivers/madison-river`: 155 samples @1440, 95 @390, **zero failures**.

## Logged-in delta (not in screenshots)

`YourRecordHere` mounts only after `useAuth` sees a user, then fetches `/api/insights/personal-river/:id`. Guests never see the strip. Owner-only; no one else's record.

## Blockers

None for the template. Mapbox two-tone needs `NEXT_PUBLIC_MAPBOX_TOKEN` (already required). Hatch intensity uses existing `hatch_chart` rows only — nothing invented.
