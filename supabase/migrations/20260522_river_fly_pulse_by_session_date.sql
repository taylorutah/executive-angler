-- =============================================
-- river_fly_pulse — filter by session date, join unified flies
-- 2026-05-22
-- =============================================
-- Two bugs in 20260521e_river_fly_pulse_exclude_demo.sql:
--
-- 1. Recency filter used `c.created_at` (when the row landed in Supabase),
--    not `fs.date` (when the fish was actually caught). When a user imports
--    a backlog of historical sessions, every catch gets `created_at = <import
--    time>` — so a "Last 60 days" pulse surfaces flies from 2019 sessions
--    imported last month. On Provo, every imported Walt's Worm / Jack
--    Daniels / GTI Caddis entry from 2019–2024 was bubbling up alongside
--    the user's actual recent catches. The label on the UI is "Last 60
--    days" and is meant as a real-time hatch signal, so it must filter on
--    when the fishing happened.
--
-- 2. The join was to `canonical_flies`, which only holds the catalog subset
--    (~162 rows). Personal patterns live in `flies` (213 rows) — see the
--    Phase A schema unification in CLAUDE.md / MEMORY.md. catches.fly_pattern_id
--    references `flies.id`, not `canonical_flies.id`. So a freshly renamed
--    personal pattern (e.g. "Lite Brite Perdigon" → "PTBD") couldn't surface
--    its current name; we'd fall through to the stale denormalized fly_name
--    snapshot or drop the catch entirely.
--
-- Fix: join `flies` (unified, post Phase A) and filter on `fs.date`.
-- Signature, SECURITY DEFINER, search_path, grants, and comment unchanged.

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
    ON f.id = c.fly_pattern_id
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
  'Returns up to 6 most-used flies on a river in the last 60 days (by session date) as {fly_name, sizes}. Joins flies (unified post-Phase-A) for live names; falls back to denormalized fly_name. Filters is_demo rows. Catch counts are internal-only — never returned. SECURITY DEFINER bypasses owner-only RLS on catches; this is the only public path that does so.';

-- ROLLBACK
-- See 20260521e_river_fly_pulse_exclude_demo.sql for the previous body.
