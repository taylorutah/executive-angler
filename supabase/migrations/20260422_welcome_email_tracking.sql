-- Track whether the branded signup-welcome email has been sent, so we
-- only fire it once per user (on their first authenticated callback —
-- works for both email/password confirmations and OAuth signups).
--
-- Idempotent + forward-safe: column defaults to NULL, set to now() after
-- the welcome email is successfully sent from /auth/callback.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz;
