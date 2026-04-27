-- Gear catalog: extend categories from {rod, reel, waders} to the full
-- fly shop directory: rods, reels, waders, wading boots, lines, leaders,
-- tippet, packs, nets. Add variant_summary JSONB column for model-level
-- variant disclosure (line weights, lengths, sizes, hand options).

ALTER TABLE gear_products DROP CONSTRAINT IF EXISTS gear_products_category_check;

ALTER TABLE gear_products
  ADD CONSTRAINT gear_products_category_check
  CHECK (category IN (
    'rod',
    'reel',
    'waders',
    'wading-boots',
    'line',
    'leader',
    'tippet',
    'pack',
    'net'
  ));

ALTER TABLE gear_products
  ADD COLUMN IF NOT EXISTS variant_summary JSONB NOT NULL DEFAULT '{}'::jsonb;
