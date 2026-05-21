-- =============================================
-- river_fly_pulse — exclude is_demo sessions/catches
-- 2026-05-21
-- =============================================
-- The previous body (20260518_river_fly_pulse_fix.sql) joined fishing_sessions
-- and catches without filtering the is_demo flag added by 20260419. As a
-- result, every new-user onboarding demo session (3 per signup, seeded by
-- /api/onboarding/seed-demo) was being aggregated into the public "Recent
-- Fly Choices" component on /rivers/[slug] — most visibly on Provo River,
-- where the demo session uses Zebra Midge #20/#22 and Black Beauty #22.
--
-- src/lib/demo-sessions.ts documents the contract: "River stats, leaderboards,
-- and awards filter is_demo=false and skip them." This migration enforces
-- that contract for this function. Signature, SECURITY DEFINER, search_path,
-- privileges, and comment are unchanged — predicate-only fix.

DROP FUNCTION IF EXISTS public.river_fly_pulse(text);

CREATE OR REPLACE FUNCTION public.river_fly_pulse(target_river_id text)
RETURNS TABLE (fly_name text, sizes text[])
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    COALESCE(cf.name, c.fly_name) AS fly_name,
    array_agg(DISTINCT c.fly_size) FILTER (WHERE c.fly_size IS NOT NULL) AS sizes
  FROM public.fishing_sessions fs
  JOIN public.catches c ON c.session_id = fs.id
  LEFT JOIN public.canonical_flies cf ON cf.id = c.fly_pattern_id
  WHERE fs.river_id = target_river_id
    AND c.created_at >= (CURRENT_DATE - INTERVAL '60 days')
    AND COALESCE(cf.name, c.fly_name) IS NOT NULL
    AND fs.is_demo IS NOT TRUE
    AND c.is_demo IS NOT TRUE
  GROUP BY COALESCE(cf.name, c.fly_name)
  ORDER BY COUNT(*) DESC, MAX(c.created_at) DESC
  LIMIT 6;
$$;

REVOKE ALL ON FUNCTION public.river_fly_pulse(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.river_fly_pulse(text) TO authenticated, anon;

COMMENT ON FUNCTION public.river_fly_pulse(text) IS
  'Returns up to 6 most-used flies on a river in the last 60 days as {fly_name, sizes}. Filters is_demo rows so onboarding sample data never appears here. Catch counts are internal-only — never returned. SECURITY DEFINER bypasses owner-only RLS on catches; this is the only public path that does so.';

-- ROLLBACK
-- See 20260518_river_fly_pulse_fix.sql for the previous body.
