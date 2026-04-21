-- Second hotfix for redeem_promo_code: the plan assumed the founding_members
-- table would exist (from 20260419_founding_members.sql), but it isn't in
-- prod. The defensive `IF EXISTS (SELECT 1 FROM founding_members ...)` errors
-- with "relation founding_members does not exist" before the subquery can
-- short-circuit.
--
-- The real entitlement source-of-truth is the `subscriptions` table already
-- checked in the same IF block — dropping the founding_members arm keeps
-- "don't-burn-a-seat-if-already-Pro" behavior intact via the subscription
-- check. If founding_members is reintroduced later, restore the reference.

CREATE OR REPLACE FUNCTION redeem_promo_code(p_user_id UUID, p_code TEXT)
RETURNS TABLE (status TEXT, premium_until TIMESTAMPTZ, remaining INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code      promo_codes%ROWTYPE;
    v_count     INTEGER;
    v_until     TIMESTAMPTZ;
    v_existing  TIMESTAMPTZ;
BEGIN
    SELECT * INTO v_code FROM promo_codes
      WHERE code = upper(trim(p_code))
        AND now() >= active_from
        AND (active_until IS NULL OR now() < active_until);
    IF NOT FOUND THEN
        RETURN QUERY SELECT 'invalid_code'::TEXT, NULL::TIMESTAMPTZ, 0;
        RETURN;
    END IF;

    SELECT promo_redemptions.premium_until INTO v_existing
      FROM promo_redemptions
      WHERE promo_redemptions.code_id = v_code.id
        AND promo_redemptions.user_id = p_user_id;
    IF v_existing IS NOT NULL THEN
        RETURN QUERY SELECT 'already_redeemed'::TEXT, v_existing, 0;
        RETURN;
    END IF;

    IF EXISTS (
      SELECT 1 FROM subscriptions
        WHERE subscriptions.user_id = p_user_id
          AND subscriptions.status IN ('active','trialing')
          AND (subscriptions.current_period_end IS NULL
               OR subscriptions.current_period_end > now())
          AND subscriptions.source <> 'promo'
    ) THEN
        RETURN QUERY SELECT 'already_premium'::TEXT, NULL::TIMESTAMPTZ, 0;
        RETURN;
    END IF;

    LOCK TABLE promo_redemptions IN EXCLUSIVE MODE;

    SELECT COUNT(*) INTO v_count
      FROM promo_redemptions
      WHERE promo_redemptions.code_id = v_code.id;

    IF v_count >= v_code.max_redemptions THEN
        RETURN QUERY SELECT 'sold_out'::TEXT, NULL::TIMESTAMPTZ, 0;
        RETURN;
    END IF;

    v_until := now() + (v_code.duration_days || ' days')::INTERVAL;

    INSERT INTO promo_redemptions (code_id, user_id, premium_until)
      VALUES (v_code.id, p_user_id, v_until);

    INSERT INTO subscriptions (
        user_id, source, external_id, plan, status, current_period_end
    ) VALUES (
        p_user_id, 'promo', v_code.code,
        'promo_' || v_code.duration_days || 'd', 'active', v_until
    )
    ON CONFLICT (user_id, source) DO UPDATE
      SET status='active',
          current_period_end=EXCLUDED.current_period_end,
          external_id=EXCLUDED.external_id,
          plan=EXCLUDED.plan,
          updated_at=now();

    RETURN QUERY SELECT 'ok'::TEXT, v_until, (v_code.max_redemptions - v_count - 1);
END;
$$;

REVOKE ALL ON FUNCTION redeem_promo_code(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION redeem_promo_code(UUID, TEXT) TO authenticated;
