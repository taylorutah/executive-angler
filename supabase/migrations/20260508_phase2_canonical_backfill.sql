-- Phase 2: backfill fly_patterns_v2 + default canonical variants from canonical_flies.
--
-- Source: canonical_flies (40 columns, ~120 rows)
-- Targets:
--   fly_patterns_v2 — one row per canonical fly (preserves ids, owner_user_id null)
--   fly_variants    — one default variant per canonical (created_by_user_id null,
--                     is_default_for_pattern true). Spec is taken from the first
--                     listed size + bead_options + colors arrays. User-created
--                     variants come later via the workbench UI.
--
-- User data (user_fly_box → fly_variant_stock) is NOT migrated here. That's a
-- separate, riskier step and ships in a follow-on commit after we've verified
-- the new Pattern detail page renders correctly against this seed.
--
-- Idempotent (on conflict do nothing). Safe to re-run.

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Canonical patterns → fly_patterns_v2 (preserve ids)
-- ────────────────────────────────────────────────────────────────────────────
insert into fly_patterns_v2 (
  id,
  slug,
  name,
  category,
  description,
  history,
  tying_overview,
  fishing_tips,
  imitates,
  water_types,
  base_materials,
  tying_steps,
  hero_image_url,
  gallery_image_urls,
  video_url,
  visibility,
  contributed_by_user_id,
  origin_credit,
  is_featured,
  created_at,
  updated_at,
  -- canonical: owner_user_id stays null
  owner_user_id
)
select
  cf.id,
  cf.slug,
  cf.name,
  cf.category,
  cf.description,
  cf.history,
  cf.tying_overview,
  cf.fishing_tips,
  coalesce(cf.imitates, '{}'::text[]),
  coalesce(cf.water_types, '{}'::text[]),
  coalesce(cf.materials_list, '[]'::jsonb),
  coalesce(cf.tying_steps, '[]'::jsonb),
  cf.hero_image_url,
  coalesce(cf.gallery_urls, '{}'::text[]),
  cf.video_url,
  'private',                                  -- ignored for canonical
  cf.contributed_by_user_id,
  cf.origin_credit,
  coalesce(cf.featured, false),
  coalesce(cf.created_at, now()),
  coalesce(cf.updated_at, now()),
  null                                        -- canonical: no owner
from canonical_flies cf
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Default variant per canonical pattern.
--    We pick the first size / first bead_option / first color (if present),
--    or fall back to "Standard" / null. Users can add more variants later.
-- ────────────────────────────────────────────────────────────────────────────
insert into fly_variants (
  pattern_id,
  created_by_user_id,
  slug,
  display_name,
  size,
  hook_style,
  bead_material,
  bead_color,
  body_color,
  sort_order,
  is_default_for_pattern
)
select
  cf.id,
  null                                        -- canonical-curated
  ,
  -- slug fragment "default"; we use unique(pattern_id, slug)
  'default',
  case
    when array_length(cf.sizes, 1) > 0 then cf.name || ' #' || cf.sizes[1]
    else cf.name
  end,
  -- size: first listed, or "Standard"
  coalesce(cf.sizes[1], 'Standard'),
  -- hook_style: first hook_styles entry
  cf.hook_styles[1],
  -- bead_material: parse first bead_options entry, default to null
  case
    when cf.bead_options[1] ilike '%tungsten%' then 'tungsten'
    when cf.bead_options[1] ilike '%brass%'    then 'brass'
    when cf.bead_options[1] ilike '%glass%'    then 'glass'
    when cf.bead_options[1] is not null         then 'tungsten'
    else null
  end,
  cf.bead_options[1],
  cf.colors[1],
  0,
  true
from canonical_flies cf
where not exists (
  select 1 from fly_variants v
   where v.pattern_id = cf.id
     and v.created_by_user_id is null
     and v.is_default_for_pattern = true
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Verify
-- ────────────────────────────────────────────────────────────────────────────
-- (commented; uncomment when running interactively)
-- select 'patterns' as kind, count(*) from fly_patterns_v2 where owner_user_id is null
-- union all
-- select 'default_variants' as kind, count(*) from fly_variants where created_by_user_id is null and is_default_for_pattern = true
-- union all
-- select 'canonical_source', count(*) from canonical_flies;

commit;
