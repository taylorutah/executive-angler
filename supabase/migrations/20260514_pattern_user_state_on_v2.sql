-- Add per-user-pattern state columns to fly_patterns_v2 (is_favorite,
-- is_tie_next, tie_next_status, tie_next_notes, tie_next_target_qty) so
-- the legacy fly_patterns.* writes from /api/fishing/tie-next,
-- /api/fishing/fly-favorites, and publish.ts can be migrated to v2.
--
-- These columns were on the legacy fly_patterns table; v2 didn't carry
-- them forward because the Phase 2 architecture initially put per-user
-- state on fly_variant_stock + user_fly_box. But the existing UI
-- (FlyFavoriteButton, TieNextKanban) targets the personal pattern row
-- directly, so we keep that surface and put the columns back on v2.
--
-- After this runs, the 20260514_drop_fly_patterns_table.sql VIEW
-- definition is updated separately so the compat layer continues to
-- expose these fields.
--
-- Idempotent: every ADD COLUMN is IF NOT EXISTS, backfill is upsert-by-
-- key with WHERE clauses that no-op on re-run.

begin;

alter table fly_patterns_v2 add column if not exists is_favorite        boolean not null default false;
alter table fly_patterns_v2 add column if not exists is_tie_next        boolean not null default false;
alter table fly_patterns_v2 add column if not exists tie_next_status    text    not null default 'none';
alter table fly_patterns_v2 add column if not exists tie_next_notes     text;
alter table fly_patterns_v2 add column if not exists tie_next_target_qty integer;
alter table fly_patterns_v2 add column if not exists tie_next_order      integer;

-- Constrain tie_next_status to the same value set as fly_variant_stock /
-- user_fly_box. Drop-and-recreate so re-runs against a stricter check stay
-- idempotent.
alter table fly_patterns_v2 drop constraint if exists fly_patterns_v2_tie_next_status_check;
alter table fly_patterns_v2 add  constraint fly_patterns_v2_tie_next_status_check
  check (tie_next_status in ('none', 'wanted', 'at_vise', 'done'));

-- Backfill from legacy fly_patterns where IDs match. Phase 2
-- (20260508_phase2_user_data_backfill.sql) mirrored personal patterns
-- into v2 preserving IDs, so the join is straightforward. Canonical
-- patterns (owner_user_id IS NULL) never had per-user state, so they're
-- left at defaults.
--
-- Guarded so re-running doesn't trample subsequent app writes: only
-- copies values when the v2 row is still at the default state.
update fly_patterns_v2 pv
   set is_favorite         = coalesce(fp.is_favorite, false),
       is_tie_next         = coalesce(fp.is_tie_next, false),
       tie_next_status     = coalesce(nullif(fp.tie_next_status, ''), 'none'),
       tie_next_notes      = fp.tie_next_notes,
       tie_next_target_qty = fp.tie_next_target_qty,
       tie_next_order      = fp.tie_next_order
  from fly_patterns fp
 where fp.id = pv.id
   and pv.owner_user_id is not null
   and pv.is_favorite is false
   and pv.is_tie_next is false
   and pv.tie_next_status = 'none';

create index if not exists idx_fly_patterns_v2_tie_next
  on fly_patterns_v2(owner_user_id, tie_next_status)
  where owner_user_id is not null and tie_next_status <> 'none';

create index if not exists idx_fly_patterns_v2_favorite
  on fly_patterns_v2(owner_user_id)
  where owner_user_id is not null and is_favorite = true;

commit;
