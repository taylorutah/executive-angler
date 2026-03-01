-- =============================================
-- Executive Angler — Database Schema
-- =============================================

create extension if not exists "uuid-ossp";

-- =============================================
-- CONTENT TABLES (public read, admin write)
-- =============================================

create table if not exists destinations (
  id uuid primary key default uuid_generate_v4(),
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

create table if not exists rivers (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  destination_id uuid references destinations(id),
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

create table if not exists lodges (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  destination_id uuid references destinations(id),
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
  nearby_river_ids uuid[],
  average_rating numeric,
  review_count integer default 0,
  meta_title text,
  meta_description text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists guides (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  destination_id uuid references destinations(id),
  bio text,
  specialties text[],
  years_experience integer,
  photo_url text,
  website_url text,
  phone text,
  email text,
  license_number text,
  river_ids uuid[],
  daily_rate text,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fly_shops (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  destination_id uuid references destinations(id),
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
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists articles (
  id uuid primary key default uuid_generate_v4(),
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
  related_destination_ids uuid[],
  related_river_ids uuid[],
  published_at timestamptz,
  meta_title text,
  meta_description text,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists species (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  common_name text not null,
  scientific_name text,
  description text,
  image_url text,
  native_range text,
  average_size text,
  record_size text,
  preferred_habitat text,
  preferred_flies text[],
  created_at timestamptz default now()
);

-- =============================================
-- USER TABLES
-- =============================================

create table if not exists user_favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamptz default now(),
  unique(user_id, entity_type, entity_id)
);

create table if not exists user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  avatar_url text,
  home_state text,
  experience_level text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entity_type text not null,
  entity_id uuid not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  body text,
  visit_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
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
create index idx_articles_slug on articles(slug);
create index idx_articles_category on articles(category);
create index idx_articles_published on articles(published_at);
create index idx_favorites_user on user_favorites(user_id);
create index idx_favorites_entity on user_favorites(entity_type, entity_id);
create index idx_reviews_entity on reviews(entity_type, entity_id);
create index idx_reviews_user on reviews(user_id);

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
create trigger update_articles_updated_at before update on articles
  for each row execute function update_updated_at_column();
create trigger update_user_profiles_updated_at before update on user_profiles
  for each row execute function update_updated_at_column();
create trigger update_reviews_updated_at before update on reviews
  for each row execute function update_updated_at_column();
