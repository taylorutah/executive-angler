-- Phase 2: Unified Fly Model
--
-- Consolidates the legacy three-headed fly system (canonical_flies +
-- fly_patterns + user_fly_box with personalizations jsonb + parent chains)
-- into four first-class concepts:
--
--   fly_patterns_v2      — the recipe (canonical OR personal). owner_user_id
--                          null = canonical/library; set = personal/forked.
--   fly_variants         — concrete spec (size · bead · color set). Belongs
--                          to a pattern. THIS IS WHAT YOU FISH WITH.
--   fly_variant_stock    — per (user, variant) inventory: tied / bought /
--                          target / tie-next / usage stats.
--   fly_variant_in_box   — many-to-many: which boxes this variant lives in.
--   fly_variant_photos   — multi-photo gallery per variant.
--
-- Catches gain a direct `variant_id` FK so a logged catch references a real
-- spec, not just a name string.
--
-- Old tables (canonical_flies, fly_patterns, user_fly_box, fly_box_membership)
-- stay intact. App reads from new tables once feature-flagged. Old tables
-- get dropped after iOS + Android land Phase 6 mobile rebuilds.

begin;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. fly_patterns_v2 — the unified recipe
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists fly_patterns_v2 (
  id uuid primary key default gen_random_uuid(),
  slug text,
  name text not null,
  category text,                          -- nymph, dry, streamer, emerger, etc.

  -- Ownership
  owner_user_id uuid references auth.users(id) on delete cascade,
  -- when null  → canonical (in library, public)
  -- when set   → personal (private/shared/public per visibility)
  forked_from_pattern_id uuid references fly_patterns_v2(id) on delete set null,
  promoted_to_canonical_id uuid references fly_patterns_v2(id) on delete set null,

  -- Editorial
  description text,
  history text,
  tying_overview text,
  fishing_tips text,
  imitates text[] default '{}',           -- canonical: insect families
  effective_species_ids uuid[] default '{}',
  water_types text[] default '{}',        -- freestone, tailwater, spring creek, etc.

  -- Recipe structure
  hook_style text,                        -- "Jig hook", "Standard", etc.
  base_materials jsonb default '[]'::jsonb,   -- material slot list
  tying_steps jsonb default '[]'::jsonb,

  -- Media
  hero_image_url text,
  gallery_image_urls text[] default '{}',
  video_url text,

  -- Personal-only
  visibility text not null default 'private'
    check (visibility in ('private', 'shared', 'public')),
  shared_with_user_ids uuid[] default '{}',

  -- Provenance
  contributed_by_user_id uuid references auth.users(id) on delete set null,
  origin_credit text,

  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Slug must be unique among canonical patterns; personal patterns may have
-- nullable/duplicate slugs (we route to personal patterns by id, not slug).
create unique index if not exists fly_patterns_v2_canonical_slug
  on fly_patterns_v2(slug)
  where owner_user_id is null and slug is not null;

create index if not exists idx_fly_patterns_v2_owner
  on fly_patterns_v2(owner_user_id) where owner_user_id is not null;
create index if not exists idx_fly_patterns_v2_canonical
  on fly_patterns_v2(slug) where owner_user_id is null;
create index if not exists idx_fly_patterns_v2_forked
  on fly_patterns_v2(forked_from_pattern_id) where forked_from_pattern_id is not null;
create index if not exists idx_fly_patterns_v2_visibility
  on fly_patterns_v2(visibility) where owner_user_id is not null;
create index if not exists idx_fly_patterns_v2_category on fly_patterns_v2(category);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. fly_variants — concrete spec (size · bead · color · materials override)
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists fly_variants (
  id uuid primary key default gen_random_uuid(),
  pattern_id uuid not null references fly_patterns_v2(id) on delete cascade,

  -- Creator: null = canonical/curated (visible to all);
  -- set = user-added variant on (canonical or personal) pattern, private to creator
  created_by_user_id uuid references auth.users(id) on delete cascade,

  -- Identity (canonical variants get a slug fragment; personal can leave null)
  slug text,
  display_name text,                      -- "Size 16 · olive · tungsten 2.8"
  notes text,

  -- Hook / size spec
  size text not null,                     -- "16", "14-18", "20"
  hook_style text,
  hook_brand text,

  -- Bead
  bead_material text check (bead_material in ('tungsten','brass','glass','none')),
  bead_weight_mm numeric(4,2),
  bead_color text,

  -- Color set (per material slot — extend as patterns demand)
  body_color text,
  rib_color text,
  tail_color text,
  wing_color text,
  thorax_color text,
  collar_color text,

  -- Per-variant material substitutions (only differences from pattern.base_materials)
  materials_override jsonb default '{}'::jsonb,

  -- Display
  sort_order integer not null default 0,
  is_default_for_pattern boolean default false,    -- canonical default variant

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (pattern_id, slug)
);

create unique index if not exists fly_variants_one_default_per_pattern
  on fly_variants(pattern_id) where is_default_for_pattern = true and created_by_user_id is null;

create index if not exists idx_fly_variants_pattern
  on fly_variants(pattern_id, sort_order);
create index if not exists idx_fly_variants_pattern_user
  on fly_variants(pattern_id, created_by_user_id);
create index if not exists idx_fly_variants_creator
  on fly_variants(created_by_user_id) where created_by_user_id is not null;
create index if not exists idx_fly_variants_size on fly_variants(size);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. fly_variant_stock — per-user per-variant inventory + tie-next state
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists fly_variant_stock (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  variant_id uuid not null references fly_variants(id) on delete cascade,

  -- Inventory split
  tied_count integer not null default 0,
  bought_count integer not null default 0,
  target_count integer not null default 0,

  -- Tie-next workflow
  tie_next_status text not null default 'none'
    check (tie_next_status in ('none','wanted','at_vise','done')),
  tie_next_target_qty integer,
  tie_next_notes text,

  -- Usage stats (denormalized, updated by triggers / app code)
  times_used integer not null default 0,
  last_used_at timestamptz,
  last_loss_at timestamptz,

  -- Personal
  is_favorite boolean not null default false,
  personal_notes text,

  added_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, variant_id)
);

