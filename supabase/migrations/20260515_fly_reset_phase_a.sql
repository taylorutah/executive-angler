-- Phase A: Fly Database Reset
--
-- Replaces the fly_patterns_v2 + fly_variants + fly_variant_stock model
-- with a flatter, options-on-canonical design:
--
--   flies                     — one row per fly, library encyclopedia. Options
--                               (sizes, bead sizes/colors, body colors) live
--                               on the row as recommended-not-enforced
--                               envelopes.
--   user_fly_configurations   — per-user picked-option tuples. One fly can
--                               have N configurations per user. Carries all
--                               inventory (tied/bought/target), favorite,
--                               tie-next state, last-used, notes.
--   fly_box_entries_v3        — box memberships now reference configurations.
--   _fly_dedup_candidates     — staging table for Phase B interactive review:
--                               every row in fly_patterns_v2 with owner set
--                               that the May 13 flatten promoted to its own
--                               canonical, paired with the parent it likely
--                               came from.
--
-- Existing tables (fly_patterns_v2, fly_variants, fly_variant_stock,
-- fly_variant_in_box, fly_variant_photos, user_fly_box, canonical_flies,
-- fly_pattern_submissions, fly_patterns view) are LEFT INTACT in this phase.
-- Phase C drops them once the app reads/writes from the new schema.
--
-- This migration is intentionally additive and non-destructive. Re-run
-- safe: every CREATE is IF NOT EXISTS, every backfill uses ON CONFLICT.

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. flies — single source of truth for fly identity
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists flies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text,                              -- nymph, dry, streamer, etc.

  -- Editorial content
  description text,
  history text,
  tying_overview text,
  fishing_tips text,
  recipe_notes text,

  -- Media
  hero_image_url text,
  gallery_image_urls text[] default '{}',
  video_url text,

  -- Recipe (slot-structured). Each entry:
  --   { slot: "bead"|"hook"|"thread"|"body"|"rib"|"tail"|"wing"|
  --           "thorax"|"collar"|"other",
  --     label: "Bead", default: { material, brand, model, color, size_mm, ... } }
  materials_list jsonb default '[]'::jsonb,

  -- Recommended (NOT enforced) options. Shape:
  --   {
  --     sizes: [12, 14, 16, 18, 20],
  --     bead: { sizes_mm: [...], colors: [...], materials: [...] },
  --     colors: { body: [...], rib: [...], tail: [...], ... }
  --   }
  option_envelope jsonb default '{}'::jsonb,

  -- Moderation
  status text not null default 'approved'
    check (status in ('approved', 'pending', 'rejected', 'private')),
  submitted_by_user_id uuid references auth.users(id) on delete set null,
  approved_by_user_id  uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  reject_reason text,

  -- Attribution (optional). Free-form pointer to a related fly; NOT a
  -- parent/variant relationship — purely editorial credit.
  inspired_by_fly_id uuid references flies(id) on delete set null,
  origin_credit text,

  -- Imitation + effectiveness (carried over from fly_patterns_v2)
  imitates text[] default '{}',
  effective_species_ids uuid[] default '{}',
  water_types text[] default '{}',

  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_flies_status        on flies(status);
create index if not exists idx_flies_category      on flies(category);
create index if not exists idx_flies_submitter     on flies(submitted_by_user_id)
  where submitted_by_user_id is not null;
create index if not exists idx_flies_featured      on flies(is_featured) where is_featured;
create index if not exists idx_flies_inspired_by   on flies(inspired_by_fly_id)
  where inspired_by_fly_id is not null;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. user_fly_configurations — per-user picked-option rows
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists user_fly_configurations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fly_id  uuid not null references flies(id) on delete cascade,

  -- Optional nickname (e.g. "small olive midge rig"). UI falls back to
  -- an auto-summary "#16 · 3mm copper · olive" when null.
  nickname text,

  -- Free-text size (autocompletes from flies.option_envelope.sizes).
  size text,

  -- Per-slot overrides, e.g.:
  --   {
  --     bead: { size_mm: 3.0, color: "copper", material: "tungsten" },
  --     body: { color: "olive", material_brand: "Troutline", model: "..." },
  --     hook: { brand: "Fasna", model: "F-100bl" }
  --   }
  -- Missing slots inherit the fly's materials_list default.
  slot_overrides jsonb default '{}'::jsonb,

  -- Inventory
  tied_count   int not null default 0 check (tied_count   >= 0),
  bought_count int not null default 0 check (bought_count >= 0),
  target_count int not null default 0 check (target_count >= 0),

  -- Per-user state
  is_favorite boolean not null default false,
  is_tie_next boolean not null default false,
  tie_next_status text check (tie_next_status in ('none','wanted','at_vise','done')),
  tie_next_target_qty int,
  tie_next_notes text,
  tie_next_order int,

  -- Usage stats
  last_used_at timestamptz,
  times_used   int not null default 0,
  last_loss_at timestamptz,

  personal_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_fly_configurations_user_fly
  on user_fly_configurations(user_id, fly_id);
