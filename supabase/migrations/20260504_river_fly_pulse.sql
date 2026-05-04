-- =============================================
-- River Fly Pulse function — Phase 3 (intel API)
-- 2026-05-04
-- =============================================
-- Public "Recent Fly Choices" aggregator. Returns the 6 most-used flies
-- on a river over the last 60 days as { fly_name, sizes }. Catch counts
-- are used internally to rank but are NEVER returned to callers — that
-- preserves the privacy ethic (no fish counts, no per-fly heatmap).
--
-- Runs as SECURITY DEFINER so it can read across users despite the
-- owner-only RLS on `catches`. The function is the only path that
-- escapes that policy and it leaks nothing beyond fly identifications,
-- which match what fly shops, magazines, and hatch charts already publish.
--
-- Companion to 20260504_privacy_overhaul.sql.

CREATE OR REPLACE FUNCTION public.river_fly_pulse(target_river_id text)
RETURNS TABLE (fly_name text, sizes text[])
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    COALESCE(fp.name, c.fly_name) AS fly_name,
    array_agg(DISTINCT c.fly_size) FILTER (WHERE c.fly_size IS NOT NULL) AS sizes
  FROM public.fishing_sessions fs
  JOIN public.catches c ON c.session_id = fs.id
  LEFT JOIN public.fly_patterns fp ON fp.id = c.fly_pattern_id
  WHERE fs.river_id = target_river_id
    AND c.created_at >= (CURRENT_DATE - INTERVAL '60 days')
    AND COALESCE(fp.name, c.fly_name) IS NOT NULL
  GROUP BY COALESCE(fp.name, c.fly_name)
  ORDER BY COUNT(*) DESC, MAX(c.created_at) DESC
  LIMIT 6;
$$;

REVOKE ALL ON FUNCTION public.river_fly_pulse(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.river_fly_pulse(text) TO authenticated, anon;

COMMENT ON FUNCTION public.river_fly_pulse(text) IS
  'Returns up to 6 most-used flies on a river in the last 60 days as {fly_name, sizes}. Catch counts are internal-only — never returned. SECURITY DEFINER bypasses owner-only RLS on catches; this is the only public path that does so.';

-- ROLLBACK
-- DROP FUNCTION IF EXISTS public.river_fly_pulse(text);
