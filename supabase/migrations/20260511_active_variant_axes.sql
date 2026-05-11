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
-- Categories per src/data/flies-canonical: dry, nymph, streamer, emerger,
-- wet, terrestrial, egg, midge.
update fly_patterns_v2
   set active_variant_axes = array['size','bead','body','rib']
 where category = 'nymph'
   and (active_variant_axes is null or active_variant_axes = array['size','bead','body']);

update fly_patterns_v2
   set active_variant_axes = array['size','body','wing','hackle']
 where category = 'dry'
   and (active_variant_axes is null or active_variant_axes = array['size','bead','body']);

update fly_patterns_v2
   set active_variant_axes = array['size','bead','body','tail','wing']
 where category = 'streamer'
   and (active_variant_axes is null or active_variant_axes = array['size','bead','body']);

update fly_patterns_v2
   set active_variant_axes = array['size','body','wing','collar']
 where category = 'emerger'
   and (active_variant_axes is null or active_variant_axes = array['size','bead','body']);

update fly_patterns_v2
   set active_variant_axes = array['size','body','wing']
 where category = 'wet'
   and (active_variant_axes is null or active_variant_axes = array['size','bead','body']);

update fly_patterns_v2
   set active_variant_axes = array['size','body']
 where category in ('terrestrial','egg','midge')
   and (active_variant_axes is null or active_variant_axes = array['size','bead','body']);

comment on column fly_patterns_v2.active_variant_axes is
  'Variant option axes this pattern uses (e.g. {size,bead,body,rib}). '
  'The variants UI hides any column not in this list. Edit per-pattern in admin CMS.';
