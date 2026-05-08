-- Phase 3: catch logger — active box on each session.
--
-- The "active box" is the fly_box the angler picked at the start of a session.
-- It's the surface the in-session catch logger shows first: a tile grid of
-- the variants in that box, sorted by recency. Tap any tile → catch logged
-- with that variant. Defaults to the user's default box on session create.

begin;

alter table fishing_sessions
  add column if not exists active_box_id uuid references fly_boxes(id) on delete set null;

create index if not exists idx_fishing_sessions_active_box
  on fishing_sessions(active_box_id) where active_box_id is not null;

commit;
