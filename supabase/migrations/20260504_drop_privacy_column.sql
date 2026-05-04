-- =============================================
-- Phase 6 — Drop deprecated `privacy` column
-- 2026-05-04
-- =============================================
-- The legacy `fishing_sessions.privacy text` field is replaced by the
-- explicit `broadcast_presence boolean` added in Phase 1. Web, iOS, and
-- Android have all been updated to write/read broadcast_presence.
--
-- Web API still ACCEPTS the legacy `privacy` JSON field from old mobile
-- clients in the wild and maps it to broadcast_presence before reaching
-- Postgres (see resolveBroadcast() in src/app/api/fishing/session/route.ts),
-- so old clients keep working at the wire level.
--
-- After this migration:
-- - Old iOS/Android builds reading `session.privacy` from server responses
--   get nil/null. Both clients model the field as optional, so this
--   degrades cosmetically (no more "Private" lock badge) but doesn't crash.
-- - Old clients writing `privacy` are still mapped server-side.
-- - All RLS, views, and aggregations already key on broadcast_presence.

ALTER TABLE public.fishing_sessions DROP COLUMN IF EXISTS privacy;

DROP INDEX IF EXISTS public.idx_sessions_privacy;

-- ROLLBACK (manual)
-- ALTER TABLE public.fishing_sessions ADD COLUMN privacy text DEFAULT 'private';
-- UPDATE public.fishing_sessions SET privacy = CASE WHEN broadcast_presence THEN 'public' ELSE 'private' END;
-- CREATE INDEX idx_sessions_privacy ON public.fishing_sessions(privacy);
