-- Fly Boxes Migration (20260508)
-- Adds named, tiered fly boxes with many-to-many membership for stock entries.
-- Implements the tier system from the user's article:
-- https://www.executiveangler.com/articles/fly-box-tier-system

-- ─── fly_boxes: named container per user with tier ───────────────────────────
create table if not exists fly_boxes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  tier text not null default 'custom' check (tier in ('kill', 'support', 'archive', 'custom')),
  description text,
  icon text,                       -- emoji or lucide icon name
  cover_image_url text,
  sort_order integer not null default 0,
  is_default boolean not null default false,
  total_capacity integer,          -- optional "holds 24 flies max"
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- One default box per user
create unique index if not exists fly_boxes_one_default_per_user
  on fly_boxes (user_id) where is_default = true;

-- Common query path: list this user's boxes by tier in display order
create index if not exists idx_fly_boxes_user_tier_sort
  on fly_boxes (user_id, tier, sort_order);

-- ─── fly_box_membership: many-to-many between boxes and stock entries ────────
create table if not exists fly_box_membership (
  box_id uuid not null references fly_boxes(id) on delete cascade,
  user_fly_box_id uuid not null references user_fly_box(id) on delete cascade,
  added_at timestamp with time zone default now(),
  sort_order integer not null default 0,
  primary key (box_id, user_fly_box_id)
);

create index if not exists idx_fly_box_membership_entry
  on fly_box_membership(user_fly_box_id);

-- ─── RLS: owner-only access ──────────────────────────────────────────────────
alter table fly_boxes enable row level security;
alter table fly_box_membership enable row level security;

drop policy if exists fly_boxes_owner on fly_boxes;
create policy fly_boxes_owner on fly_boxes
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists fly_box_membership_owner on fly_box_membership;
create policy fly_box_membership_owner on fly_box_membership
  for all
  using (
    exists (
      select 1 from fly_boxes b
      where b.id = box_id and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from fly_boxes b
      where b.id = box_id and b.user_id = auth.uid()
    )
  );

-- ─── Backfill: one default "My Fly Box" per user, all entries assigned ──────
insert into fly_boxes (user_id, name, tier, is_default)
select distinct user_id, 'My Fly Box', 'custom', true
from user_fly_box
on conflict do nothing;

insert into fly_box_membership (box_id, user_fly_box_id)
select b.id, ufb.id
from user_fly_box ufb
join fly_boxes b on b.user_id = ufb.user_id and b.is_default = true
on conflict do nothing;

-- ─── updated_at trigger ──────────────────────────────────────────────────────
create or replace function update_fly_boxes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists fly_boxes_updated_at_trigger on fly_boxes;
create trigger fly_boxes_updated_at_trigger
  before update on fly_boxes
  for each row
  execute function update_fly_boxes_updated_at();
