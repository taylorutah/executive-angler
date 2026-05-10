-- ═══════════════════════════════════════════════════════
-- FLY PATTERN SUBMISSIONS — user-proposed canonical entries
-- ═══════════════════════════════════════════════════════
--
-- Workflow:
--   * Admin (Taylor) creates a fly via /journal/flies/new → row inserted
--     directly into canonical_flies, no submission row created.
--   * Regular user creates a fly via /journal/flies/new → personal copy
--     inserted into fly_patterns (so it stays in their box) AND a snapshot
--     of the proposed canonical fields is inserted into fly_pattern_submissions
--     with status='pending'.
--   * Admin reviews at /admin/flies/submissions → approves (promote snapshot
--     to canonical_flies, link source pattern via promoted_to_canonical_id)
--     or rejects (status='rejected', admin_notes recorded, source pattern
--     stays in user's box).
--   * Variants graduating to canonical: same submission flow, with
--     parent_canonical_id set so the admin sees the lineage.
--
-- The user's personal fly_patterns row is independent of the submission.
-- They keep using it in their box whether the submission is pending,
-- approved, or rejected.

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. fly_pattern_submissions
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists fly_pattern_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Link back to the user's personal pattern (the "stays in their box" copy).
  -- on delete set null so deleting a personal pattern doesn't blow away the
  -- audit trail of past submissions.
  source_pattern_id uuid references fly_patterns(id) on delete set null,

  -- If this submission is a variant being graduated to canonical, point at
  -- the parent canonical fly. Helps the admin reviewer see lineage.
  parent_canonical_id uuid references canonical_flies(id) on delete set null,

  -- Snapshot of proposed canonical fields (mirrors canonical_flies columns
  -- the admin will copy into the public library on approval).
  name text not null,
  category text,
  tagline text,
  description text,
  history text,
  tying_overview text,
  tying_steps jsonb,
  materials_list jsonb,
  fishing_tips text,
  imitates text[],
  effective_species text[],
  water_types text[],
  sizes text[],
  colors text[],
  bead_options text[],
  hook_styles text[],
  hero_image_url text,
  video_url text,
  origin_credit text,
  notes_to_reviewer text,

  -- Workflow
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'needs_info')),
  admin_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  promoted_canonical_id uuid references canonical_flies(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_fly_pattern_submissions_user
  on fly_pattern_submissions(user_id);
create index if not exists idx_fly_pattern_submissions_status
  on fly_pattern_submissions(status);
create index if not exists idx_fly_pattern_submissions_source
  on fly_pattern_submissions(source_pattern_id);
create index if not exists idx_fly_pattern_submissions_created
  on fly_pattern_submissions(created_at desc);

alter table fly_pattern_submissions enable row level security;

-- Submitter sees their own.
drop policy if exists fly_pattern_submissions_select_own on fly_pattern_submissions;
create policy fly_pattern_submissions_select_own on fly_pattern_submissions
  for select using (auth.uid() = user_id);

-- Submitter can insert their own.
drop policy if exists fly_pattern_submissions_insert_own on fly_pattern_submissions;
create policy fly_pattern_submissions_insert_own on fly_pattern_submissions
  for insert to authenticated
  with check (auth.uid() = user_id);

-- Admin reads all (for the queue page) — JWT email check, same pattern as
-- 20260509_pattern_edit_rls.sql.
drop policy if exists fly_pattern_submissions_admin_select on fly_pattern_submissions;
create policy fly_pattern_submissions_admin_select on fly_pattern_submissions
  for select using (
    (auth.jwt() ->> 'email') in (
      'taylor@executiveangler.com',
      'taylor.warnick@gmail.com'
    )
  );

-- Admin updates (approve / reject / status change). Service role bypasses
-- RLS in API routes, but we keep a JWT policy so an admin's authenticated
-- session can update directly if needed.
drop policy if exists fly_pattern_submissions_admin_update on fly_pattern_submissions;
create policy fly_pattern_submissions_admin_update on fly_pattern_submissions
  for update using (
    (auth.jwt() ->> 'email') in (
      'taylor@executiveangler.com',
      'taylor.warnick@gmail.com'
    )
  )
  with check (
    (auth.jwt() ->> 'email') in (
      'taylor@executiveangler.com',
      'taylor.warnick@gmail.com'
    )
  );

create trigger update_fly_pattern_submissions_updated_at
  before update on fly_pattern_submissions
  for each row execute function update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. fly_patterns.promoted_to_canonical_id — back-link from personal copy
-- ────────────────────────────────────────────────────────────────────────────
-- Lets the user's pattern detail page show "This fly is in the library →"
-- once the submission is approved.

alter table fly_patterns
  add column if not exists promoted_to_canonical_id uuid
    references canonical_flies(id) on delete set null;

create index if not exists idx_fly_patterns_promoted_to_canonical
  on fly_patterns(promoted_to_canonical_id)
  where promoted_to_canonical_id is not null;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. submission_rate_limits — backstop against spam / automation
-- ────────────────────────────────────────────────────────────────────────────
-- Append-only log keyed by (user_id, submission_type, submitted_at).
-- The submission-gate helper inserts on each accepted submission and
-- counts recent rows to enforce per-type caps.

create table if not exists submission_rate_limits (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_type text not null
    check (submission_type in ('fly_pattern', 'photo', 'review', 'material', 'community')),
  ip_hash text,
  submitted_at timestamptz not null default now()
);

create index if not exists idx_submission_rate_limits_user_type
  on submission_rate_limits(user_id, submission_type, submitted_at desc);

create index if not exists idx_submission_rate_limits_ip_type
  on submission_rate_limits(ip_hash, submission_type, submitted_at desc)
  where ip_hash is not null;

-- Service role inserts only; readers go through the gate helper.
alter table submission_rate_limits enable row level security;

drop policy if exists submission_rate_limits_admin_select on submission_rate_limits;
create policy submission_rate_limits_admin_select on submission_rate_limits
  for select using (
    (auth.jwt() ->> 'email') in (
      'taylor@executiveangler.com',
      'taylor.warnick@gmail.com'
    )
  );

commit;
