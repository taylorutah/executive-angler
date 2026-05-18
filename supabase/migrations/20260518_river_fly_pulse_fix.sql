-- =============================================
-- river_fly_pulse — repoint to canonical_flies
-- 2026-05-18
-- =============================================
-- The original 20260504_river_fly_pulse.sql referenced `public.fly_patterns`,
-- a table that no longer exists in this database (it was either dropped or
-- never created on this branch — catches.fly_pattern_id actually FKs to
-- `canonical_flies`). The function has been silently erroring and returning
-- an empty pulse on every river page since deploy.
--
-- Fix: drop the old function and recreate it pointed at `canonical_flies`.
-- Behavior, signature, and privacy guarantees are unchanged.

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
  GROUP BY COALESCE(cf.name, c.fly_name)
  ORDER BY COUNT(*) DESC, MAX(c.created_at) DESC
  LIMIT 6;
$$;

REVOKE ALL ON FUNCTION public.river_fly_pulse(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.river_fly_pulse(text) TO authenticated, anon;

COMMENT ON FUNCTION public.river_fly_pulse(text) IS
  'Returns up to 6 most-used flies on a river in the last 60 days as {fly_name, sizes}. Catch counts are internal-only — never returned. SECURITY DEFINER bypasses owner-only RLS on catches; this is the only public path that does so.';

-- ROLLBACK
-- DROP FUNCTION IF EXISTS public.river_fly_pulse(text);
