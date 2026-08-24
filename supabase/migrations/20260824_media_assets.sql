-- Media catalogue for self-hosted images.
-- A published row must carry a readable licence. Hotlinks are not a licence.

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  column_name text not null default 'hero_image_url',
  storage_path text,
  source_url text,
  credit_name text,
  credit_url text,
  licence text,
  licence_url text,
  acquired_at timestamptz,
  blur_hash text,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'flagged', 'unpublished')),
  tier text not null
    check (tier in ('unsplash', 'wikimedia', 'brand', 'avatar', 'owned')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id, column_name)
);

alter table public.media_assets
  add constraint media_assets_published_needs_licence
  check (status <> 'published' or (licence is not null and length(trim(licence)) > 0));

create index if not exists media_assets_status_idx on public.media_assets (status);
create index if not exists media_assets_tier_idx on public.media_assets (tier);

create table if not exists public.brand_image_permissions (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  asset_url text not null,
  entity_type text,
  route_to_permission text not null
    check (route_to_permission in ('media_kit', 'ask', 'substitute', 'plate')),
  status text not null default 'unresolved'
    check (status in ('unresolved', 'asked', 'granted', 'denied', 'plated')),
  flagged_for_taylor boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  unique (asset_url)
);

alter table public.media_assets enable row level security;
alter table public.brand_image_permissions enable row level security;

create policy "media_assets_public_read_published"
  on public.media_assets for select
  using (status = 'published' and licence is not null);

-- No public writes. Ingest uses the service role.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 20971520, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

