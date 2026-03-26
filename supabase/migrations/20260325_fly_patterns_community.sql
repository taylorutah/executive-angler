-- Add columns to fly_patterns for community contribution flow
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS flag_reason text;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS imitates text[];
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS effective_species text[];
