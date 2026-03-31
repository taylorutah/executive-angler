-- Add "Tie Next" queue column to user_fly_box and fly_patterns
ALTER TABLE user_fly_box
  ADD COLUMN IF NOT EXISTS is_tie_next boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tie_next_order integer;

ALTER TABLE fly_patterns
  ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_tie_next boolean DEFAULT false;
