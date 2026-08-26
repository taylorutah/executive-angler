---
type: concept
title: "Workbench Style Guide"
project: executive-angler
updated: 2026-08-26
tags: [ea, brand, design-system, workbench, dusk]
---

# EA Workbench Style Guide

**Status:** Current. Rewritten 2026-08-26 onto [[Brand-Bible-v4]] v4.1 tokens.
**Governs:** the private notebook — `/today`, `/journal`, `/journal/[id]`, `/journal/insights`, `/flybox`, `/flies/workbench`, `/rivers/mine`, `/account`.

> The workbench is the **Dusk notebook**: whole-page dark, dense, tabular, keyboard-first. It is the one place in the product where Dusk owns the ground rather than sitting on it as an instrument.

---

## 0. What changed, and why this file was dangerous

The 2026-05-08 version documented **GitHub's palette and DM's typefaces** — `#0D1117` page, `#161B22` surface, `#21262D` border, `#F0F6FC` text, DM Serif Display, DM Sans. Every one of those is retired. That leak is why workbench surfaces still read as a dev tool: the tokens said "Water Desk" and this file said "GitHub dark".

Nothing below contains a literal hex outside the token table. **If a component hardcodes a colour, that is the bug.**

---

## 1. Two registers, one system

| Register | Where | Ground |
|---|---|---|
| **Daylight** | the public desk | Paper. Instruments inset as objects. |
| **Dusk** | the private notebook | Riverbed. The page *is* the instrument; there is no seam to manage. |

The gear-shift is **density and ground**, not a second design system. Same type scale, same accent, same mark, same widget names.

Editorial treatment still exists inside Dusk — `/journal/trophy-wall` and a session's header are editorial *in the dark*. That is a density choice, not a licence to import magazine chrome.

---

## 2. Tokens

Use the semantic tokens. Never the primitives, never a literal.

| Semantic | Dusk binding | Role |
|---|---|---|
| `--surface-page` | Riverbed `#0B1112` | page ground |
| `--surface-raised` | Pool `#131B1D` | cards, zebra rows |
| `--surface-card` | Shelf `#1C2629` | raised surfaces, inputs, neutral button fill |
| `--border-rule` | `#243033` | separators |
| `--border-strong` | `#3A474A` | stronger separators, focus rails |
| `--text-primary` | Chalk `#EEF2F1` | headings, values |
| `--text-body` | `#C5CECF` | body |
| `--text-meta` | Fog `#8B979A` | labels, meta, placeholders |
| `--action` | Copper 400 `#E97C48` | **actions only** |
| `--action-hover` | `#FE9A77` | |
| `--on-action` | Riverbed | text on a copper fill |
| `--signal-live` | Teal 300 `#00BCC5` | **live data only** |
| `--state-positive` | Rise 400 `#3FB863` | a positive **delta** — not "healthy" |
| `--state-negative` | Cutthroat 400 `#F87171` | error, destructive |

**Retired, permanently:** Abyss `#0D1117` · Depth `#161B22` · `#21262D` · `#30363D` · `#F0F6FC` · `#A8B2BD` · `#6E7681` · `#484F58` · Stone `#1F2937` · `#7F1D1D` · Copper `#E8923A` · `#D17D28` · Teal `#0BA5C7` · Success `#2EA44F`.

**Zero-state cells** use `--text-meta`, not a fourth dimmer grey. There is no `text-faint`.

**Stock state in the variant table:**

| Condition | Colour |
|---|---|
| count > 0 | `--text-primary` |
| count = 0 | `--text-meta` |
| below target | `--action` |
| at or above target | `--signal-live` |

---

## 3. Type

| Role | Face | Where |
|---|---|---|
| Display | **Fraunces** | session titles, page headings |
| Interface & data | **Archivo** | the default — every table, label, button, and **every quantity**, via `tabular-nums` (`.num`) |
| Identifiers | **IBM Plex Mono** | gauge IDs, coordinates, hook sizes, keys, URLs |
| Long-form | **Newsreader** | `.prose` only — rare here |

**Retired:** DM Serif Display, DM Sans, Aktiv Grotesk, Inter.

**Mono is for identifiers, not quantities.** The 2026-05 rule — "mono is mandatory for any numeric column" — is **reversed**. A column of tied/bought/target counts is Archivo with `tabular-nums`, right-aligned. `USGS 06038500` is Plex Mono. Getting this backwards is what made the tables read as a terminal.

Uppercase labels: 10–11px, `letter-spacing: 0.16em`, `--text-meta`.

---

## 4. DataTable — the workbench primitive

`src/components/data/DataTable.tsx`. Every notebook list reuses it.

