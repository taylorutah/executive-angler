-- =============================================
-- Add missing columns to fly_patterns
-- These were referenced by the UI/API but never in the schema
-- =============================================

ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS bead_size text;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS bead_color text;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS fly_color text;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS tags text[];

CREATE INDEX IF NOT EXISTS idx_fly_patterns_user ON fly_patterns(user_id);

-- RLS: users can only manage their own fly patterns
DROP POLICY IF EXISTS "Users manage own fly patterns" ON fly_patterns;
CREATE POLICY "Users manage own fly patterns" ON fly_patterns
  FOR ALL USING (auth.uid() = user_id);
