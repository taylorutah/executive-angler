/** Chrome hint only — not an auth check. Matches sb-*-auth-token cookies. */
export function hasSessionHint(cookie: string): boolean {
  return cookie.split(";").some((part) => {
    const name = part.trim().split("=")[0] ?? "";
    return name.includes("-auth-token");
  });
}
