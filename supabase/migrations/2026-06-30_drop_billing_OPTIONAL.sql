-- ============================================================================
-- OPTIONAL — DO NOT RUN AUTOMATICALLY. DESTRUCTIVE & IRREVERSIBLE.
-- ============================================================================
-- Executive Angler is now fully free (2026-06-30). The application code no
-- longer reads or writes any billing/premium state — the `subscriptions`
-- table, the `profiles.is_premium` / `premium_granted_by` / `premium_granted_at`
-- columns, and the premium trigger are all DORMANT.
--
-- This migration removes that dormant billing schema. It is provided for
-- completeness but is intentionally NOT part of the automatic migration set.
-- Run it ONLY after an explicit decision to drop the data permanently, and
-- after taking a fresh Supabase backup. Once dropped, historical subscription
-- rows cannot be recovered.
--
-- To apply: paste into the Supabase SQL editor manually. Review each statement.
-- ============================================================================

-- 1. Drop the trigger that mirrored subscriptions → profiles.is_premium.
DROP TRIGGER IF EXISTS trg_subscriptions_update_premium ON public.subscriptions;
-- (If the trigger function is unused elsewhere, drop it too:)
-- DROP FUNCTION IF EXISTS public.update_premium_from_subscription();

-- 2. Drop the subscriptions table.
DROP TABLE IF EXISTS public.subscriptions;

-- 3. Drop the premium columns on profiles.
DROP INDEX IF EXISTS idx_profiles_premium;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_premium;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS premium_granted_by;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS premium_granted_at;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS stripe_customer_id;

-- 4. (Optional) Drop founding-member / promo tables if they are no longer used.
--    Verify first — only uncomment if you are sure nothing else references them.
-- DROP TABLE IF EXISTS public.founding_members;
-- DROP TABLE IF EXISTS public.promo_codes;
-- DROP TABLE IF EXISTS public.promo_redemptions;
