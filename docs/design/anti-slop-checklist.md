---
type: concept
title: "Anti-slop checklist"
project: executive-angler
updated: 2026-08-26
tags: [ea, brand, qa, design, checklist]
---

# Anti-slop checklist

**Run this before claiming any page is done.** Both registers, 1440 **and** 390, signed in **and** signed out.

Every line is measured, not asserted. A gate that passes while checking zero things is worse than no gate. If a line cannot be measured on the page in front of you, it fails.

Authority: [[Brand-Bible-v4]] v4.1 Part II. Page specs: [[Water-Desk-Spec-2026-08-26]].

---

## 0. Evidence this list is built from — production, 2026-08-26

Measured on `www.executiveangler.com`, logged out, at 1114 / 1512 / 1800 / 500px viewports.

| # | Tell | Where | Measured |
|---|---|---|---|
| 1 | Generic icon language | `/rivers/madison-river` | **35 Lucide glyphs** of 49 SVGs. `/rivers/arkansas-river-colorado`: 29 of 35 |
| 2 | Rounded-card idiom | `/rivers`, `/flies/library`, `/destinations` | **26 elements at 12px radius** on each |
| 3 | Pill everything | `/rivers` | **74 elements at `border-radius: 9999px`** (56 on `/flies/library`, 33 on `/destinations`) |
| 4 | Elevation theatre | same three indexes | **24 elements carrying ≥20px shadow blur** on each |
| 5 | Three-up feature grids | `/` | **5 grid containers ≥700px wide with 3 equal columns** |
| 6 | Under-resolved hero | `/` | hero source **naturalWidth 557px** painted across **1114 CSS px** at DPR 2 |
| 7 | Hero composition | `/` | ~55% of the frame is empty sky; the eyebrow sits in an opaque cream plate floating on the photograph |
| 8 | Missing alt text | `/` | **17 of 21 `<img>` have empty `alt`** |
| 9 | Viewport-dependent image loading | `/rivers` | at 1114px, **24 of 28 images issued no network request**; at 1800px all 28 loaded (26 optimizer requests) |
| 10 | Duplicate controls | `/rivers/madison-river` | **"Create a free account" rendered 3×**; "Montana" 2× |
| 11 | InstrumentWell geometry | `/rivers/arkansas-river-colorado` | well is correct in kind (1042×483, `.register-dusk`, 1px `#243033`) but **12px radius**; a second dusk panel 976×200 has **0px border** |
| 12 | Banned copy | `/rivers/arkansas-river-colorado` | **"premier"** in body copy |
| 13 | Contradictory counts | `/flies/library` | `<title>` says **"120+ Proven Patterns"**; the library holds **162** |
| 14 | Wordmark in chrome | every public page | full lockup `EXECUTIVE ANGLER` in the header, against §5.6 mark-only |
| 15 | App CTA as chrome | every public page | `Get the app` as a filled copper button in the header |
| 16 | Footer ground | `/` footer | **`#FFFFFF`** — Card used as a page ground, a white slab under a cream page |
| 17 | Footer icon set | `/` footer | 4 generic social glyphs in 8px-radius grey squares |
| 18 | App-store wall in footer | `/` footer | App Store + Google Play badges with a `SOON` chip |
| 19 | Slop is tokenised | `globals.css` | `--radius-control: 9999px`, `--radius-surface: 12px`, `--elev-glow` / `--elev-glow-strong` (30–40px copper bloom), `--enter-duration` / `--enter-rise` / `--enter-stagger` |

**Not a finding, and worth stating:** the type stack and the palette are clean. Fonts measured Archivo-dominant with Fraunces on headings, Newsreader confined to prose, Plex Mono ≤4 elements per page. The shipped warm palette passes AA on all 20 pairs checked (minimum 4.86:1, copper-700 on vellum). **The palette is not the problem. Composition, geometry, iconography and elevation are.**

---

## 1. The gate

Tick every line. A miss is a defect, not a preference.

### Seam and register
- [ ] No full-bleed Dusk on a public editorial page. The seam is an object on paper, not a cliff.
- [ ] Every Dusk panel on a Daylight page satisfies all five values in §5.7 Rule 5: gutter inset, ≥24px paper above and below, 4px radius, 1px `--border-rule` edge, `--elev-1` shadow only.
- [ ] `.register-dusk` sits on the panel, never on the section containing it.
- [ ] One InstrumentWell per page region.

### Controls
- [ ] Every control renders **once** per page. Grep the rendered text for duplicate button and link labels.
- [ ] A control that exists in both registers uses the same accent hue through `--action`. No component hardcodes a hex.
- [ ] Keyboard focus is visible on every interactive element.
- [ ] Hover is a 1px rule darkening at 140ms. No glow, no scale, lift ≤2px.

### Icons
- [ ] Zero raw Lucide / Heroicons / Feather glyphs. `document.querySelectorAll('svg[class*="lucide"]').length === 0`.
- [ ] Zero emoji used as UI icons.
- [ ] Social glyphs come from the same set as everything else.

### Geometry and light
- [ ] No element at `border-radius` ≥ 8px except a chip.
- [ ] Cards at `--radius-surface` (6px); instruments at `--radius-instrument` (4px); chips only at `--radius-chip`.
- [ ] No shadow with ≥20px blur. No glow. `--elev-3` / `--elev-4` / `--elev-glow*` do not appear.

