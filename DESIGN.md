# DESIGN.md — Executive Angler Design System

**This file is permanent law for all visual work in this repo.** Every visual value comes from the tokens below. No magic numbers, no one-off styles, no arbitrary values. If a design and a function conflict, function wins — flag it in the session changelog and move on.

Aesthetic references: Linear and Stripe for discipline; Orvis and Filson for heritage character. Restrained, precise, typography-led, neutral-first. No decoration without function.

The product: an educational fishing platform plus a private fishing journal. The feel is a premium field journal — not a tackle shop, not a SaaS dashboard.

Canonical implementation: `src/app/globals.css` (tokens, base, components) + `src/lib/palette.ts` (resolved hexes for non-CSS contexts: Mapbox, OG images, Recharts).

---

## 1. Hard constraints

1. **Functionality is frozen.** Preserve 100% of existing logic, routes, forms, validation, data bindings. Restructure markup only when styling requires it.
2. **Light theme only.** No dark mode anywhere.
3. **Token-only styling.** Every visual value resolves to the tokens in §2.

## 2. Tokens

### Color — warm paper + river green

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FAF9F5` | page background |
| `--paper-deep` | `#F2EFE8` | alternating sections, chips |
| `--surface` | `#FFFFFF` | cards, panels, inputs |
| `--ink` | `#131815` | dark bands ONLY: footer, closing CTA |
| `--border` | `#E4E0D6` | default hairline |
| `--border-strong` | `#CFC9BB` | emphasized hairline |
| `--text-1` | `#171C19` | primary text |
| `--text-2` | `#525B55` | body/secondary text, labels |
| `--text-3` | `#6E746F` | overlines/metadata — amended 2026-08-28 (client-approved): `#969E97` measured 2.61:1 on `--paper`; this is the lightest same-hue value passing WCAG AA at 4.54:1 |
| `--accent` | `#1E4D3B` | deep river green — primary actions, links, active states |
| `--accent-hover` | `#16382B` | accent hover/active |
| `--accent-soft` | `#EAF1ED` | active nav, selected rows |
| `--ember` | `#C05B23` | RARE: featured badges, one key stat max per screen |
| `--danger` | `#A63A2E` | errors, destructive actions |
| `--success` | `#2E7D4F` | positive state |
| `--warning` | `#A8741A` | warning state |

Rules: ≥90% of every screen is paper/neutral. Accent only on primary actions, links, active states. Ember at most once per screen. Flat color only — no gradients. Dark appears only as intentional `--ink` bands, never as a theme.

### Spacing — 8pt system

`4, 8, 12, 16, 24, 32, 48, 64, 96` (`--space-1` … `--space-9`). All margin, padding, and gap values come from this scale. Nothing else.

### Typography — two fonts

- **Fraunces** (500/600): headlines, journal entry titles, pull quotes, large stats.
- **Inter** (400/500/600): nav, body, forms, buttons, tables, labels.

Scale (px): `12 / 13 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60` (`--text-12` … `--text-60`).

- Headlines: Fraunces 600, line-height 1.1–1.2, letter-spacing -0.01em max.
- Body/UI: Inter 16px / 1.55 / 400, `--text-1` or `--text-2`.
- Long-form (lessons, journal entries, stored article bodies): Inter 18px, line-height 1.7, measure max 65ch (~680px, `--prose`).
- Labels/metadata: Inter 13px, 500, `--text-2`.
- Overlines: 12px uppercase, letter-spacing 0.06em, `--text-3`. Sparingly.
- `font-variant-numeric: tabular-nums` in logs and tables (`.num`, `.ea-table`, `.ea-stat-value`).
- Max 3 type sizes per component.
- No other fonts, no other weights. IBM Plex Mono, Archivo, and Newsreader are retired; their CSS variable names alias to Inter so legacy classes keep compiling.

### Radius — one language

`--radius-sm: 4px` (small elements) · `--radius-md: 6px` (default: buttons, inputs) · `--radius-card: 10px` (cards, modals, map panels) · `--radius-pill: 999px` (condition chips and tags only). Menu/dropdown triggers are buttons, not tags — radius 6, never pill (client ruling 2026-08-28).

### Elevation — borders, not shadows

