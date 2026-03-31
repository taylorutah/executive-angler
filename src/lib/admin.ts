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

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}

export function isPermanentPro(email: string | null | undefined): boolean {
  return !!email && PERMANENT_PRO_EMAILS.includes(email);
}

/**
 * Check if a user has premium access.
 *
 * Checks in order:
 *   1. Permanent pro email whitelist (admin bypass)
 *   2. profiles.is_premium flag (set by DB trigger from subscriptions table,
 *      or admin-granted)
 *   3. Direct subscriptions table check (belt and suspenders — catches any
 *      race where the trigger hasn't fired yet)
 *
 * The subscriptions table is the source of truth. It's populated by:
 *   - Stripe webhook (web purchases)
 *   - iOS PremiumStore (Apple IAP)
 *   - Android PremiumManager (Google Play)
 *   - The DB trigger auto-updates profiles.is_premium
 */
export async function checkPremium(
  supabase: { from: (table: string) => any },
  userId: string,
  email?: string | null
): Promise<boolean> {
  if (isPermanentPro(email)) return true;

  // Fast path: profiles.is_premium (updated by DB trigger)
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("user_id", userId)
    .single();
  if (profile?.is_premium) return true;

  // Belt and suspenders: check subscriptions table directly
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .limit(1)
    .single();
  return !!sub;
}
