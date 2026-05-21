-- Required by the soft-delete flow. The flies table previously had
-- only INSERT + SELECT policies, so the API's UPDATE … SET deleted_at = …
-- was silently denied by RLS (0 rows affected, no error). Owners need
-- UPDATE permission on their own private/pending flies for the
-- DeleteFlyButton to work, and for any future owner-side edits
-- (rename, swap materials, etc.).
--
-- Approved canonicals stay locked to admins — the API routes those
-- through the service-role client so this user-scoped policy doesn't
-- apply there.

DROP POLICY IF EXISTS flies_update_own_private ON public.flies;

CREATE POLICY flies_update_own_private
  ON public.flies
  FOR UPDATE
  USING (
    auth.uid() = submitted_by_user_id
    AND status IN ('private', 'pending')
  )
  WITH CHECK (
    auth.uid() = submitted_by_user_id
    AND status IN ('private', 'pending')
  );
