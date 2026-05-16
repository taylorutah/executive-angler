-- Per-user editable descriptions for the 4 fly_box tiers (kill/support/archive/custom).
-- Stored as a single jsonb so callers can patch one or all in one round-trip.
-- A null/missing key falls back to the app default in BoxesManager.tsx.

alter table profiles
  add column if not exists tier_descriptions jsonb;
