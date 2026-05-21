-- ============================================================
-- Trust window enforcement at the DB layer — applies uniformly
-- to web, iOS, and Android because all three write directly to
-- Supabase via PostgREST (no shared API gate).
--
-- 1. dm_messages: new accounts (< 7 days) cannot insert
-- 2. fishing_sessions: new accounts' rows are forced to
--    broadcast_presence=false (keeps them out of the feed)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Block DMs from new accounts
-- ─────────────────────────────────────────────────────────────

create or replace function enforce_dm_trust()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  account_age interval;
begin
  select now() - created_at into account_age
  from auth.users
  where id = new.sender_id;

  if account_age is null or account_age >= interval '7 days' then
    return new;
  end if;

  raise exception 'TRUST_WINDOW_DM_BLOCKED: New accounts cannot send messages for the first 7 days.'
    using errcode = 'check_violation';
end;
$$;

drop trigger if exists enforce_dm_trust_trigger on dm_messages;
create trigger enforce_dm_trust_trigger
  before insert on dm_messages
  for each row execute function enforce_dm_trust();

-- ─────────────────────────────────────────────────────────────
-- 2. Silently mute presence broadcasts from new accounts.
--
-- We don't reject the session insert — that would break logging
-- for legitimate new users. We just flip broadcast_presence to
-- false so the session is private until they age into trust.
-- session_presence view filters on broadcast_presence=true, so
-- they never appear in the public feed.
-- ─────────────────────────────────────────────────────────────

create or replace function prevent_new_account_broadcast()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  account_age interval;
begin
  if new.broadcast_presence is not true then
    return new;
  end if;

  select now() - created_at into account_age
  from auth.users
  where id = new.user_id;

  if account_age is not null and account_age < interval '7 days' then
    new.broadcast_presence := false;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_new_account_broadcast_trigger on fishing_sessions;
create trigger prevent_new_account_broadcast_trigger
  before insert or update on fishing_sessions
  for each row execute function prevent_new_account_broadcast();
