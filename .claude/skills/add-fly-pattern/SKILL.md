---
name: add-fly-pattern
description: Use this skill when Taylor wants to add one or more canonical fly patterns to the Executive Angler database. Triggers on pasted recipes (text, image, URL, YouTube), phrases like "add this fly", "new fly pattern", "create canonical", or any tying recipe handed over for ingestion. Handles single flies and bulk submissions.
---

# Add Fly Pattern — Canonical Ingestion Skill

Ingests fly tying recipes (text, image, URL, YouTube) and writes them as canonical patterns to Supabase via the existing batch importer. Also detects and adds new hooks/threads/beads/dubbings to `tying_materials` when mentioned.

## The 5-step contract (do not skip steps)

**1. Parse the input** — accept any of:
- Pasted text recipe
- URL → use `WebFetch` to pull the page; extract recipe sections
- YouTube URL → `WebFetch` the watch page for title + description (often contains the recipe). If the video itself is the only source, ask Taylor to paste materials/steps — you cannot watch video.
- Screenshot / image attachment → read it directly (vision)
- Multiple flies → handle them as an array; never silently merge or drop

**2. Concise echo** — for each fly, one tight block:
```
NAME · category · hook style #default-size · originator
Body: …  Rib: …  Tail: …  Hackle: …  Bead: …   (≤6 lines, only filled slots)
```
No marketing prose, no padding. If something is missing or ambiguous, mark it `?` here so the gap audit catches it.

**3. Gap audit** — run these checks, ask Taylor about gaps in one batched question:

Required-field gaps:
- `name` (non-empty)
- `category` — must be one of: `dry`, `nymph`, `streamer`, `emerger`, `wet`, `terrestrial`, `egg`, `midge`
- `origin_credit` — every canonical needs provenance. If truly unknown, use `"Classic pattern, originator unknown"` but ask first
- `default_size`, `hook_style` (nice-to-have but ask)

Database gaps (query Supabase before claiming a gap exists):
- **Slug collision** — slugify(name) → query `canonical_flies` `.eq("slug", …)`. If exists, ask Taylor: skip, rename, or overwrite?
- **Near-duplicate name** — fetch all `canonical_flies(name)`, compute Levenshtein vs. proposed name. ≤2 = flag and confirm. The batch script also enforces this; respect `--force-name` only if Taylor explicitly says so.
- **New materials** — for each hook brand+model, thread brand+size, bead spec, distinctive dubbing/hackle mentioned, query `tying_materials` by `name` (case-insensitive `ilike`). Anything absent goes in a "new materials to add" list. Categories enum: `hook | bead | thread | dubbing | feather | flash | foam | wire | resin | marker | rubber | synthetic | tail | wing | ribbing | chenille | body | eye`.

