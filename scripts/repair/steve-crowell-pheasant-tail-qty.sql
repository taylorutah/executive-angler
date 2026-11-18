-- Repair: @trout_guy (Steve Crowell) Pheasant Tail variant bought_count doubled after
-- remove-from-box + re-add. Run only with Taylor's approval (Hal).
-- Idempotent: sets bought_count to 2 when it was erroneously above 2.

-- Preview affected user + configurations
SELECT
  p.id AS user_id,
  p.username,
  ufc.id AS configuration_id,
  f.name AS fly_name,
  ufc.size,
  ufc.nickname,
  ufc.tied_count,
  ufc.bought_count,
  ufc.target_count,
  ufc.updated_at
FROM profiles p
JOIN user_fly_configurations ufc ON ufc.user_id = p.id
JOIN flies f ON f.id = ufc.fly_id
WHERE lower(p.username) = 'trout_guy'
  AND f.name ILIKE '%pheasant tail%'
ORDER BY ufc.updated_at DESC;

BEGIN;

UPDATE user_fly_configurations ufc
SET
  bought_count = 2,
  updated_at = now()
FROM profiles p,
     flies f
WHERE ufc.user_id = p.id
  AND f.id = ufc.fly_id
  AND lower(p.username) = 'trout_guy'
  AND f.name ILIKE '%pheasant tail%'
  AND ufc.bought_count > 2;

COMMIT;

-- Verification
SELECT
  p.username,
  f.name AS fly_name,
  ufc.id AS configuration_id,
  ufc.size,
  ufc.nickname,
  ufc.tied_count,
  ufc.bought_count,
  (SELECT count(*) FROM fly_box_entries_v3 e WHERE e.configuration_id = ufc.id) AS box_memberships
FROM profiles p
JOIN user_fly_configurations ufc ON ufc.user_id = p.id
JOIN flies f ON f.id = ufc.fly_id
WHERE lower(p.username) = 'trout_guy'
  AND f.name ILIKE '%pheasant tail%'
ORDER BY ufc.updated_at DESC;
