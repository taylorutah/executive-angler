-- 20260511_active_variant_axes.sql
--
-- Adds `active_variant_axes` to fly_patterns_v2 so each pattern declares which
-- option columns are meaningful for its variants. A Perdigon has no rib;
-- showing an empty Rib column produces UI noise and forces users to scan
-- through columns that will never have data.
--
-- The variants UI reads this list and only renders the axes that apply.
-- Default seeds smart per-category values; admin can override per-pattern in
-- the CMS.

alter table fly_patterns_v2
  add column if not exists active_variant_axes text[]
  default array['size','bead','body']::text[];

-- Per-category defaults — backfill existing rows with sensible axes.
-- Category casing is inconsistent in the data (e.g. both 'nymph' and 'Nymph',
-- 'dry' and 'Dry Fly'), so match with lower(category) like '<prefix>%'.
update fly_patterns_v2
   set active_variant_axes = array['size','bead','body','rib']
 where lower(category) like 'nymph%'
   and (active_variant_axes is null or active_variant_axes = array['size','bead','body']::text[]);

update fly_patterns_v2
   set active_variant_axes = array['size','body','wing','hackle']
 where lower(category) like 'dry%'
   and (active_variant_axes is null or active_variant_axes = array['size','bead','body']::text[]);

update fly_patterns_v2
   set active_variant_axes = array['size','bead','body','tail','wing']
 where lower(category) like 'streamer%'
   and (active_variant_axes is null or active_variant_axes = array['size','bead','body']::text[]);

update fly_patterns_v2
   set active_variant_axes = array['size','body','wing','collar']
 where lower(category) like 'emerger%'
   and (active_variant_axes is null or active_variant_axes = array['size','bead','body']::text[]);

update fly_patterns_v2
   set active_variant_axes = array['size','body','wing']
 where lower(category) like 'wet%'
   and (active_variant_axes is null or active_variant_axes = array['size','bead','body']::text[]);

update fly_patterns_v2
   set active_variant_axes = array['size','body']
 where (lower(category) like 'terrestrial%'
        or lower(category) like 'egg%'
        or lower(category) like 'midge%')
   and (active_variant_axes is null or active_variant_axes = array['size','bead','body']::text[]);

comment on column fly_patterns_v2.active_variant_axes is
  'Variant option axes this pattern uses (e.g. {size,bead,body,rib}). '
  'The variants UI hides any column not in this list. Edit per-pattern in admin CMS.';
