-- Cleanup: canonical fly_variants whose `size` is a JSON-array or CSV string.
--
-- An earlier seeding/migration stuffed text like '["14","16","18"]' or
-- '14,16,18,20,22,24' into fly_variants.size on canonical patterns
-- (owner_user_id IS NULL) instead of exploding them into per-size rows.
-- Result: the /flies/[slug] detail page renders one ugly row with the raw
-- array tail visible as the "Size" cell (visible on Jack Daniels, France
-- Fly, Eggstasy Yellow, Hares Ear, Sexy Walts, Fluorescent Surprise
-- Perdigon, Missing Link, etc.).
--
-- Pre-flight check confirmed zero references to these polluted variants from
-- fly_variant_in_box, fly_variant_stock, or catches — they're orphan
-- defaults nobody depends on. Safe to replace.
--
-- This migration:
--   1. Inserts one proper canonical variant per parsed size, copying the
--      polluted row's bead/hook/notes so any defaults carry forward.
--   2. Deletes the polluted variant rows.
--
-- Parser identical to 20260514_explode_personal_pattern_sizes.sql:
--   strip [, ], ", #, whitespace; split on comma; drop empties.

begin;

with bad as (
  select fv.id as variant_id, fv.pattern_id, fv.size as raw_size,
         fv.bead_weight_mm, fv.bead_material, fv.hook_style, fv.notes
  from fly_variants fv
  join fly_patterns_v2 pv on pv.id = fv.pattern_id
  where pv.owner_user_id is null
    and (fv.size like '[%' or fv.size like '%,%')
)
insert into fly_variants (
  pattern_id, size, bead_weight_mm, bead_material, hook_style, notes, sort_order
)
select
  b.pattern_id,
  s.size_value,
  b.bead_weight_mm,
  b.bead_material,
  b.hook_style,
  b.notes,
  (s.idx)::integer
from bad b
cross join lateral (
  select
    trim(regexp_replace(elem, '[\[\]"#[:space:]]', '', 'g')) as size_value,
    ord                                                       as idx
  from unnest(string_to_array(b.raw_size, ',')) with ordinality t(elem, ord)
) s
where length(s.size_value) >= 1
  and not exists (
    select 1 from fly_variants v
    where v.pattern_id          = b.pattern_id
      and v.size                = s.size_value
      and v.created_by_user_id is null
  );

delete from fly_variants fv
where fv.id in (
  select fv2.id
  from fly_variants fv2
  join fly_patterns_v2 pv on pv.id = fv2.pattern_id
  where pv.owner_user_id is null
    and (fv2.size like '[%' or fv2.size like '%,%')
);

commit;
