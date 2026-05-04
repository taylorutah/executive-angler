-- =============================================
-- Privacy Overhaul — Phase 1 (DB foundation)
-- 2026-05-04
-- =============================================
-- Enforces "private by default" model across Web/iOS/Android.
--
-- Changes
--   1. fishing_sessions gets `broadcast_presence boolean DEFAULT false`.
--      Existing rows force-set to false (one-time privacy reset). Field
--      semantics: true means "show me on the presence feed (river + section
--      + weather only)". It NEVER controls catch/coord/note visibility.
--
--   2. Sessions RLS → OWNER ONLY for direct table SELECT. Non-owners can
--      no longer read other users' session rows directly. Public presence
--      is exposed exclusively via the `session_presence` view below.
--
--   3. Catches RLS → OWNER ONLY. Catch data (species, length, fly, GPS,
--      photo, notes) is now strictly private to the owner regardless of
--      the parent session's broadcast flag.
--
--   4. New view `session_presence` — projects only safe columns
--      (river_name, section, weather, profile) WHERE broadcast_presence
--      = true AND owner profile is not 'private'. NEVER exposes lat/lng,
--      total_fish, water_temp_f, water_clarity, notes, flies_notes,
--      route_points, title, location, tags, trip_tags. Runs as view
--      owner so it bypasses the new owner-only RLS on fishing_sessions.
--
--   5. `river_activity_stats` view re-pointed at `broadcast_presence`.
--      After backfill all rows are false, so the view returns empty
--      aggregates for every river (graceful empty state). Phase 3 drops
--      the view and the remaining client surfaces that consume it.
--
-- The legacy `privacy text` column stays for now so old iOS/Android
-- clients that write `privacy='public'` keep working at the write layer
-- (the writes simply have no effect on visibility now). It's dropped in
-- a Phase 6 cleanup migration after mobile clients ship the new toggle.

-- ─────────────────────────────────────────────
-- 1. broadcast_presence column + reset backfill
-- ─────────────────────────────────────────────

ALTER TABLE public.fishing_sessions
  ADD COLUMN IF NOT EXISTS broadcast_presence boolean NOT NULL DEFAULT false;

-- Defensive: force every existing row to false. Covers re-runs and the
-- case where the column already existed with stale values.
UPDATE public.fishing_sessions SET broadcast_presence = false;

-- Partial index — only the (small) set of opted-in rows. Speeds up the
-- feed and river-presence aggregates without bloating writes.
CREATE INDEX IF NOT EXISTS idx_sessions_broadcast_presence
  ON public.fishing_sessions (created_at DESC)
  WHERE broadcast_presence = true;

COMMENT ON COLUMN public.fishing_sessions.broadcast_presence IS
  'Opt-in: appear on the presence feed with river+section+weather only. NEVER governs visibility of total_fish, coords, notes, or catches — those are owner-only.';

-- ─────────────────────────────────────────────
-- 2. fishing_sessions RLS — OWNER ONLY
-- ─────────────────────────────────────────────

DROP POLICY IF EXISTS "sessions_read"               ON public.fishing_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.fishing_sessions;
DROP POLICY IF EXISTS "Anyone can view public sessions" ON public.fishing_sessions;

CREATE POLICY "sessions_read_owner_only" ON public.fishing_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 3. catches RLS — OWNER ONLY
-- ─────────────────────────────────────────────

DROP POLICY IF EXISTS "catches_read"                          ON public.catches;
DROP POLICY IF EXISTS "Users can view own catches"            ON public.catches;
DROP POLICY IF EXISTS "Anyone can view catches from public sessions" ON public.catches;

CREATE POLICY "catches_read_owner_only" ON public.catches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fishing_sessions fs
      WHERE fs.id = catches.session_id
        AND fs.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- 4. session_presence view — safe columns only
-- ─────────────────────────────────────────────

DROP VIEW IF EXISTS public.session_presence;

CREATE VIEW public.session_presence
  WITH (security_invoker = off) AS
