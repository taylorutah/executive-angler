-- Phase 1 foundation: variation lineage, visibility, tie-next status machine,
-- quantity tracking, vise time, tied-fly photo, provenance.
-- Additive only — no drops, no renames.

-- ── Variation lineage ─────────────────────────────────────────────
ALTER TABLE fly_patterns
  ADD COLUMN IF NOT EXISTS parent_pattern_id uuid REFERENCES fly_patterns(id) ON DELETE SET NULL;
ALTER TABLE fly_patterns
  ADD COLUMN IF NOT EXISTS parent_canonical_id uuid REFERENCES canonical_flies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_fly_patterns_parent_pattern ON fly_patterns(parent_pattern_id);
CREATE INDEX IF NOT EXISTS idx_fly_patterns_parent_canonical ON fly_patterns(parent_canonical_id);

-- ── Visibility enum ───────────────────────────────────────────────
-- Coexists with legacy is_public boolean; visibility is the new source of truth.
DO $$ BEGIN
  CREATE TYPE fly_visibility AS ENUM ('private', 'shared', 'public');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE fly_patterns
  ADD COLUMN IF NOT EXISTS visibility fly_visibility DEFAULT 'private';
ALTER TABLE fly_patterns
  ADD COLUMN IF NOT EXISTS shared_with_user_ids uuid[] DEFAULT '{}';

-- Backfill visibility from legacy is_public flag (one-time, idempotent)
UPDATE fly_patterns
  SET visibility = 'public'
  WHERE is_public = true AND visibility = 'private';

-- ── Tie Next state machine ────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE tie_next_status AS ENUM ('none', 'wanted', 'at_vise', 'done');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE fly_patterns
  ADD COLUMN IF NOT EXISTS tie_next_status tie_next_status DEFAULT 'none';
ALTER TABLE fly_patterns
  ADD COLUMN IF NOT EXISTS tie_next_target_qty integer;
ALTER TABLE fly_patterns
  ADD COLUMN IF NOT EXISTS tie_next_notes text;

ALTER TABLE user_fly_box
  ADD COLUMN IF NOT EXISTS tie_next_status tie_next_status DEFAULT 'none';
ALTER TABLE user_fly_box
  ADD COLUMN IF NOT EXISTS tie_next_target_qty integer;
ALTER TABLE user_fly_box
  ADD COLUMN IF NOT EXISTS tie_next_notes text;

-- Backfill tie_next_status from legacy is_tie_next boolean
UPDATE fly_patterns
  SET tie_next_status = 'wanted'
  WHERE is_tie_next = true AND tie_next_status = 'none';

UPDATE user_fly_box
  SET tie_next_status = 'wanted'
  WHERE is_tie_next = true AND tie_next_status = 'none';

-- ── Quantity tracking on fly box ──────────────────────────────────
ALTER TABLE user_fly_box
  ADD COLUMN IF NOT EXISTS quantity_by_size jsonb DEFAULT '{}'::jsonb;
ALTER TABLE user_fly_box
  ADD COLUMN IF NOT EXISTS last_loss_at timestamptz;

-- ── Workbench extras ──────────────────────────────────────────────
ALTER TABLE fly_patterns
  ADD COLUMN IF NOT EXISTS my_tied_fly_photo_url text;
ALTER TABLE fly_patterns
  ADD COLUMN IF NOT EXISTS vise_time_minutes integer DEFAULT 0;
ALTER TABLE fly_patterns
  ADD COLUMN IF NOT EXISTS provenance_credit text;

-- ── Author display flag for public sharing ────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ties_own_flies boolean DEFAULT true;

-- ── RLS: expand fly_patterns SELECT to cover shared + public ──────
-- Keep existing policy names intact; add a new permissive policy for
-- shared/public patterns. Owner policies remain unchanged.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fly_patterns'
      AND policyname = 'fly_patterns_select_visible'
  ) THEN
    CREATE POLICY fly_patterns_select_visible ON fly_patterns
      FOR SELECT
      USING (
        visibility = 'public'
        OR (visibility = 'shared' AND auth.uid() = ANY(shared_with_user_ids))
      );
  END IF;
END $$;

-- ── Helpful indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_fly_patterns_visibility ON fly_patterns(visibility) WHERE visibility <> 'private';
CREATE INDEX IF NOT EXISTS idx_fly_patterns_tie_next_status ON fly_patterns(user_id, tie_next_status) WHERE tie_next_status <> 'none';
CREATE INDEX IF NOT EXISTS idx_user_fly_box_tie_next_status ON user_fly_box(user_id, tie_next_status) WHERE tie_next_status <> 'none';
