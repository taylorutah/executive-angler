-- User Awards table (feature-flagged, hidden by default)
-- Awards still calculate and persist — UI visibility controlled by NEXT_PUBLIC_FEATURE_AWARDS_VISIBLE env var

CREATE TABLE IF NOT EXISTS user_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  award_type text NOT NULL,
  award_key text NOT NULL,
  river_name text,
  river_id text,
  awarded_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, award_key, river_name)
);

CREATE INDEX IF NOT EXISTS idx_user_awards_user ON user_awards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_awards_river ON user_awards(river_name);

-- RLS: users can only see/manage their own awards
ALTER TABLE user_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own awards"
  ON user_awards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert awards"
  ON user_awards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own awards"
  ON user_awards FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_user_awards_updated_at
  BEFORE UPDATE ON user_awards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
