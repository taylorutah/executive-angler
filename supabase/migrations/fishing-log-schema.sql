-- =============================================
-- Fishing Log Feature — Database Migration
-- =============================================
-- Run this SQL in Supabase SQL Editor
-- Or execute via: npm run fishing:migrate

-- Add columns to rivers table if they don't exist
ALTER TABLE rivers ADD COLUMN IF NOT EXISTS usgs_gauge_id text;
ALTER TABLE rivers ADD COLUMN IF NOT EXISTS ea_destination_id uuid REFERENCES destinations(id);

-- =============================================
-- Fly Patterns Table
-- =============================================
CREATE TABLE IF NOT EXISTS fly_patterns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text,
  size text,
  hook text,
  materials text,
  notes text,
  notion_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- Fishing Sessions Table
-- =============================================
CREATE TABLE IF NOT EXISTS fishing_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  river_id uuid REFERENCES rivers(id),
  river_name text,
  date date NOT NULL,
  weather text,
  water_temp_f numeric,
  water_clarity text,
  total_fish integer DEFAULT 0,
  notes text,
  flies_notes text,
  tags text[],
  notion_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- Session Rigs Table (Fly Positions)
-- =============================================
CREATE TABLE IF NOT EXISTS session_rigs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES fishing_sessions(id) ON DELETE CASCADE NOT NULL,
  fly_pattern_id uuid REFERENCES fly_patterns(id),
  fly_name text,
  position integer NOT NULL CHECK (position >= 1 AND position <= 5),
  notion_id text,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- Catches Table
-- =============================================
CREATE TABLE IF NOT EXISTS catches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES fishing_sessions(id) ON DELETE CASCADE NOT NULL,
  species text,
  length_inches numeric,
  fly_pattern_id uuid REFERENCES fly_patterns(id),
  fly_name text,
  time time,
  notes text,
  notion_id text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- Fishing Spots Table
-- =============================================
CREATE TABLE IF NOT EXISTS fishing_spots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  river_id uuid REFERENCES rivers(id),
  name text NOT NULL,
  latitude numeric,
  longitude numeric,
  description text,
  notion_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- Angler Profiles Table
-- =============================================
CREATE TABLE IF NOT EXISTS angler_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  home_location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_fly_patterns_notion ON fly_patterns(notion_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON fishing_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_river ON fishing_sessions(river_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON fishing_sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_notion ON fishing_sessions(notion_id);
CREATE INDEX IF NOT EXISTS idx_rigs_session ON session_rigs(session_id);
CREATE INDEX IF NOT EXISTS idx_rigs_fly ON session_rigs(fly_pattern_id);
CREATE INDEX IF NOT EXISTS idx_catches_session ON catches(session_id);
CREATE INDEX IF NOT EXISTS idx_catches_notion ON catches(notion_id);
CREATE INDEX IF NOT EXISTS idx_spots_river ON fishing_spots(river_id);
CREATE INDEX IF NOT EXISTS idx_spots_notion ON fishing_spots(notion_id);

-- =============================================
-- Row Level Security
-- =============================================

-- Fishing Sessions RLS
ALTER TABLE fishing_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON fishing_sessions;
CREATE POLICY "Users can view own sessions" ON fishing_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON fishing_sessions;
CREATE POLICY "Users can insert own sessions" ON fishing_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON fishing_sessions;
CREATE POLICY "Users can update own sessions" ON fishing_sessions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON fishing_sessions;
CREATE POLICY "Users can delete own sessions" ON fishing_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Session Rigs RLS
ALTER TABLE session_rigs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own rigs" ON session_rigs;
CREATE POLICY "Users can view own rigs" ON session_rigs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fishing_sessions
      WHERE fishing_sessions.id = session_rigs.session_id
      AND fishing_sessions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own rigs" ON session_rigs;
CREATE POLICY "Users can insert own rigs" ON session_rigs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM fishing_sessions
      WHERE fishing_sessions.id = session_rigs.session_id
      AND fishing_sessions.user_id = auth.uid()
    )
  );

-- Catches RLS
ALTER TABLE catches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own catches" ON catches;
CREATE POLICY "Users can view own catches" ON catches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fishing_sessions
      WHERE fishing_sessions.id = catches.session_id
      AND fishing_sessions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own catches" ON catches;
CREATE POLICY "Users can insert own catches" ON catches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM fishing_sessions
      WHERE fishing_sessions.id = catches.session_id
      AND fishing_sessions.user_id = auth.uid()
    )
  );

-- Fly Patterns RLS (public read)
ALTER TABLE fly_patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read fly patterns" ON fly_patterns;
CREATE POLICY "Public read fly patterns" ON fly_patterns FOR SELECT USING (true);

-- Fishing Spots RLS (public read)
ALTER TABLE fishing_spots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read fishing spots" ON fishing_spots;
CREATE POLICY "Public read fishing spots" ON fishing_spots FOR SELECT USING (true);

-- Angler Profiles RLS
ALTER TABLE angler_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON angler_profiles;
CREATE POLICY "Users can view own profile" ON angler_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON angler_profiles;
CREATE POLICY "Users can insert own profile" ON angler_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON angler_profiles;
CREATE POLICY "Users can update own profile" ON angler_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- Update Triggers
-- =============================================

DROP TRIGGER IF EXISTS update_fly_patterns_updated_at ON fly_patterns;
CREATE TRIGGER update_fly_patterns_updated_at BEFORE UPDATE ON fly_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fishing_sessions_updated_at ON fishing_sessions;
CREATE TRIGGER update_fishing_sessions_updated_at BEFORE UPDATE ON fishing_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fishing_spots_updated_at ON fishing_spots;
CREATE TRIGGER update_fishing_spots_updated_at BEFORE UPDATE ON fishing_spots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_angler_profiles_updated_at ON angler_profiles;
CREATE TRIGGER update_angler_profiles_updated_at BEFORE UPDATE ON angler_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
