-- Finish the Phase 2 migration for personal patterns, then explode their size
-- arrays into per-variant rows. Idempotent on re-run.
--
-- Context: Phase 2 (20260508_phase2_user_data_backfill.sql) was supposed to
-- copy each `fly_patterns` row into `fly_patterns_v2` with `owner_user_id`
-- set, then create variants from `user_fly_box` rows. On production, the
-- variant step ran (19 user-created variants existed, all pointing at
-- canonical patterns) but the pattern-copy step did not — all 47 personal
-- patterns were still missing from v2 entirely. This migration does both
-- halves: copies the patterns, then explodes their size text into one
-- `fly_variants` row per size, places those variants into an auto-created
-- per-user "Recipes" box.
--
-- Applied to production 2026-05-14:
--   fly_patterns_v2 (owner set)            0  → 47
--   fly_variants    (user-created)        19  → 113
--   fly_variant_in_box                    11  → 115
--   fly_boxes named Recipes                0  →   4
--
-- Source data shape (confirmed on production before applying):
--   fly_patterns.size text:
--     '["14","16","18"]', '["#12","#14","#16"]', '14,16,18', '14, 16, 18', '[]'
--   fly_patterns.bead_size text: mostly NULL; single numeric ('2.5', '3.2');
--                                one CSV ('2.0, 2.5, 3.0, 3.5, 4.0'). No
--                                T/B/G material codes in source.
--
-- Parser rules:
--   size  → strip [, ], ", #, whitespace from each element; split on comma;
--           drop empties; result is the verbatim size value (e.g. "14")
--   bead  → cast bead_size to numeric only if it matches /^\d+(\.\d+)?$/;
--           multi-value CSVs cannot be reliably mapped to sizes 1:1 so they
--           stay NULL (only 1 row hit this — the user fixes it on web).
--
-- Notes on schema discrepancies caught during apply:
--   • fly_patterns_v2 has no `forked_from_pattern_id` (the flatten-fly-forks
--     refactor renamed/dropped it). We don't carry fork lineage forward.
--   • `promoted_to_canonical_id` had orphan FK references in legacy. Dropped
--     during this copy.
--   • Two NOT NULL columns on fly_patterns_v2 take defaults: `visibility`
--     (set explicitly from legacy) and `status` (defaults to 'approved').

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- 0. Backfill: legacy fly_patterns → fly_patterns_v2 with owner_user_id set.
--    Preserves the legacy id so future joins (catches.fly_pattern_id, etc.)
--    keep working. Idempotent via `on conflict (id) do nothing`.
-- ────────────────────────────────────────────────────────────────────────────
insert into fly_patterns_v2 (
  id,
  name,
  category,
  owner_user_id,
  visibility,
  shared_with_user_ids,
  hero_image_url,
  video_url,
  description,
  contributed_by_user_id,
  origin_credit,
  is_featured,
  created_at,
  updated_at
)
select
  fp.id,
  fp.name,
  fp.type,
  fp.user_id,
  case
    when fp.visibility in ('private','shared','public') then fp.visibility
    when fp.is_public = true                              then 'public'
    else                                                       'private'
  end,
  coalesce(fp.shared_with_user_ids, '{}'::uuid[]),
  fp.image_url,
  fp.video_url,
  fp.description,
  fp.user_id,                                  -- contributed by self
  fp.provenance_credit,
  false,
  coalesce(fp.created_at, now()),
  coalesce(fp.updated_at, now())
from fly_patterns fp
where fp.user_id is not null
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Per-user "Recipes" box (only for users who actually have personal
--    patterns). is_default=false because the unique partial index
--    `fly_boxes_one_default_per_user` allows only one default per user.
-- ────────────────────────────────────────────────────────────────────────────
insert into fly_boxes (user_id, name, tier, description, is_default, sort_order)
select distinct
  fp.user_id,
  'Recipes',
  'custom',
  'Personal fly recipes — migrated from the legacy pattern list. Edit sizes and beads here.',
  false,
  100
from fly_patterns fp
where fp.user_id is not null
  and not exists (
    select 1 from fly_boxes fb
    where fb.user_id = fp.user_id and fb.name = 'Recipes'
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Explode each personal pattern's size text into individual fly_variants
--    rows. Per-(pattern, user, size) dedup keeps this safe on re-run and
--    safe alongside any variants Phase 2 already created from ufb rows.
-- ────────────────────────────────────────────────────────────────────────────
insert into fly_variants (
  pattern_id,
  created_by_user_id,
  size,
  bead_weight_mm,
  bead_material,
  sort_order,
  notes,
  hook_style
)
select
  fp.id                                                                          as pattern_id,
  fp.user_id                                                                     as created_by_user_id,
  s.size_value                                                                   as size,
  case
    when fp.bead_size ~ '^[0-9]+(\.[0-9]+)?$' then fp.bead_size::numeric
    else null
  end                                                                            as bead_weight_mm,
  null::text                                                                     as bead_material,
  (s.idx)::integer                                                               as sort_order,
  nullif(trim(fp.notes), '')                                                     as notes,
  nullif(trim(fp.hook),  '')                                                     as hook_style
from fly_patterns fp
join lateral (
  select
    trim(regexp_replace(elem, '[\[\]"#[:space:]]', '', 'g')) as size_value,
    ord                                                       as idx
  from unnest(string_to_array(fp.size, ',')) with ordinality t(elem, ord)
) s on length(s.size_value) >= 1
where fp.user_id is not null
  and fp.size   is not null
  and length(trim(fp.size)) >= 1
  and exists (
    select 1 from fly_patterns_v2 pv where pv.id = fp.id
  )
  and not exists (
    select 1 from fly_variants v
    where v.pattern_id          = fp.id
      and v.created_by_user_id  = fp.user_id
      and v.size                = s.size_value
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Place every personal variant into the user's Recipes box, unless it's
--    already in some other box. Existing assignments are preserved as-is.
-- ────────────────────────────────────────────────────────────────────────────
insert into fly_variant_in_box (box_id, variant_id, user_id, sort_order, added_at)
select
  rb.id                  as box_id,
  v.id                   as variant_id,
  v.created_by_user_id   as user_id,
  coalesce(v.sort_order, 0),
  now()
from fly_variants v
join fly_boxes rb
  on  rb.user_id = v.created_by_user_id
  and rb.name    = 'Recipes'
where v.created_by_user_id is not null
  and not exists (
    select 1 from fly_variant_in_box fvb where fvb.variant_id = v.id
  );

commit;
