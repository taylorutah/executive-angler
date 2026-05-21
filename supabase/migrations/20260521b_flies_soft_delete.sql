-- Soft-delete column on `flies`. Lets users archive their private flies
-- without orphaning catches that reference them via fly_pattern_id.
--
-- Convention (matches the rest of the codebase — see fly_box_entries,
-- fly_patterns, etc.): `deleted_at IS NULL` means active; setting it to
-- now() archives the row. The workspace + detail queries filter out
-- non-null rows so archived flies disappear from the UI.
--
-- iOS contract: additive only. iOS reads continue to work; the iOS app
-- will simply continue returning archived rows until it adds its own
-- filter (low priority — the realtime push will notify it of the
-- update and a refresh will surface the archived state).

ALTER TABLE flies
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Partial index for the hot path: every list query reads
-- `WHERE deleted_at IS NULL`, so make that fast.
CREATE INDEX IF NOT EXISTS flies_active_idx
  ON flies (status, submitted_by_user_id)
  WHERE deleted_at IS NULL;