create index if not exists idx_fly_variant_stock_user on fly_variant_stock(user_id);
create index if not exists idx_fly_variant_stock_variant on fly_variant_stock(variant_id);
create index if not exists idx_fly_variant_stock_favorite
  on fly_variant_stock(user_id) where is_favorite = true;
create index if not exists idx_fly_variant_stock_deficit
  on fly_variant_stock(user_id, ((target_count - tied_count - bought_count)) desc)
  where target_count > 0;
create index if not exists idx_fly_variant_stock_tie_next
  on fly_variant_stock(user_id, tie_next_status)
  where tie_next_status <> 'none';

-- ────────────────────────────────────────────────────────────────────────────
-- 4. fly_variant_in_box — variant ↔ fly_box join
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists fly_variant_in_box (
  box_id uuid not null references fly_boxes(id) on delete cascade,
  variant_id uuid not null references fly_variants(id) on delete cascade,
  user_id uuid not null,                  -- denormalized for RLS performance
  sort_order integer not null default 0,
  added_at timestamptz default now(),
  primary key (box_id, variant_id)
);

create index if not exists idx_fly_variant_in_box_variant
  on fly_variant_in_box(variant_id);
create index if not exists idx_fly_variant_in_box_user_box
  on fly_variant_in_box(user_id, box_id, sort_order);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. fly_variant_photos — multi-photo gallery per variant
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists fly_variant_photos (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references fly_variants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  -- null user_id = canonical photo (admin-curated)

  storage_path text not null,             -- key in 'variant-photos' bucket
  caption text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,

  uploaded_at timestamptz default now()
);

create unique index if not exists fly_variant_photos_one_primary
  on fly_variant_photos(variant_id) where is_primary = true;
create index if not exists idx_fly_variant_photos_variant
  on fly_variant_photos(variant_id, sort_order);
create index if not exists idx_fly_variant_photos_user
  on fly_variant_photos(user_id) where user_id is not null;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. catches.variant_id — first-class link to spec used
-- ────────────────────────────────────────────────────────────────────────────
alter table catches
  add column if not exists variant_id uuid references fly_variants(id) on delete set null;

create index if not exists idx_catches_variant
  on catches(variant_id) where variant_id is not null;

-- ────────────────────────────────────────────────────────────────────────────
-- 7. updated_at triggers
-- ────────────────────────────────────────────────────────────────────────────
create or replace function update_phase2_fly_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists fly_patterns_v2_updated_at_trigger on fly_patterns_v2;
create trigger fly_patterns_v2_updated_at_trigger
  before update on fly_patterns_v2
  for each row execute function update_phase2_fly_updated_at();