- 32px row height (compact); 36px comfortable. 13px cell text.
- Sticky header, `--surface-raised` ground, 1px `--border-rule` bottom.
- Zebra: even `--surface-raised`, odd `--surface-page`.
- Focused row: 1px `--border-strong` inset rail on the leading edge. **Not** a copper ring.
- Selected row: `--action` at 8% fill.
- Alignment: text left · quantities right (`.num`) · identifiers left (mono) · status centre · photos 32×32 leading.
- Inline edit: click → input replaces span; optimistic write; `--state-positive` flash on save, `--state-negative` on error; `Esc` cancels, `Enter`/blur commits.
- Bulk toolbar appears at selection > 0, shows the count, clears on row change.
- **Nothing inside a data table animates.** No row entrance, no fade-in, no stagger.

**Keyboard map:** `↑`/`↓` or `j`/`k` move focus · `Space` toggles selection · `Enter` activates · `/` focuses filter · `Esc` cancels · `Cmd+K` site search. Focus returns to the originating row after a modal closes.

---

## 5. Controls

**Buttons** — three tiers, `--radius-media` (4px), flat:

| Tier | Fill | Use |
|---|---|---|
| Primary | `--action`, text `--on-action` | one per surface |
| Default | `--surface-card`, 1px `--border-strong`, text `--text-primary` | secondary |
| Danger | transparent, 1px `--state-negative`, text `--state-negative` | destructive |

Sizes: compact `px-2 py-1` 10px uppercase · standard `px-3 py-1.5` 12px · large `px-4 py-2` 14px.

**Chips** — `--radius-chip` (the one legitimate pill): neutral `--surface-card` / `--text-body` · active `--action` at 15% / `--action` · live `--signal-live` at 15% / `--signal-live`.

**Cards** — `--radius-surface` (6px), 1px `--border-rule`, `--surface-raised`. Hover darkens the rule; nothing lifts more than 2px. **No 12px cards. No glow. No ≥20px shadow.**

---

## 6. Privacy is part of the visual language

The lock glyph on a SessionRow is **a mark on the page, not a tooltip afterthought.** It is how the notebook says out loud that this record is nobody else's business, and it is the visual half of the strongest claim the brand makes.

- Session rows, catch rows, and note rows carry the lock in `--text-meta`.
- Anything that *could* be public — presence on `/feed`: river, section, weather — carries no lock and says what is shared, in words.
- Catch counts render **only to the owner**, in every component, on every surface.

---

## 7. Charts

Charts exist on `/journal/insights` and nowhere else in the notebook.

- Series colour comes from the palette: `--signal-live` for measurements, `--action` for the user's own marks, `--text-meta` for reference lines. No chart library default palette.
- Axes and gridlines are `--border-rule` at 1px.
- **Charts do not draw themselves.** They render.
- We show numbers next to flies, not pie charts.

---

## 8. Density

| Compact (32px, default) | Comfortable |
|---|---|
| Pattern variant table · box detail · gear list · catches within a session · sessions list · flybox | Session detail header · trophy wall · insights narrative · account |

Where a surface mixes both, separate with `border-t border-[var(--border-rule)] mt-6` and reset density below the divider.

---

## 9. What the workbench is not

- **Not a magazine.** No drop shadows, no full-bleed photo backgrounds, no parallax, no entrance animation. Everything snaps to the grid.
- **Not a dashboard.** No KPI tiles, no sparkline wall, no "insights" that are really metrics.
- **Not GitHub.** The retired palette in §2 is the whole reason this file was rewritten.
- **Not a third design system.** Tailwind v4 plus the tokens above cover everything. No Bootstrap, no shadcn, no component library.

---

## See Also
- [[Brand-Bible-v4]] — v4.1; §12 named widgets, §13 density, §14 motion, Part II anti-slop
- [[Water-Desk-Spec-2026-08-26]] — the public desk this register is the counterpart to
- [[Anti-Slop-Checklist]] — the gate, which applies to notebook routes too
- [[Executive Angler/App/Fly-Data-Model]] — the variant table is built on this model
- [[Executive Angler/App/Catch-Logger-UX]] — session detail surface

---


<!-- timeline -->

- **2026-08-26** | Rewritten onto v4.1 tokens. Killed Abyss/Depth/Stone and the DM faces, which had this file documenting GitHub's palette a year after the brand moved. Reversed the 2026-05 "mono is mandatory for numeric columns" rule — quantities are Archivo with tabular figures; mono is identifiers only. Focus row moved from a copper ring to a `--border-strong` rail (copper is actions only). Charts scoped to `/journal/insights`. Privacy lock promoted from tooltip to visual language. Card radius 8/12px → `--radius-surface` 6px.
- **2026-05-08** | CC session — Initial draft. Locked at strategic reset; supersedes the implicit Workbench rules embedded in Brand Bible v3 §UI sections.
