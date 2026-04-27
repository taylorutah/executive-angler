-- Storage RLS for the `fly-pattern-images` bucket.
--
-- Without this policy, only the service role could write to the bucket
-- (the web /api/fishing/flies route bypasses RLS via the service client).
-- The iOS app uploads with the user's session token and was getting
-- HTTP 400 on save because no policy permitted authenticated INSERT.
--
-- Policy mirrors the standard Supabase pattern: a user may read/write
-- objects whose path begins with their own auth.uid(). The iOS upload
-- path is `{userId}/{uuid}.jpg`, so storage.foldername(name)[1] is the
-- user id segment.
--
-- Public reads are unaffected — those go through the bucket's public
-- mode (`/object/public/...`), which is independent of RLS on
-- storage.objects.

CREATE POLICY "Users manage own fly photos"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'fly-pattern-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'fly-pattern-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
