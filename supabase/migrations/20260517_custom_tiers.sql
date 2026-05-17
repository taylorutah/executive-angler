-- Allow user-defined fly_box tiers beyond the original 4 (kill/support/archive/custom).
-- Drops the column CHECK so any text tier slug becomes valid; per-user tier list
-- lives on profiles.tier_definitions (jsonb array of { key, label, description }).

alter table fly_boxes
  drop constraint if exists fly_boxes_tier_check;

alter table profiles
  add column if not exists tier_definitions jsonb;
