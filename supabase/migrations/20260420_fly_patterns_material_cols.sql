-- Expand fly_patterns to cover every material role a tier might vary.
--
-- Pre-existing columns already handle the bead, body, fly_color, tail, thorax,
-- collar, rib_material, and wing_material. To complete "every material is
-- variantable" (hook, thread, body, collar, rib, wing, hot spot, …), we need
-- dedicated color columns for the material roles that only had the _material
-- column — and a standalone `hot_spot_color` + `thread_color` so the variant
-- modal can spawn colored riffs without jamming everything into `materials`.
--
-- All columns default NULL and are independent; inheriting rows keep existing
-- behavior. Named with the `IF NOT EXISTS` guard so this migration is
-- idempotent and safe to re-run.

ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS thread_color text;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS rib_color text;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS wing_color text;
ALTER TABLE fly_patterns ADD COLUMN IF NOT EXISTS hot_spot_color text;
