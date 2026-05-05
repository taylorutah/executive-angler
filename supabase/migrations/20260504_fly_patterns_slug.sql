-- Make fly_patterns slugs unique PER USER (not globally) so two anglers can
-- both have a 'pink-tag-quilldigon'. Backfill existing rows from name with a
-- numbering tail when a user already has the same slug. Visibility column
-- already existed; we only ensure the index is in place.

begin;

-- Drop the global unique constraint — we want per-user uniqueness instead.
alter table fly_patterns drop constraint if exists fly_patterns_slug_key;

-- Backfill slug from name. ROW_NUMBER() within (user_id, base_slug) handles
-- duplicate names within a user by appending -2, -3, ... .
update fly_patterns f
set slug = sub.candidate_slug
from (
  select id,
    case when rn = 1 then base_slug else base_slug || '-' || rn end as candidate_slug
  from (
    select id,
      lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) as base_slug,
      row_number() over (
        partition by user_id,
          lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
        order by created_at
      ) as rn
    from fly_patterns
    where slug is null and name is not null
  ) ranked
) sub
where f.id = sub.id;

create unique index if not exists fly_patterns_user_slug_unique
  on fly_patterns(user_id, slug)
  where slug is not null;

create index if not exists idx_fly_patterns_visibility
  on fly_patterns(visibility)
  where visibility != 'private';

commit;
