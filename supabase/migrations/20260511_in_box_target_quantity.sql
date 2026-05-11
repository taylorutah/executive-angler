-- 20260511_in_box_target_quantity.sql
--
-- Per-box target_quantity on fly_variant_in_box. The user already has a
-- global target via `fly_variant_stock.target_count` ("I want 20 size-16
-- Perdigons total across everything"). This per-box target answers a
-- different question: "I want 6 in my Kill Box specifically."
--
-- Used by the box-detail view's inline "Target" column. When unset, the
-- global stock target applies. Setting per-box lets the angler stock
-- specialized boxes (a Madison-only box, a winter midge box) with
-- box-specific targets.
--
-- Idempotent — uses add column if not exists. Default null so existing rows
-- behave like before (no per-box target → fall back to global).

alter table fly_variant_in_box
  add column if not exists target_quantity integer;

comment on column fly_variant_in_box.target_quantity is
  'Per-box target tied count. When null, the user falls back to '
  'fly_variant_stock.target_count (the global target across all boxes).';
