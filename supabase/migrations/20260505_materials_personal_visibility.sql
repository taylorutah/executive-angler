-- =============================================
-- Materials: personal-visibility for unverified submissions
-- 2026-05-05
-- =============================================
-- Submitted materials should be usable immediately by their submitter
-- (visible only to them) until an admin promotes is_verified=true.
-- Anonymous and other users still only see verified materials.

DROP POLICY IF EXISTS "Public can read materials" ON tying_materials;

CREATE POLICY "Public reads verified, submitter reads own pending"
  ON tying_materials FOR SELECT
  USING (
    is_verified = true
    OR submitted_by = auth.uid()
  );

-- Submitter can edit their own pending material (e.g. fix a typo, extend colors[])
-- before it's promoted. Once verified, only admin (service role) can edit.
CREATE POLICY "Submitter can update own unverified materials"
  ON tying_materials FOR UPDATE
  USING (
    submitted_by = auth.uid() AND is_verified = false
  )
  WITH CHECK (
    submitted_by = auth.uid() AND is_verified = false
  );

-- Submitter can also delete their own pending material if they want to retract.
CREATE POLICY "Submitter can delete own unverified materials"
  ON tying_materials FOR DELETE
  USING (
    submitted_by = auth.uid() AND is_verified = false
  );
