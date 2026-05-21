-- ============================================================
-- Trust window on follows.
--
-- Accounts younger than 7 days are capped at 5 follows per 24h.
-- After the window they get the normal (uncapped) behavior.
--
-- Enforced as a BEFORE INSERT trigger because the FollowButton writes
-- to follows directly via the Supabase JS client (no server route to
-- gate). Trigger applies to every insert regardless of source.
-- ============================================================

create or replace function enforce_follow_trust()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  account_age interval;
  recent_follows int;
begin
  select now() - created_at into account_age
  from auth.users
  where id = new.follower_id;

  if account_age is null or account_age >= interval '7 days' then
    return new;
  end if;

  select count(*) into recent_follows
  from follows
  where follower_id = new.follower_id
    and created_at > now() - interval '24 hours';

  if recent_follows >= 5 then
    raise exception 'TRUST_WINDOW_FOLLOW_LIMIT: New accounts are limited to 5 follows per day for the first week.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_follow_trust_trigger on follows;
create trigger enforce_follow_trust_trigger
  before insert on follows
  for each row execute function enforce_follow_trust();
