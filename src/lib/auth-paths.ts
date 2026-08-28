/**
 * Auth landing and private-route lists.
 *
 * `/rivers/mine` is in these lists before the page exists so a private surface
 * cannot ship unprotected. `/today` is reachable signed out with an honest
 * empty state; signed-in content requires auth on the page. Public `/` is never
 * redirected.
 */

export const POST_LOGIN_PATH = "/today";

export const PROTECTED_PATHS = [
  "/favorites",
  "/account",
  "/journal",
  "/dashboard",
  "/notifications",
  "/messages",
  "/admin",
  "/flybox",
] as const;

/** Exact private routes that must not prefix-match public slugs
 *  (e.g. /rivers/mine must not catch /rivers/minnesota). */
export const PROTECTED_EXACT = ["/rivers/mine"] as const;

export const EMAIL_VERIFIED_REQUIRED = [
  "/journal",
  "/dashboard",
  "/today",
  "/favorites",
  "/notifications",
  "/messages",
  "/flies",
  "/feed",
  "/flybox",
] as const;

export const EMAIL_VERIFIED_EXACT = ["/rivers/mine"] as const;

export function pathMatches(
  pathname: string,
  prefixes: readonly string[],
  exact: readonly string[],
): boolean {
  return (
    prefixes.some((path) => pathname.startsWith(path)) ||
    exact.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  );
}

/**
 * `/dashboard` permanently lands on `/today`.
 * `/` stays reachable while signed in — the logo goes to `/today`.
 */
export function signedInPathRedirect(pathname: string): string | null {
  if (pathname === "/dashboard") return POST_LOGIN_PATH;
  return null;
}

/**
 * Same-origin path only. Rejects protocol-relative (`//`, `/\\`) and
 * encoded backslash tricks (`/%5C%5Cevil.com`) that browsers treat as hosts.
 */
export function safeInternalPath(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;

  let value = trimmed;
  try {
    value = decodeURIComponent(trimmed);
  } catch {
    return null;
  }

  if (value.includes("\\") || value.includes("\0")) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  if (value.includes("://")) return null;
  return value;
}
