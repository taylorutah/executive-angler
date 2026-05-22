-- =============================================
-- river_fly_pulse — join via fly_pattern_id OR canonical_fly_id
-- 2026-05-22
-- =============================================
-- Issue: catches has TWO FKs into flies — `fly_pattern_id` (added pre-Phase A
-- for personal patterns) and `canonical_fly_id` (added 20260504 for catalog
-- picks). After Phase C both columns reference `flies(id)`, but the web's
-- FlyPicker still routes catalog selections through `canonical_fly_id` only,
-- leaving `fly_pattern_id` NULL on those rows. The prior `river_fly_pulse`
-- joined only via `fly_pattern_id`, so renamed catalog patterns fell back to
-- the stale denormalized `fly_name` snapshot — the same class of bug that
-- prompted the LBP/PTBD fix in 20260522.
--
-- Fix: COALESCE the FK so the join resolves on either column. Live names win
-- whenever a FK exists, regardless of which platform picked the fly.
--
-- Behavior is otherwise identical to 20260522_river_fly_pulse_by_session_date:
-- session-date recency, demo exclusion, top-6 by count, sort ties by recency.

DROP FUNCTION IF EXISTS public.river_fly_pulse(text);

CREATE OR REPLACE FUNCTION public.river_fly_pulse(target_river_id text)
RETURNS TABLE (fly_name text, sizes text[])
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    COALESCE(f.name, c.fly_name) AS fly_name,
    array_agg(DISTINCT c.fly_size) FILTER (WHERE c.fly_size IS NOT NULL) AS sizes
  FROM public.fishing_sessions fs
  JOIN public.catches c ON c.session_id = fs.id
  LEFT JOIN public.flies f
    ON f.id = COALESCE(c.fly_pattern_id, c.canonical_fly_id)
    AND f.deleted_at IS NULL
  WHERE fs.river_id = target_river_id
    AND fs.date >= (CURRENT_DATE - INTERVAL '60 days')
    AND COALESCE(f.name, c.fly_name) IS NOT NULL
    AND fs.is_demo IS NOT TRUE
    AND c.is_demo IS NOT TRUE
  GROUP BY COALESCE(f.name, c.fly_name)
  ORDER BY COUNT(*) DESC, MAX(fs.date) DESC
  LIMIT 6;
$$;

REVOKE ALL ON FUNCTION public.river_fly_pulse(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.river_fly_pulse(text) TO authenticated, anon;

COMMENT ON FUNCTION public.river_fly_pulse(text) IS
  'Returns up to 6 most-used flies on a river in the last 60 days (by session date) as {fly_name, sizes}. Joins flies via fly_pattern_id OR canonical_fly_id so web canonical picks (canonical_fly_id only) and iOS/Android picks (fly_pattern_id only) both surface live names. Falls back to denormalized fly_name when no FK is set. Filters is_demo. SECURITY DEFINER bypasses owner-only RLS on catches.';

-- ROLLBACK
-- See 20260522_river_fly_pulse_by_session_date.sql for previous body.
