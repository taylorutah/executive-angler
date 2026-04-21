-- Reddit-launch promo codes: cardless, cap-limited, 30-day Pro access.
-- Mirrors the founding_members atomic-allocator pattern (see 20260419).
--
-- Design:
--   - `promo_codes` catalog holds code metadata (cap, duration, campaign
--     attribution). Server-side only — no RLS SELECT for anon/authenticated.
--   - `promo_redemptions` ledger is one row per (code,user). UNIQUE constraint
--     blocks double-redemption; row count vs. max_redemptions enforces the cap.
--   - `redeem_promo_code()` is the only write path: SECURITY DEFINER, takes an
--     EXCLUSIVE table lock to serialize concurrent claims on the last seat,
--     returns a status string + expiry + remaining count.
--   - The actual entitlement row is written to the existing `subscriptions`
--     table with source='promo'. The existing update_premium_from_subscriptions
--     trigger then syncs profiles.is_premium for free — no new premium logic.
--   - Public `promo_code_availability` view exposes only aggregate counts per
--     code (no PII). Used by /api/promo/status for the live counter.

-- Widen the source CHECK to allow 'promo' as a first-class entitlement source.
-- The constraint was created unnamed in 20260331_subscriptions.sql so Postgres
-- auto-named it subscriptions_source_check.
ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_source_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_source_check
    CHECK (source IN ('apple', 'google', 'stripe', 'promo'));

-- ── Code catalog ──

CREATE TABLE IF NOT EXISTS promo_codes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code             TEXT NOT NULL UNIQUE,   -- stored uppercase; lookup normalizes
    campaign_source  TEXT NOT NULL,          -- 'reddit', 'twitter', etc. — analytics
    max_redemptions  INTEGER NOT NULL CHECK (max_redemptions > 0),
    duration_days    INTEGER NOT NULL CHECK (duration_days > 0),
    active_from      TIMESTAMPTZ NOT NULL DEFAULT now(),
    active_until     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
-- No policies = service-role-only access. Clients never read promo_codes directly;
-- they call the SECURITY DEFINER redeem function or the public availability view.

-- ── Redemption ledger ──

CREATE TABLE IF NOT EXISTS promo_redemptions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_id        UUID NOT NULL REFERENCES promo_codes(id) ON DELETE RESTRICT,
    user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    redeemed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    premium_until  TIMESTAMPTZ NOT NULL,
    UNIQUE (code_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_code
    ON promo_redemptions(code_id);

ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own promo redemptions"
    ON promo_redemptions FOR SELECT
    USING (auth.uid() = user_id);

-- ── Atomic redemption function ──
--
-- Called from /api/promo/redeem. Authenticated users have EXECUTE.
--
-- Returns one row with (status, premium_until, remaining):
--   status='ok'               → redeemed; premium_until + remaining populated
--   status='invalid_code'     → no matching active code
--   status='already_redeemed' → user already redeemed this code; premium_until
--                                holds their existing expiry
--   status='already_premium'  → user already has another active entitlement;
--                                seat NOT consumed
--   status='sold_out'         → cap reached

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
    -- 1. Resolve the code (case/whitespace normalized, within active window)
    SELECT * INTO v_code FROM promo_codes
      WHERE code = upper(trim(p_code))
        AND now() >= active_from
        AND (active_until IS NULL OR now() < active_until);
    IF NOT FOUND THEN
        RETURN QUERY SELECT 'invalid_code'::TEXT, NULL::TIMESTAMPTZ, 0;
        RETURN;
    END IF;

    -- 2. Idempotency: same user redeeming same code → return existing expiry
    --    NB: all column refs below are table-qualified — `premium_until` is
    --    also a RETURNS TABLE name so Postgres treats bare `premium_until`
    --    as ambiguous in these SELECTs.
    SELECT promo_redemptions.premium_until INTO v_existing
      FROM promo_redemptions
      WHERE promo_redemptions.code_id = v_code.id
        AND promo_redemptions.user_id = p_user_id;
    IF v_existing IS NOT NULL THEN
        RETURN QUERY SELECT 'already_redeemed'::TEXT, v_existing, 0;
        RETURN;
    END IF;

    -- 3. Block-don't-burn: user already has another active entitlement
    IF EXISTS (
      SELECT 1 FROM subscriptions
        WHERE subscriptions.user_id = p_user_id
          AND subscriptions.status IN ('active','trialing')
          AND (subscriptions.current_period_end IS NULL
               OR subscriptions.current_period_end > now())
          AND subscriptions.source <> 'promo'
    ) OR EXISTS (
      SELECT 1 FROM founding_members
        WHERE founding_members.user_id = p_user_id
    ) THEN
        RETURN QUERY SELECT 'already_premium'::TEXT, NULL::TIMESTAMPTZ, 0;
        RETURN;
    END IF;

    -- 4. Serialize concurrent redemptions on the last seat
    LOCK TABLE promo_redemptions IN EXCLUSIVE MODE;

    SELECT COUNT(*) INTO v_count
      FROM promo_redemptions
      WHERE promo_redemptions.code_id = v_code.id;

    IF v_count >= v_code.max_redemptions THEN
        RETURN QUERY SELECT 'sold_out'::TEXT, NULL::TIMESTAMPTZ, 0;
        RETURN;
    END IF;

    v_until := now() + (v_code.duration_days || ' days')::INTERVAL;

    -- 5. Write ledger + entitlement row
    INSERT INTO promo_redemptions (code_id, user_id, premium_until)
      VALUES (v_code.id, p_user_id, v_until);

    -- Writing to subscriptions fires the existing update_premium_from_subscriptions
    -- trigger, which sets profiles.is_premium = true.
    --
    -- ON CONFLICT handles the case where a user previously had an expired promo
    -- row on another campaign — we refresh it with the new expiry. The unique
    -- index is (user_id, source), so one promo row per user at a time.
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

-- ── Public counter view ──
--
-- Exposes aggregate counts only (no user identity). Used by /api/promo/status
-- to render "247 of 250 left" on the /redeem page. Mirrors founding_seats_remaining.

CREATE OR REPLACE VIEW promo_code_availability AS
SELECT
    pc.code,
    pc.max_redemptions AS total,
    (pc.max_redemptions - COUNT(pr.id))::INTEGER AS remaining,
    COUNT(pr.id)::INTEGER AS redeemed
  FROM promo_codes pc
  LEFT JOIN promo_redemptions pr ON pr.code_id = pc.id
 WHERE now() >= pc.active_from
   AND (pc.active_until IS NULL OR now() < pc.active_until)
 GROUP BY pc.code, pc.max_redemptions;

GRANT SELECT ON promo_code_availability TO anon, authenticated;

-- ── Seed the Reddit campaign ──

INSERT INTO promo_codes (code, campaign_source, max_redemptions, duration_days)
  VALUES ('REDDIT30', 'reddit', 250, 30)
  ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE promo_codes IS
'Marketing promo codes. Each code grants duration_days of Pro access to the first max_redemptions redeemers.';

COMMENT ON FUNCTION redeem_promo_code(UUID, TEXT) IS
'Atomically redeems a promo code for a user. Writes a subscriptions row with source=''promo'' which fires the existing premium-sync trigger.';
