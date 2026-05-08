-- Soft-delete column for fly_variants.
--
-- Variants need to be removable from the pattern detail page without breaking
-- catches.variant_id (declared `on delete set null`). Hard-delete would silently
-- sever the catch ↔ spec link. Instead we flag deleted_at and filter at the
-- query level.
--
-- The fly_variants_read RLS policy stays open (no `deleted_at IS NULL` clause)
-- so historical lookups from catch detail pages still resolve the row. The
-- visible-on-pattern-page filter happens in src/lib/db/fly-v2.ts.

alter table fly_variants
  add column if not exists deleted_at timestamptz;

create index if not exists idx_fly_variants_pattern_active
  on fly_variants(pattern_id, sort_order)
  where deleted_at is null;
