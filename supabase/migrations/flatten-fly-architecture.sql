-- Flatten Fly Architecture
-- ─────────────────────────────────────────────────────────────────────────────
-- Drops the fork/parent layer from fly_patterns_v2 in favor of "every fly is
-- its own canonical." Each row becomes a first-class fly with moderation
-- status. fly_variants stays as the per-size/per-bead recipe table; only the
-- parent-of-a-fly relationship goes away.
--
-- Why: renames currently have to cascade across canonical_flies + fly_patterns
-- + fly_patterns_v2 + fly_variants.display_name + catches.fly_name, and the
-- merge scripts only touch a subset, so names drift between web BoxDetail,
-- web catalog, and iOS picker. With this flatter model a rename is a single
-- UPDATE plus a snapshot refresh.
--
-- Linkage preservation: this migration touches NO `catches.*_id` column and
-- NO `fly_variants.pattern_id`. Every catch stays linked to its variant; every
-- variant stays linked to its pattern. Only the "this pattern is a fork of
-- that pattern" attribution is dropped.
--
-- Reader cleanup (FlyPickerSheet fork-resolution, BoxDetailClient legacy join)
-- happens in follow-up changes once this lands.

BEGIN;

-- 1. Moderation columns. status defaults to 'approved' per shipping decision;
--    moderation UI can flip new submissions to 'pending' later.
ALTER TABLE fly_patterns_v2
  ADD COLUMN IF NOT EXISTS status               text         NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS submitted_by_user_id uuid         REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_by_user_id  uuid         REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at          timestamptz;

-- Constrain status to known values. Keeps anything unexpected out of the
-- catalog filter at the DB layer.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fly_patterns_v2_status_check'
  ) THEN
    ALTER TABLE fly_patterns_v2
      ADD CONSTRAINT fly_patterns_v2_status_check
      CHECK (status IN ('approved', 'pending', 'rejected', 'private'));
  END IF;
END $$;

-- Catalog reads filter by status — index pays off immediately.
CREATE INDEX IF NOT EXISTS idx_fly_patterns_v2_status ON fly_patterns_v2(status);

-- 2. Backfill submitted_by from existing owner_user_id (so we know who
--    contributed each personal-fork row even after it becomes standalone).
--    Canonical rows stay null (owner_user_id was already null for those).
UPDATE fly_patterns_v2
SET submitted_by_user_id = owner_user_id
WHERE submitted_by_user_id IS NULL
  AND owner_user_id IS NOT NULL;

-- 3. Rename forked_from_pattern_id → inspired_by_fly_id. Same column, kept as
--    optional attribution metadata. NOT a parent reference, NOT used by any
--    reader after the cleanup pass.
ALTER TABLE fly_patterns_v2
  RENAME COLUMN forked_from_pattern_id TO inspired_by_fly_id;

-- 4. promoted_to_canonical_id is now meaningless (every fly is canonical) but
--    7 web call sites still SELECT or filter on it — dropping it here would
--    400 those endpoints. Leave the column in place for now; a follow-up
--    migration drops it after the web readers are cleaned up.
--    Marked deprecated via column comment so it's not used in new code.
COMMENT ON COLUMN fly_patterns_v2.promoted_to_canonical_id IS
  'DEPRECATED: pre-flatten parent reference. Always NULL on new rows. Web call sites still reference this; do not use in new code. Drop in follow-up migration after web cleanup.';

-- 5. Document the new ownership model on the table itself.
COMMENT ON TABLE fly_patterns_v2 IS
  'Flies. Each row is a first-class canonical fly. fly_variants holds the per-size/per-bead recipes; box memberships and catches link through variant_id. status gates catalog visibility; inspired_by_fly_id is optional attribution only — no parent-of-a-fly inheritance.';
COMMENT ON COLUMN fly_patterns_v2.status IS
  '''approved'' = in the public catalog; ''pending'' = user submission awaiting admin review; ''rejected'' = denied by admin; ''private'' = owner-only, never in catalog.';
COMMENT ON COLUMN fly_patterns_v2.inspired_by_fly_id IS
  'Optional attribution to a fly this one was based on. NOT a parent reference — readers must not resolve display name through this column.';

COMMIT;
