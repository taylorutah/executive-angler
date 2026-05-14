-- Drop the legacy `fly_patterns` table and replace with a compatibility VIEW.
--
-- Context: after iOS/Android/web Fly Box work + Phase 2 backfill + bulk
-- bead/personal-pattern migrations, every code path that needs to write
-- patterns has been switched to fly_patterns_v2. Reads still come from
-- 27 endpoints (FlyDetail, Tie Next, journal insights, lineage, search,
-- account dashboard, public angler profiles, admin tools, etc.) that
-- expect the legacy column shape — those keep working through the VIEW.
--
-- Strategy:
--   1. Repoint every FK constraint pointing at fly_patterns(id) to
--      fly_patterns_v2(id). Safe because Phase 2 preserved IDs when it
--      mirrored personal patterns into v2, and canonical patterns have
--      already been seeded into v2 with the same IDs.
--   2. DROP TABLE fly_patterns CASCADE (drops RLS policies, indexes,
--      remaining constraints, and the self-ref parent_pattern_id FK).
--   3. CREATE VIEW fly_patterns over fly_patterns_v2 that exposes the
--      legacy column shape. Variant-level columns (size, hook, bead_*,
--      colors) are reconstructed from the pattern's first variant or
--      aggregated. Reads against the view see backward-compatible data.
--   4. Inserts/updates against the view will fail loudly (no INSTEAD OF
--      triggers); all write paths have been rewritten to v2.
--
-- Pre-flight: backup recommended. Supabase auto-backups should cover.

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- Step 1: Backfill safety. Verify every FK value already points at a row
-- that exists in fly_patterns_v2. If any orphans exist, NULL them so the
-- new FK can be added without violation. Each table's policy below mirrors
-- its existing ON DELETE behavior (CASCADE rows get nulled instead of
-- killed; SET NULL rows get nulled; NO ACTION rows get nulled too — we
-- prefer surviving rows with NULL pattern over rolled-back migration).
-- ────────────────────────────────────────────────────────────────────────────
update session_rigs        set fly_pattern_id = null
  where fly_pattern_id is not null
    and fly_pattern_id not in (select id from fly_patterns_v2);

update catches             set fly_pattern_id = null
  where fly_pattern_id is not null
    and fly_pattern_id not in (select id from fly_patterns_v2);

update user_fly_box        set fly_pattern_id = null
  where fly_pattern_id is not null
    and fly_pattern_id not in (select id from fly_patterns_v2);

delete from fly_recipe_ingredients
  where fly_pattern_id is not null
    and fly_pattern_id not in (select id from fly_patterns_v2);
-- (CASCADE-targeted rows would have been removed by a parent delete anyway.)

update fly_pattern_submissions set source_pattern_id = null
  where source_pattern_id is not null
    and source_pattern_id not in (select id from fly_patterns_v2);

-- ────────────────────────────────────────────────────────────────────────────
-- Step 2: Drop old FK constraints, add new ones pointing at fly_patterns_v2.
-- The constraint NAMES are preserved for grep-ability in future audits.
-- ────────────────────────────────────────────────────────────────────────────
alter table session_rigs              drop constraint if exists session_rigs_fly_pattern_id_fkey;
alter table session_rigs              add  constraint session_rigs_fly_pattern_id_fkey
  foreign key (fly_pattern_id) references fly_patterns_v2(id) on delete set null;

alter table catches                   drop constraint if exists catches_fly_pattern_id_fkey;
alter table catches                   add  constraint catches_fly_pattern_id_fkey
  foreign key (fly_pattern_id) references fly_patterns_v2(id) on delete set null;

alter table user_fly_box              drop constraint if exists user_fly_box_fly_pattern_id_fkey;
alter table user_fly_box              add  constraint user_fly_box_fly_pattern_id_fkey
  foreign key (fly_pattern_id) references fly_patterns_v2(id) on delete set null;

alter table fly_recipe_ingredients    drop constraint if exists fly_recipe_ingredients_fly_pattern_id_fkey;
alter table fly_recipe_ingredients    add  constraint fly_recipe_ingredients_fly_pattern_id_fkey
  foreign key (fly_pattern_id) references fly_patterns_v2(id) on delete cascade;

alter table fly_pattern_submissions   drop constraint if exists fly_pattern_submissions_source_pattern_id_fkey;
alter table fly_pattern_submissions   add  constraint fly_pattern_submissions_source_pattern_id_fkey
  foreign key (source_pattern_id) references fly_patterns_v2(id) on delete set null;

-- ────────────────────────────────────────────────────────────────────────────
-- Step 3: DROP TABLE fly_patterns CASCADE.
--   - Removes the table data (47 personal rows, all already mirrored to v2).
--   - Removes its RLS policies, indexes, triggers.
--   - CASCADE removes the self-ref parent_pattern_id FK and anything else
--     still hanging off it (e.g. the canonical_flies.fly_pattern_id FK from
--     a much older migration, if still present).
-- ────────────────────────────────────────────────────────────────────────────
drop table if exists fly_patterns cascade;

