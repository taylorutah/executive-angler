-- Gear catalog: public brands + products directory (SEO-first).
-- User integration extends existing gear_items with an optional FK to gear_products.
-- Uses TEXT ids to match the rest of the schema (destinations, rivers, etc.)

-- ---------------------------------------------------------------------------
-- gear_brands
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gear_brands (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  hero_image_url TEXT,
  hero_image_alt TEXT,
  hero_image_credit TEXT,
  hero_image_credit_url TEXT,
  website_url TEXT,
  country TEXT,
  founded_year INT,
  headquarters TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gear_brands_slug ON gear_brands(slug);
CREATE INDEX IF NOT EXISTS idx_gear_brands_featured ON gear_brands(featured) WHERE featured = true;

-- ---------------------------------------------------------------------------
-- gear_products
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gear_products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  brand_id TEXT REFERENCES gear_brands(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('rod','reel','waders')),
  description TEXT NOT NULL DEFAULT '',
  hero_image_url TEXT,
  hero_image_alt TEXT,
  hero_image_credit TEXT,
  hero_image_credit_url TEXT,
  gallery_urls TEXT[] NOT NULL DEFAULT '{}',
  msrp_usd NUMERIC(8,2),
  specs JSONB NOT NULL DEFAULT '{}',
  use_cases TEXT[] NOT NULL DEFAULT '{}',
  related_river_ids TEXT[] NOT NULL DEFAULT '{}',
  related_species_ids TEXT[] NOT NULL DEFAULT '{}',
  product_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gear_products_slug ON gear_products(slug);
CREATE INDEX IF NOT EXISTS idx_gear_products_brand_id ON gear_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_gear_products_category ON gear_products(category);
CREATE INDEX IF NOT EXISTS idx_gear_products_featured ON gear_products(featured) WHERE featured = true;

-- ---------------------------------------------------------------------------
-- RLS: public read, no public write
-- ---------------------------------------------------------------------------
ALTER TABLE gear_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read gear_brands" ON gear_brands FOR SELECT USING (true);
CREATE POLICY "Public read gear_products" ON gear_products FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- gear_items FK: link personal inventory back to the catalog when added via
-- an "Add to my gear" click on a product page. Optional — personal gear added
-- manually in the Journal still works without a catalog reference.
-- ---------------------------------------------------------------------------
ALTER TABLE gear_items
  ADD COLUMN IF NOT EXISTS gear_product_id TEXT REFERENCES gear_products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_gear_items_gear_product_id
  ON gear_items(gear_product_id) WHERE gear_product_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
CREATE TRIGGER update_gear_brands_updated_at
  BEFORE UPDATE ON gear_brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gear_products_updated_at
  BEFORE UPDATE ON gear_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
