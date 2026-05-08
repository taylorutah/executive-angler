-- Add per-box quantity tracking to fly_variant_in_box.
-- Tracks how many physical flies of each variant are in each box.
-- Default 1: existing memberships already imply at least one fly present.

ALTER TABLE fly_variant_in_box
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1;

-- Ensure non-negative
ALTER TABLE fly_variant_in_box
  ADD CONSTRAINT IF NOT EXISTS fly_variant_in_box_quantity_nonneg CHECK (quantity >= 0);