Cards/panels: 1px solid `--border`, no shadow. One shadow exists, for floating layers only (dropdown, modal, toast): `--shadow-float: 0 8px 30px rgba(0,0,0,0.12)`. No colored shadows, no glows.

### Motion

150–200ms (`--duration-fast` / `--duration-base`; modals may use `--duration-modal: 250ms`), `--ease-standard: cubic-bezier(0.16, 1, 0.3, 1)`. Animate opacity and transform only. No bounce, spring, parallax, animated backgrounds, or scroll-jacking. `prefers-reduced-motion` is honored globally.

## 3. Layout

- Max content width 1200px centered (`--container`); 24px gutters, 16px below 640px (`--gutter`).
- Prose column 680px for lessons and journal reading.
- Everything aligns to shared left edges. Nothing floats unaligned.
- Section rhythm: 96px desktop / 56px mobile on marketing pages; 24–32px in-app.
- Dense, real content beats airy filler. No giant empty centered hero.

## 4. Components

Implemented as `.ea-*` classes in `src/app/globals.css` (`@layer components`). Spec every state: default, hover, focus-visible, active, disabled, loading.

- **Buttons** (`.ea-btn` + `-sm/-lg`, `-primary/-secondary/-ghost/-danger/-on-ink`): heights 32/40/48; padding-x 14/18/22; radius 6; Inter 14–15px/500. Primary = solid `--accent`. Secondary = 1px `--border-strong`, transparent. On `--ink` bands, primary flips to `--paper` bg / `--ink` text (`.ea-btn-on-ink`). No gradients, no shadows. Heights govern desktop/pointer contexts; below 768px the 44px touch floor applies (§7).
- **Inputs** (`.ea-label`, `.ea-input`, `.ea-field-error`, `.ea-field-helper`): 44px tall, 1px `--border`, radius 6, padding-x 12, `--surface` bg. Label 13px/500 above. Focus: `--accent` border + 3px ring rgba(30,77,59,0.15) (`--signal-ring`). Error: `--danger` border + 13px message. Helper 13px `--text-3`.
- **Cards** (`.ea-card`): 1px `--border`, radius 10, padding 24, `--surface`, no shadow. No nested cards.
- **Journal entry card**: date as 12px overline; water/location name Fraunces 20px; conditions as chips; notes excerpt clamped to 2 lines; optional 4:3 photo thumb.
- **Condition chips** (`.ea-chip`): pill, 12px, `--paper-deep` bg, `--text-2`, optional 14px icon (thermometer, droplets, wind, sun metaphors).
- **Nav**: 68px, sticky, 1px bottom border, `--paper` bg. Wordmark left in Fraunces 600. Links Inter 14px/500; active = `--accent` text. Primary CTA right. No blur, no transparency tricks.
- **Footer**: the site's one graded-photo ink band (client ruling 2026-08-28 — see Phase 4C rulings): one existing library photograph under a flat `--ink` scrim at uniform alpha, `--paper` text at 80%, organized link columns, hairline separators rgba(255,255,255,0.12). The closing CTA stays flat `--ink`.
- **Tables** (`.ea-table`): header 12px uppercase 0.06em `--text-3`; 1px row borders; 12px vertical cell padding; row hover `--paper-deep`; tabular numerals. One table language app-wide: `WorkbenchTable` (journal, flybox, rivers/mine, gear, fly workbench) renders this spec — no zebra, no fixed-height rows (client ruling 2026-08-28).
- **Map panels**: radius 10, 1px `--border`; muted default map chrome where the API allows; minimal consistent controls.
- **Stats** (`.ea-stat-value` / `.ea-stat-label`): numeral Fraunces 30px/600 `--text-1`, label 12px uppercase `--text-3`.
- **Modals** (`.ea-modal-overlay` / `.ea-modal`): overlay rgba(19,24,21,0.5), radius 10, max-width 520px, padding 32, the one allowed shadow.
- **Badges** (`.ea-badge`, `.ea-badge-ember`): pill, 12px, `--paper-deep`/`--text-2`. Featured/seasonal only: `--ember` at 10% tint bg, `--ember` text.
- **Empty states** (`.ea-empty`): one concrete sentence + one primary action. No illustrations.
- **Toasts** (`.ea-toast`): `--surface`, 1px `--border`, radius 6, bottom-right, the floating shadow.

## 5. Icons

