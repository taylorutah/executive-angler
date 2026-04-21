-- Founding Members: lifetime Pro access for the first 50 purchasers.
-- One-time $150 payment (web-only, via Stripe), capped at 50 seats total.
--
-- Design:
--   - `founding_members` table enforces the 50-seat cap via a CHECK constraint
--     on seat_number (1..50) + a UNIQUE index on seat_number. The DB itself is
--     the source of truth for scarcity.
--   - `claim_founding_seat()` is the only write path; it's SECURITY DEFINER,
--     takes an exclusive table lock, finds the next available seat, inserts,
--     and returns the seat number. Returns NULL when sold out so the webhook
--     can issue a refund instead of silently failing.
--   - An AFTER INSERT trigger sets profiles.is_founding_member = true,
--     profiles.founder_seat_number, and profiles.is_premium = true.
--   - The existing subscriptions trigger is modified to OR with founding
--     membership so founders never lose premium when a subscription expires.
--   - Public read via the `founding_seats_remaining` view (count only; zero
--     PII leak). Used by the pricing page's "X of 50 left" counter.

CREATE TABLE IF NOT EXISTS founding_members (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seat_number                INTEGER NOT NULL CHECK (seat_number BETWEEN 1 AND 50),
    stripe_session_id          TEXT,
    stripe_payment_intent_id   TEXT,
    amount_paid_cents          INTEGER NOT NULL,
    purchased_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per user (you can't buy two founding seats).
CREATE UNIQUE INDEX IF NOT EXISTS idx_founding_members_user
    ON founding_members(user_id);

-- Seat number is unique across the whole table; combined with the CHECK
-- (1..50), this is the hard cap.
CREATE UNIQUE INDEX IF NOT EXISTS idx_founding_members_seat
    ON founding_members(seat_number);

CREATE INDEX IF NOT EXISTS idx_founding_members_session
    ON founding_members(stripe_session_id)
    WHERE stripe_session_id IS NOT NULL;

ALTER TABLE founding_members ENABLE ROW LEVEL SECURITY;

-- Users can read their own founding-member row (so the account page can
-- render "Founding Member #XX").
CREATE POLICY "Users can read own founding membership"
    ON founding_members FOR SELECT
    USING (auth.uid() = user_id);

-- No public INSERT/UPDATE/DELETE policies — all writes go through the
-- SECURITY DEFINER `claim_founding_seat` function called by the webhook.

-- ── Profile flags ──

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS is_founding_member BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS founder_seat_number INTEGER;

-- ── Atomic seat allocator ──
--
-- Called only from the Stripe webhook. Takes an EXCLUSIVE table lock to
-- serialize seat assignment across concurrent webhook invocations. Returns
-- the assigned seat number, or NULL if all 50 are taken (webhook should
-- refund the charge in that case).
--
-- Idempotency: if a row already exists for this stripe_session_id, return
-- the existing seat number (Stripe occasionally retries webhooks).

CREATE OR REPLACE FUNCTION claim_founding_seat(
    p_user_id                  UUID,
    p_session_id               TEXT,
    p_payment_intent_id        TEXT,
    p_amount_cents             INTEGER
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_seat  INTEGER;
    existing   INTEGER;
BEGIN
    -- Idempotency: already recorded for this session
    SELECT seat_number INTO existing
    FROM founding_members
    WHERE stripe_session_id = p_session_id;
    IF existing IS NOT NULL THEN
        RETURN existing;
    END IF;

    -- Idempotency: user already has a seat (shouldn't happen via checkout UI,
    -- but if they somehow paid twice, return the existing seat so the webhook
    -- can refund the second charge).
    SELECT seat_number INTO existing
    FROM founding_members
    WHERE user_id = p_user_id;
    IF existing IS NOT NULL THEN
        RETURN existing;
    END IF;

    -- Serialize concurrent seat claims
    LOCK TABLE founding_members IN EXCLUSIVE MODE;

    -- Find the lowest unused seat number 1..50
    SELECT n INTO next_seat
    FROM generate_series(1, 50) AS s(n)
    WHERE NOT EXISTS (
        SELECT 1 FROM founding_members WHERE seat_number = s.n
    )
    ORDER BY n
    LIMIT 1;

    IF next_seat IS NULL THEN
        -- Sold out
        RETURN NULL;
    END IF;

    INSERT INTO founding_members (
        user_id, seat_number, stripe_session_id, stripe_payment_intent_id, amount_paid_cents
    ) VALUES (
        p_user_id, next_seat, p_session_id, p_payment_intent_id, p_amount_cents
    );

    RETURN next_seat;
END;
$$;

-- ── Keep profile flags in sync on insert ──

CREATE OR REPLACE FUNCTION sync_founding_member_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE profiles
    SET is_founding_member  = TRUE,
        founder_seat_number = NEW.seat_number,
        is_premium          = TRUE
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_founding_member_profile_sync ON founding_members;
CREATE TRIGGER trg_founding_member_profile_sync
    AFTER INSERT ON founding_members
    FOR EACH ROW
    EXECUTE FUNCTION sync_founding_member_to_profile();

-- ── Patch the subscriptions trigger so founders never lose is_premium ──
--
-- The existing `update_premium_from_subscriptions` would reset is_premium
-- to FALSE when a founder's trial/subscription (if any) expires. Rewriting
-- it here with an OR against founding_members keeps founders premium forever.

CREATE OR REPLACE FUNCTION update_premium_from_subscriptions()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id  UUID;
    has_active      BOOLEAN;
    is_founder      BOOLEAN;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_user_id := OLD.user_id;
    ELSE
        target_user_id := NEW.user_id;
    END IF;

    SELECT EXISTS(
        SELECT 1 FROM subscriptions
        WHERE user_id = target_user_id
          AND status IN ('active', 'trialing')
          AND (current_period_end IS NULL OR current_period_end > now())
    ) INTO has_active;

    SELECT EXISTS(
        SELECT 1 FROM founding_members WHERE user_id = target_user_id
    ) INTO is_founder;

    UPDATE profiles
    SET is_premium = (has_active OR is_founder)
    WHERE user_id = target_user_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Public seat counter view ──
--
-- Exposes only aggregate count — no user identity. The pricing page queries
-- this via GET /api/founding-seats to render "37 of 50 left".

CREATE OR REPLACE VIEW founding_seats_remaining AS
SELECT
    50 AS total_seats,
    50 - COUNT(*)::INTEGER AS remaining_seats,
    COUNT(*)::INTEGER AS sold_seats
FROM founding_members;

GRANT SELECT ON founding_seats_remaining TO anon, authenticated;

COMMENT ON TABLE founding_members IS
'Lifetime Pro access for the first 50 $150 one-time purchasers. Web-only (Stripe).';

COMMENT ON FUNCTION claim_founding_seat IS
'Atomic seat allocator called by the Stripe webhook. Returns seat number 1..50 or NULL if sold out.';
