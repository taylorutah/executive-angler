-- Profile visibility enum — extends the binary is_private flag into a
-- three-way choice that gives anglers a "Followers Only" middle ground
-- (visible to accepted followers) and a hard "Private" mode where only
-- the owner can see anything.
--
-- Semantics
--   public        — session feed visible to anyone, profile row indexable
--   followers_only — profile header public; session feed requires follow
--                   (mirrors current is_private = true behaviour)
--   private       — owner-only; session feed AND direct session links
--                   blocked for non-owners; profile row still readable only
--                   by the owner (consistent with a strict hard-lock)
--
-- Backward compat
--   • is_private is kept and synced via trigger so old iOS builds in the
--     wild that only write is_private continue to work.
--   • When profile_visibility is set, is_private is derived automatically.
--   • New app code writes profile_visibility; old clients read is_private.
--
-- RLS changes (in this file)
--   profiles:          allow anon/followers to read 'public'/'followers_only'
--                      profiles so the profile header is always visible.
--   fishing_sessions:  block non-owners from reading sessions whose owner
--                      has profile_visibility = 'private'.
--   catches:           same gate as fishing_sessions (join via session owner).
--
-- Tables without RLS (session_likes, session_comments, notifications)
-- are addressed in a dedicated hardening migration.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Enum type
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_visibility_enum') THEN
    CREATE TYPE profile_visibility_enum AS ENUM ('public', 'followers_only', 'private');
  END IF;
END
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Column
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_visibility profile_visibility_enum
    NOT NULL DEFAULT 'public';

COMMENT ON COLUMN public.profiles.profile_visibility IS
  'Session-feed visibility. public=anyone, followers_only=accepted followers, private=owner only.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Backfill — map existing is_private boolean into the new enum
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE public.profiles
  SET profile_visibility = CASE
    WHEN is_private = true THEN 'followers_only'::profile_visibility_enum
    ELSE                        'public'::profile_visibility_enum
  END
WHERE profile_visibility = 'public';  -- only rows at default; avoids overwriting
                                       -- any that were already set by a re-run

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Sync trigger — keep is_private in sync whenever profile_visibility changes
--    so old iOS clients that only read is_private still get correct data.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_is_private_from_visibility()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- is_private = true for anything that isn't fully public
  NEW.is_private := (NEW.profile_visibility <> 'public');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_is_private ON public.profiles;
CREATE TRIGGER trg_sync_is_private
  BEFORE INSERT OR UPDATE OF profile_visibility ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_is_private_from_visibility();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. profiles — updated SELECT policy
--
--    Old:  is_private = false OR auth.uid() = user_id
--    New:  public/followers_only profiles readable by anyone (to show profile
--          header + follow CTA); private profiles readable only by owner.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Public can view non-private profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read" ON public.profiles;

CREATE POLICY "profiles_read" ON public.profiles
  FOR SELECT USING (
    profile_visibility IN ('public', 'followers_only')
    OR auth.uid() = user_id
    -- 'private' falls through to auth.uid() = user_id check above
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. fishing_sessions — updated SELECT policy
--
--    Old:  auth.uid() = user_id OR privacy = 'public'
--    New:  same, but block non-owners when the profile is 'private'
--          (follower-only sessions are still gated in app code; per-session
--          `privacy` continues to control individual session visibility).
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own sessions" ON public.fishing_sessions;
DROP POLICY IF EXISTS "Anyone can view public sessions" ON public.fishing_sessions;
DROP POLICY IF EXISTS "sessions_read" ON public.fishing_sessions;

CREATE POLICY "sessions_read" ON public.fishing_sessions
  FOR SELECT USING (
    auth.uid() = user_id                   -- owner sees everything
    OR (
      privacy = 'public'                   -- public session visible to others…
      AND NOT EXISTS (                     -- …unless the owner locked to 'private'
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = fishing_sessions.user_id
          AND p.profile_visibility = 'private'
      )
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. catches — updated SELECT policy
--
--    Old:  fishing_sessions.user_id = auth.uid() OR fishing_sessions.privacy = 'public'
--    New:  propagate the 'private' profile block through to catches.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own catches" ON public.catches;
DROP POLICY IF EXISTS "Anyone can view catches from public sessions" ON public.catches;
DROP POLICY IF EXISTS "catches_read" ON public.catches;

CREATE POLICY "catches_read" ON public.catches
  FOR SELECT USING (
    EXISTS (
      SELECT 1
        FROM public.fishing_sessions fs
        JOIN public.profiles p ON p.user_id = fs.user_id
       WHERE fs.id = catches.session_id
         AND (
           fs.user_id = auth.uid()          -- owner
           OR (
             fs.privacy = 'public'
             AND p.profile_visibility <> 'private'
           )
         )
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK (run manually if needed)
-- ─────────────────────────────────────────────────────────────────────────────
--
-- DROP TRIGGER IF EXISTS trg_sync_is_private ON public.profiles;
-- DROP FUNCTION IF EXISTS sync_is_private_from_visibility();
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS profile_visibility;
-- DROP TYPE IF EXISTS profile_visibility_enum;
--
-- -- Restore old policies:
-- DROP POLICY IF EXISTS "profiles_read"  ON public.profiles;
-- CREATE POLICY "Public can view non-private profiles" ON public.profiles
--   FOR SELECT USING (is_private = false OR auth.uid() = user_id);
--
-- DROP POLICY IF EXISTS "sessions_read"  ON public.fishing_sessions;
-- CREATE POLICY "Users can view own sessions" ON public.fishing_sessions
--   FOR SELECT USING (auth.uid() = user_id OR privacy = 'public');
--
-- DROP POLICY IF EXISTS "catches_read"   ON public.catches;
-- CREATE POLICY "Users can view own catches" ON public.catches
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM public.fishing_sessions
--       WHERE fishing_sessions.id = catches.session_id
--         AND (fishing_sessions.user_id = auth.uid() OR fishing_sessions.privacy = 'public')
--     )
--   );
