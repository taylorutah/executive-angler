-- Phase 2: backfill user data into the new fly model.
--
-- Source counts (taylorutah only, pre-launch):
--   fly_patterns:        44 rows  (personal patterns)
--   user_fly_box:         7 rows  (stock entries, one per variant)
--   fly_box_membership:   7 rows  (each ufb in its default box)
--
-- Target:
--   fly_patterns_v2  (owner_user_id set)  ← from fly_patterns
--   fly_variants     (created_by_user_id set, migrated_from_ufb_id temp col)
--                                         ← one per user_fly_box row
--   fly_variant_stock                     ← derived from user_fly_box
--   fly_variant_in_box                    ← from fly_box_membership joined to ufb
--
-- Strategy: a temp `migrated_from_ufb_id` column on fly_variants captures
-- the source row id so subsequent INSERTs can join. Dropped at the end.

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Personal patterns: fly_patterns → fly_patterns_v2 (preserve ids)
-- ────────────────────────────────────────────────────────────────────────────
insert into fly_patterns_v2 (
  id,
  name,
  category,
  owner_user_id,
  forked_from_pattern_id,
  promoted_to_canonical_id,
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
  fp.parent_pattern_id,
  fp.promoted_to_canonical_id,
  case
    when fp.visibility in ('private','shared','public') then fp.visibility
    when fp.is_public = true then 'public'
    else 'private'
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
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Temp column to track source ufb row → new variant id
-- ────────────────────────────────────────────────────────────────────────────
alter table fly_variants
  add column if not exists migrated_from_ufb_id uuid;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Variants: one fly_variants row per user_fly_box row
--    pattern_id = canonical OR personal pattern (whichever is set)
--    created_by_user_id = ufb.user_id (so it's a personal variant)
--
--    Spec extracted from ufb columns:
--      size:            preferred_sizes[1] || quantity_by_size first key || 'Standard'
--      bead_material:   ufb.bead_material if valid, else null
--      bead_weight_mm:  ufb.bead_weight_mm
--      hook_style:      hook_size (close enough for now)
--      colors / notes:  preserved where present
-- ────────────────────────────────────────────────────────────────────────────
insert into fly_variants (
  pattern_id,
  created_by_user_id,
  display_name,
  notes,
  size,
  bead_material,
  bead_weight_mm,
  hook_style,
  body_color,
  sort_order,
  migrated_from_ufb_id
)
select
  coalesce(ufb.canonical_fly_id, ufb.fly_pattern_id),
  ufb.user_id,
  nullif(ufb.custom_name, ''),
  nullif(ufb.personal_notes, ''),
  -- Pick a sensible size
  coalesce(
    nullif(ufb.preferred_sizes[1], ''),
    -- First key of quantity_by_size if present
    (select k from jsonb_object_keys(coalesce(ufb.quantity_by_size, '{}'::jsonb)) k limit 1),
    'Standard'
  ),
  case when ufb.bead_material in ('tungsten','brass','glass','none') then ufb.bead_material else null end,
  ufb.bead_weight_mm,
  ufb.hook_size,
  -- Best-effort body color from preferred_colors[1]
  ufb.preferred_colors[1],
  coalesce(ufb.variant_sort_order, 0),
  ufb.id
from user_fly_box ufb
where coalesce(ufb.canonical_fly_id, ufb.fly_pattern_id) is not null
  and exists (
    select 1 from fly_patterns_v2 p
     where p.id = coalesce(ufb.canonical_fly_id, ufb.fly_pattern_id)
  )
  and not exists (
    -- Idempotent: skip if already migrated
    select 1 from fly_variants v where v.migrated_from_ufb_id = ufb.id
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Stock: per (user, new variant) inventory row
--    Combines tied_count + sum(quantity_by_size) for tied total.
-- ────────────────────────────────────────────────────────────────────────────
insert into fly_variant_stock (
  user_id,
  variant_id,
  tied_count,
  bought_count,
  target_count,
  tie_next_status,
  tie_next_target_qty,
  tie_next_notes,
  times_used,
  last_loss_at,
  is_favorite,
  personal_notes,
  added_at
)
select
  ufb.user_id,
  v.id,
  -- Prefer summed quantity_by_size, fall back to tied_count
  greatest(
    coalesce((
      select sum(value::int)
        from jsonb_each_text(coalesce(ufb.quantity_by_size, '{}'::jsonb))
    ), 0),
    coalesce(ufb.tied_count, 0)
  ),
  0,                                          -- no bought tracking pre-migration
  coalesce(ufb.target_count, 0),
  case
    when ufb.tie_next_status in ('none','wanted','at_vise','done') then ufb.tie_next_status
    when ufb.is_tie_next = true then 'wanted'
    else 'none'
  end,
  ufb.tie_next_target_qty,
  ufb.tie_next_notes,
  coalesce(ufb.times_used, 0),
  ufb.last_loss_at,
  coalesce(ufb.is_favorite, false),
  nullif(ufb.personal_notes, ''),
  coalesce(ufb.added_at, now())
from user_fly_box ufb
join fly_variants v on v.migrated_from_ufb_id = ufb.id
on conflict (user_id, variant_id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Box membership: fly_box_membership → fly_variant_in_box
-- ────────────────────────────────────────────────────────────────────────────
insert into fly_variant_in_box (
  box_id,
  variant_id,
  user_id,
  sort_order,
  added_at
)
select
  fbm.box_id,
  v.id,
  ufb.user_id,
  coalesce(fbm.sort_order, 0),
  coalesce(fbm.added_at, now())
from fly_box_membership fbm
join user_fly_box ufb on ufb.id = fbm.user_fly_box_id
join fly_variants v on v.migrated_from_ufb_id = ufb.id
on conflict (box_id, variant_id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. Drop the temp column once migration is verified.
--    (Commented out so a re-run still works; drop manually after verifying.)
-- ────────────────────────────────────────────────────────────────────────────
-- alter table fly_variants drop column if exists migrated_from_ufb_id;

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Verify
-- ────────────────────────────────────────────────────────────────────────────
-- select 'patterns_v2 (personal)' as kind, count(*) from fly_patterns_v2 where owner_user_id is not null
-- union all
-- select 'variants (user-created)', count(*) from fly_variants where created_by_user_id is not null
-- union all
-- select 'variant_stock', count(*) from fly_variant_stock
-- union all
-- select 'variant_in_box', count(*) from fly_variant_in_box
-- union all
-- select 'fly_patterns (source)', count(*) from fly_patterns
-- union all
-- select 'user_fly_box (source)', count(*) from user_fly_box;

commit;