SELECT
  s.id,
  s.user_id,
  s.river_id,
  s.river_name,
  s.section,
  s.date,
  s.created_at,
  s.weather,
  p.username,
  p.display_name,
  p.avatar_url
FROM public.fishing_sessions s
LEFT JOIN public.profiles p ON p.user_id = s.user_id
WHERE s.broadcast_presence = true
  AND COALESCE(p.profile_visibility, 'public'::profile_visibility_enum) <> 'private';

GRANT SELECT ON public.session_presence TO authenticated, anon;

COMMENT ON VIEW public.session_presence IS
  'Public presence ribbon. Exposes river/section/weather + profile only, and only WHERE broadcast_presence=true. NEVER exposes lat/lng, total_fish, water_temp_f, water_clarity, notes, route_points.';

-- ─────────────────────────────────────────────
-- 5. river_activity_stats view — point at broadcast_presence
-- ─────────────────────────────────────────────
-- View bypasses RLS (security_invoker=off default). Repointing the WHERE
-- to broadcast_presence ensures it only aggregates opted-in sessions —
-- which is none after the Phase 1 backfill. Phase 3 will drop the view
-- and the remaining client code that depends on it.

DROP VIEW IF EXISTS public.river_activity_stats;
CREATE VIEW public.river_activity_stats AS
SELECT
  fs.river_id,
  fs.river_name,
  COUNT(DISTINCT fs.id) AS total_sessions,
  COUNT(DISTINCT fs.id) FILTER (WHERE fs.date >= CURRENT_DATE - INTERVAL '30 days') AS sessions_last_30d,
  COUNT(DISTINCT fs.id) FILTER (WHERE fs.date >= CURRENT_DATE - INTERVAL '7 days')  AS sessions_last_7d,
  COALESCE(SUM(fs.total_fish), 0) AS total_fish_recorded,
  ROUND(AVG(fs.total_fish) FILTER (WHERE fs.total_fish > 0), 1) AS avg_fish_per_session,
  COUNT(c.id) AS total_catches,
  MAX(fs.date) AS last_session_date,
  MAX(fs.water_temp_f) FILTER (WHERE fs.date >= CURRENT_DATE - INTERVAL '7 days')  AS recent_water_temp,
  MODE() WITHIN GROUP (ORDER BY fs.water_clarity) FILTER (WHERE fs.date >= CURRENT_DATE - INTERVAL '30 days') AS recent_water_clarity
FROM public.fishing_sessions fs
LEFT JOIN public.catches c ON c.session_id = fs.id
WHERE fs.broadcast_presence = true
  AND fs.river_id IS NOT NULL
GROUP BY fs.river_id, fs.river_name;

GRANT SELECT ON public.river_activity_stats TO authenticated, anon;

-- ─────────────────────────────────────────────
-- ROLLBACK (manual)
-- ─────────────────────────────────────────────
-- DROP VIEW  IF EXISTS public.session_presence;
-- DROP INDEX IF EXISTS public.idx_sessions_broadcast_presence;
-- ALTER TABLE public.fishing_sessions DROP COLUMN IF EXISTS broadcast_presence;
--
-- DROP POLICY IF EXISTS "sessions_read_owner_only" ON public.fishing_sessions;
-- CREATE POLICY "sessions_read" ON public.fishing_sessions
--   FOR SELECT USING (
--     auth.uid() = user_id
--     OR (privacy = 'public' AND NOT EXISTS (
--       SELECT 1 FROM public.profiles p
--       WHERE p.user_id = fishing_sessions.user_id AND p.profile_visibility = 'private'
--     ))
--   );
--
-- DROP POLICY IF EXISTS "catches_read_owner_only" ON public.catches;
-- CREATE POLICY "catches_read" ON public.catches
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.fishing_sessions fs
--       JOIN public.profiles p ON p.user_id = fs.user_id
--       WHERE fs.id = catches.session_id
--         AND (fs.user_id = auth.uid() OR (fs.privacy = 'public' AND p.profile_visibility <> 'private'))
--     )
--   );
--
-- DROP VIEW IF EXISTS public.river_activity_stats;
-- (re-create from 20260318_schema_unification.sql section 8 if needed)
