-- 20260511_fly_variants_admin_rls.sql
--
-- Mirrors the admin RLS policies that 20260509_pattern_edit_rls.sql added for
-- fly_patterns_v2, but for fly_variants. Today's `fly_variants_user_write`
-- policy only matches `created_by_user_id = auth.uid()`, which means admins
-- (Taylor) cannot update canonical/curated variants — every save fails at
-- the RLS layer even though the application-level check in
-- src/lib/db/fly-v2.ts:updateVariant() correctly allows admin.
--
-- These policies add an admin bypass for UPDATE, INSERT, and DELETE on
-- fly_variants. Application code still gates "what fields are editable" —
-- this just unblocks the database write.
--
-- Same email list as src/lib/admin.ts. Inlined for self-contained policies.

begin;

drop policy if exists fly_variants_admin_update on fly_variants;
create policy fly_variants_admin_update on fly_variants
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

drop policy if exists fly_variants_admin_insert on fly_variants;
create policy fly_variants_admin_insert on fly_variants
  for insert to authenticated
  with check (
    (auth.jwt() ->> 'email') in (
      'taylor@executiveangler.com',
      'taylor.warnick@gmail.com'
    )
  );

drop policy if exists fly_variants_admin_delete on fly_variants;
create policy fly_variants_admin_delete on fly_variants
  for delete using (
    (auth.jwt() ->> 'email') in (
      'taylor@executiveangler.com',
      'taylor.warnick@gmail.com'
    )
  );

commit;
