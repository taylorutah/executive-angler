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
