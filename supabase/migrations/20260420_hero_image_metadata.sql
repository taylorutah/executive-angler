-- Add hero image metadata columns (alt, credit, credit_url, thumbnail_url)
-- to every entity table. entity-config.ts has referenced these since admin CMS
-- shipped, but they were never actually migrated — so saves via
-- /admin/content/[entity]/[id] crash with "column not found".
--
-- species and guides have hero_image_alt/credit* but use image_url / photo_url
-- for the primary asset, so they don't get thumbnail_url.

alter table destinations
  add column if not exists hero_image_alt text,
  add column if not exists hero_image_credit text,
  add column if not exists hero_image_credit_url text,
  add column if not exists thumbnail_url text;

alter table rivers
  add column if not exists hero_image_alt text,
  add column if not exists hero_image_credit text,
  add column if not exists hero_image_credit_url text,
  add column if not exists thumbnail_url text;

alter table species
  add column if not exists hero_image_alt text,
  add column if not exists hero_image_credit text,
  add column if not exists hero_image_credit_url text;

alter table lodges
  add column if not exists hero_image_alt text,
  add column if not exists hero_image_credit text,
  add column if not exists hero_image_credit_url text,
  add column if not exists thumbnail_url text;

alter table guides
  add column if not exists hero_image_alt text,
  add column if not exists hero_image_credit text,
  add column if not exists hero_image_credit_url text;

alter table fly_shops
  add column if not exists hero_image_alt text,
  add column if not exists hero_image_credit text,
  add column if not exists hero_image_credit_url text,
  add column if not exists thumbnail_url text;

alter table articles
  add column if not exists hero_image_alt text,
  add column if not exists hero_image_credit text,
  add column if not exists hero_image_credit_url text,
  add column if not exists thumbnail_url text;
