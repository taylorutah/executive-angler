-- Phase 2: variant-photos storage bucket
--
-- Creates the storage bucket for fly variant photos uploaded via the
-- workbench/box UI (web drag-drop and mobile camera/picker).
-- See migration 20260508_phase2_unified_fly_model.sql for the
-- fly_variant_photos table that references storage paths in this bucket.
--
-- Bucket policy: public read (so canonical variant photos render without
-- signed URLs), authenticated write to user-owned subfolders only.
-- Subfolder convention: <user_uuid>/<variant_uuid>/<photo_uuid>.<ext>
--
-- Applied 2026-05-08.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'variant-photos',
  'variant-photos',
  true,
  10485760,  -- 10 MB
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "variant-photos public read" on storage.objects;
create policy "variant-photos public read" on storage.objects
  for select using (bucket_id = 'variant-photos');

drop policy if exists "variant-photos owner write" on storage.objects;
create policy "variant-photos owner write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'variant-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "variant-photos owner update" on storage.objects;
create policy "variant-photos owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'variant-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "variant-photos owner delete" on storage.objects;
create policy "variant-photos owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'variant-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
