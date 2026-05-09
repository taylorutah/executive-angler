-- Pattern editing — admin RLS + slug-redirect table + storage buckets
--
-- Enables front-end editing of fly_patterns_v2:
--   * owners can already update their own personal patterns (existing
--     fly_patterns_v2_owner_all policy from 20260508_phase2_unified_fly_model.sql)
--   * admins (Taylor) can now update canonical patterns (owner_user_id IS NULL)
--     via a JWT email check
--
-- Adds fly_pattern_redirects so renaming a canonical slug doesn't break old
-- URLs — the [slug] page falls back to this table on miss and 301s to the
-- current slug.
--
-- Adds two storage buckets used by the new pattern edit drawer:
--   pattern-hero-photos  — single hero image per pattern
--   pattern-step-photos  — per-tying-step photos
--
-- Path conventions (match the existing variant-photos bucket so storage
-- RLS stays consistent):
--   <user_id>/<pattern_id>/<photo_id>.<ext>   for owner-edited personal patterns
--   admin/<pattern_id>/<photo_id>.<ext>       for canonical patterns (admin only)

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Admin-can-edit-canonical policies on fly_patterns_v2
-- ────────────────────────────────────────────────────────────────────────────
-- Helper: read admin emails from JWT claim. Same emails as src/lib/admin.ts.
-- We inline rather than reference a function so the policy is self-contained.

drop policy if exists fly_patterns_v2_admin_update on fly_patterns_v2;
create policy fly_patterns_v2_admin_update on fly_patterns_v2
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

drop policy if exists fly_patterns_v2_admin_insert on fly_patterns_v2;
create policy fly_patterns_v2_admin_insert on fly_patterns_v2
  for insert to authenticated
  with check (
    (auth.jwt() ->> 'email') in (
      'taylor@executiveangler.com',
      'taylor.warnick@gmail.com'
    )
  );

drop policy if exists fly_patterns_v2_admin_delete on fly_patterns_v2;
create policy fly_patterns_v2_admin_delete on fly_patterns_v2
  for delete using (
    (auth.jwt() ->> 'email') in (
      'taylor@executiveangler.com',
      'taylor.warnick@gmail.com'
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 2. fly_pattern_redirects — old slug → current pattern_id (for 301s)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists fly_pattern_redirects (
  old_slug text primary key,
  pattern_id uuid not null references fly_patterns_v2(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_fly_pattern_redirects_pattern
  on fly_pattern_redirects(pattern_id);

alter table fly_pattern_redirects enable row level security;

drop policy if exists fly_pattern_redirects_read on fly_pattern_redirects;
create policy fly_pattern_redirects_read on fly_pattern_redirects
  for select using (true);

drop policy if exists fly_pattern_redirects_admin_write on fly_pattern_redirects;
create policy fly_pattern_redirects_admin_write on fly_pattern_redirects
  for insert to authenticated
  with check (
    (auth.jwt() ->> 'email') in (
      'taylor@executiveangler.com',
      'taylor.warnick@gmail.com'
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Storage buckets — pattern-hero-photos, pattern-step-photos
-- ────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pattern-hero-photos',
  'pattern-hero-photos',
  true,
  5242880,  -- 5 MB
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pattern-step-photos',
  'pattern-step-photos',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read on both buckets (matches variant-photos pattern).
drop policy if exists "pattern-hero-photos public read" on storage.objects;
create policy "pattern-hero-photos public read" on storage.objects
  for select using (bucket_id = 'pattern-hero-photos');

drop policy if exists "pattern-step-photos public read" on storage.objects;
create policy "pattern-step-photos public read" on storage.objects
  for select using (bucket_id = 'pattern-step-photos');

-- Owner-write: <user_id>/... subfolders for personal patterns.
drop policy if exists "pattern-hero-photos owner write" on storage.objects;
create policy "pattern-hero-photos owner write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pattern-hero-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "pattern-step-photos owner write" on storage.objects;
create policy "pattern-step-photos owner write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pattern-step-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin write to admin/ prefix (canonical photos) on both buckets.
drop policy if exists "pattern-hero-photos admin write" on storage.objects;
create policy "pattern-hero-photos admin write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pattern-hero-photos'
    and (storage.foldername(name))[1] = 'admin'
    and (auth.jwt() ->> 'email') in (
      'taylor@executiveangler.com',
      'taylor.warnick@gmail.com'
    )
  );

drop policy if exists "pattern-step-photos admin write" on storage.objects;
create policy "pattern-step-photos admin write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pattern-step-photos'
    and (storage.foldername(name))[1] = 'admin'
    and (auth.jwt() ->> 'email') in (
      'taylor@executiveangler.com',
      'taylor.warnick@gmail.com'
    )
  );

-- Owner-update / owner-delete on their own subfolders + admin on admin/.
drop policy if exists "pattern-hero-photos owner update" on storage.objects;
create policy "pattern-hero-photos owner update" on storage.objects
  for update to authenticated using (
    bucket_id = 'pattern-hero-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] = 'admin'
        and (auth.jwt() ->> 'email') in (
          'taylor@executiveangler.com',
          'taylor.warnick@gmail.com'
        )
      )
    )
  );

drop policy if exists "pattern-step-photos owner update" on storage.objects;
create policy "pattern-step-photos owner update" on storage.objects
  for update to authenticated using (
    bucket_id = 'pattern-step-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] = 'admin'
        and (auth.jwt() ->> 'email') in (
          'taylor@executiveangler.com',
          'taylor.warnick@gmail.com'
        )
      )
    )
  );

drop policy if exists "pattern-hero-photos owner delete" on storage.objects;
create policy "pattern-hero-photos owner delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'pattern-hero-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] = 'admin'
        and (auth.jwt() ->> 'email') in (
          'taylor@executiveangler.com',
          'taylor.warnick@gmail.com'
        )
      )
    )
  );

drop policy if exists "pattern-step-photos owner delete" on storage.objects;
create policy "pattern-step-photos owner delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'pattern-step-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or (
        (storage.foldername(name))[1] = 'admin'
        and (auth.jwt() ->> 'email') in (
          'taylor@executiveangler.com',
          'taylor.warnick@gmail.com'
        )
      )
    )
  );

commit;
