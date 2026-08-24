# Design tokens

Lane A map from the Abyss / GitHub-dark hexes that were hardcoded as
Tailwind arbitrary utilities, to the semantic tokens in `globals.css`.

`src/data/**` is excluded (inline article HTML).

## Hex → token (Commit A values were the old hex; Commit B flipped the values)

| Old hex | Count (class utils) | Token | Role |
|---|---:|---|---|
| `#0D1117` | 474 | `--surface-page` | page |
| `#161B22` | 500 | `--surface-raised` | cards / zebra |
| `#1F2937` | 168 | `--surface-card` | raised / inputs / button fill |
| `#21262D` | 894 | `--border-rule` | borders |
| `#30363D` | 85 | `--border-strong` | stronger borders |
| `#F0F6FC` | 724 | `--text-primary` | headings |
| `#A8B2BD` | 769 | `--text-body` | body |
| `#6E7681` | 793 | `--text-meta` | labels / meta |
| `#E8923A` | 1549 | `--action` | **action only** after Commit B |
| `#0BA5C7` / `#00B4D8` | 241 | `--signal-live` | live data |
| `#2EA44F` | 45 | `--state-positive` | rise |
| `#DA3633` | 33 | `--state-negative` | cut |

## `#1F2937` disambiguation

Every class-utility occurrence is `bg-` (162). None are `text-` or `border-`.
Mapped to `--surface-card` (Stone / button fill). If a later lane needs a
neutral button fill distinct from card, add `--fill-muted` — do not reintroduce
a literal hex.

## Leftovers

Unmapped class hexes (hover coppers `#F0A65A` / `#D17D28`, gold `#FFD700`,
chart colours, a handful of one-offs) are snapshotted in
`scripts/hex-baseline.json`. CI (`npm run check:hex`) fails if a new
`[#{3,8}]` utility appears outside `src/data`.

Skip list (not class names): Mapbox styles, chart configs, email templates,
`<meta name="theme-color">`.

## Registers

| Attribute | Binding |
|---|---|
| `[data-register="daylight"]` | paper / vellum / card / ink / copper-700 / teal-700 |
| `[data-register="dusk"]` | riverbed / pool / shelf / chalk / copper-400 / teal-300 |
| `.register-dusk` | same dusk bindings, for a live-conditions inset on a daylight page |

Register is **route-determined**, not a preference. See `src/lib/register.ts`.

## Type stack

| Token | Face | Use |
|---|---|---|
| `--font-display` | Fraunces | headings, titles (`font-heading` alias) |
| `--font-body` | Fraunces at text optical size | running prose. Newsreader was the spec face; the latin variable payload was ~2× Inter+DM Sans, so it was dropped per the brief's fallback. |
| `--font-ui` | Archivo | nav, labels, buttons, tables; `.num` for tabular figures |
| `--font-mono` | IBM Plex Mono | identifiers only |

Mono is not for quantities. `.num` is available; call sites are not migrated yet.

## Font payload (Google CSS, latin, Chrome UA)

This is the unsubsetted CSS2 download, not next/font's per-page subset, but it is
the right order of magnitude.

| Stack | Bytes | Files |
|---|---:|---:|
| Before: Inter 400–800 + DM Sans 400–700 + IBM Plex Mono 400/600 | 376,788 | 19 |
| Spec: Fraunces (opsz/wght/SOFT/WONK) + Newsreader (opsz) + Archivo + IBM Plex Mono | 690,316 | 19 |
| Shipped: Fraunces + Archivo + IBM Plex Mono (Newsreader dropped) | 444,460 | 16 |

Newsreader blew the budget (~1.8×). Fallback from the brief: long-form is Fraunces at its text optical size (`font-optical-sizing: auto` on `.article-body`).

