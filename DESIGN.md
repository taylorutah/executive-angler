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

`--radius-sm: 4px` (small elements) · `--radius-md: 6px` (default: buttons, inputs) · `--radius-card: 10px` (cards, modals, map panels) · `--radius-pill: 999px` (condition chips and tags only).

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

- **Buttons** (`.ea-btn` + `-sm/-lg`, `-primary/-secondary/-ghost/-danger/-on-ink`): heights 32/40/48; padding-x 14/18/22; radius 6; Inter 14–15px/500. Primary = solid `--accent`. Secondary = 1px `--border-strong`, transparent. On `--ink` bands, primary flips to `--paper` bg / `--ink` text (`.ea-btn-on-ink`). No gradients, no shadows.
- **Inputs** (`.ea-label`, `.ea-input`, `.ea-field-error`, `.ea-field-helper`): 44px tall, 1px `--border`, radius 6, padding-x 12, `--surface` bg. Label 13px/500 above. Focus: `--accent` border + 3px ring rgba(30,77,59,0.15) (`--signal-ring`). Error: `--danger` border + 13px message. Helper 13px `--text-3`.
- **Cards** (`.ea-card`): 1px `--border`, radius 10, padding 24, `--surface`, no shadow. No nested cards.
- **Journal entry card**: date as 12px overline; water/location name Fraunces 20px; conditions as chips; notes excerpt clamped to 2 lines; optional 4:3 photo thumb.
- **Condition chips** (`.ea-chip`): pill, 12px, `--paper-deep` bg, `--text-2`, optional 14px icon (thermometer, droplets, wind, sun metaphors).
- **Nav**: 68px, sticky, 1px bottom border, `--paper` bg. Wordmark left in Fraunces 600. Links Inter 14px/500; active = `--accent` text. Primary CTA right. No blur, no transparency tricks.
- **Footer**: `--ink` bg, `--paper` text at 80%, organized link columns, hairline separators rgba(255,255,255,0.12).
- **Tables** (`.ea-table`): header 12px uppercase 0.06em `--text-3`; 1px row borders; 12px vertical cell padding; row hover `--paper-deep`; tabular numerals.
- **Map panels**: radius 10, 1px `--border`; muted default map chrome where the API allows; minimal consistent controls.
- **Stats** (`.ea-stat-value` / `.ea-stat-label`): numeral Fraunces 30px/600 `--text-1`, label 12px uppercase `--text-3`.
- **Modals** (`.ea-modal-overlay` / `.ea-modal`): overlay rgba(19,24,21,0.5), radius 10, max-width 520px, padding 32, the one allowed shadow.
- **Badges** (`.ea-badge`, `.ea-badge-ember`): pill, 12px, `--paper-deep`/`--text-2`. Featured/seasonal only: `--ember` at 10% tint bg, `--ember` text.
- **Empty states** (`.ea-empty`): one concrete sentence + one primary action. No illustrations.
- **Toasts** (`.ea-toast`): `--surface`, 1px `--border`, radius 6, bottom-right, the floating shadow.

## 5. Icons

Inline SVG only, via the repo's desk icon set (`src/icons/` — Lucide-geometry glyphs at 16/20/24 optical sizes; `lucide-react` is banned by test gate). 16px in buttons/inputs, 20px standalone, optically aligned to text baseline. NEVER emojis — including fishing/tackle emojis — and never clip-art fish, cartoon lures, or novelty tackle graphics.

## 6. Imagery

- Real river/water/fish photography, natural tones. Consistent grade: `filter: saturate(0.88) contrast(1.03)` (`--photo-grade`, `.ea-photo`).
- Fixed aspect-ratio per context: 21:9 or 3:2 heroes, 4:3 card thumbs, 1:1 avatars (`.ea-photo-hero/-wide/-card/-avatar`). `object-fit: cover`. Never stretched.
- Explicit width/height or CSS aspect-ratio on every image — zero layout shift.
- Radius matches tokens. Lazy-load below the fold. Descriptive alt text ("Evening rise on the Madison," never "image1").
- Missing photo asset: solid `--paper-deep` block at the correct aspect-ratio with descriptive alt text. Never hotlink stock URLs.

## 7. Responsive & accessibility

- Mobile-first. Breakpoints 640 / 768 / 1024 / 1280. Nav collapses to a menu below 768px (repo ships the collapse at 1024 — see §9). Grids step 3→2→1. Touch targets ≥44px. Strong contrast over delicate grays — the app is used streamside, one-handed, in sunlight. 320px wide with zero horizontal scroll.
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

## Open conflicts (awaiting client ruling)

1. **Dusk register.** `src/lib/register.ts` + `RegisterBinder` route the logged-in product (`/today`, `/journal`, `/account`, `/dashboard`, `/feed`, `/admin`, …) to a dark `data-register="dusk"` theme. The brief bans dark mode. Machinery kept intact for now (it is load-bearing: logo swap, map chrome, InstrumentWell). Recommended: rebind dusk values to the daylight tokens, then delete the register.
2. **Hero scrims.** `--scrim-*` / `.hero-overlay` gradients keep white text legible over hero photography. The brief bans gradients; these survive pending a ruling (flat `--ink` band or tokenized scrim are the options).
3. **`--text-3` contrast.** `#969E97` on `--paper` measures ~2.4:1, below AA for small text. It is reserved for non-essential overlines/metadata; anything meaningful uses `--text-2`. Recommend darkening `--text-3` (≈ `#6B736D` passes 4.5:1) or accepting the exception.
4. **Nav collapse breakpoint.** Brief says below 768px; the repo's mobile sheet/tab bar engage below 1024px (`lg`), which also satisfies the ≥44px touch-target rule on tablets. Kept at 1024 pending ruling.
5. **Icon stroke.** The desk icon set draws at stroke-width 1.5 (hardcoded in `src/icons/Icon.tsx`); the brief asks 1.75. Kept 1.5 for sitewide consistency pending ruling.
