-- Capture geographic context at login time for admin visibility.
-- Populated by middleware from Vercel geo headers on the first request
-- after a fresh sign-in. No raw IP stored.

alter table public.profiles
  add column if not exists last_login_at timestamptz,
  add column if not exists last_login_country text,
  add column if not exists last_login_region text,
  add column if not exists last_login_city text;
