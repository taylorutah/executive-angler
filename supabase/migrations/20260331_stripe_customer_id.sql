-- Add stripe_customer_id to profiles for Stripe Checkout/Portal flow.
-- Only populated when a user subscribes via the web (Stripe).

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
ON profiles(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;
