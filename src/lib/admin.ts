/**
 * Admin access control. Simple email-based — no database columns needed.
 *
 * Executive Angler is fully free: there is no premium tier, so there is no
 * premium/subscription check here anymore. Every feature is available to all
 * users. This module only governs who can reach the admin dashboard.
 */

export const ADMIN_EMAILS = [
  "taylor@executiveangler.com",
  "taylor.warnick@gmail.com",
];

export function isAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email);
}
