---
name: add-fly-pattern
description: Use this skill when Taylor wants to add one or more canonical fly patterns to the Executive Angler database. Triggers on pasted recipes (text, image, URL, YouTube), phrases like "add this fly", "new fly pattern", "create canonical", or any tying recipe handed over for ingestion. Handles single flies and bulk submissions.
---

# Add Fly Pattern — Canonical Ingestion Skill

Ingests fly tying recipes (text, image, URL, YouTube) and writes them to the post-2026-05-15 `flies` table via the batch importer. Also detects and adds new hooks/threads/beads/dubbings to `tying_materials` when mentioned.

> **Model context (read once, internalize):** After the 2026-05-15 fly reset, the canonical fly source-of-truth is the `flies` table. `canonical_flies` is a read-only **view** filtered to `status = 'approved'`. There are NO `fly_patterns_v2`, `fly_variants`, `fly_variant_stock`, or `user_fly_box` tables — those were dropped. Per-user "configurations" of a fly live in `user_fly_configurations` (one row per user version) and never need to be created at canonical seed time. The seeder inserts ONE row per fly into `flies` with everything inline (materials_list jsonb + option_envelope jsonb).

## The 5-step contract (do not skip steps)

**1. Parse the input** — accept any of:
- Pasted text recipe
- URL → use `WebFetch` to pull the page; extract recipe sections
- YouTube URL → `WebFetch` the watch page for title + description (often contains the recipe). If the video itself is the only source, ask Taylor to paste materials/steps — you cannot watch video.
- Screenshot / image attachment → read it directly (vision)
- Multiple flies → handle them as an array; never silently merge or drop

**2. Concise echo** — for each fly, one tight block:
```
NAME · category · originator · default size
Body: …  Rib: …  Tail: …  Hackle: …  Bead: …   (≤6 lines, only filled slots)
```
No marketing prose, no padding. If something is missing or ambiguous, mark it `?` here so the gap audit catches it.

**3. Gap audit** — run these checks, ask Taylor about gaps in one batched question:

Required-field gaps:
- `name` (non-empty)
- `category` — must be one of: `dry`, `nymph`, `streamer`, `emerger`, `wet`, `terrestrial`, `egg`, `midge`, `other`
- `origin_credit` — every canonical needs provenance. If truly unknown, use `"Classic pattern, originator unknown"` but ask first

Database gaps (query Supabase before claiming a gap exists):
- **Slug collision** — slugify(name) → query `flies` `.eq("slug", …)`. If exists, ask Taylor: skip, rename, or overwrite?
- **Near-duplicate name** — fetch all `flies(name)`, compute Levenshtein vs. proposed name. ≤2 = flag and confirm. The batch script also enforces this; respect `--force-name` only if Taylor explicitly says so.
- **New materials** — for each hook brand+model, thread brand+size, bead spec, distinctive dubbing/hackle mentioned, query `tying_materials` by `name` (case-insensitive `ilike`) **and** by `slug`. Anything truly absent goes in a "new materials to add" list. ALSO check named variants: the same product is often stored under multiple slugs ("Hanak 450" + "H450BL"); don't add a duplicate just because the slug pattern differs. Categories enum: `hook | bead | thread | dubbing | feather | flash | foam | wire | resin | marker | rubber | synthetic | tail | wing | ribbing | chenille | body | eye`.

**4. Final plan + confirm** — show Taylor:
```
Flies to insert (N):
  • Name 1  (cat, originator)  default size  → /flies/<slug>
  • Name 2  …
New tying_materials to insert (M):
  • [hook] TMC 5263, sizes 2-12
  • [thread] Veevus 16/0 olive
Skips (S):
  • Foo Bug — slug collision with existing
```
Wait for explicit "yes" / "go" / "do it". Don't infer consent.

