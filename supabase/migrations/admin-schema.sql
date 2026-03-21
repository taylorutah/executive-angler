-- Admin Schema Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Add admin columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_granted_by text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_granted_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_by text;

-- 2. Create audit log table (append-only, tracks every admin action)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL,
  admin_email text NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 3. Create admin notes table (internal notes on users)
CREATE TABLE IF NOT EXISTS admin_user_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  admin_email text NOT NULL,
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Enable RLS on admin tables
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_user_notes ENABLE ROW LEVEL SECURITY;

-- 5. Policies — allow authenticated users (admin check happens in API layer)
DO $$ BEGIN
  CREATE POLICY admin_audit_all ON admin_audit_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY admin_notes_all ON admin_user_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 6. Grant your accounts permanent Pro access
UPDATE profiles SET is_premium = true
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('taylor.warnick@gmail.com', 'taylor@executiveangler.com')
);

-- 7. Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON admin_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON admin_user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned) WHERE is_banned = true;
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium) WHERE is_premium = true;
