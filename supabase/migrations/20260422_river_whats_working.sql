-- River "What's Working" — top flies on a river over a recent window.
--
-- Combines all `public` sessions + the caller's own `private` sessions.
-- We denormalize fly_name + fly_size directly from `catches` (both are
-- already stored on the row, per the 20260313 schema unification), so we
-- don't need to join fly_patterns.
--
-- Returns the top 5 fly/size combos sorted by total catch count.
--
-- Run in Supabase SQL Editor:
--   https://supabase.com/dashboard/project/qlasxtfbodyxbcuchvxz/sql
--
-- SECURITY NOTE: we use SECURITY DEFINER because the RPC's whole purpose is
-- to combine public rows with the caller's private rows in a single query.
-- RLS would otherwise block the public rows at join-time for some callers.
-- We re-assert the privacy filter inside the function body, and we pin
-- `p_user_id` to `auth.uid()` — callers cannot impersonate another user.

CREATE OR REPLACE FUNCTION river_whats_working(
  p_river_id text,
  p_days     integer DEFAULT 7
)
RETURNS TABLE (
  fly_name     text,
  fly_size     text,
  catch_count  bigint,
  session_count bigint,
  last_used_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_cutoff timestamptz := NOW() - (p_days || ' days')::interval;
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(NULLIF(TRIM(c.fly_name), ''), 'Unknown')::text        AS fly_name,
    COALESCE(NULLIF(TRIM(c.fly_size), ''), '')::text               AS fly_size,
    SUM(COALESCE(c.quantities, 1))::bigint                         AS catch_count,
    COUNT(DISTINCT fs.id)::bigint                                  AS session_count,
    MAX(GREATEST(fs.date::timestamptz, c.created_at))::timestamptz AS last_used_at
  FROM catches c
  JOIN fishing_sessions fs ON fs.id = c.session_id
  WHERE fs.river_id = p_river_id
    AND fs.date >= v_cutoff::date
    AND (fs.privacy = 'public' OR fs.user_id = v_user)
    AND NULLIF(TRIM(c.fly_name), '') IS NOT NULL
  GROUP BY 1, 2
  ORDER BY catch_count DESC, session_count DESC
  LIMIT 5;
END;
$$;

REVOKE ALL ON FUNCTION river_whats_working(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION river_whats_working(text, integer) TO authenticated;

COMMENT ON FUNCTION river_whats_working(text, integer) IS
  'Top flies for a river over the last N days. Combines public sessions + the caller''s own private sessions. Returns up to 5 rows sorted by catch_count.';


-- ───────────────────────────────────────────────────────────────────
-- Trip Reports helper — "public sessions at a river, newest first".
-- No schema change — just a convenience RPC the Trip Reports section
-- can call instead of reinventing the query on three platforms.
-- ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION river_trip_reports(
  p_river_id text,
  p_limit    integer DEFAULT 10
)
RETURNS TABLE (
  session_id    uuid,
  user_id       uuid,
  date          date,
  title         text,
  section       text,
  total_fish    integer,
  water_temp_f  numeric,
  weather       text,
  notes         text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    fs.id,
    fs.user_id,
    fs.date,
    fs.title,
    fs.section,
    fs.total_fish,
    fs.water_temp_f,
    fs.weather,
    fs.notes
  FROM fishing_sessions fs
  WHERE fs.river_id = p_river_id
    AND fs.privacy  = 'public'
  ORDER BY fs.date DESC, fs.id DESC
  LIMIT GREATEST(p_limit, 1);
$$;

REVOKE ALL ON FUNCTION river_trip_reports(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION river_trip_reports(text, integer) TO authenticated, anon;

COMMENT ON FUNCTION river_trip_reports(text, integer) IS
  'Public fishing sessions at a river, newest first. Used by the Trip Reports section in the river detail view.';
