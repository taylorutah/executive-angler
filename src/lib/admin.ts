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
 * Works server-side with a Supabase client that has the user session.
 */
export async function checkPremium(
  supabase: { from: (table: string) => any },
  userId: string,
  email?: string | null
): Promise<boolean> {
  if (isPermanentPro(email)) return true;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("user_id", userId)
    .single();
  return profile?.is_premium ?? false;
}
