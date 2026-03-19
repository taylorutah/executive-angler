-- Follows table for social follow system
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Indexes for fast lookups
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_follows_status ON follows(follower_id, status);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Users can create follow requests (only as themselves)
CREATE POLICY "Users can create follow requests"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can view follows they're involved in
CREATE POLICY "Users can view their follows"
  ON follows FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Users can accept/update follow requests they receive
CREATE POLICY "Users can update received follows"
  ON follows FOR UPDATE
  USING (auth.uid() = following_id);

-- Users can delete their own follows (unfollow or decline)
CREATE POLICY "Users can delete their follows"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id OR auth.uid() = following_id);
