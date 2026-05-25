/**
 * Admin and premium access control.
 * Simple email-based — no database columns needed.
 */

export const ADMIN_EMAILS = [
  "taylor@executiveangler.com",
  "taylor.warnick@gmail.com",
];

/** Permanent Pro users — bypasses subscription check */
export const PERMANENT_PRO_EMAILS = [
  "taylor.warnick@gmail.com",
  "taylor@executiveangler.com",
];

/**
 * Founders' Free Launch Year — every authenticated user has Pro until this
 * date. Driven by env var so it can be flipped without a redeploy. See
 * vault: Executive Angler/Founders-Free-Launch-Year-Plan.md
 */
export const FOUNDERS_FREE_END = new Date(
  process.env.NEXT_PUBLIC_FOUNDERS_FREE_END ?? "2027-05-25T07:00:00Z"
);

export function isFoundersFreeWindow(now: Date = new Date()): boolean {
  return now < FOUNDERS_FREE_END;
}

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}

export function isPermanentPro(email: string | null | undefined): boolean {
  return !!email && PERMANENT_PRO_EMAILS.includes(email);
}

/**
 * Check if a user has premium access.
 *
 * Order:
 *   1. Permanent Pro email whitelist (admin bypass)
 *   2. Founders' Free Launch Year window — every authenticated user is Pro
 *   3. profiles.is_premium flag (set by DB triggers on subscriptions or
 *      admin-granted)
 *   4. Direct subscriptions table check — catches the ~ms race where a
 *      webhook just wrote a row but the trigger hasn't propagated yet, and
 *      filters out stale rows whose current_period_end has passed.
 */
export async function checkPremium(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any },
  userId: string,
  email?: string | null
): Promise<boolean> {
  if (isPermanentPro(email)) return true;
  if (isFoundersFreeWindow()) return true;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("user_id", userId)
    .maybeSingle();
  if (profile?.is_premium) return true;

  const nowIso = new Date().toISOString();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .or(`current_period_end.is.null,current_period_end.gt.${nowIso}`)
    .limit(1)
    .maybeSingle();
  return !!sub;
}
