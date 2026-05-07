-- Variant detail columns + MRP-style stock targets.
--
-- Migration 20260507 split user_fly_box into per-variant rows but only added
-- identity columns (variant_label, is_primary, variant_sort_order, tied_count).
-- The actual differentiating attributes — bead weight in mm, bead material,
-- hook size — were never modeled at the variant level (bead_size existed only
-- as a free-text string on fly_patterns).
--
-- This migration adds those attributes to user_fly_box and introduces
-- target_count so the Patterns/Boxes table views can compute "deficit"
-- (target − tied) for MRP-style low-stock signals and tie-next prioritization.
--
-- Backfill seeds target_count from current stock so existing rows don't
-- show false low-stock alarms the first time a user opens the new view.

begin;

alter table user_fly_box
  add column if not exists bead_weight_mm numeric(4,2),
  add column if not exists bead_material text
    check (bead_material in ('tungsten','brass','glass','none')),
  add column if not exists hook_size text,
  add column if not exists target_count integer not null default 0;

-- Backfill: target = current stock so deficit starts at 0 for legacy rows.
-- Prefer summed quantity_by_size (the historical source); fall back to tied_count.
update user_fly_box
   set target_count = greatest(
       coalesce((
         select sum(value::int)
           from jsonb_each_text(coalesce(quantity_by_size, '{}'::jsonb))
       ), tied_count, 0), 0)
 where target_count = 0;

-- Sort/filter index for "what should I tie next" queries (deficit desc).
create index if not exists idx_user_fly_box_user_deficit
  on user_fly_box (user_id, ((target_count - tied_count)) desc)
  where target_count > 0;

commit;
