-- Add fly_pattern to community_submissions entity_type constraint
ALTER TABLE community_submissions DROP CONSTRAINT IF EXISTS community_submissions_entity_type_check;
ALTER TABLE community_submissions ADD CONSTRAINT community_submissions_entity_type_check
  CHECK (entity_type IN ('river', 'fly_shop', 'guide', 'lodge', 'destination', 'species', 'feedback', 'fly_pattern'));
