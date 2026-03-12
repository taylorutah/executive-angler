-- Gear items table
CREATE TABLE IF NOT EXISTS gear_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rod','reel','line','leader','tippet','net','waders','other')),
  name TEXT NOT NULL,
  maker TEXT,
  model TEXT,
  specs JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one default per type per user
CREATE UNIQUE INDEX IF NOT EXISTS gear_items_one_default_per_type
  ON gear_items (user_id, type)
  WHERE is_default = true AND is_active = true;

-- RLS
ALTER TABLE gear_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own gear" ON gear_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add gear columns to fishing_sessions
ALTER TABLE fishing_sessions
  ADD COLUMN IF NOT EXISTS gear_rod_id UUID REFERENCES gear_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gear_reel_id UUID REFERENCES gear_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gear_line_id UUID REFERENCES gear_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gear_leader_id UUID REFERENCES gear_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gear_tippet_id UUID REFERENCES gear_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gear_snapshot JSONB DEFAULT '{}';
  -- gear_snapshot stores a point-in-time copy of gear names for display even if gear is deleted

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER update_gear_items_updated_at
  BEFORE UPDATE ON gear_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
