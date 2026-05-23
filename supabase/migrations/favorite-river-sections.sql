-- =============================================
-- Favorite River Sections + Section Preferences
-- =============================================
-- Adds two tables for the dashboard redesign:
--
--   user_favorite_sections   — user-pinned river sections with custom ordering
--   user_river_section_pref  — per-river "which gauge" choice for the
--                              "Your Rivers" view of the dashboard
--
-- A river section is identified by (river_id, usgs_site_id). The site_id
-- lives inside rivers.usgs_gauge_id JSONB and is not unique site-wide on its
-- own — it must always be qualified by river_id.
-- =============================================

-- ── user_favorite_sections ──────────────────────────────────────────────────

create table if not exists user_favorite_sections (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  river_id      text not null references rivers(id) on delete cascade,
  usgs_site_id  text not null,
  position      integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (user_id, river_id, usgs_site_id)
);

create index if not exists idx_user_favorite_sections_user_position
  on user_favorite_sections (user_id, position);

alter table user_favorite_sections enable row level security;

create policy "Users can view own favorite sections"
  on user_favorite_sections for select using (auth.uid() = user_id);

create policy "Users can insert own favorite sections"
  on user_favorite_sections for insert with check (auth.uid() = user_id);

create policy "Users can update own favorite sections"
  on user_favorite_sections for update using (auth.uid() = user_id);

create policy "Users can delete own favorite sections"
  on user_favorite_sections for delete using (auth.uid() = user_id);

-- ── user_river_section_pref ────────────────────────────────────────────────
-- Remembers which gauge the user last viewed for a given river on the
-- "Your Rivers" tab (one row per (user_id, river_id)). Used as the default
-- selection when the section selector renders.

create table if not exists user_river_section_pref (
  user_id       uuid not null references auth.users(id) on delete cascade,
  river_id      text not null references rivers(id) on delete cascade,
  usgs_site_id  text not null,
  updated_at    timestamptz not null default now(),
  primary key (user_id, river_id)
);

alter table user_river_section_pref enable row level security;

create policy "Users can view own section pref"
  on user_river_section_pref for select using (auth.uid() = user_id);

create policy "Users can upsert own section pref"
  on user_river_section_pref for insert with check (auth.uid() = user_id);

create policy "Users can update own section pref"
  on user_river_section_pref for update using (auth.uid() = user_id);

create policy "Users can delete own section pref"
  on user_river_section_pref for delete using (auth.uid() = user_id);
