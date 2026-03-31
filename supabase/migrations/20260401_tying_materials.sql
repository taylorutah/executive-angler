-- =============================================
-- Fly-Tying Workbench — Materials Database
-- Phase 2.1: Core schema for structured recipes
-- =============================================

-- Master materials catalog (system-owned, community-enrichable)
CREATE TABLE IF NOT EXISTS tying_materials (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  name          text NOT NULL,
  brand         text,
  category      text NOT NULL,  -- hook | bead | thread | dubbing | feather | flash | foam | wire | resin | marker | rubber | synthetic | tail | wing | ribbing | chenille | body | eye
  subcategory   text,           -- e.g. for hooks: nymph, dry, streamer, jig

  -- Specs (vary by category, nullable)
  sizes         text[],         -- ["14", "16", "18"] for hooks; ["2.0mm", "2.3mm"] for beads
  colors        text[],         -- ["copper", "gold", "black nickel"]
  material_type text,           -- tungsten, brass for beads; 6/0, 8/0 for thread; CDC, marabou for feathers
  weight        text,           -- denier for thread, grain weight for beads
  finish        text,           -- barbless, slotted, countersunk, etc.

  -- Display
  description   text,
  image_url     text,           -- self-hosted in Supabase Storage
  vendor_url    text,           -- link to buy (affiliate potential)

  -- Metadata
  is_verified   boolean DEFAULT false,
  submitted_by  uuid REFERENCES auth.users(id),
  popularity    integer DEFAULT 0,

  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tying_materials_category ON tying_materials(category);
CREATE INDEX IF NOT EXISTS idx_tying_materials_brand ON tying_materials(brand);
CREATE INDEX IF NOT EXISTS idx_tying_materials_slug ON tying_materials(slug);

-- Recipe ingredients: links a fly pattern to specific materials
CREATE TABLE IF NOT EXISTS fly_recipe_ingredients (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fly_pattern_id    uuid REFERENCES fly_patterns(id) ON DELETE CASCADE,
  canonical_fly_id  uuid REFERENCES canonical_flies(id) ON DELETE CASCADE,

  material_id       uuid REFERENCES tying_materials(id),
  material_name     text,           -- fallback if material not in DB (free text)

  step_position     integer NOT NULL,
  role              text NOT NULL,  -- hook | bead | thread | tail | body | ribbing | wing | hackle | head | tag | hotspot | eye | collar | thorax | abdomen | shellback | legs | antennae | post
  quantity          text,           -- "1", "10 wraps", "pinch"
  notes             text,           -- "tie in at 60% mark", "use dubbing loop"
  color_choice      text,           -- specific color selection
  size_choice       text,           -- specific size selection
  is_optional       boolean DEFAULT false,
  substitute_ids    uuid[],         -- alternative material_ids

  created_at        timestamptz DEFAULT now(),

  CONSTRAINT recipe_fly_check CHECK (
    fly_pattern_id IS NOT NULL OR canonical_fly_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_fly_recipe_fly ON fly_recipe_ingredients(fly_pattern_id);
CREATE INDEX IF NOT EXISTS idx_fly_recipe_canonical ON fly_recipe_ingredients(canonical_fly_id);
CREATE INDEX IF NOT EXISTS idx_fly_recipe_material ON fly_recipe_ingredients(material_id);

-- User's material inventory ("what's in my box")
CREATE TABLE IF NOT EXISTS user_materials_inventory (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id   uuid NOT NULL REFERENCES tying_materials(id),
  color_owned   text,
  size_owned    text,
  quantity      text,           -- "1 spool", "half pack"
  notes         text,
  added_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, material_id, color_owned, size_owned)
);

CREATE INDEX IF NOT EXISTS idx_user_materials_user ON user_materials_inventory(user_id);

-- Add tying-specific columns to fly_patterns
ALTER TABLE fly_patterns
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'tied',
  ADD COLUMN IF NOT EXISTS date_tied date,
  ADD COLUMN IF NOT EXISTS tied_count integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS materials_cost numeric(6,2),
  ADD COLUMN IF NOT EXISTS has_structured_recipe boolean DEFAULT false;

-- RLS policies
ALTER TABLE tying_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE fly_recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_materials_inventory ENABLE ROW LEVEL SECURITY;

-- tying_materials: public read, authenticated insert for submissions
CREATE POLICY "Public can read materials"
  ON tying_materials FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can submit materials"
  ON tying_materials FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- fly_recipe_ingredients: public read (for canonical), owner read/write (for personal)
CREATE POLICY "Public can read recipe ingredients"
  ON fly_recipe_ingredients FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own fly recipe ingredients"
  ON fly_recipe_ingredients FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own fly recipe ingredients"
  ON fly_recipe_ingredients FOR UPDATE
  USING (
    fly_pattern_id IN (SELECT id FROM fly_patterns WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own fly recipe ingredients"
  ON fly_recipe_ingredients FOR DELETE
  USING (
    fly_pattern_id IN (SELECT id FROM fly_patterns WHERE user_id = auth.uid())
  );

-- user_materials_inventory: owner only
CREATE POLICY "Users can view own inventory"
  ON user_materials_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own inventory"
  ON user_materials_inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON user_materials_inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inventory"
  ON user_materials_inventory FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at triggers
CREATE TRIGGER update_tying_materials_updated_at
  BEFORE UPDATE ON tying_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