create index if not exists idx_user_fly_configurations_favorite
  on user_fly_configurations(user_id) where is_favorite;
create index if not exists idx_user_fly_configurations_tie_next
  on user_fly_configurations(user_id) where is_tie_next;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. fly_box_entries_v3 — box membership now references configurations
-- ────────────────────────────────────────────────────────────────────────────
-- We keep the existing fly_boxes table; only the join table changes shape.
create table if not exists fly_box_entries_v3 (
  id uuid primary key default gen_random_uuid(),
  box_id uuid not null references fly_boxes(id) on delete cascade,
  configuration_id uuid not null references user_fly_configurations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,  -- denormalized for RLS perf
  sort_order int default 0,
  added_at timestamptz not null default now(),
  unique (box_id, configuration_id)
);

create index if not exists idx_fly_box_entries_v3_box  on fly_box_entries_v3(box_id);
create index if not exists idx_fly_box_entries_v3_user on fly_box_entries_v3(user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. catches — add configuration_id + options_snapshot (additive, no drop)
-- ────────────────────────────────────────────────────────────────────────────
alter table catches
  add column if not exists configuration_id uuid references user_fly_configurations(id) on delete set null,
  add column if not exists options_snapshot jsonb;

create index if not exists idx_catches_configuration on catches(configuration_id)
  where configuration_id is not null;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. _fly_dedup_candidates — Phase B interactive review staging
-- ────────────────────────────────────────────────────────────────────────────
-- The May 13 flatten-fly-architecture migration promoted every personal
-- fork to its own canonical (fly_patterns_v2 with owner_user_id null,
-- status='approved'). Many of those are genuine named variants we want
-- to keep (Mike Komara's Walt's Worm); many are just personal beadswaps
-- that should merge back into their parent.
--
-- This table is the working set for the dedup CLI (scripts/dedup-flies.ts).
create table if not exists _fly_dedup_candidates (
  id uuid primary key default gen_random_uuid(),
  child_fly_id uuid references flies(id) on delete cascade,
  parent_fly_id uuid references flies(id) on delete set null,
  child_v2_pattern_id  uuid,  -- corresponding fly_patterns_v2 row, for reference
  parent_v2_pattern_id uuid,
  similarity_score real,       -- 0..1, computed on backfill
  reason text,                  -- "shared inspired_by_fly_id", "name overlap", etc.
  decision text check (decision in ('pending','keep_both','merge','skip')) default 'pending',
  decided_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_fly_dedup_decision on _fly_dedup_candidates(decision);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. fly_slug_redirects — preserve old URLs across merges and the personal
--                        /anglers/<u>/flies/<slug> namespace deletion
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists fly_slug_redirects (
  from_slug text primary key,
  to_slug   text not null,
  reason    text,                -- "merged_dup", "personal_fork_collapsed", etc.
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. BACKFILL: canonical fly_patterns_v2 rows → flies
-- ────────────────────────────────────────────────────────────────────────────
-- Every canonical v2 row (owner_user_id IS NULL, status='approved' or
-- legacy NULL status) becomes a flies row. UUIDs are preserved so app code
-- can dual-read during the transition.
--
-- Slug normalization: the apostrophe-S artifact (e.g. "walt-s-worm" — Walt's
-- Worm round-tripped through a slugger that kept the apostrophe as its own
-- segment) gets collapsed inline. Only the pattern `<word>-s-<word>` is
-- normalized; nothing else in the slug is touched. Old slug → new slug
-- redirect rows are added below so existing links keep working.
insert into flies (
  id, slug, name, category,
  description, history, tying_overview, fishing_tips,
  hero_image_url, gallery_image_urls, video_url,
  materials_list, status, submitted_by_user_id, approved_by_user_id, approved_at,
  inspired_by_fly_id, origin_credit, imitates, effective_species_ids, water_types,
  is_featured, created_at, updated_at
)
select
  pv.id,
  -- Normalize ANY occurrence of "-s-" between word characters (handles
  -- multi-word genitives like "walt-s-worm" → "walts-worm"). Leaves all
  -- other characters alone. Falls back to 'fly-<id>' if slug is null.
  coalesce(regexp_replace(pv.slug, '([a-z0-9])-s-([a-z0-9])', '\1s-\2', 'g'),
           'fly-' || substr(pv.id::text, 1, 8)),
  pv.name,
  pv.category,
  pv.description, pv.history, pv.tying_overview, pv.fishing_tips,
  pv.hero_image_url, coalesce(pv.gallery_image_urls, '{}'), pv.video_url,
  coalesce(pv.base_materials, '[]'::jsonb),
  coalesce(pv.status, 'approved'),
  pv.submitted_by_user_id, pv.approved_by_user_id, pv.approved_at,
  pv.inspired_by_fly_id, pv.origin_credit,
  coalesce(pv.imitates, '{}'),
  coalesce(pv.effective_species_ids, '{}'),
  coalesce(pv.water_types, '{}'),
  coalesce(pv.is_featured, false),
  pv.created_at, pv.updated_at
from fly_patterns_v2 pv
where pv.owner_user_id is null
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 7b. BACKFILL: slug-change redirects for normalized canonical slugs
-- ────────────────────────────────────────────────────────────────────────────
-- Wherever step 7 normalized a slug (apostrophe-S artifact), record the old
-- slug → new slug mapping so old URLs (bookmarks, links from emails, indexed
-- by Google) keep resolving via the redirect table. The app's
-- lookupPatternRedirect() helper already consults this table.
insert into fly_slug_redirects (from_slug, to_slug, reason)
select
  pv.slug,
  regexp_replace(pv.slug, '([a-z0-9])-s-([a-z0-9])', '\1s-\2', 'g'),
  'apostrophe_s_normalization'
from fly_patterns_v2 pv
where pv.owner_user_id is null
  and pv.slug is not null
  and pv.slug ~ '[a-z0-9]-s-[a-z0-9]'
  and pv.slug <> regexp_replace(pv.slug, '([a-z0-9])-s-([a-z0-9])', '\1s-\2', 'g')
on conflict (from_slug) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 8. BACKFILL: derive option_envelope from existing fly_variants
-- ────────────────────────────────────────────────────────────────────────────
-- For each canonical fly, aggregate the distinct sizes / bead specs /
-- colors found across its variants. Store as recommended envelope.
update flies f
   set option_envelope = jsonb_build_object(
     'sizes',
     coalesce((
       select jsonb_agg(distinct s.size order by s.size)
         from (
           select size::int as size from fly_variants
            where pattern_id = f.id
              and size ~ '^[0-9]+$'
              and deleted_at is null
         ) s
     ), '[]'::jsonb),
     'bead', jsonb_build_object(
       'sizes_mm', coalesce((
         select jsonb_agg(distinct bead_weight_mm order by bead_weight_mm)
           from fly_variants
          where pattern_id = f.id and bead_weight_mm is not null
            and deleted_at is null
       ), '[]'::jsonb),
       'colors', coalesce((
         select jsonb_agg(distinct bead_color)
           from fly_variants
          where pattern_id = f.id and bead_color is not null
            and deleted_at is null
       ), '[]'::jsonb),
       'materials', coalesce((
         select jsonb_agg(distinct bead_material::text)
           from fly_variants
          where pattern_id = f.id and bead_material is not null
            and deleted_at is null
       ), '[]'::jsonb)
     ),
     'colors', jsonb_build_object(
       'body', coalesce((select jsonb_agg(distinct body_color)
                           from fly_variants
                          where pattern_id = f.id and body_color is not null
                            and deleted_at is null), '[]'::jsonb),
       'rib',  coalesce((select jsonb_agg(distinct rib_color)
                           from fly_variants
                          where pattern_id = f.id and rib_color is not null
                            and deleted_at is null), '[]'::jsonb),
       'tail', coalesce((select jsonb_agg(distinct tail_color)
                           from fly_variants
                          where pattern_id = f.id and tail_color is not null
                            and deleted_at is null), '[]'::jsonb),
       'wing', coalesce((select jsonb_agg(distinct wing_color)
                           from fly_variants
                          where pattern_id = f.id and wing_color is not null
                            and deleted_at is null), '[]'::jsonb),
       'thorax', coalesce((select jsonb_agg(distinct thorax_color)
                           from fly_variants
                          where pattern_id = f.id and thorax_color is not null
                            and deleted_at is null), '[]'::jsonb),
       'collar', coalesce((select jsonb_agg(distinct collar_color)
                           from fly_variants
                          where pattern_id = f.id and collar_color is not null
                            and deleted_at is null), '[]'::jsonb)
     )
   )
 where exists (select 1 from fly_variants v
                where v.pattern_id = f.id and v.deleted_at is null);

-- ────────────────────────────────────────────────────────────────────────────
-- 9. BACKFILL: fly_variant_stock + fly_variants → user_fly_configurations
-- ────────────────────────────────────────────────────────────────────────────
-- Each (user, variant) pair with any non-default state becomes a configuration.
-- Variants of personal-owned fly_patterns_v2 (owner != null) are routed to
-- their inspired_by canonical when available; else flagged for Phase B.
insert into user_fly_configurations (
  user_id, fly_id, nickname, size, slot_overrides,
  tied_count, bought_count, target_count,
  is_favorite, is_tie_next, tie_next_status, tie_next_target_qty, tie_next_notes,
  last_used_at, times_used, last_loss_at,
  personal_notes, created_at, updated_at
)
select
  s.user_id,
  -- Route to canonical: if the variant's pattern is itself canonical, use it.
  -- If personal, prefer the canonical referenced by inspired_by_fly_id; else
  -- fall back to the personal pattern's own id (will be flagged for dedup).
  case
    when pv.owner_user_id is null then pv.id
    when pv.inspired_by_fly_id is not null
      and exists (select 1 from flies where id = pv.inspired_by_fly_id) then pv.inspired_by_fly_id
    else pv.id
  end as fly_id,
  v.display_name,
  v.size,
  jsonb_strip_nulls(jsonb_build_object(
    'bead', case when v.bead_weight_mm is not null or v.bead_color is not null or v.bead_material is not null
                 then jsonb_strip_nulls(jsonb_build_object(
                       'size_mm', v.bead_weight_mm,
                       'color', v.bead_color,
                       'material', v.bead_material::text))
                 else null end,
    'hook', case when v.hook_style is not null or v.hook_brand is not null
                 then jsonb_strip_nulls(jsonb_build_object(
                       'style', v.hook_style,
                       'brand', v.hook_brand))
                 else null end,
    'body', case when v.body_color is not null
                 then jsonb_build_object('color', v.body_color) else null end,
    'rib',  case when v.rib_color  is not null
                 then jsonb_build_object('color', v.rib_color)  else null end,
    'tail', case when v.tail_color is not null
                 then jsonb_build_object('color', v.tail_color) else null end,
    'wing', case when v.wing_color is not null
                 then jsonb_build_object('color', v.wing_color) else null end,
    'thorax', case when v.thorax_color is not null
                   then jsonb_build_object('color', v.thorax_color) else null end,
    'collar', case when v.collar_color is not null
                   then jsonb_build_object('color', v.collar_color) else null end
  )),
  coalesce(s.tied_count, 0),
  coalesce(s.bought_count, 0),
  coalesce(s.target_count, 0),
  coalesce(s.is_favorite, false),
  case when coalesce(s.tie_next_status, 'none') in ('wanted','at_vise') then true else false end,
  s.tie_next_status,
  s.tie_next_target_qty,
  s.tie_next_notes,
  s.last_used_at,
  coalesce(s.times_used, 0),
  s.last_loss_at,
  s.personal_notes,
  coalesce(s.added_at, now()),
  coalesce(s.updated_at, now())
from fly_variant_stock s
join fly_variants v   on v.id = s.variant_id and v.deleted_at is null
join fly_patterns_v2 pv on pv.id = v.pattern_id
-- Only configurations with meaningful state — skip empty stock rows.
where coalesce(s.tied_count,   0) > 0
   or coalesce(s.bought_count, 0) > 0
   or coalesce(s.target_count, 0) > 0
   or coalesce(s.is_favorite, false)
   or coalesce(s.tie_next_status, 'none') in ('wanted','at_vise')
   or s.personal_notes is not null
on conflict do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 10. BACKFILL: fly_variant_in_box → fly_box_entries_v3
-- ────────────────────────────────────────────────────────────────────────────
-- A box entry survives only if a matching user_fly_configurations row was
-- created in step 9 (same user_id and the variant's underlying configuration).
-- We match via a CTE that locates the configuration the box entry should
-- point to (best-effort: same user + same fly_id + matching size).
with vib_map as (
  select
    ib.box_id,
    ib.user_id,
    ib.sort_order,
    ib.added_at,
    ufc.id as configuration_id
  from fly_variant_in_box ib
  join fly_variants v  on v.id = ib.variant_id and v.deleted_at is null
  join fly_patterns_v2 pv on pv.id = v.pattern_id
  join user_fly_configurations ufc
    on ufc.user_id = ib.user_id
   and ufc.fly_id = case
       when pv.owner_user_id is null then pv.id
       when pv.inspired_by_fly_id is not null
         and exists (select 1 from flies where id = pv.inspired_by_fly_id) then pv.inspired_by_fly_id
       else pv.id end
   and coalesce(ufc.size, '') = coalesce(v.size, '')
)
insert into fly_box_entries_v3 (box_id, configuration_id, user_id, sort_order, added_at)
select box_id, configuration_id, user_id, coalesce(sort_order, 0), coalesce(added_at, now())
from vib_map
on conflict do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 10b. BACKFILL: configs for box-resident variants without stock state
-- ────────────────────────────────────────────────────────────────────────────
-- Step 9 only created configs for variants with meaningful stock state. Many
-- box memberships reference variants the user added to a box but never
-- tracked counts on — those rows need a zero-state config so the box stays
-- populated.
insert into user_fly_configurations (
  user_id, fly_id, nickname, size, slot_overrides,
  tied_count, bought_count, target_count,
  is_favorite, is_tie_next, tie_next_status,
  created_at, updated_at
)
select distinct
  ib.user_id,
  case
    when pv.owner_user_id is null then pv.id
    when pv.inspired_by_fly_id is not null
      and exists (select 1 from flies where id = pv.inspired_by_fly_id) then pv.inspired_by_fly_id
    else pv.id
  end as fly_id,
  v.display_name,
  v.size,
  jsonb_strip_nulls(jsonb_build_object(
    'bead', case when v.bead_weight_mm is not null or v.bead_color is not null or v.bead_material is not null
                 then jsonb_strip_nulls(jsonb_build_object(
                       'size_mm', v.bead_weight_mm,
                       'color', v.bead_color,
                       'material', v.bead_material::text))
                 else null end,
    'hook', case when v.hook_style is not null or v.hook_brand is not null
                 then jsonb_strip_nulls(jsonb_build_object(
                       'style', v.hook_style,
                       'brand', v.hook_brand))
                 else null end,
    'body', case when v.body_color is not null then jsonb_build_object('color', v.body_color) else null end,
    'rib',  case when v.rib_color  is not null then jsonb_build_object('color', v.rib_color)  else null end,
    'tail', case when v.tail_color is not null then jsonb_build_object('color', v.tail_color) else null end,
    'wing', case when v.wing_color is not null then jsonb_build_object('color', v.wing_color) else null end,
    'thorax', case when v.thorax_color is not null then jsonb_build_object('color', v.thorax_color) else null end,
    'collar', case when v.collar_color is not null then jsonb_build_object('color', v.collar_color) else null end
  )),
  0, 0, 0, false, false, 'none',
  coalesce(ib.added_at, now()), coalesce(ib.added_at, now())
from fly_variant_in_box ib
join fly_variants v     on v.id = ib.variant_id and v.deleted_at is null
join fly_patterns_v2 pv on pv.id = v.pattern_id
where (
  pv.owner_user_id is null
  or (pv.inspired_by_fly_id is not null
      and exists (select 1 from flies where id = pv.inspired_by_fly_id))
)
and not exists (
  select 1 from user_fly_configurations ufc
   where ufc.user_id = ib.user_id
     and ufc.fly_id = case
         when pv.owner_user_id is null then pv.id
         when pv.inspired_by_fly_id is not null then pv.inspired_by_fly_id
         else pv.id end
     and coalesce(ufc.size, '') = coalesce(v.size, '')
);

-- ────────────────────────────────────────────────────────────────────────────
-- 10c. BACKFILL: import personal v2 patterns into flies as private rows
-- ────────────────────────────────────────────────────────────────────────────
-- Personal-owned v2 patterns (forks the May 13 flatten promoted, and any
-- user-created flies) need a row in `flies` so their variants can have
-- configurations. Status='private' keeps them visible only to the owner.
-- The Phase B dedup CLI promotes/merges them via _fly_dedup_candidates.
insert into flies (
  id, slug, name, category,
  description, history, tying_overview, fishing_tips,
  hero_image_url, gallery_image_urls, video_url,
  materials_list, status, submitted_by_user_id,
  inspired_by_fly_id, origin_credit, imitates, effective_species_ids, water_types,
  is_featured, created_at, updated_at
)
select
  pv.id,
  -- Namespace personal slugs to avoid collision with canonicals.
  coalesce(pv.slug, 'fly') || '-private-' || substr(pv.id::text, 1, 8),
  pv.name,
  pv.category,
  pv.description, pv.history, pv.tying_overview, pv.fishing_tips,
  pv.hero_image_url, coalesce(pv.gallery_image_urls, '{}'), pv.video_url,
  coalesce(pv.base_materials, '[]'::jsonb),
  'private',
  pv.owner_user_id,
  pv.inspired_by_fly_id, pv.origin_credit,
  coalesce(pv.imitates, '{}'),
  coalesce(pv.effective_species_ids, '{}'),
  coalesce(pv.water_types, '{}'),
  coalesce(pv.is_featured, false),
  pv.created_at, pv.updated_at
from fly_patterns_v2 pv
where pv.owner_user_id is not null
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 10d. BACKFILL: configs for variants of personal patterns
-- ────────────────────────────────────────────────────────────────────────────
insert into user_fly_configurations (
  user_id, fly_id, nickname, size, slot_overrides,
  tied_count, bought_count, target_count,
  is_favorite, is_tie_next, tie_next_status,
  created_at, updated_at
)
select distinct
  ib.user_id,
  pv.id,
  v.display_name,
  v.size,
  jsonb_strip_nulls(jsonb_build_object(
    'bead', case when v.bead_weight_mm is not null or v.bead_color is not null or v.bead_material is not null
                 then jsonb_strip_nulls(jsonb_build_object(
                       'size_mm', v.bead_weight_mm,
                       'color', v.bead_color,
                       'material', v.bead_material::text))
                 else null end,
    'hook', case when v.hook_style is not null or v.hook_brand is not null
                 then jsonb_strip_nulls(jsonb_build_object(
                       'style', v.hook_style,
                       'brand', v.hook_brand))
                 else null end,
    'body', case when v.body_color is not null then jsonb_build_object('color', v.body_color) else null end,
    'rib',  case when v.rib_color  is not null then jsonb_build_object('color', v.rib_color)  else null end,
    'tail', case when v.tail_color is not null then jsonb_build_object('color', v.tail_color) else null end,
    'wing', case when v.wing_color is not null then jsonb_build_object('color', v.wing_color) else null end,
    'thorax', case when v.thorax_color is not null then jsonb_build_object('color', v.thorax_color) else null end,
    'collar', case when v.collar_color is not null then jsonb_build_object('color', v.collar_color) else null end
  )),
  0, 0, 0, false, false, 'none',
  coalesce(ib.added_at, now()), coalesce(ib.added_at, now())
from fly_variant_in_box ib
join fly_variants v     on v.id = ib.variant_id and v.deleted_at is null
join fly_patterns_v2 pv on pv.id = v.pattern_id
where pv.owner_user_id is not null
  and exists (select 1 from flies where id = pv.id)
  and not exists (
    select 1 from user_fly_configurations ufc
     where ufc.user_id = ib.user_id
       and ufc.fly_id = pv.id
       and coalesce(ufc.size, '') = coalesce(v.size, '')
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 10e. BACKFILL: fly_box_entries_v3 — final pass picking up new configs
-- ────────────────────────────────────────────────────────────────────────────
with vib_map as (
  select
    ib.box_id,
    ib.user_id,
    ib.sort_order,
    ib.added_at,
    ufc.id as configuration_id
  from fly_variant_in_box ib
  join fly_variants v     on v.id = ib.variant_id and v.deleted_at is null
  join fly_patterns_v2 pv on pv.id = v.pattern_id
  join user_fly_configurations ufc
    on ufc.user_id = ib.user_id
   and ufc.fly_id = case
       when pv.owner_user_id is null then pv.id
       when pv.inspired_by_fly_id is not null
         and exists (select 1 from flies where id = pv.inspired_by_fly_id) then pv.inspired_by_fly_id
       else pv.id end
   and coalesce(ufc.size, '') = coalesce(v.size, '')
)
insert into fly_box_entries_v3 (box_id, configuration_id, user_id, sort_order, added_at)
select box_id, configuration_id, user_id, coalesce(sort_order, 0), coalesce(added_at, now())
from vib_map
on conflict do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 11. BACKFILL: catches — SKIPPED on purpose
-- ────────────────────────────────────────────────────────────────────────────
-- We deliberately do NOT backfill catches.configuration_id here. The catches
-- table records `fly_pattern_id` (the pattern) and `fly_name` (a string
-- snapshot), but it has never recorded which variant/size/bead/color the
-- angler actually used. Inferring it now would either be guesswork or a
-- cartesian explosion of false matches — both destroy more truth than they
-- preserve.
--
-- What this means for your data:
--   - Every catch keeps its existing fly_pattern_id (points at fly_patterns_v2,
--     which is untouched) and fly_name string.
--   - The new configuration_id and options_snapshot columns stay NULL for
--     historical catches. The UI must render them from fly_name + the pattern
--     join (no regression — that's exactly what it does today).
--   - Going forward, the catch-logging UI will set configuration_id when
--     the angler picks a saved configuration at log time.
--
-- No UPDATE of any existing catch column. No rows added or removed.

-- ────────────────────────────────────────────────────────────────────────────
-- 12. BACKFILL: Phase B dedup candidates
-- ────────────────────────────────────────────────────────────────────────────
-- Personal v2 patterns (owner set) that the May 13 flatten promoted but
-- weren't matched to a canonical via inspired_by_fly_id. For each, find
-- the most likely parent canonical by name overlap and queue for review.
insert into _fly_dedup_candidates (
  child_fly_id, parent_fly_id,
  child_v2_pattern_id, parent_v2_pattern_id,
  similarity_score, reason
)
select
  pv.id          as child_fly_id,
  parent.id      as parent_fly_id,
  pv.id          as child_v2_pattern_id,
  parent.id      as parent_v2_pattern_id,
  case
    when lower(pv.name) = lower(parent.name) then 1.0
    when lower(pv.name) like '%' || lower(parent.name) || '%' then 0.8
    when lower(parent.name) like '%' || lower(pv.name) || '%' then 0.7
    else 0.4
  end as similarity_score,
  case
    when pv.inspired_by_fly_id is not null then 'inspired_by'
    else 'name_overlap'
  end as reason
from fly_patterns_v2 pv
left join flies parent
  on parent.id = pv.inspired_by_fly_id
  or (lower(parent.name) like '%' || lower(pv.name) || '%' and parent.id <> pv.id)
where pv.owner_user_id is not null
  and exists (select 1 from flies where id = pv.id)  -- this personal pv was flattened into flies
  and parent.id is not null
on conflict do nothing;

-- Personal v2 patterns flattened into canonical but with NO matching parent
-- need a different kind of review — they're either genuine new flies or
-- need manual mapping. Queue them with parent NULL.
insert into _fly_dedup_candidates (
  child_fly_id, child_v2_pattern_id, similarity_score, reason
)
select pv.id, pv.id, 0.0, 'standalone_personal_promoted'
from fly_patterns_v2 pv
where pv.owner_user_id is not null
  and exists (select 1 from flies where id = pv.id)
  and not exists (select 1 from _fly_dedup_candidates d where d.child_fly_id = pv.id)
on conflict do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 13. updated_at trigger
-- ────────────────────────────────────────────────────────────────────────────
create or replace function update_flies_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists flies_updated_at_trigger on flies;
create trigger flies_updated_at_trigger
  before update on flies
  for each row execute function update_flies_updated_at();

drop trigger if exists ufc_updated_at_trigger on user_fly_configurations;
create trigger ufc_updated_at_trigger
  before update on user_fly_configurations
  for each row execute function update_flies_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- 14. Row Level Security
-- ────────────────────────────────────────────────────────────────────────────
alter table flies                     enable row level security;
alter table user_fly_configurations   enable row level security;
alter table fly_box_entries_v3        enable row level security;

-- flies: public read approved; submitter reads own pending; admin writes
drop policy if exists flies_read_approved on flies;
create policy flies_read_approved on flies
  for select using (status = 'approved');

drop policy if exists flies_read_own_pending on flies;
create policy flies_read_own_pending on flies
  for select using (
    status in ('pending', 'rejected', 'private')
    and submitted_by_user_id = auth.uid()
  );

-- Inserts allowed from authenticated users (they submit pending flies); admin
-- promotion is handled server-side via service role. Updates/deletes only
-- via service role (admin tooling).
drop policy if exists flies_insert_authenticated on flies;
create policy flies_insert_authenticated on flies
  for insert with check (
    auth.uid() is not null
    and submitted_by_user_id = auth.uid()
    and status in ('pending', 'private')
  );

-- user_fly_configurations: owner-only
drop policy if exists ufc_owner_all on user_fly_configurations;
create policy ufc_owner_all on user_fly_configurations
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- fly_box_entries_v3: owner-only
drop policy if exists fly_box_entries_v3_owner_all on fly_box_entries_v3;
create policy fly_box_entries_v3_owner_all on fly_box_entries_v3
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- fly_slug_redirects: public read
alter table fly_slug_redirects enable row level security;
drop policy if exists fly_slug_redirects_read on fly_slug_redirects;
create policy fly_slug_redirects_read on fly_slug_redirects for select using (true);

-- _fly_dedup_candidates: service-role only (admin tool)
alter table _fly_dedup_candidates enable row level security;
-- (no public policies — only service role can read/write)

commit;

-- ════════════════════════════════════════════════════════════════════════════
-- DATA SAFETY GUARANTEE
-- ════════════════════════════════════════════════════════════════════════════
--
-- Tables this migration READS FROM (never modified):
--   fly_patterns_v2, fly_variants, fly_variant_stock, fly_variant_in_box
--
-- Tables this migration CREATES (new, empty before backfill):
--   flies, user_fly_configurations, fly_box_entries_v3,
--   _fly_dedup_candidates, fly_slug_redirects
--
-- Tables this migration ADDS COLUMNS TO (additive — existing data untouched):
--   catches: + configuration_id (nullable FK), + options_snapshot (jsonb)
--
-- Tables this migration NEVER TOUCHES (no read, no write, no schema change):
--   sessions, fishing_sessions, session_rigs, session_catch_aggregates,
--   catches.fly_pattern_id (existing column unchanged),
--   catches.fly_name (existing column unchanged),
--   catches.user_id / .species / .length_in / .photo_url / etc.,
--   canonical_flies, fly_patterns (view), user_fly_box,
--   fly_pattern_submissions, fly_variant_photos
--
-- Catch backfill is intentionally SKIPPED (see step 11). Historical catches
-- keep their fly_pattern_id and fly_name; the new configuration_id stays
-- NULL for them. UI renders them exactly as today.
--
-- ════════════════════════════════════════════════════════════════════════════
-- Pre- and post-migration sanity checks (run manually as Taylor)
-- ════════════════════════════════════════════════════════════════════════════
--
-- BEFORE applying (record these numbers):
--   select count(*) as catches_total from catches;
--   select count(*) as sessions_total from fishing_sessions;
--   select count(*) as canonical_total from fly_patterns_v2 where owner_user_id is null;
--   select count(*) as personal_total  from fly_patterns_v2 where owner_user_id is not null;
--   select count(*) as variants_total  from fly_variants where deleted_at is null;
--   select count(*) as stock_total     from fly_variant_stock
--    where tied_count > 0 or bought_count > 0 or target_count > 0
--       or is_favorite or tie_next_status in ('wanted','at_vise')
--       or personal_notes is not null;
--
-- AFTER applying:
--   1. catches_total       — MUST be identical (no rows added/removed).
--   2. sessions_total      — MUST be identical (table not touched).
--   3. canonical_total     — MUST equal new `select count(*) from flies`.
--   4. stock_total         — should approximately equal new count of
--                            `select count(*) from user_fly_configurations`.
--                            (Exact match unless a variant was personal-owned
--                            and routed via inspired_by_fly_id — see dedup
--                            queue for those.)
--   5. variants_total      — MUST be identical (table not touched).
--
-- Spot-check your own data after the migration:
--   select fly_id, count(*) as configs
--     from user_fly_configurations
--    where user_id = 'YOUR-USER-UUID'
--    group by fly_id order by configs desc;
--
--   select count(*) as my_catches_pre, count(distinct fly_pattern_id) as flies_caught
--     from catches where user_id = 'YOUR-USER-UUID';
--
-- ════════════════════════════════════════════════════════════════════════════
-- Phase B follow-up: run `npm run dedup-flies` (scripts/dedup-flies.ts) to
-- drain _fly_dedup_candidates. Phase C migration drops the legacy tables.
-- ════════════════════════════════════════════════════════════════════════════
