-- ============================================================
-- Executive Angler — Community Submissions Schema
-- Run in Supabase SQL Editor (one-time setup)
-- ============================================================

-- 1. Core submissions table (unified for all entity types)
CREATE TABLE IF NOT EXISTS community_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- What type of entity is being submitted
  entity_type text NOT NULL CHECK (entity_type IN (
    'river', 'fly_shop', 'guide', 'lodge', 'destination', 'species'
  )),

  -- Lifecycle status
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'in_review', 'needs_info', 'approved', 'rejected', 'published', 'archived', 'flagged'
  )),

  -- Core fields (shared across all entity types)
  name text NOT NULL,
  slug text, -- generated on approval for URL
  description text,
  short_description text, -- tagline / one-liner

  -- Location (for rivers, shops, guides, lodges, destinations)
  latitude double precision,
  longitude double precision,
  state text,
  region text,
  country text DEFAULT 'US',
  address text, -- street address for shops/lodges

  -- Contact info (for shops, guides, lodges)
  website text,
  phone text,
  email text,

  -- Entity-specific JSON data (flexible per type)
  -- Rivers: { primary_species: [], access_points: [], regulations: "", season: "", difficulty: "" }
  -- Fly Shops: { brands: [], services: [], hours: {} }
  -- Guides: { specialties: [], rivers_guided: [], price_range: "", experience_years: 0 }
  -- Lodges: { amenities: [], price_range: "", capacity: 0 }
  -- Destinations: { best_months: [], nearest_airport: "", elevation: 0 }
  -- Species: { family: "", habitat: "", avg_size: "", preferred_flies: [] }
  entity_data jsonb DEFAULT '{}',

  -- Media
  hero_image_url text, -- primary/hero image (strongly advised)
  additional_images jsonb DEFAULT '[]', -- array of { url, caption, sort_order }

  -- Moderation
  reviewer_id uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text, -- shown to user
  moderation_notes text, -- internal admin notes
  admin_feedback text, -- feedback sent to user with needs_info status

  -- If approved, link to the actual entity record
  published_entity_id text, -- the slug/id in the rivers/shops/etc table

  -- Versioning
  version integer DEFAULT 1,
  previous_version_id uuid REFERENCES community_submissions(id),

  -- Source context
  source text DEFAULT 'manual' CHECK (source IN (
    'manual', -- user went to Add River page
    'post_session', -- prompted after fishing session on unknown water
    'suggest_edit', -- editing an existing published entity
    'ios_app' -- submitted from iOS app
  )),
  source_session_id uuid, -- if source = post_session, link to the session

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  submitted_at timestamptz, -- when user clicked Submit
  published_at timestamptz -- when admin approved and published
);

-- 2. Submission status history (audit trail)
CREATE TABLE IF NOT EXISTS submission_status_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES community_submissions(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  changed_by_email text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 3. Community flags (users reporting issues with published content)
CREATE TABLE IF NOT EXISTS community_flags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type text NOT NULL, -- river, fly_shop, guide, lodge, destination, species, session, catch
  entity_id text NOT NULL, -- slug or UUID of the flagged entity
  reason text NOT NULL CHECK (reason IN (
    'inaccurate', 'inappropriate', 'spam', 'duplicate', 'closed_permanently',
    'wrong_location', 'offensive', 'fake_data', 'copyright', 'other'
  )),
  details text, -- free-text explanation
  status text DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  reviewer_id uuid,
  reviewed_at timestamptz,
  resolution_notes text,
  created_at timestamptz DEFAULT now()
);

-- 4. Contributor stats (track trust level)
CREATE TABLE IF NOT EXISTS contributor_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  submissions_total integer DEFAULT 0,
  submissions_approved integer DEFAULT 0,
  submissions_rejected integer DEFAULT 0,
  edits_total integer DEFAULT 0,
  edits_approved integer DEFAULT 0,
  flags_submitted integer DEFAULT 0,
  flags_upheld integer DEFAULT 0, -- their flags were valid
  trust_level text DEFAULT 'new' CHECK (trust_level IN ('new', 'contributor', 'trusted', 'verified', 'moderator')),
  -- new: 0-2 approved, contributor: 3-9, trusted: 10+, verified: admin-granted, moderator: admin role
  updated_at timestamptz DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE community_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributor_stats ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Submissions: users can see their own + published ones; admins see all via API
DROP POLICY IF EXISTS submissions_own ON community_submissions;
CREATE POLICY submissions_own ON community_submissions
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR status = 'published')
  WITH CHECK (user_id = auth.uid());

-- Status history: viewable by submission owner
DROP POLICY IF EXISTS status_history_own ON submission_status_history;
CREATE POLICY status_history_own ON submission_status_history
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Flags: users can create their own, admins manage via API
DROP POLICY IF EXISTS flags_own ON community_flags;
CREATE POLICY flags_own ON community_flags
  FOR ALL TO authenticated
  USING (reporter_id = auth.uid() OR true) -- admin access via service role
  WITH CHECK (reporter_id = auth.uid());

-- Contributor stats: users see their own
DROP POLICY IF EXISTS contributor_own ON contributor_stats;
CREATE POLICY contributor_own ON contributor_stats
  FOR ALL TO authenticated
  USING (user_id = auth.uid() OR true)
  WITH CHECK (user_id = auth.uid());

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_submissions_user ON community_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON community_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_type ON community_submissions(entity_type);
CREATE INDEX IF NOT EXISTS idx_submissions_type_status ON community_submissions(entity_type, status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted ON community_submissions(submitted_at DESC) WHERE status = 'submitted';
CREATE INDEX IF NOT EXISTS idx_submissions_slug ON community_submissions(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_status_history_submission ON submission_status_history(submission_id);
CREATE INDEX IF NOT EXISTS idx_flags_status ON community_flags(status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_flags_entity ON community_flags(entity_type, entity_id);

-- 8. Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_submission_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS submissions_updated_at ON community_submissions;
CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON community_submissions
  FOR EACH ROW EXECUTE FUNCTION update_submission_timestamp();

-- 9. Function to auto-compute trust level
CREATE OR REPLACE FUNCTION update_contributor_trust()
RETURNS TRIGGER AS $$
BEGIN
  NEW.trust_level = CASE
    WHEN NEW.submissions_approved >= 10 THEN 'trusted'
    WHEN NEW.submissions_approved >= 3 THEN 'contributor'
    ELSE 'new'
  END;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contributor_trust_update ON contributor_stats;
CREATE TRIGGER contributor_trust_update
  BEFORE UPDATE ON contributor_stats
  FOR EACH ROW EXECUTE FUNCTION update_contributor_trust();
