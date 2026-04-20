-- Flatten fly_patterns.fly_color and .bead_color from text[] → text.
--
-- The original migration (20260313_fly_patterns_columns.sql) declared these as
-- plain text, but production ended up with text[] (likely because they were
-- pre-created via the Supabase dashboard with the "array" checkbox checked, so
-- the later ADD COLUMN IF NOT EXISTS was a no-op).
--
-- The entire app treats these as strings: the TS types are `string`, the
-- forms submit a single value, the VariantModal and journal flies/new pages
-- all POST raw strings. Posting a string into a text[] column throws
-- "malformed array literal: 'Tan'" from Postgres.
--
-- This migration converts each column back to text, flattening any existing
-- single-element arrays to scalar values and treating empty arrays as NULL.
-- At time of writing only 6 rows had values; all were single-element arrays
-- like ["Black"], so no data is lost.

ALTER TABLE fly_patterns
  ALTER COLUMN fly_color TYPE text USING (
    CASE
      WHEN fly_color IS NULL THEN NULL
      WHEN array_length(fly_color, 1) IS NULL THEN NULL
      ELSE fly_color[1]
    END
  );

ALTER TABLE fly_patterns
  ALTER COLUMN bead_color TYPE text USING (
    CASE
      WHEN bead_color IS NULL THEN NULL
      WHEN array_length(bead_color, 1) IS NULL THEN NULL
      ELSE bead_color[1]
    END
  );
