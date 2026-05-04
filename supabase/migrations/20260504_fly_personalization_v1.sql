-- Fly personalization + contribution attribution + catch FK unification.
--
-- Three coordinated changes for the single fly-identity model:
--
-- 1. Attribution: canonical_flies.contributed_by_user_id links a published
--    fly back to the angler who submitted it. fly_patterns.promoted_to_canonical_id
--    soft-deletes a personal pattern when it gets promoted to library
--    canonical (preserving its row so old URLs can redirect).
--
-- 2. Personalization: user_fly_box.personalizations stores the angler's
--    per-slot recipe choices (hook brand, bead size+color, thread color,
--    body material) keyed by the canonical's materials_list slot names.
--    Renders missing keys as canonical defaults — graceful when canonical
--    adds new slots later.
--
-- 3. Catch FK: catches.canonical_fly_id makes the catches table support
--    EITHER a canonical reference OR a personal pattern reference. The
--    UI typeahead unifies them; stats roll up correctly. catches
--    .personalization_snapshot freezes the angler's recipe at catch time
--    so historical entries don't drift if they later edit their preferences.

begin;

-- 1. Attribution
alter table canonical_flies
  add column if not exists contributed_by_user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_canonical_flies_contributed_by
  on canonical_flies(contributed_by_user_id)
  where contributed_by_user_id is not null;

alter table fly_patterns
  add column if not exists promoted_to_canonical_id uuid references canonical_flies(id) on delete set null;

create index if not exists idx_fly_patterns_promoted_to
  on fly_patterns(promoted_to_canonical_id)
  where promoted_to_canonical_id is not null;

-- 2. Personalization
alter table user_fly_box
  add column if not exists personalizations jsonb not null default '{}'::jsonb;

-- 3. Catch FK + snapshot
alter table catches
  add column if not exists canonical_fly_id uuid references canonical_flies(id) on delete set null,
  add column if not exists personalization_snapshot jsonb;

create index if not exists idx_catches_canonical_fly
  on catches(canonical_fly_id)
  where canonical_fly_id is not null;

-- Sanity: a catch should reference at most one fly source. Enforce in
-- application code rather than a CHECK constraint so existing rows with
-- both null aren't blocked.

commit;
