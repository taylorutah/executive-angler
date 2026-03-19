-- =============================================
-- Schema Unification Migration — 2026-03-18
-- =============================================
-- Aligns iOS and Web schemas to use identical
-- table structures and column names.
-- All statements are idempotent (IF NOT EXISTS).
-- =============================================

-- ─────────────────────────────────────────────
-- 1. CATCHES — add columns iOS writes
-- ─────────────────────────────────────────────
ALTER TABLE catches ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE catches ADD COLUMN IF NOT EXISTS fly_size text;
ALTER TABLE catches ADD COLUMN IF NOT EXISTS bead_size text;
ALTER TABLE catches ADD COLUMN IF NOT EXISTS fly_position text;
ALTER TABLE catches ADD COLUMN IF NOT EXISTS time_caught text;
ALTER TABLE catches ADD COLUMN IF NOT EXISTS quantities integer DEFAULT 1;
ALTER TABLE catches ADD COLUMN IF NOT EXISTS catch_note text;
ALTER TABLE catches ADD COLUMN IF NOT EXISTS catch_tags text[];
ALTER TABLE catches ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE catches ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE catches ADD COLUMN IF NOT EXISTS fish_image_url text;
ALTER TABLE catches ADD COLUMN IF NOT EXISTS fish_location_image_url text;
ALTER TABLE catches ADD COLUMN IF NOT EXISTS fly_image_url text;
ALTER TABLE catches ADD COLUMN IF NOT EXISTS photo_urls text[];

-- Index for user-level catch queries (biggest catch, etc.)
CREATE INDEX IF NOT EXISTS idx_catches_user ON catches(user_id);
CREATE INDEX IF NOT EXISTS idx_catches_species ON catches(species);

-- ─────────────────────────────────────────────
-- 2. FISHING_SESSIONS — add columns iOS writes
-- ─────────────────────────────────────────────
ALTER TABLE fishing_sessions ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE fishing_sessions ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE fishing_sessions ADD COLUMN IF NOT EXISTS route_points jsonb;
ALTER TABLE fishing_sessions ADD COLUMN IF NOT EXISTS privacy text DEFAULT 'private';
ALTER TABLE fishing_sessions ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE fishing_sessions ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE fishing_sessions ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE fishing_sessions ADD COLUMN IF NOT EXISTS trip_tags text[];

-- Index for public feed queries
CREATE INDEX IF NOT EXISTS idx_sessions_privacy ON fishing_sessions(privacy);

-- ─────────────────────────────────────────────
-- 3. PROFILES — canonical profile table
-- ─────────────────────────────────────────────
-- iOS already uses this table. Ensure it exists
-- with the full superset of fields.
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  username text UNIQUE,
  bio text,
  avatar_url text,
  is_private boolean DEFAULT false,
  home_location text,
  home_state text,
  experience_level text,
  feed_display text DEFAULT 'collage',
  total_sessions integer DEFAULT 0,
  total_fish integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add columns that may not exist if table was created earlier
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_location text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_state text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_level text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS feed_display text DEFAULT 'collage';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_sessions integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_fish integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- ─────────────────────────────────────────────
-- 4. PROFILES — RLS
-- ─────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view non-private profiles
DROP POLICY IF EXISTS "Public can view non-private profiles" ON profiles;
CREATE POLICY "Public can view non-private profiles" ON profiles
  FOR SELECT USING (is_private = false OR auth.uid() = user_id);

-- Users manage their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────
-- 5. FISHING_SESSIONS — updated RLS for social
-- ─────────────────────────────────────────────
-- Users can view own sessions + public sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON fishing_sessions;
CREATE POLICY "Users can view own sessions" ON fishing_sessions
  FOR SELECT USING (auth.uid() = user_id OR privacy = 'public');

-- ─────────────────────────────────────────────
-- 6. CATCHES — updated RLS for social
-- ─────────────────────────────────────────────
-- Users can view catches from own sessions + public sessions
DROP POLICY IF EXISTS "Users can view own catches" ON catches;
CREATE POLICY "Users can view own catches" ON catches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fishing_sessions
      WHERE fishing_sessions.id = catches.session_id
      AND (fishing_sessions.user_id = auth.uid() OR fishing_sessions.privacy = 'public')
    )
  );

-- Users can update own catches
DROP POLICY IF EXISTS "Users can update own catches" ON catches;
CREATE POLICY "Users can update own catches" ON catches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM fishing_sessions
      WHERE fishing_sessions.id = catches.session_id
      AND fishing_sessions.user_id = auth.uid()
    )
  );

-- Users can delete own catches
DROP POLICY IF EXISTS "Users can delete own catches" ON catches;
CREATE POLICY "Users can delete own catches" ON catches
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM fishing_sessions
      WHERE fishing_sessions.id = catches.session_id
      AND fishing_sessions.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- 7. MIGRATE existing profile data into profiles
-- ─────────────────────────────────────────────
-- Copy angler_profiles data that doesn't already exist in profiles
INSERT INTO profiles (user_id, display_name, home_location, created_at, updated_at)
SELECT ap.user_id, ap.display_name, ap.home_location, ap.created_at, ap.updated_at
FROM angler_profiles ap
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = ap.user_id)
ON CONFLICT (user_id) DO NOTHING;

-- Merge user_profiles data (avatar, home_state, experience_level)
UPDATE profiles p
SET
  avatar_url = COALESCE(p.avatar_url, up.avatar_url),
  home_state = COALESCE(p.home_state, up.home_state),
  experience_level = COALESCE(p.experience_level, up.experience_level)
FROM user_profiles up
WHERE p.user_id = up.user_id
  AND (p.avatar_url IS NULL OR p.home_state IS NULL OR p.experience_level IS NULL);

-- ─────────────────────────────────────────────
-- 8. Update river_activity_stats view
-- ─────────────────────────────────────────────
-- Recreate view to include new columns
DROP VIEW IF EXISTS river_activity_stats;
CREATE VIEW river_activity_stats AS
SELECT
  fs.river_id,
  fs.river_name,
  COUNT(DISTINCT fs.id) AS total_sessions,
  COUNT(DISTINCT fs.id) FILTER (WHERE fs.date >= CURRENT_DATE - INTERVAL '30 days') AS sessions_last_30d,
  COUNT(DISTINCT fs.id) FILTER (WHERE fs.date >= CURRENT_DATE - INTERVAL '7 days') AS sessions_last_7d,
  COALESCE(SUM(fs.total_fish), 0) AS total_fish_recorded,
  ROUND(AVG(fs.total_fish) FILTER (WHERE fs.total_fish > 0), 1) AS avg_fish_per_session,
  COUNT(c.id) AS total_catches,
  MAX(fs.date) AS last_session_date,
  MAX(fs.water_temp_f) FILTER (WHERE fs.date >= CURRENT_DATE - INTERVAL '7 days') AS recent_water_temp,
  MODE() WITHIN GROUP (ORDER BY fs.water_clarity) FILTER (WHERE fs.date >= CURRENT_DATE - INTERVAL '30 days') AS recent_water_clarity
FROM fishing_sessions fs
LEFT JOIN catches c ON c.session_id = fs.id
WHERE fs.privacy = 'public'
  AND fs.river_id IS NOT NULL
GROUP BY fs.river_id, fs.river_name;