**4. Final plan + confirm** — show Taylor:
```
Flies to insert (N):
  • Name 1  (cat, originator) → /flies/<slug>
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
2. Resolve `SEED_ADMIN_USER_ID` once: query `angler_profiles` `.eq("user_id", auth user for taylor.warnick@gmail.com)` — or grep recent run logs in `scripts/logs/seed-flies-batch-*.log`. Cache in conversation; don't re-query.
3. Run: `SEED_ADMIN_USER_ID=<uuid> npx tsx scripts/seed-flies-batch.ts /tmp/fly-batch-<ts>.json` from repo root. The script auto-loads `.env.local` for the service role key.
4. For each new `tying_materials` row, do a single service-role insert via a short inline tsx one-off (build a tiny script in `/tmp/`, run it, delete it). Slug = slugify(brand + name + size if applicable). Set `is_verified: true`, `submitted_by: <admin uuid>`.
5. Surface the script's per-row log lines verbatim (`OK inserted`, `SKIP slug exists`, `ERROR …`). Don't paraphrase outcomes.
6. **Verify** — for each inserted slug, `select id, name, category, hero_image_url from canonical_flies where slug=…`. Confirm `fly_patterns_v2` got the same id, and a default `fly_variants` row exists. Print the live URL `https://www.executiveangler.com/flies/<slug>` per fly.
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
    "imitates": ["mayfly", "attractor"],
    "hook_style": "dry fly, standard",
    "default_size": "16",
    "base_materials": [
      { "slot": "hook",   "material": "TMC 100, size 16" },
      { "slot": "thread", "material": "Veevus 8/0 purple" },
      { "slot": "tail",   "material": "Moose body hair" },
      { "slot": "body",   "material": "Purple superfine dubbing" },
      { "slot": "wing",   "material": "White calf body hair (post)" },
      { "slot": "hackle", "material": "Grizzly, parachute" }
    ],
    "tying_steps": [
      { "step": 1, "instruction": "Lay thread base from eye to bend." },
      { "step": 2, "instruction": "Tie in moose tail, shank length." }
    ],
    "hero_image_url": null
  }
]
```

`hero_image_url`: leave `null` to default to `/images/fly-icons/<category>.svg`. Only set if Taylor provides a real image URL or a Supabase Storage path.

## DB facts the skill MUST encode correctly

- **Two tables get written** by the batch script: `canonical_flies` (legacy, still read in some paths) AND `fly_patterns_v2` (modern, read by `/flies/[slug]`). Plus one default row in `fly_variants`. The script handles all three.
- **`fly_recipe_ingredients` is NOT populated** by this flow. Materials live in `base_materials` jsonb on the pattern. Don't try to wire FK links unless Taylor explicitly asks.
- **Required RLS env:** `SUPABASE_SERVICE_ROLE_KEY` (in `.env.local`) bypasses RLS for both inserts.
- **Slug rule:** lowercase, alphanumeric + hyphens, max 80 chars, `slugify(name)`. The script auto-generates; do not pass `slug` in JSON.
- **Categories enum (exact):** `dry | nymph | streamer | emerger | wet | terrestrial | egg | midge`. Anything else is rejected with `ERROR_VALIDATION`.
- **`tying_materials` categories:** `hook | bead | thread | dubbing | feather | flash | foam | wire | resin | marker | rubber | synthetic | tail | wing | ribbing | chenille | body | eye`.
- **Recipe brand convention — when to include brand in a `base_materials` slot:**
  - ✅ **Brand + model**: hooks (`"Dohiku 303"`, `"Hanak 450"`), threads (`"UNI-Thread 8/0 rusty dun"`), branded dubbings with distinct character (`"Troutline Mad Rabbit Dubbing"`, `"Hareline Ice Dub"`)
  - ❌ **Spec only — no brand**: beads (`"Slotted tungsten, copper, 2.8mm"`), CDC and other naturals (`"CDC, dark dun"`, `"Coq de Leon, pardo"`), generic wire (`"Small copper wire"`)
  - **Rule:** include the brand only when the brand actually changes the product. Beads/CDC/hackle/generic wire are interchangeable across brands at the vise; hooks/threads/specialty dubbings aren't.
  - The `tying_materials` table itself can still store full brand metadata for inventory/SKU tracking — that's separate from how the recipe slot reads.

## Anti-patterns (do not do these)

- ❌ Do not use the Chrome MCP / Supabase SQL editor to insert. The CLI path is the source of truth and is idempotent + logged.
- ❌ Do not guess `origin_credit`, `history`, or fishing tips. Taylor and his audience are specialists — fabricated tying history damages trust. If unknown, ask or omit.
- ❌ Do not skip the gap-audit step even when the recipe looks complete — the slug-collision and Levenshtein checks are real and have caught dupes before.
- ❌ Do not invent `tying_steps` when not provided. Empty array is fine; partial steps from a video transcript should be flagged as such in the echo.
- ❌ Do not commit the generated `/tmp/fly-batch-*.json` files into the repo. They're scratch.
- ❌ Do not bulk-approve near-duplicates without an explicit `--force-name` instruction from Taylor.

## Multiple flies in one request

If Taylor pastes 5 recipes, run steps 2–4 once across all 5 (single echo block, single gap audit, single plan, single confirmation). Step 5 runs them in one batch via the JSON array. Skips/errors per fly surface individually in the log; don't abort the batch on a single failure.

## After execution

- Do NOT commit unless Taylor asks. New canonicals are data, not code — they live in Supabase, not the repo.
- Per global feedback ("Always deploy when work done"), this doesn't apply here — there's no deploy step. The site reads from Supabase live; new flies appear on next ISR revalidation. Mention this in the done-summary.
- If a hero_image is still missing after insert, suggest dropping one into `public/images/flies/` and updating `hero_image_url` via the admin CMS at `/admin/content/flies` — don't try to source images automatically.
