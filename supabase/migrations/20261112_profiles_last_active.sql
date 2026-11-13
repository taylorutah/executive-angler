-- Last active: app-open heartbeats (web + iOS) separate from auth.last_sign_in_at.

alter table public.profiles
  add column if not exists last_active_at timestamptz;

create or replace function public.touch_last_active()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  recent timestamptz;
begin
  if uid is null then
    return;
  end if;

  select p.last_active_at
    into recent
    from public.profiles p
   where p.user_id = uid;

  if recent is not null and recent > now() - interval '5 minutes' then
    return;
  end if;

  update public.profiles
     set last_active_at = now(),
         updated_at = coalesce(updated_at, now())
   where user_id = uid;
end;
$$;

revoke all on function public.touch_last_active() from public;
grant execute on function public.touch_last_active() to authenticated;

-- Backfill from login stamps, auth sign-in, and latest session activity.
update public.profiles p
   set last_active_at = src.best_at
  from (
    select
      pr.user_id,
      greatest(
        pr.last_login_at,
        au.last_sign_in_at,
        (
          select max(greatest(fs.created_at, fs.date::timestamptz))
            from public.fishing_sessions fs
           where fs.user_id = pr.user_id
        )
      ) as best_at
      from public.profiles pr
      left join auth.users au on au.id = pr.user_id
  ) src
 where p.user_id = src.user_id
   and src.best_at is not null
   and (p.last_active_at is null or p.last_active_at < src.best_at);

comment on function public.touch_last_active() is
  'Sets profiles.last_active_at for auth.uid(); no-op if updated within 5 minutes. Called by web and iOS on app open.';
