-- Moderation v2: Strava-grade reporting + blocking.
--
-- Background:
--   - iOS has been writing to a legacy `content_reports` table (created out-of-band,
--     not in migrations) with columns reporter_id / content_type / target_id / reason.
--   - Blocks have been hacked onto the `follows` table with status='blocked', which
--     violates the follows CHECK constraint and is already partially broken.
--   - Android independently created a `user_blocks` table with blocker_id/blocked_id.
--
-- This migration canonicalizes:
--   1. `content_reports` — fully enumerated reason categories + review workflow fields.
--   2. `user_blocks`     — proper symmetric block table with follow-edge cleanup trigger.
--   3. `is_blocked()`    — helper function for future RLS rewrites (don't rewrite policies
--      this round; just make the primitive available).
--
-- Legacy clients (old iOS builds still in the wild) may continue to write status='blocked'
-- to the follows table — we do NOT alter the follows CHECK constraint here because doing
-- so could mask an App Store review regression. New iOS and web write to user_blocks.
-- The follows CHECK remains ('pending','accepted') and legacy block writes will simply fail
-- the way they have been — the dual-write path in the app layer covers the gap.

-- ─────────────────────────────────────────────────────────────
-- 1. content_reports
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS content_reports (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type     TEXT NOT NULL,  -- 'user' | 'session' | 'comment'
    target_id        UUID NOT NULL,
    reason           TEXT,           -- legacy free-form field, kept for back-compat
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add the new Strava-style columns. IF NOT EXISTS keeps the migration idempotent
-- whether the table was created above or pre-existing from the out-of-band insert path.
ALTER TABLE content_reports
    ADD COLUMN IF NOT EXISTS reason_category TEXT NOT NULL DEFAULT 'other',
    ADD COLUMN IF NOT EXISTS reason_text     TEXT,
    ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS reviewer_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewer_notes  TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_at     TIMESTAMPTZ;

-- Enum-style CHECK constraints. Drop-if-exists guards keep re-runs idempotent.
ALTER TABLE content_reports DROP CONSTRAINT IF EXISTS content_reports_content_type_check;
ALTER TABLE content_reports ADD CONSTRAINT content_reports_content_type_check
    CHECK (content_type IN ('user', 'session', 'comment'));

ALTER TABLE content_reports DROP CONSTRAINT IF EXISTS content_reports_reason_category_check;
ALTER TABLE content_reports ADD CONSTRAINT content_reports_reason_category_check
    CHECK (reason_category IN ('spam', 'harassment', 'inappropriate', 'impersonation', 'off_topic', 'other'));

ALTER TABLE content_reports DROP CONSTRAINT IF EXISTS content_reports_status_check;
ALTER TABLE content_reports ADD CONSTRAINT content_reports_status_check
    CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned'));

CREATE INDEX IF NOT EXISTS idx_content_reports_reporter       ON content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_target         ON content_reports(content_type, target_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status_created ON content_reports(status, created_at DESC);
-- Supports the 24h dedup lookup used by /api/moderation/report.
CREATE INDEX IF NOT EXISTS idx_content_reports_dedup          ON content_reports(reporter_id, content_type, target_id, created_at DESC);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can file reports" ON content_reports;
CREATE POLICY "Users can file reports"
    ON content_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view their own reports" ON content_reports;
CREATE POLICY "Users can view their own reports"
    ON content_reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- No UPDATE / DELETE policies for `authenticated` — only service_role (admin tooling)
-- can mutate existing reports. The reviewer_id / reviewed_at / status columns are filled
-- in by the moderation queue UI using the service-role key.

-- ─────────────────────────────────────────────────────────────
-- 2. user_blocks
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_blocks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (blocker_id, blocked_id),
    CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);

ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own blocks" ON user_blocks;
CREATE POLICY "Users can view their own blocks"
    ON user_blocks FOR SELECT
    USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can create their own blocks" ON user_blocks;
CREATE POLICY "Users can create their own blocks"
    ON user_blocks FOR INSERT
    WITH CHECK (auth.uid() = blocker_id AND blocker_id <> blocked_id);

DROP POLICY IF EXISTS "Users can remove their own blocks" ON user_blocks;
CREATE POLICY "Users can remove their own blocks"
    ON user_blocks FOR DELETE
    USING (auth.uid() = blocker_id);

-- No UPDATE policy — blocks are insert-or-delete only.

-- ─────────────────────────────────────────────────────────────
-- 3. Trigger: on block insert, wipe any follow edges in BOTH directions.
--    Prevents either party from lingering in the other's follower/following list.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION user_blocks_wipe_follows()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM follows
    WHERE (follower_id = NEW.blocker_id AND following_id = NEW.blocked_id)
       OR (follower_id = NEW.blocked_id AND following_id = NEW.blocker_id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_blocks_wipe_follows ON user_blocks;
CREATE TRIGGER trg_user_blocks_wipe_follows
    AFTER INSERT ON user_blocks
    FOR EACH ROW
    EXECUTE FUNCTION user_blocks_wipe_follows();

-- ─────────────────────────────────────────────────────────────
-- 4. is_blocked(viewer, target) helper
--    Returns TRUE if either side has blocked the other. Not wired into any
--    existing RLS policy this round — rewriting feed/profile/comments policies
--    is a follow-up. Provided now so callers can start using it.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_blocked(viewer UUID, target UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_blocks
        WHERE (blocker_id = viewer AND blocked_id = target)
           OR (blocker_id = target AND blocked_id = viewer)
    );
$$;

GRANT EXECUTE ON FUNCTION is_blocked(UUID, UUID) TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────
-- ROLLBACK (run manually if needed)
-- ─────────────────────────────────────────────────────────────
--
-- DROP FUNCTION IF EXISTS is_blocked(UUID, UUID);
-- DROP TRIGGER IF EXISTS trg_user_blocks_wipe_follows ON user_blocks;
-- DROP FUNCTION IF EXISTS user_blocks_wipe_follows();
-- DROP TABLE IF EXISTS user_blocks;
--
-- -- content_reports: strip the v2 columns but keep the legacy table shape so
-- -- old iOS clients keep working.
-- ALTER TABLE content_reports DROP CONSTRAINT IF EXISTS content_reports_content_type_check;
-- ALTER TABLE content_reports DROP CONSTRAINT IF EXISTS content_reports_reason_category_check;
-- ALTER TABLE content_reports DROP CONSTRAINT IF EXISTS content_reports_status_check;
-- ALTER TABLE content_reports
--     DROP COLUMN IF EXISTS reason_category,
--     DROP COLUMN IF EXISTS reason_text,
--     DROP COLUMN IF EXISTS status,
--     DROP COLUMN IF EXISTS reviewer_id,
--     DROP COLUMN IF EXISTS reviewer_notes,
--     DROP COLUMN IF EXISTS reviewed_at;
-- DROP INDEX IF EXISTS idx_content_reports_reporter;
-- DROP INDEX IF EXISTS idx_content_reports_target;
-- DROP INDEX IF EXISTS idx_content_reports_status_created;
-- DROP INDEX IF EXISTS idx_content_reports_dedup;
-- DROP POLICY IF EXISTS "Users can file reports" ON content_reports;
-- DROP POLICY IF EXISTS "Users can view their own reports" ON content_reports;
