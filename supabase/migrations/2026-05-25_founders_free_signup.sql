-- Founders' Free Launch Year — optional grandfathering flag.
--
-- Adds a boolean to profiles capturing whether the user signed up before
-- 2027-05-25T07:00:00Z (the Founders' Free Launch Year end).
--
-- This column is NOT consulted by checkPremium() under the default plan
-- (everyone flips at T-0). It exists so that if Taylor decides at T-60 to
-- grandfather founders, we already have the data and can flip a single
-- line in src/lib/admin.ts without a backfill migration.
--
-- Safe to apply on launch. Safe to drop if grandfathering is rejected.

-- 1. Column (idempotent).
alter table profiles
  add column if not exists founders_free_signup boolean not null default false;

-- 2. Backfill: every existing profile signed up before the cutoff.
update profiles
  set founders_free_signup = true
  where (created_at is null or created_at < '2027-05-25T07:00:00Z')
    and founders_free_signup = false;

-- 3. Trigger: any new profile inserted before the cutoff is auto-flagged.
create or replace function flag_founders_free_signup()
returns trigger as $$
begin
  if new.created_at is null or new.created_at < '2027-05-25T07:00:00Z' then
    new.founders_free_signup := true;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_flag_founders_free_signup on profiles;
create trigger profiles_flag_founders_free_signup
before insert on profiles
for each row execute function flag_founders_free_signup();
