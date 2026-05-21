-- =============================================
-- One-time hard-delete of existing is_demo=true rows
-- 2026-05-21
-- =============================================
-- Clean slate: remove every session and catch row that was previously seeded
-- by the onboarding flow. Going forward new signups will continue to receive
-- demo data via /api/onboarding/seed-demo, but the leak fix in
-- 20260521e_river_fly_pulse_exclude_demo.sql ensures those rows never affect
-- public aggregates.
--
-- catches first to satisfy FK (catches.session_id → fishing_sessions.id).
-- RLS does not apply inside migrations. Both statements are idempotent.

DELETE FROM public.catches          WHERE is_demo = true;
DELETE FROM public.fishing_sessions WHERE is_demo = true;