### Layout
- [ ] No three-up equal grid of icon + heading + paragraph.
- [ ] No horizontal carousel of content cards on desktop.
- [ ] No SEO link strip under a hero.
- [ ] Index pages are scan-dense, not landing-page padded.

### Colour
- [ ] Copper appears **only** on actions. Not on a heading, not as a large fill, not as decoration.
- [ ] Teal appears **only** on live data. Not on a link, not on a button.
- [ ] No status colour outside the palette. No stoplight green.
- [ ] No `#000` or `#fff` as a page ground — including the footer.

### Motion
- [ ] No count-up on any reading.
- [ ] No scroll-reveal stagger, no entrance animation, no parallax, no page transition.
- [ ] Charts do not draw themselves. Nothing inside a data table moves.
- [ ] `prefers-reduced-motion: reduce` is honoured.

### Images
- [ ] Every image loads, at every breakpoint. Measure with `naturalWidth` after scrolling into view, and count optimizer requests against the number of `<img>` — they must match.
- [ ] Every image is served at or above its rendered CSS width.
- [ ] Every image that fails renders a TypographicPlate. Zero grey rectangles.
- [ ] Every image has meaningful `alt`, or is genuinely decorative and marked so.
- [ ] Photographs are captioned as field notes. No data overlaid on a photograph. No held fish on a public surface.

### Copy and data
- [ ] Banned-copy grep is clean: tight lines · see you on the water · definitive · world's finest · discerning · premier · elite · exclusive · serious anglers · intelligence platform · leaderboard (outside the ethic line) · Pro · upgrade · Founders · gift · Get started · Learn more · Unlock · Dashboard.
- [ ] Counts agree with the database everywhere they appear — body, heading, and `<title>`.
- [ ] Every empty state says what would be here and why it isn't. No invented fishing facts.
- [ ] No app CTA in a hero. No app CTA in chrome.

### The last test
- [ ] **Remove the photographs mentally. Is the page still recognisably this brand?** If it collapses into a template, the pictures were carrying a composition that does not exist.

---

## 2. How to measure it

Load the real page. Do not trust a build log, a Cursor claim, or a previous session's assertion.

```js
// paste in the console on the page under test
const A=()=>{const all=[...document.querySelectorAll('*')],imgs=[...document.querySelectorAll('img')],o={};
 o.lucide=document.querySelectorAll('svg[class*="lucide"]').length;
 o.imgs=imgs.length; o.unloaded=imgs.filter(i=>i.naturalWidth===0).length;
 o.upscaled=imgs.filter(i=>i.naturalWidth&&i.naturalWidth<i.getBoundingClientRect().width*0.9).length;
 o.noAlt=imgs.filter(i=>!i.alt).length;
 o.requests=performance.getEntriesByType('resource').filter(r=>r.name.includes('/_next/image')).length;
 const rad={};let glow=0,big=0;
 for(const el of all){const cs=getComputedStyle(el),q=el.getBoundingClientRect();if(q.width<4||q.height<4)continue;
  if(cs.borderRadius!=='0px')rad[cs.borderRadius]=(rad[cs.borderRadius]||0)+1;
  const s=cs.boxShadow;if(s!=='none'){if(/0px 0px [23456789]\dpx/.test(s))glow++;if(/ [23456789]\dpx /.test(s))big++;}}
 o.radius=Object.entries(rad).sort((a,b)=>b[1]-a[1]).slice(0,6);o.glow=glow;o.bigShadow=big;
 let fb=0;for(const el of all){const m=getComputedStyle(el).backgroundColor.match(/rgba?\((\d+), (\d+), (\d+)/);if(!m)continue;
  const[r,g,b]=[+m[1],+m[2],+m[3]];if(.2126*r+.7152*g+.0722*b>50)continue;const q=el.getBoundingClientRect();
  if(q.width>=innerWidth-2&&q.height>80)fb++;}
 o.duskFullBleed=fb;
 const t=document.body.innerText.toLowerCase();
 o.banned=['tight lines','definitive','finest waters','discerning','premier','elite','exclusive','serious anglers','intelligence platform','get started','learn more','unlock','upgrade','founders'].filter(b=>t.includes(b));
 const dup={};[...document.querySelectorAll('button,a')].forEach(e=>{const k=e.textContent.trim();if(k&&k.length<32)dup[k]=(dup[k]||0)+1});
 o.dupControls=Object.entries(dup).filter(([,v])=>v>1);
 return o;};
A();
```

**Pass condition:** `lucide === 0` · `unloaded === 0` · `upscaled === 0` · `noAlt === 0` · `requests === imgs` · `glow === 0` · `bigShadow === 0` · `duskFullBleed === 0` · `banned` empty · `dupControls` contains only legitimate repeats (primary nav echoed in the footer). Radius census shows nothing ≥8px that is not a chip.

Scroll the whole page before measuring, then return to the top and wait for idle. Run it at 1440 and at 390. Run it signed in and signed out.

---

## See Also
- [[Brand-Bible-v4]] — v4.1 Part II is the authority for every line here
- [[Water-Desk-Spec-2026-08-26]] — the page specs this gate verifies
- [[Workbench-Style-Guide]] — the Dusk notebook register
- [[Plan-Locked-2026-08-25]] — the QA standard this descends from

---


<!-- timeline -->

- **2026-08-26** | Written as the one-page gate Cursor runs before claiming a page is done. §0 evidence table measured live on production the same day at four viewports; the console snippet in §2 is the exact instrument used.
