-- ============================================================
-- Nymph variation fields — first-class columns for quick variants
-- ============================================================
-- Adds bead material/size (so tungsten vs brass + mm size are
-- diffable) plus body/tail/thorax/collar colors so common nymph
-- variations are a 3-click edit instead of requiring the full
-- structured recipe builder.
-- ============================================================

ALTER TABLE public.fly_patterns
  ADD COLUMN IF NOT EXISTS bead_material text,     -- none | brass | tungsten | slotted_tungsten | copper | other
  ADD COLUMN IF NOT EXISTS bead_size_mm numeric,   -- bead diameter (2.0, 2.4, 2.8, 3.2, 3.5, 3.8, 4.0 ...)
  ADD COLUMN IF NOT EXISTS body_color text,
  ADD COLUMN IF NOT EXISTS body_material text,
  ADD COLUMN IF NOT EXISTS tail_color text,
  ADD COLUMN IF NOT EXISTS thorax_color text,
  ADD COLUMN IF NOT EXISTS collar_color text,
  ADD COLUMN IF NOT EXISTS rib_material text,
  ADD COLUMN IF NOT EXISTS wing_material text;

-- Optional sanity check on bead_material values (loose; accepts anything for now)
COMMENT ON COLUMN public.fly_patterns.bead_material IS
  'Bead/head material. Common values: none, brass, tungsten, slotted_tungsten, copper, other';

COMMENT ON COLUMN public.fly_patterns.bead_size_mm IS
  'Bead diameter in millimeters (e.g. 2.4, 3.2, 3.8). Decouples tungsten 3.2mm from brass 3.5mm as distinct variants.';
