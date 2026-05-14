-- Add per-user-pattern state columns to fly_patterns_v2 (is_favorite,
-- is_tie_next, tie_next_status, tie_next_notes, tie_next_target_qty) so
-- /api/fishing/tie-next, /api/fishing/fly-favorites, FlyFavoriteButton,
-- TieNextKanban, and publish.ts can write/read these against v2.
--
-- Context: v2's initial Phase 2 design moved per-user state to
-- fly_variant_stock + user_fly_box, but the existing UI targets the
-- personal-pattern row directly (favorite a pattern, queue a pattern in
-- tie-next). Those write paths kept going to the legacy fly_patterns
-- table — which was then converted to a backward-compat VIEW by
-- 20260514_drop_fly_patterns_table.sql, silently breaking the writes
-- because views don't accept INSERT/UPDATE.
--
-- This migration restores the columns on v2 (the new source of truth)
-- so the code in commit 950193a — which switched the writes to
-- fly_patterns_v2 — works against a real schema. No backfill is
-- possible: the legacy fly_patterns table is already gone (replaced by
-- the view), so any prior favorite/tie-next state on personal patterns
-- can't be recovered.
--
-- Idempotent: every ADD COLUMN is IF NOT EXISTS; the check constraint
-- and indexes are drop-and-recreate so re-runs are safe.

begin;

alter table fly_patterns_v2 add column if not exists is_favorite        boolean not null default false;
alter table fly_patterns_v2 add column if not exists is_tie_next        boolean not null default false;
alter table fly_patterns_v2 add column if not exists tie_next_status    text    not null default 'none';
alter table fly_patterns_v2 add column if not exists tie_next_notes     text;
alter table fly_patterns_v2 add column if not exists tie_next_target_qty integer;
alter table fly_patterns_v2 add column if not exists tie_next_order      integer;

-- Constrain tie_next_status to the same value set as fly_variant_stock /
-- user_fly_box. Drop-and-recreate keeps re-runs idempotent.
alter table fly_patterns_v2 drop constraint if exists fly_patterns_v2_tie_next_status_check;
alter table fly_patterns_v2 add  constraint fly_patterns_v2_tie_next_status_check
  check (tie_next_status in ('none', 'wanted', 'at_vise', 'done'));

create index if not exists idx_fly_patterns_v2_tie_next
  on fly_patterns_v2(owner_user_id, tie_next_status)
  where owner_user_id is not null and tie_next_status <> 'none';

create index if not exists idx_fly_patterns_v2_favorite
  on fly_patterns_v2(owner_user_id)
  where owner_user_id is not null and is_favorite = true;

commit;
