-- =============================================
-- Migration: UUID → TEXT primary keys for content tables
-- =============================================
-- Run this in the Supabase SQL Editor BEFORE seeding.
-- This drops and recreates all content + user tables with text IDs.
-- No production user data exists yet, so this is safe.

-- Drop tables in reverse dependency order
drop table if exists photo_submissions cascade;
drop table if exists reviews cascade;
drop table if exists user_favorites cascade;
drop table if exists user_profiles cascade;
drop table if exists articles cascade;
drop table if exists fly_shops cascade;
drop table if exists guides cascade;
drop table if exists lodges cascade;
drop table if exists species cascade;
drop table if exists rivers cascade;
drop table if exists destinations cascade;

-- Drop existing triggers (they reference old tables)
drop trigger if exists update_destinations_updated_at on destinations;
drop trigger if exists update_rivers_updated_at on rivers;
drop trigger if exists update_lodges_updated_at on lodges;
drop trigger if exists update_articles_updated_at on articles;
drop trigger if exists update_user_profiles_updated_at on user_profiles;
drop trigger if exists update_reviews_updated_at on reviews;
drop trigger if exists update_species_updated_at on species;

-- =============================================
-- CONTENT TABLES (text IDs)
-- =============================================

create table destinations (
  id text primary key,
  slug text unique not null,
  name text not null,
  region text not null,
  country text not null default 'USA',
  state text,
  tagline text,
  description text,
  hero_image_url text,
  thumbnail_url text,
  latitude numeric,
  longitude numeric,
  best_months text[],
  primary_species text[],
  license_info text,
  elevation_range text,
  climate_notes text,
  regulations_summary text,
  meta_title text,
  meta_description text,
  featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table rivers (
  id text primary key,
  slug text unique not null,
  name text not null,
  destination_id text references destinations(id),
  description text,
  hero_image_url text,
  thumbnail_url text,
  length_miles numeric,
  flow_type text,
  difficulty text,
  wading_type text,
  primary_species text[],
  regulations text,
  access_points jsonb,
  best_months text[],
  latitude numeric,
  longitude numeric,
  map_bounds jsonb,
  hatch_chart jsonb,
  meta_title text,
  meta_description text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table lodges (
  id text primary key,
  slug text unique not null,
  name text not null,
  destination_id text references destinations(id),
  description text,
  hero_image_url text,
  thumbnail_url text,
  gallery_urls text[],
  website_url text,
  phone text,
  email text,
  address text,
  latitude numeric,
  longitude numeric,
  price_range text,
  price_tier integer,
  season_start text,
  season_end text,
  capacity integer,
  amenities text[],
  nearby_river_ids text[],
  average_rating numeric,
  review_count integer default 0,
  google_place_id text,
  google_rating numeric,
  google_review_count integer,
  google_reviews_url text,
  featured_reviews jsonb,
  meta_title text,
  meta_description text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table guides (
  id text primary key,
  slug text unique not null,
  name text not null,
  destination_id text references destinations(id),
  bio text,
  specialties text[],
  years_experience integer,
  photo_url text,
  website_url text,
  phone text,
  email text,
  license_number text,
  river_ids text[],
  daily_rate text,
  google_place_id text,
  google_rating numeric,
  google_review_count integer,
  google_reviews_url text,
  featured_reviews jsonb,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table fly_shops (
  id text primary key,
  slug text unique not null,
  name text not null,
  destination_id text references destinations(id),
  description text,
  hero_image_url text,
  address text,
  latitude numeric,
  longitude numeric,
  phone text,
  website_url text,
  hours jsonb,
  services text[],
  brands_carried text[],
  google_place_id text,
  google_rating numeric,
  google_review_count integer,
  google_reviews_url text,
  featured_reviews jsonb,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table species (
  id text primary key,
  slug text unique not null,
  common_name text not null,
  scientific_name text,
  family text,
  description text,
  image_url text,
  illustration_url text,
  native_range text,
  introduced_range text,
  average_size text,
  record_size text,
  record_details text,
  preferred_habitat text,
  preferred_flies text[],
  taxonomy jsonb,
  conservation_status text,
  diet text,
  spawning_info text,
  spawning_months text[],
  spawning_temp_f text,
  lifespan text,
  water_temperature_range text,
  fly_fishing_tips text,
  tackle_recommendations text,
  fun_facts text[],
  related_destination_ids text[],
  related_river_ids text[],
  distribution_coordinates jsonb,
  meta_title text,
  meta_description text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table articles (
  id text primary key,
  slug text unique not null,
  title text not null,
  subtitle text,
  author text default 'Executive Angler Staff',
  category text,
  hero_image_url text,
  thumbnail_url text,
  excerpt text,
  content text,
  reading_time_minutes integer,
  tags text[],
  related_destination_ids text[],
  related_river_ids text[],
  published_at timestamptz,
  meta_title text,
  meta_description text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- USER TABLES
-- =============================================

create table user_favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entity_type text not null,
  entity_id text not null,
  created_at timestamptz default now(),
  unique(user_id, entity_type, entity_id)
);

create table user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  avatar_url text,
  home_state text,
  experience_level text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entity_type text not null,
  entity_id text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  body text,
  visit_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- PHOTO SUBMISSIONS
-- =============================================

create table photo_submissions (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null,
  entity_id text not null,
  submitter_name text not null,
  submitter_email text not null,
  photo_url text not null,
  caption text,
  camera_body text,
  lens text,
  aperture text,
  shutter_speed text,
  iso text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz default now(),
  approved_at timestamptz,
  user_id uuid references auth.users(id) on delete set null
);

-- =============================================
-- INDEXES
-- =============================================

create index idx_destinations_slug on destinations(slug);
create index idx_rivers_slug on rivers(slug);
create index idx_rivers_destination on rivers(destination_id);
create index idx_lodges_slug on lodges(slug);
create index idx_lodges_destination on lodges(destination_id);
create index idx_guides_slug on guides(slug);
create index idx_guides_destination on guides(destination_id);
create index idx_fly_shops_slug on fly_shops(slug);
create index idx_fly_shops_destination on fly_shops(destination_id);
create index idx_articles_slug on articles(slug);
create index idx_articles_category on articles(category);
create index idx_articles_published on articles(published_at);
create index idx_species_slug on species(slug);
create index idx_favorites_user on user_favorites(user_id);
create index idx_favorites_entity on user_favorites(entity_type, entity_id);
create index idx_reviews_entity on reviews(entity_type, entity_id);
create index idx_reviews_user on reviews(user_id);
create index idx_photos_entity on photo_submissions(entity_type, entity_id);
create index idx_photos_status on photo_submissions(status);
create index idx_photos_user on photo_submissions(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table destinations enable row level security;
create policy "Public read destinations" on destinations for select using (true);

alter table rivers enable row level security;
create policy "Public read rivers" on rivers for select using (true);

alter table lodges enable row level security;
create policy "Public read lodges" on lodges for select using (true);

alter table guides enable row level security;
create policy "Public read guides" on guides for select using (true);

alter table fly_shops enable row level security;
create policy "Public read fly_shops" on fly_shops for select using (true);

alter table articles enable row level security;
create policy "Public read articles" on articles for select using (true);

alter table species enable row level security;
create policy "Public read species" on species for select using (true);

alter table user_favorites enable row level security;
create policy "Users can view own favorites" on user_favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on user_favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on user_favorites for delete using (auth.uid() = user_id);

alter table user_profiles enable row level security;
create policy "Users can view own profile" on user_profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on user_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = user_id);

alter table reviews enable row level security;
create policy "Public read reviews" on reviews for select using (true);
create policy "Users can insert own reviews" on reviews for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on reviews for delete using (auth.uid() = user_id);

alter table photo_submissions enable row level security;
create policy "Public read approved photos" on photo_submissions for select using (status = 'approved');
create policy "Users can view own submissions" on photo_submissions for select using (auth.uid() = user_id);
create policy "Authenticated users can submit photos" on photo_submissions for insert with check (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_destinations_updated_at before update on destinations
  for each row execute function update_updated_at_column();
create trigger update_rivers_updated_at before update on rivers
  for each row execute function update_updated_at_column();
create trigger update_lodges_updated_at before update on lodges
  for each row execute function update_updated_at_column();
create trigger update_guides_updated_at before update on guides
  for each row execute function update_updated_at_column();
create trigger update_fly_shops_updated_at before update on fly_shops
  for each row execute function update_updated_at_column();
create trigger update_species_updated_at before update on species
  for each row execute function update_updated_at_column();
create trigger update_articles_updated_at before update on articles
  for each row execute function update_updated_at_column();
create trigger update_user_profiles_updated_at before update on user_profiles
  for each row execute function update_updated_at_column();
create trigger update_reviews_updated_at before update on reviews
  for each row execute function update_updated_at_column();
