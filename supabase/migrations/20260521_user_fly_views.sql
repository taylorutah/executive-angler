-- user_fly_views — saved filter+sort+display presets for the Flies Workspace.
--
-- Default ("virtual") views (All, Created by me, Favorites, Tie Next queue,
-- In a box, Need to restock) are NOT stored here — they're computed in the
-- query layer. Only user-defined views land in this table.
--
-- iOS contract: this table is web-only at launch. iOS does not read it.
-- Schema changes here are additive; nothing on `flies` or
-- `user_fly_configurations` is touched. Adding this table is safe to deploy
-- without an iOS release.

CREATE TABLE IF NOT EXISTS user_fly_views (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  -- Filter shape (validated in the API layer, not the DB):
  --   { source?: 'canonical' | 'custom' | 'all',
  --     categories?: string[],
  --     box_ids?: string[],
  --     tags?: ('favorite' | 'tie-next' | 'in-box' | 'restock')[],
  --     search?: string }
  filter       JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Sort shape: { field: 'name'|'created_at'|'last_used_at'|'deficit', direction: 'asc'|'desc' }
  sort         JSONB NOT NULL DEFAULT '{"field":"name","direction":"asc"}'::jsonb,
  -- Display mode: 'grid' | 'table' | 'kanban' | 'group-by-box'
  view_type    TEXT NOT NULL DEFAULT 'grid'
                    CHECK (view_type IN ('grid', 'table', 'kanban', 'group-by-box')),
  sort_order   INT NOT NULL DEFAULT 0,
  is_pinned    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Per-user view name uniqueness — prevents accidental "view (2)" duplicates
  -- when the user clicks Save on the same set of filters twice.
  CONSTRAINT user_fly_views_user_name_unique UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS user_fly_views_user_order_idx
  ON user_fly_views (user_id, sort_order);

CREATE INDEX IF NOT EXISTS user_fly_views_user_pinned_idx
  ON user_fly_views (user_id, is_pinned) WHERE is_pinned = true;

ALTER TABLE user_fly_views ENABLE ROW LEVEL SECURITY;

-- Single permissive policy: a user can do anything to their own view rows.
-- No public read — saved views are private to the user.
CREATE POLICY "Users manage own fly views"
  ON user_fly_views
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at trigger — reuses the project-wide update_updated_at_column()
-- function (defined in schema.sql / earlier migrations).
CREATE TRIGGER user_fly_views_updated_at
  BEFORE UPDATE ON user_fly_views
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
