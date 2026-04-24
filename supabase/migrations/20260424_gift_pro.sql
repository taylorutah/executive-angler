-- Gift Pro: one-year Pro gift purchased by one user, redeemed by another.
--
-- Flow:
--   1. Purchaser buys via Stripe Checkout (mode=payment, metadata.gift=true).
--   2. Stripe webhook inserts a gift_redemptions row with a fresh 32-byte token
--      and sends the recipient an email with /redeem/[token].
--   3. Recipient signs in and calls redeem_gift_token(p_user_id, p_token),
--      which writes a subscriptions row (source='gift') and marks the gift
--      redeemed. The existing update_premium_from_subscriptions trigger then
--      flips profiles.is_premium for free — no new premium logic.
--
-- Stacking: if the recipient already has another active entitlement, the gift
-- row just coexists in subscriptions. The premium-sync trigger picks the max
-- current_period_end across rows, so the gift effectively extends their access.

-- Widen subscriptions source CHECK to allow 'gift'.
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_source_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_source_check
    CHECK (source IN ('apple', 'google', 'stripe', 'promo', 'gift'));

-- ── Gift ledger ──

CREATE TABLE IF NOT EXISTS gift_redemptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token                   TEXT NOT NULL UNIQUE,
    purchaser_user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    purchaser_email         TEXT,
    purchaser_display_name  TEXT,
    recipient_email         TEXT NOT NULL,
    recipient_message       TEXT,
    stripe_session_id       TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    amount_cents            INTEGER NOT NULL,
    redeemed_by_user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    redeemed_at             TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gift_redemptions_recipient_email
    ON gift_redemptions(lower(recipient_email));
CREATE INDEX IF NOT EXISTS idx_gift_redemptions_purchaser
    ON gift_redemptions(purchaser_user_id);

ALTER TABLE gift_redemptions ENABLE ROW LEVEL SECURITY;

-- Purchasers can see their own gifts (for "my gifts" UI, if ever built).
CREATE POLICY "Purchasers read own gifts"
    ON gift_redemptions FOR SELECT
    USING (auth.uid() = purchaser_user_id);

-- Redeemers can see the gift they redeemed.
CREATE POLICY "Redeemers read own redeemed gifts"
    ON gift_redemptions FOR SELECT
    USING (auth.uid() = redeemed_by_user_id);

-- Writes happen via SECURITY DEFINER functions only — no client write policies.

-- ── Atomic redeem function ──
--
-- Returns (status, premium_until):
--   status='ok'               → redeemed; premium_until is now()+1yr
--   status='invalid_token'    → no matching token
--   status='already_redeemed' → token was already redeemed
--   status='own_gift'         → purchaser tried to redeem their own gift

CREATE OR REPLACE FUNCTION redeem_gift_token(p_user_id UUID, p_token TEXT)
RETURNS TABLE (status TEXT, premium_until TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_gift   gift_redemptions%ROWTYPE;
    v_until  TIMESTAMPTZ;
BEGIN
    SELECT * INTO v_gift FROM gift_redemptions
      WHERE token = p_token
      FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT 'invalid_token'::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    IF v_gift.redeemed_at IS NOT NULL THEN
        RETURN QUERY SELECT 'already_redeemed'::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    IF v_gift.purchaser_user_id IS NOT NULL
       AND v_gift.purchaser_user_id = p_user_id THEN
        RETURN QUERY SELECT 'own_gift'::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    v_until := now() + INTERVAL '1 year';

    -- Mark the gift redeemed.
    UPDATE gift_redemptions
       SET redeemed_by_user_id = p_user_id,
           redeemed_at = now()
     WHERE id = v_gift.id;

    -- Write the entitlement row. The existing
    -- update_premium_from_subscriptions trigger flips profiles.is_premium.
    -- Unique index is (user_id, source), so one gift row per user at a time.
    -- If the user had a previous expired gift, refresh its expiry.
    INSERT INTO subscriptions (
        user_id, source, external_id, plan, status, current_period_end
    ) VALUES (
        p_user_id, 'gift', v_gift.token,
        'gift_annual', 'active', v_until
    )
    ON CONFLICT (user_id, source) DO UPDATE
      SET status = 'active',
          current_period_end = EXCLUDED.current_period_end,
          external_id = EXCLUDED.external_id,
          plan = EXCLUDED.plan,
          updated_at = now();

    RETURN QUERY SELECT 'ok'::TEXT, v_until;
END;
$$;

REVOKE ALL ON FUNCTION redeem_gift_token(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION redeem_gift_token(UUID, TEXT) TO authenticated;

COMMENT ON TABLE gift_redemptions IS
'One-year Pro gift purchases. Token is URL-safe; redemption grants a gift-source subscription row that auto-flips profiles.is_premium.';

COMMENT ON FUNCTION redeem_gift_token(UUID, TEXT) IS
'Atomically redeems a Gift Pro token for a user. Returns status + expiry.';
