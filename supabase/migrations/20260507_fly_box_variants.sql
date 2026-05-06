-- Multi-variant fly box.
--
-- Today user_fly_box enforces "one row per (user, canonical fly)" — fine when
-- a personalization was a single-axis tweak, wrong when an angler carries the
-- same canonical pattern in multiple colorways/sizes/weights (3 olive 18 with
-- 2.0mm bead + 5 black 16 with 3.3mm bead + 2 brown 20). Each of those is a
-- distinct variant the angler maintains, with its own quantity, tie-next
-- state, possibly its own photo and notes.
--
-- The schema otherwise already supports per-variant differentiation: every
-- meaningful column (personalizations, preferred_sizes, preferred_colors,
-- custom_image_url, custom_name, tie_next_*, quantity_by_size, personal_notes)
-- is per-row. Only the unique constraint blocks multi-variant.
--
-- This migration:
--   1. Drops the per-fly unique constraints (canonical + pattern variants).
--   2. Adds variant identity columns (label, is_primary, sort order, tied_count).
--   3. Adds a partial unique index so at most one variant per fly can be
--      marked primary — that's the "default-shown" variant on the canonical
--      page when no ?variant param is set.
--   4. Backfills every existing row to is_primary = true (each was the only
--      variant before, so it stays the default).
--   5. Adds catches.user_fly_box_id so a logged catch can attribute back to
--      the specific variant used (preserving personalization_snapshot for
--      historical immutability).

begin;

-- 1. Drop one-row-per-fly constraints
alter table user_fly_box drop constraint if exists user_fly_box_user_id_canonical_fly_id_key;
alter table user_fly_box drop constraint if exists user_fly_box_user_id_fly_pattern_id_key;

-- 2. Variant identity columns
alter table user_fly_box
  add column if not exists variant_label text,
  add column if not exists is_primary boolean not null default false,
  add column if not exists variant_sort_order integer not null default 0,
  add column if not exists tied_count integer not null default 0;

-- 3. At most one primary per (user, canonical_fly) and per (user, fly_pattern)
create unique index if not exists user_fly_box_one_primary_canonical
  on user_fly_box (user_id, canonical_fly_id)
  where is_primary = true and canonical_fly_id is not null;

create unique index if not exists user_fly_box_one_primary_pattern
  on user_fly_box (user_id, fly_pattern_id)
  where is_primary = true and fly_pattern_id is not null;

-- 4. Backfill existing rows as primary
update user_fly_box set is_primary = true where is_primary = false;

-- 5. Catch ↔ variant link
alter table catches
  add column if not exists user_fly_box_id uuid references user_fly_box(id) on delete set null;

create index if not exists idx_catches_user_fly_box
  on catches(user_fly_box_id)
  where user_fly_box_id is not null;

-- Helpful for the canonical fly page chip strip query
create index if not exists idx_user_fly_box_user_canonical_sort
  on user_fly_box(user_id, canonical_fly_id, is_primary desc, variant_sort_order, added_at);

commit;
