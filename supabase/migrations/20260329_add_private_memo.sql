-- Add private_memo field to fishing_sessions (like Strava's private notes)
-- This field is always private and never shown on public/shared session views
ALTER TABLE fishing_sessions ADD COLUMN IF NOT EXISTS private_memo text;
