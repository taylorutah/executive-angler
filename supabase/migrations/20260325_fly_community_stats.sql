-- fly_community_stats: aggregate usage data per canonical fly (denormalized for performance)
CREATE TABLE IF NOT EXISTS fly_community_stats (
  canonical_fly_id  uuid PRIMARY KEY REFERENCES canonical_flies(id) ON DELETE CASCADE,
  total_catches      integer DEFAULT 0,
  total_anglers      integer DEFAULT 0,
  avg_fish_size      numeric(5,2),
  top_rivers         jsonb DEFAULT '[]'::jsonb,     -- [{river_id, river_name, catch_count}]
  top_species        jsonb DEFAULT '[]'::jsonb,     -- [{species_name, catch_count}]
  monthly_usage      jsonb DEFAULT '{}'::jsonb,     -- {"2026-01": 12, "2026-02": 8, ...}
  updated_at         timestamptz DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER update_fly_community_stats_updated_at
  BEFORE UPDATE ON fly_community_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Public read access
ALTER TABLE fly_community_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read fly_community_stats"
  ON fly_community_stats FOR SELECT USING (true);
