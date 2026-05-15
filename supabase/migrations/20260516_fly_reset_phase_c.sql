-- Phase C: drop legacy fly tables.
--
-- DO NOT APPLY until ALL of these are true:
--   1. Phase A migration applied (flies + user_fly_configurations populated).
--   2. The dedup CLI (scripts/dedup-flies.ts) drained _fly_dedup_candidates —
--      i.e., every candidate has decision != 'pending'.
--   3. The web app has run for at least a week reading from `flies` and
--      `user_fly_configurations` with no errors logged against them.
--   4. iOS and Android have been verified — they read from the same v2
--      tables this drops. They must either be updated to read from flies
--      OR you accept those clients will break until updated.
--
-- This is the destructive step. After running, the old fly_patterns_v2,
-- fly_variants, fly_variant_stock, fly_variant_in_box, fly_variant_photos,
-- canonical_flies, user_fly_box, fly_patterns (view), and
-- fly_pattern_submissions tables/views are GONE. Nothing reverts them
-- short of a backup restore.

begin;

-- Drop legacy app reads first (the view points at fly_patterns_v2 and
-- breaks once that table goes).
drop view if exists fly_patterns cascade;

-- Catches: re-point the legacy fly_pattern_id FK from fly_patterns_v2 to
-- flies. Phase A preserved IDs, so existing values still point at the
-- correct fly — we just swap the FK target before dropping the old
-- table. 108 production catches reference a pattern this way; dropping
-- the column would lose that history.
--
-- Order matters: drop the old FK, null any references that no longer
-- resolve into `flies` (e.g. catches that pointed at a personal pattern
-- which was rejected during dedup), then add the new FK.
alter table catches drop constraint if exists catches_fly_pattern_id_fkey;
-- First re-point catches whose pattern was MERGED in Phase B dedup.
-- _fly_dedup_candidates.decision='merge' captures (child_fly_id →
-- parent_fly_id). Catches that referenced the child now reference the
-- parent.
update catches c
   set fly_pattern_id = d.parent_fly_id
  from _fly_dedup_candidates d
 where d.decision = 'merge'
   and d.parent_fly_id is not null
   and c.fly_pattern_id = d.child_fly_id;
-- Then null anything still unresolved.
update catches set fly_pattern_id = null
 where fly_pattern_id is not null
   and fly_pattern_id not in (select id from flies);
alter table catches add constraint catches_fly_pattern_id_fkey
  foreign key (fly_pattern_id) references flies(id) on delete set null;

-- Session rigs: same treatment.
alter table session_rigs drop constraint if exists session_rigs_fly_pattern_id_fkey;
update session_rigs r
   set fly_pattern_id = d.parent_fly_id
  from _fly_dedup_candidates d
 where d.decision = 'merge'
   and d.parent_fly_id is not null
   and r.fly_pattern_id = d.child_fly_id;
update session_rigs set fly_pattern_id = null
 where fly_pattern_id is not null
   and fly_pattern_id not in (select id from flies);
alter table session_rigs add constraint session_rigs_fly_pattern_id_fkey
  foreign key (fly_pattern_id) references flies(id) on delete set null;

-- Fly pattern submissions queue — pending lives on flies.status now.
drop table if exists fly_pattern_submissions cascade;

-- v2 fly model — variants, stock, box-memberships, photos.
drop table if exists fly_variant_photos cascade;
drop table if exists fly_variant_in_box cascade;
drop table if exists fly_variant_stock  cascade;
drop table if exists fly_variants       cascade;
drop table if exists fly_patterns_v2    cascade;

-- Pre-v2 user fly box — `fly_box_entries_v3` + `user_fly_configurations`
-- have replaced it.
drop table if exists user_fly_box cascade;

-- canonical_flies → repoint FKs to `flies`, then drop and replace with a
-- compatibility VIEW so workbench code (fly_recipe_ingredients joins,
-- what-can-i-tie) keeps working without a rewrite.
--
-- fly_recipe_ingredients.canonical_fly_id originally referenced
-- canonical_flies(id). Phase A preserved IDs, so re-pointing the FK to
-- flies(id) is a metadata-only change (no row movement).
alter table if exists fly_recipe_ingredients
  drop constraint if exists fly_recipe_ingredients_canonical_fly_id_fkey;
alter table if exists fly_recipe_ingredients
  add constraint fly_recipe_ingredients_canonical_fly_id_fkey
  foreign key (canonical_fly_id) references flies(id) on delete cascade;

-- Drop the canonical_flies table and create a compatibility view in its
-- place. Any code path that still does `from('canonical_flies').select(...)`
-- gets a read-only view of approved flies. Writes against the view will
-- fail (intentional — all writes now go to `flies`).
drop table if exists canonical_flies cascade;
create view canonical_flies as
select
  id,
  slug,
  name,
  category,
  description,
  hero_image_url,
  null::text as tagline,
  null::int  as rank,
  is_featured as featured,
  (option_envelope -> 'sizes')   as sizes,
  (option_envelope #> '{colors,body}') as colors,
  (option_envelope -> 'bead' -> 'sizes_mm') as bead_options,
  null::text[] as hook_styles,
  materials_list,
  history,
  tying_overview,
  fishing_tips,
  imitates,
  effective_species_ids,
  water_types,
  inspired_by_fly_id as contributed_by_user_id,
  origin_credit,
  created_at,
  updated_at
from flies
where status = 'approved';

grant select on canonical_flies to authenticated, anon, service_role;

-- _fly_dedup_candidates is intentionally KEPT for audit. The Phase B CLI
-- updates `decision` and `decided_at` so this stays as the history of
-- merge/keep/skip calls. If you really want it gone:
--   drop table if exists _fly_dedup_candidates;

commit;

-- After applying:
--   - All app surfaces must read from `flies` and `user_fly_configurations`
--     (Commit 3 of the reset did this for /flies/[slug]; verify Dashboard,
--      Workbench, Tie-Next, catch logging all use fly-model.ts queries).
--   - iOS and Android need an update if they haven't already.
--   - The fly_slug_redirects table keeps old URLs alive — leave it in
--     place indefinitely.