Inline SVG only, via the repo's desk icon set (`src/icons/` — Lucide-geometry glyphs at 16/20/24 optical sizes; `lucide-react` is banned by test gate). 16px in buttons/inputs, 20px standalone, optically aligned to text baseline. Stroke-width is 1.75 at every optical size, hardcoded in `src/icons/Icon.tsx`; the prop is not overridable (client ruling 2026-08-28). NEVER emojis — including fishing/tackle emojis — and never clip-art fish, cartoon lures, or novelty tackle graphics.

## 6. Imagery

- Real river/water/fish photography, natural tones. Consistent grade: `filter: saturate(0.88) contrast(1.03)` (`--photo-grade`, `.ea-photo`).
- Fixed aspect-ratio per context: 21:9 or 3:2 heroes, 4:3 card thumbs, 1:1 avatars (`.ea-photo-hero/-wide/-card/-avatar`). `object-fit: cover`. Never stretched.
- Explicit width/height or CSS aspect-ratio on every image — zero layout shift.
- Radius matches tokens. Lazy-load below the fold. Descriptive alt text ("Evening rise on the Madison," never "image1").
- Missing photo asset: solid `--paper-deep` block at the correct aspect-ratio with descriptive alt text. Never hotlink stock URLs.
- Heroes are flat (client ruling 2026-08-28): no scrims, no gradient overlays, no text over the photograph. The image stands in its own band; headline, overline, and metadata sit on paper below. The only sanctioned on-photo affordance is the solid `--ink` chip (photo credit, gallery count). One exception: the footer photo band (Phase 4C ruling below).

## 7. Responsive & accessibility

- Mobile-first. Breakpoints 640 / 768 / 1024 / 1280. Nav collapses to a menu below 768px (shipped at 768 per client ruling 2026-08-28; in the 768–1024 band nav links tighten to `--space-2` and header search keeps its pill). Grids step 3→2→1. Touch targets: the 32/40/48 height scale governs desktop/pointer contexts; below 768px (touch) every interactive element enforces a 44px minimum — implemented once as a `min-height` floor in `globals.css` (`@media (max-width: 767px)`), not per-component rewrites. Streamside one-handed use is a product requirement. Strong contrast over delicate grays — the app is used streamside, one-handed, in sunlight. 320px wide with zero horizontal scroll.
- WCAG AA minimum: 4.5:1 body text, 3:1 large text and UI. Semantic landmarks, one h1 per page. Visible focus-visible ring (2px `--accent`, 2px offset) on every interactive element. Every input labeled. Real alt text. Full keyboard operability, correct aria on menus and modals.

## 8. BANNED — ship none of it

- Gradients of any kind, mesh backgrounds, glows
- Emojis anywhere in the UI (yes, including 🎣)
- Clip-art fish, cartoon lures, novelty tackle graphics
- Glassmorphism, backdrop blur, transparency gimmicks
- Bounce/elastic animation, parallax, floating blobs, scroll-jacking
- Dark-mode toggles, theme switchers, or prefers-color-scheme overrides
- Cards nested in cards
- Colored drop shadows
- Walls of centered text (center only short empty states)
- Mixed radius languages (pill buttons beside square inputs)
- Generic SaaS copy: "Elevate," "Supercharge," "Unlock," "Seamless," "Next-level," "Journey"
- Lorem ipsum, placeholder copy, hotlinked stock images
- Any spacing, color, radius, or font size not on the token scales above
- Any font besides Fraunces and Inter at the specified weights

## 9. Copy voice

A seasoned guide, not a marketer. Short declarative sentences. Concrete nouns: pools, runs, seams, hatches, flows, fly patterns. Verbs over adjectives. Bad: "Elevate your angling journey!" Good: "Every pool you fish teaches you something. Executive Angler makes sure you don't forget it."

---

## Migration appendix — pre-system names

The repo's earlier semantic layer (`--surface-page`, `--text-body`, `--action`, `--border-rule`, `--signal-live`, `--state-positive/negative`, `--font-archivo/newsreader/ibm-plex-mono`, `--radius-surface/instrument/chip`, `--elev-*`) is rebound to the tokens above in `globals.css`. Existing components keep compiling; new work uses the §2 tokens directly. `src/lib/palette.ts` mirrors the hexes for Mapbox/OG/Recharts with its historical export names.

