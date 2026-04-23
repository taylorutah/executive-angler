-- Profile "searchable" flag — controls whether the profile page is
-- indexable by search engines and whether it shows up in in-app angler
-- search / suggested-anglers lists.
--
-- This is the Strava "show in search results" toggle. Defaults to true
-- (indexable) so existing users aren't silently removed from discovery;
-- anglers who want to stay off search can opt out in settings.
--
-- RLS is untouched here. Visibility of a profile row is already handled
-- by the existing `profiles_read` SELECT policy — `searchable` is a
-- discovery gate, not a visibility gate. Private profile = existing
-- `is_private` column (which controls session access via the RLS
-- policies on fishing_sessions).
--
-- Shipped as part of the Strava-style anonymous viewing work
-- (20260423 series).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS searchable boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.profiles.searchable IS
  'When false, the profile is excluded from search engine indexing (noindex meta) and from in-app angler search / suggested-anglers results. Independent of is_private — a profile can be publicly viewable by URL yet opted out of discovery surfaces.';

-- No index yet. Profiles table is small and every discovery query
-- already filters by username/display_name first; a boolean filter on
-- the tail is cheap.