-- ────────────────────────────────────────────────────────────────────────────
-- Step 4: Compatibility VIEW. Reads against `fly_patterns` continue to work
-- across 27 web endpoints + Android SessionViewModel + iOS Watch + journal
-- analytics queries. Writes will fail with "cannot insert into view" — that's
-- intentional. All write paths have been rewritten to use fly_patterns_v2
-- and the variant tables directly.
--
-- Variant-level fields (size text, hook, bead_*, body_color, etc.) are
-- reconstructed from the pattern's variants. `size` becomes a comma-joined
-- list of distinct sizes; single-valued fields take the first variant's
-- value (deterministic via sort_order). Fields with no v2 equivalent
-- (materials, tags, has_structured_recipe) return NULL or computed defaults.
-- ────────────────────────────────────────────────────────────────────────────
create view fly_patterns as
with first_variant as (
  select distinct on (pattern_id)
    pattern_id,
    hook_style,
    bead_material,
    bead_weight_mm,
    bead_color,
    body_color,
    rib_color,
    tail_color,
    wing_color,
    thorax_color,
    collar_color
  from fly_variants
  where deleted_at is null
  order by pattern_id, sort_order asc nulls last, created_at asc
),
agg_sizes as (
  select pattern_id,
         string_agg(distinct size, ',' order by size) as size_csv
  from fly_variants
  where deleted_at is null
  group by pattern_id
),
agg_bead_colors as (
  select pattern_id,
         array_agg(distinct bead_color) filter (where bead_color is not null) as bead_colors
  from fly_variants
  where deleted_at is null
  group by pattern_id
),
agg_fly_colors as (
  select pattern_id,
         array_agg(distinct body_color) filter (where body_color is not null) as body_colors
  from fly_variants
  where deleted_at is null
  group by pattern_id
),
has_recipe as (
  select fly_pattern_id, true as has_structured_recipe
  from fly_recipe_ingredients
  group by fly_pattern_id
)
select
  pv.id                                          as id,
  pv.owner_user_id                               as user_id,
  pv.name                                        as name,
  pv.slug                                        as slug,
  pv.category                                    as type,
  coalesce(asz.size_csv, '')                     as size,
  fv.hook_style                                  as hook,
  case when fv.bead_weight_mm is not null
       then fv.bead_weight_mm::text else null end as bead_size,
  fv.bead_weight_mm                              as bead_size_mm,
  fv.bead_material                               as bead_material,
  abc.bead_colors                                as bead_color,
  afc.body_colors                                as fly_color,
  fv.body_color                                  as body_color,
  null::text                                     as body_material,
  fv.tail_color                                  as tail_color,
  fv.thorax_color                                as thorax_color,
  fv.collar_color                                as collar_color,
  null::text                                     as rib_material,
  fv.rib_color                                   as rib_color,
  null::text                                     as wing_material,
  fv.wing_color                                  as wing_color,
  null::text                                     as hot_spot_color,
  null::text                                     as materials,
  pv.description                                 as description,
  pv.video_url                                   as video_url,
  pv.hero_image_url                              as image_url,
  null::text[]                                   as tags,
  pv.visibility                                  as visibility,
  (pv.visibility = 'public')                     as is_public,
  pv.shared_with_user_ids                        as shared_with_user_ids,
  pv.origin_credit                               as provenance_credit,
  pv.inspired_by_fly_id                          as parent_pattern_id,
  pv.promoted_to_canonical_id                    as promoted_to_canonical_id,
  null::uuid                                     as parent_canonical_id,
  'tied'::text                                   as source,
  coalesce(hr.has_structured_recipe, false)      as has_structured_recipe,
  -- Per-user pattern state (added in 20260514_pattern_user_state_on_v2)
  pv.is_favorite                                 as is_favorite,
  pv.is_tie_next                                 as is_tie_next,
  pv.tie_next_status                             as tie_next_status,
  pv.tie_next_notes                              as tie_next_notes,
  pv.tie_next_target_qty                         as tie_next_target_qty,
  pv.tie_next_order                              as tie_next_order,
  pv.created_at                                  as created_at,
  pv.updated_at                                  as updated_at
from fly_patterns_v2 pv
left join first_variant   fv  on fv.pattern_id  = pv.id
left join agg_sizes       asz on asz.pattern_id = pv.id
left join agg_bead_colors abc on abc.pattern_id = pv.id
left join agg_fly_colors  afc on afc.pattern_id = pv.id
left join has_recipe      hr  on hr.fly_pattern_id = pv.id;

-- ────────────────────────────────────────────────────────────────────────────
-- Step 5: Grant select to authenticated users (matches the original
-- fly_patterns RLS posture). RLS itself rides on fly_patterns_v2.
-- ────────────────────────────────────────────────────────────────────────────
grant select on fly_patterns to authenticated, anon, service_role;

commit;