## Resolved conflicts — client rulings (2026-08-28)

All five open conflicts are ruled. These are permanent law.

1. **Dusk register — REMOVED.** Light theme only; theme variants are banned machinery. `src/lib/register.ts`, `RegisterBinder`, `ThemeProvider`/`ThemeToggle`, the `data-register` attribute, the dusk token block, and the dusk palette hexes in `palette.ts` are deleted. Chrome accents use `--accent` directly; `--signal-live`/`--action` survive only as migration aliases for un-migrated content surfaces — never for new work.
2. **Hero scrims — REMOVED.** Gradients are banned, including photo-legibility scrims. Heroes follow §6: graded photography in its own band, text on paper. `--scrim-*` tokens and `.hero-overlay*` classes are deleted.
3. **`--text-3` amended.** `#969E97` → `#6E746F`, the lightest value in the same hue family passing WCAG AA on `--paper` (4.54:1; one step lighter, `#6F7570`, fails at 4.48:1). Client-approved token amendment; the §2 table is the canonical record.
4. **Nav collapse at 768px.** The primary bar expands at `md` (768px); the mobile sheet and tab bar engage below it. See §7 for the 768–1024 density rules.
5. **Icon stroke 1.75.** `src/icons/Icon.tsx` draws at stroke-width 1.75; the dead `strokeWidth` prop is removed from `IconProps` and every call site.

## Phase 3 refinements — client rulings (2026-08-28)

All four Phase 3 open questions are ruled. These are permanent law.

1. **WorkbenchTable adopts the §4 table spec.** One table language app-wide (journal, flybox, rivers/mine, gear, and the fly workbench): header 12px uppercase 0.06em `--text-3` at 500 weight, 1px `--border` row borders, 12px vertical cell padding, row hover `--paper-deep`, tabular numerals. The fixed 32px row and zebra striping are retired — density comes from the spec padding, not a fixed height. The tested keyboard map is unchanged; presentation only.
2. **FirstRunEmpty is token-compliant.** All six first-run surfaces live on the 8pt and type scales: purpose at body size (16px), the primary action on the overline spec (12px uppercase, 0.06em — never 0.14em), the example at metadata size (13px). One concrete sentence + one primary action, per §4 Empty states.
3. **Dropdown triggers are buttons, not tags.** FilterDropdown triggers — and any future menu trigger — use `--radius-md` (6px). `--radius-pill` stays reserved for condition chips and tags; the selected-count inside the trigger is a badge and keeps the pill.
4. **Touch targets resolved.** The 32/40/48 height scale governs desktop/pointer contexts. Below 768px (touch), interactive elements enforce a 44px minimum — a single `min-height` floor in `globals.css`, not per-component rewrites. Streamside one-handed use is a product requirement.

## Phase 4C chrome rulings — client rulings (2026-08-28)

Both rulings are permanent law.

1. **The footer is the site's one permanent graded-photo ink band.** One existing photograph from the imagery the site already serves (a moody water/river landscape) carries the standard `--photo-grade` under a flat `--ink` scrim at a uniform 72% alpha (`.ea-band-photo` / `.ea-band-photo-scrim`) — a grade, never a gradient. White text, the link columns, and the legal bar ride above it. This is the only sanctioned photo-behind-text band anywhere on the site; heroes and every other surface stay flat per §6, and the solid `--ink` chip remains the only other on-photo affordance. The photograph may only ever be swapped for another image the site already serves — never downloaded, hotlinked, or invented.
2. **The Explore mega menu is the canonical directory navigation pattern.** One hover-triggered, full-width solid panel (`--paper`, 1px `--border` bottom edge, `--shadow-float`): directory link columns on the left, a featured-image tile on the right that crossfades (opacity only, 150–200ms) to the existing site photograph mapped to the hovered or focused link, with a default photograph when nothing is hovered. Imagery rule: only imagery the site already serves. Behavior: hover-intent delays (120ms open / 220ms close), closes on mouse-leave and ESC (focus returns to the trigger), keyboard focus on the trigger opens it, and every link is tabbable — the disclosure pattern (`aria-expanded` + `aria-controls`; no `aria-haspopup`, because the panel is a nav region of ordinary links, not a `role="menu"`). Below 768px no hover panel exists; the directory links live in the `.ea-sheet` mobile menu as an accordion group.
