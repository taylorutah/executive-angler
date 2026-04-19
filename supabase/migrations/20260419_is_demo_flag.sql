-- 20260419_is_demo_flag.sql
-- ============================================================================
-- Add is_demo flag to fishing_sessions + catches so onboarding sample data
-- can be visible in a user's personal journal/dashboard but excluded from
-- every cross-user aggregation (river stats, leaderboards, public feeds,
-- analytics). Private-default on sessions already keeps demo data out of
-- privacy='public' feeds; this flag covers the aggregation paths that
-- don't filter on privacy.
-- ============================================================================

ALTER TABLE fishing_sessions
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

ALTER TABLE catches
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

-- Partial indexes: the vast majority of rows will have is_demo=false,
-- so a partial index on the demo rows (used only when querying demos
-- or filtering them out explicitly) is cheap and keeps the hot path fast.
CREATE INDEX IF NOT EXISTS idx_sessions_is_demo
  ON fishing_sessions (user_id)
  WHERE is_demo = true;

CREATE INDEX IF NOT EXISTS idx_catches_is_demo
  ON catches (session_id)
  WHERE is_demo = true;

COMMENT ON COLUMN fishing_sessions.is_demo IS
  'True for onboarding sample sessions seeded at signup. Personal views show them; all cross-user aggregates (river stats, awards, feeds) must filter is_demo=false.';

COMMENT ON COLUMN catches.is_demo IS
  'True for catches inside demo sessions. Mirrors fishing_sessions.is_demo for cheap filtering without a join.';
