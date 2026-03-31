-- Subscriptions table: tracks active subscriptions from all sources (Apple, Google, Stripe).
-- profiles.is_premium is derived from this table via trigger.

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('apple', 'google', 'stripe')),
    external_id TEXT,                     -- Stripe sub ID / Apple original_transaction_id / Google purchase token
    plan TEXT NOT NULL DEFAULT 'monthly', -- 'monthly' or 'annual'
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'past_due', 'trialing')),
    current_period_end TIMESTAMPTZ,       -- when the current billing period ends
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_external ON subscriptions(external_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_source_user ON subscriptions(user_id, source);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update (webhooks, server-side sync)
-- App clients use authenticated API routes that run with service role

-- Trigger function: after any subscription change, recompute profiles.is_premium
CREATE OR REPLACE FUNCTION update_premium_from_subscriptions()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    has_active BOOLEAN;
BEGIN
    -- Determine which user to update
    IF TG_OP = 'DELETE' THEN
        target_user_id := OLD.user_id;
    ELSE
        target_user_id := NEW.user_id;
    END IF;

    -- Check if user has any active subscription
    SELECT EXISTS(
        SELECT 1 FROM subscriptions
        WHERE user_id = target_user_id
        AND status IN ('active', 'trialing')
        AND (current_period_end IS NULL OR current_period_end > now())
    ) INTO has_active;

    -- Update the profiles table
    UPDATE profiles
    SET is_premium = has_active
    WHERE user_id = target_user_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_subscriptions_update_premium
    AFTER INSERT OR UPDATE OR DELETE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_premium_from_subscriptions();
