-- ============================================================
-- Signup audit log — per-IP signup rate limiting + bot detection.
-- Inserted by /api/auth/preflight on every signup attempt
-- (accepted OR rejected) so we can both rate-limit and forensic.
-- ============================================================

create table if not exists signup_audit (
  id bigserial primary key,
  ip_hash text not null,
  email_normalized text,
  outcome text not null check (outcome in ('accepted', 'rate_limited', 'captcha_failed', 'disposable_email', 'duplicate_collision', 'other_reject')),
  reason text,
  user_agent text,
  country text,
  attempted_at timestamptz not null default now()
);

create index if not exists idx_signup_audit_ip_time
  on signup_audit(ip_hash, attempted_at desc);

create index if not exists idx_signup_audit_email_norm
  on signup_audit(email_normalized)
  where email_normalized is not null;

create index if not exists idx_signup_audit_attempted_at
  on signup_audit(attempted_at desc);

alter table signup_audit enable row level security;

-- Admin-only read. Inserts happen via service role (preflight route).
drop policy if exists signup_audit_admin_select on signup_audit;
create policy signup_audit_admin_select on signup_audit
  for select using (
    (auth.jwt() ->> 'email') in (
      'taylor@executiveangler.com',
      'taylor.warnick@gmail.com'
    )
  );