drop trigger if exists fly_variants_updated_at_trigger on fly_variants;
create trigger fly_variants_updated_at_trigger
  before update on fly_variants
  for each row execute function update_phase2_fly_updated_at();

drop trigger if exists fly_variant_stock_updated_at_trigger on fly_variant_stock;
create trigger fly_variant_stock_updated_at_trigger
  before update on fly_variant_stock
  for each row execute function update_phase2_fly_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- 8. Row Level Security
-- ────────────────────────────────────────────────────────────────────────────
alter table fly_patterns_v2 enable row level security;
alter table fly_variants enable row level security;
alter table fly_variant_stock enable row level security;
alter table fly_variant_in_box enable row level security;
alter table fly_variant_photos enable row level security;

-- fly_patterns_v2: canonical readable by all; personal readable by owner or
-- via visibility (public reachable to anyone; shared to listed user_ids;
-- private only to owner).
drop policy if exists fly_patterns_v2_read_canonical on fly_patterns_v2;
create policy fly_patterns_v2_read_canonical on fly_patterns_v2
  for select using (owner_user_id is null);

drop policy if exists fly_patterns_v2_read_public on fly_patterns_v2;
create policy fly_patterns_v2_read_public on fly_patterns_v2
  for select using (owner_user_id is not null and visibility = 'public');

drop policy if exists fly_patterns_v2_read_shared on fly_patterns_v2;
create policy fly_patterns_v2_read_shared on fly_patterns_v2
  for select using (
    owner_user_id is not null
    and visibility = 'shared'
    and auth.uid() = any(shared_with_user_ids)
  );

drop policy if exists fly_patterns_v2_owner_all on fly_patterns_v2;
create policy fly_patterns_v2_owner_all on fly_patterns_v2
  for all using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- fly_variants:
--   Read: canonical-curated (created_by_user_id is null) visible if the
--         pattern is visible. User-created variants visible only to creator.
--   Write: created_by_user_id matches auth.uid(), and the parent pattern
--         is either canonical (owner_user_id is null) or owned by user.
drop policy if exists fly_variants_read on fly_variants;
create policy fly_variants_read on fly_variants
  for select using (
    -- Canonical-curated variant: follow pattern visibility
    (
      created_by_user_id is null
      and exists (
        select 1 from fly_patterns_v2 p
         where p.id = fly_variants.pattern_id
           and (
                p.owner_user_id is null
             or p.owner_user_id = auth.uid()
             or p.visibility = 'public'
             or (p.visibility = 'shared' and auth.uid() = any(p.shared_with_user_ids))
           )
      )
    )
    or
    -- User-created variant: only the creator sees it
    created_by_user_id = auth.uid()
  );

drop policy if exists fly_variants_user_write on fly_variants;
create policy fly_variants_user_write on fly_variants
  for all using (created_by_user_id = auth.uid())
  with check (
    created_by_user_id = auth.uid()
    and exists (
      select 1 from fly_patterns_v2 p
       where p.id = fly_variants.pattern_id
         and (p.owner_user_id is null or p.owner_user_id = auth.uid())
    )
  );

-- fly_variant_stock: owner only
drop policy if exists fly_variant_stock_owner on fly_variant_stock;
create policy fly_variant_stock_owner on fly_variant_stock
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- fly_variant_in_box: owner only (via denormalized user_id)
drop policy if exists fly_variant_in_box_owner on fly_variant_in_box;
create policy fly_variant_in_box_owner on fly_variant_in_box
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- fly_variant_photos: read follows pattern visibility; write own only
drop policy if exists fly_variant_photos_read on fly_variant_photos;
create policy fly_variant_photos_read on fly_variant_photos
  for select using (
    user_id is null  -- canonical photo
    or user_id = auth.uid()
    or exists (
      select 1 from fly_variants v
        join fly_patterns_v2 p on p.id = v.pattern_id
       where v.id = fly_variant_photos.variant_id
         and (p.owner_user_id is null or p.visibility = 'public')
    )
  );

drop policy if exists fly_variant_photos_owner_write on fly_variant_photos;
create policy fly_variant_photos_owner_write on fly_variant_photos
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

commit;
