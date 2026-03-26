-- ═══════════════════════════════════════════════════════
-- CANONICAL FLY CATALOG (system-owned, public, SEO pages)
-- ═══════════════════════════════════════════════════════

create table if not exists canonical_flies (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  category      text not null,

  -- Editorial content
  tagline           text,
  description       text not null,
  history           text,
  tying_overview    text,
  tying_steps       jsonb,
  materials_list    jsonb,
  fishing_tips      text,
  when_to_use       text,

  -- Classification & search
  imitates          text[],
  effective_species text[],
  water_types       text[],

  -- Variations (structured)
  sizes             text[] not null,
  colors            text[],
  bead_options      text[],
  hook_styles       text[],
  key_variations    jsonb,

  -- Media
  hero_image_url    text,
  gallery_urls      text[],
  icon_url          text,
  video_url         text,
  additional_videos jsonb,

  -- Relationships
  related_fly_ids       uuid[],
  related_river_ids     text[],
  related_destination_ids text[],
  hatch_associations    jsonb,

  -- Commerce & attribution
  affiliate_links   jsonb,
  fly_shop_ids      text[],
  origin_credit     text,

  -- SEO
  meta_title        text,
  meta_description  text,

  -- Ranking & display
  rank              integer,
  featured          boolean default false,
  is_hero_pattern   boolean default false,

  -- Timestamps
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_canonical_flies_slug on canonical_flies(slug);
create index if not exists idx_canonical_flies_category on canonical_flies(category);
create index if not exists idx_canonical_flies_rank on canonical_flies(rank);
create index if not exists idx_canonical_flies_featured on canonical_flies(featured) where featured = true;

-- RLS: public read, no public write
alter table canonical_flies enable row level security;

drop policy if exists "canonical_flies_public_read" on canonical_flies;
create policy "canonical_flies_public_read" on canonical_flies
  for select using (true);

-- Trigger for updated_at
create trigger update_canonical_flies_updated_at
  before update on canonical_flies
  for each row execute function update_updated_at_column();

-- ═══════════════════════════════════════════════════════
-- USER FLY BOX (personal references to canonical + custom)
-- ═══════════════════════════════════════════════════════

create table if not exists user_fly_box (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  canonical_fly_id  uuid references canonical_flies(id),
  fly_pattern_id    uuid references fly_patterns(id),

  -- Personal overrides
  preferred_sizes   text[],
  preferred_colors  text[],
  personal_notes    text,
  custom_image_url  text,
  custom_name       text,

  -- Organization
  box_section       text,
  sort_order        integer default 0,
  is_favorite       boolean default false,

  -- Usage stats
  times_used        integer default 0,
  last_used_at      timestamptz,
  fish_caught_count integer default 0,

  -- Timestamps
  added_at      timestamptz default now(),
  updated_at    timestamptz default now(),

  unique(user_id, canonical_fly_id),
  unique(user_id, fly_pattern_id)
);

create index if not exists idx_user_fly_box_user on user_fly_box(user_id);
create index if not exists idx_user_fly_box_canonical on user_fly_box(canonical_fly_id);
create index if not exists idx_user_fly_box_usage on user_fly_box(user_id, times_used desc);

-- RLS: own data only
alter table user_fly_box enable row level security;

drop policy if exists "user_fly_box_select_own" on user_fly_box;
create policy "user_fly_box_select_own" on user_fly_box
  for select using (auth.uid() = user_id);

drop policy if exists "user_fly_box_insert_own" on user_fly_box;
create policy "user_fly_box_insert_own" on user_fly_box
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_fly_box_update_own" on user_fly_box;
create policy "user_fly_box_update_own" on user_fly_box
  for update using (auth.uid() = user_id);

drop policy if exists "user_fly_box_delete_own" on user_fly_box;
create policy "user_fly_box_delete_own" on user_fly_box
  for delete using (auth.uid() = user_id);

-- Trigger for updated_at
create trigger update_user_fly_box_updated_at
  before update on user_fly_box
  for each row execute function update_updated_at_column();
