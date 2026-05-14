-- Flatten Fly Forks — DATA migration
-- ─────────────────────────────────────────────────────────────────────────────
-- Run AFTER flatten-fly-architecture.sql (which adds the moderation columns
-- and renames forked_from_pattern_id → inspired_by_fly_id).
--
-- What this does:
--   1. Promotes every fork to a standalone canonical (nulls inspired_by_fly_id,
--      confirms status='approved'). No FK on catches or fly_variants is
--      mutated — every catch stays bound to its variant, every variant stays
--      bound to its pattern.
--   2. Refreshes the denormalized catches.fly_name snapshot from the live
--      pattern.name via variant_id → fly_variants.pattern_id → fly_patterns_v2.
--      Old catches stop showing stale strings after the next admin rename.
--   3. Nulls fly_variants.display_name across the board. That column was the
--      last stale-name source the merge scripts wouldn't touch.
--
-- Verification: SELECT counts at the top and bottom show pre/post state so you
-- can eyeball the diff before committing.

\echo
\echo === BEFORE ===
\echo

SELECT
  (SELECT COUNT(*) FROM fly_patterns_v2 WHERE inspired_by_fly_id IS NOT NULL) AS forks_remaining,
  (SELECT COUNT(*) FROM fly_patterns_v2 WHERE status <> 'approved')           AS not_approved,
  (SELECT COUNT(*) FROM fly_variants    WHERE display_name IS NOT NULL)       AS variants_with_display_name,
  (SELECT COUNT(*)
     FROM catches c
     JOIN fly_variants v   ON v.id = c.variant_id
     JOIN fly_patterns_v2 p ON p.id = v.pattern_id
     WHERE c.fly_name IS DISTINCT FROM p.name)                                AS catches_with_stale_fly_name;

-- Per-fork variant + catch counts, captured BEFORE we touch anything. Compare
-- against the post-state report at the bottom — every row should match.
SELECT
  p.id                                                                          AS fork_id,
  p.name,
  p.owner_user_id,
  p.inspired_by_fly_id,
  (SELECT COUNT(*) FROM fly_variants v WHERE v.pattern_id = p.id)               AS variant_count,
  (SELECT COUNT(*) FROM catches c
     JOIN fly_variants v ON v.id = c.variant_id
     WHERE v.pattern_id = p.id)                                                 AS catch_count
FROM fly_patterns_v2 p
WHERE p.inspired_by_fly_id IS NOT NULL
ORDER BY p.name;

BEGIN;

-- 1. Promote forks → standalone canonicals.
UPDATE fly_patterns_v2
   SET inspired_by_fly_id = NULL,
       status             = 'approved'
 WHERE inspired_by_fly_id IS NOT NULL;

-- 2. Refresh denormalized catches.fly_name from the live pattern.name.
--    Only touches rows whose snapshot has drifted from the live name.
UPDATE catches c
   SET fly_name = p.name
  FROM fly_variants v
  JOIN fly_patterns_v2 p ON p.id = v.pattern_id
 WHERE c.variant_id = v.id
   AND c.fly_name IS DISTINCT FROM p.name;

-- 3. Null fly_variants.display_name. Readers fall back to pattern.name — the
--    only source of truth — and renames take effect everywhere immediately.
UPDATE fly_variants
   SET display_name = NULL
 WHERE display_name IS NOT NULL;

COMMIT;

\echo
\echo === AFTER ===
\echo

SELECT
  (SELECT COUNT(*) FROM fly_patterns_v2 WHERE inspired_by_fly_id IS NOT NULL) AS forks_remaining,
  (SELECT COUNT(*) FROM fly_patterns_v2 WHERE status <> 'approved')           AS not_approved,
  (SELECT COUNT(*) FROM fly_variants    WHERE display_name IS NOT NULL)       AS variants_with_display_name,
  (SELECT COUNT(*)
     FROM catches c
     JOIN fly_variants v   ON v.id = c.variant_id
     JOIN fly_patterns_v2 p ON p.id = v.pattern_id
     WHERE c.fly_name IS DISTINCT FROM p.name)                                AS catches_with_stale_fly_name;

-- Linkage check — for each formerly-forked fly, confirm variant + catch counts
-- exactly match what we captured before the UPDATEs. Any drift here means a
-- catch came unbound and we should investigate before continuing.
SELECT
  p.id                                                                          AS former_fork_id,
  p.name,
  p.owner_user_id,
  p.status,
  (SELECT COUNT(*) FROM fly_variants v WHERE v.pattern_id = p.id)               AS variant_count,
  (SELECT COUNT(*) FROM catches c
     JOIN fly_variants v ON v.id = c.variant_id
     WHERE v.pattern_id = p.id)                                                 AS catch_count
FROM fly_patterns_v2 p
WHERE p.owner_user_id IS NOT NULL
ORDER BY p.name;