**5. Execute** — only after confirmation:
1. Write `/tmp/fly-batch-<unix-ts>.json` containing the validated array (shape below).
2. Resolve `SEED_ADMIN_USER_ID` once: it's Taylor's auth user id `e0cb4b66-74eb-4bb9-b793-0445dcf5ec2b` (already cached from prior runs; if you don't have it, look up `auth.admin.listUsers()` and find `taylor.warnick@gmail.com`).
3. Run: `SEED_ADMIN_USER_ID=<uuid> npx tsx scripts/seed-flies-batch.ts /tmp/fly-batch-<ts>.json` from repo root. The script auto-loads `.env.local` for the service role key.
4. For each new `tying_materials` row, do a single service-role insert via a short inline tsx one-off (build a tiny script in `/tmp/`, run it, delete it). Slug = slugify(brand + name + size if applicable). Set `is_verified: true`, `submitted_by: <admin uuid>`.
5. Surface the script's per-row log lines verbatim (`OK inserted`, `SKIP slug exists`, `ERROR …`). Don't paraphrase outcomes.
6. **Verify** — for each inserted slug, `select id, name, category, hero_image_url, status from flies where slug=…` (the row should have `status='approved'`). Print the live URL `https://www.executiveangler.com/flies/<slug>` per fly.
7. Done — one-line summary: `Inserted N, skipped S, errored E. Materials added: M.`

## JSON shape for `seed-flies-batch.ts`

One object per fly. Required fields are `name`, `category`, `origin_credit`. Everything else is optional but include what you have.

```json
[
  {
    "name": "Purple Haze",
    "category": "dry",
    "origin_credit": "Andy Carlson",
    "description": "Parachute Adams variant with a purple superfine body.",
    "history": "Originated on the Big Hole River in the late 1990s …",
    "tying_overview": "Standard parachute construction over a purple body.",
    "fishing_tips": "Searching pattern in the West; works during PMD and BWO hatches.",
    "recipe_notes": "Tying tip / construction notes that don't fit history or fishing_tips",
    "imitates": ["mayfly", "attractor"],
    "water_types": ["freestone", "tailwater"],
    "video_url": "https://www.youtube.com/watch?v=...",
    "materials_list": [
      { "slot": "hook",   "material": "TMC 100 — size 16", "brand": "Tiemco" },
      { "slot": "thread", "material": "Veevus 8/0 purple", "brand": "Veevus" },
      { "slot": "tail",   "material": "Moose body hair" },
      { "slot": "body",   "material": "Purple superfine dubbing" },
      { "slot": "wing",   "material": "White calf body hair (post)" },
      { "slot": "hackle", "material": "Grizzly, parachute" }
    ],
    "option_envelope": {
      "sizes": [12, 14, 16, 18, 20],
      "bead": { "sizes_mm": [], "colors": [], "materials": [] },
      "colors": { "body": ["purple"], "rib": [] }
    },
    "hero_image_url": null
  }
]
```

`hero_image_url`: leave `null` to default to `/images/fly-icons/<category>.svg`. Only set if Taylor provides a real image URL or a Supabase Storage path.

`option_envelope` is recommended-only — informational, never enforced. Use it to capture the size ladder, bead options, and color options the fly is typically tied in. The picker UI surfaces these as suggestions but always accepts free text.

`materials_list` slots: keep the slot vocabulary tight — `bead | hook | thread | body | rib | tail | wing | thorax | collar | hackle | head | other`. The `material` field is a free-form display string; `brand` is a separate optional field. No `material_id` FK required (the trigger can hydrate one if it matches a known `tying_materials` row, but it's not required at insert time).

## DB facts the skill MUST encode correctly

- **One table gets written** by the batch script: `flies`. The seeder sets `status='approved'`, `submitted_by_user_id=<admin>`, `approved_by_user_id=<admin>`, `approved_at=now()` so the row is immediately visible via the `canonical_flies` view.
- **`canonical_flies` is a VIEW** (not a table) over `flies WHERE status='approved'`. Never INSERT into `canonical_flies` — it will fail with "cannot insert into column ... of view".
- **No `fly_variants` / `fly_patterns_v2`** — those were dropped. Don't try to create variant rows; sizes/beads/colors all live in `option_envelope` on the fly itself.
- **Required RLS env:** `SUPABASE_SERVICE_ROLE_KEY` (in `.env.local`) bypasses RLS for the insert.
- **Slug rule:** lowercase, alphanumeric + hyphens, max 80 chars, `slugify(name)` with accent stripping (Luboš → lubos). The script auto-generates; do not pass `slug` in JSON.
- **Categories enum (exact):** `dry | nymph | streamer | emerger | wet | terrestrial | egg | midge | other`. Anything else is rejected with `ERROR_VALIDATION`.
- **`tying_materials` categories:** `hook | bead | thread | dubbing | feather | flash | foam | wire | resin | marker | rubber | synthetic | tail | wing | ribbing | chenille | body | eye`.
- **Pre-populated UTC inventory:** UTC Ultra Thread 70 (slug `utc-ultra-thread-70-chartreuse`) carries all 41 thread colors; UTC Ultra Wire (slug `utc-ultra-wire-hot-orange`) carries 33 colors × 5 sizes (XSM/small/brassie/medium/large). Don't add new UTC wire or thread rows — reference these existing rows.
- **Recipe brand convention — when to include brand in a `materials_list` slot:**
  - ✅ **Brand + model**: hooks (`"Dohiku 303"`, `"Hanak H450BL"`), threads (`"UTC Ultra Thread 70 black"`, `"Semperfli Nano Silk 12/0 brown"`), branded dubbings with distinct character (`"Troutline Mad Rabbit Dubbing"`, `"Hareline Ice Dub"`)
  - ❌ **Spec only — no brand**: beads (`"Slotted tungsten, copper, 2.8mm"`), CDC and other naturals (`"CDC, dark dun"`, `"Coq de Leon, pardo"`), generic wire (`"Small copper wire"`)
  - **Rule:** include the brand only when the brand actually changes the product. Beads/CDC/hackle/generic wire are interchangeable across brands at the vise; hooks/threads/specialty dubbings aren't.
  - The `tying_materials` table itself can still store full brand metadata for inventory/SKU tracking — that's separate from how the recipe slot reads.

## Anti-patterns (do not do these)

- ❌ Do not INSERT into `canonical_flies` — it's a view. Insert into `flies` directly.
- ❌ Do not create `fly_variants` or `fly_patterns_v2` rows. Those tables don't exist anymore. Size/bead/color ladders live in `option_envelope`.
- ❌ Do not use the Chrome MCP / Supabase SQL editor for the canonical insert. The CLI path is the source of truth and is idempotent + logged.
- ❌ Do not guess `origin_credit`, `history`, or fishing tips. Taylor and his audience are specialists — fabricated tying history damages trust. If unknown, ask or omit.
- ❌ Do not skip the gap-audit step even when the recipe looks complete — the slug-collision and Levenshtein checks are real and have caught dupes before.
- ❌ Do not commit the generated `/tmp/fly-batch-*.json` files into the repo. They're scratch.
- ❌ Do not bulk-approve near-duplicates without an explicit `--force-name` instruction from Taylor.

## Multiple flies in one request

If Taylor pastes 5 recipes, run steps 2–4 once across all 5 (single echo block, single gap audit, single plan, single confirmation). Step 5 runs them in one batch via the JSON array. Skips/errors per fly surface individually in the log; don't abort the batch on a single failure.

## After execution

- Do NOT commit unless Taylor asks. New canonicals are data, not code — they live in Supabase, not the repo.
- Per global feedback ("Always deploy when work done"), this doesn't apply here — there's no deploy step. The site reads from Supabase live; new flies appear on the next ISR revalidation. If Taylor wants the page live immediately, push an empty commit (`git commit --allow-empty`) to trigger Vercel rebuild.
- If a hero_image is still missing after insert, suggest dropping one into `public/images/flies/` and updating `hero_image_url` via the admin CMS at `/admin/flies/<slug>/edit` (note: `/admin/content/flies` is gone post-reset) — don't try to source images automatically.
