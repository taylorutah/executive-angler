-- Waitlist table for app beta signups
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Anyone can join the waitlist (insert only)
CREATE POLICY "public_waitlist_insert" ON waitlist
  FOR INSERT WITH CHECK (true);

-- No public reads — only service role can query the list
