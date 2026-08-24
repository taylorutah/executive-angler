/**
 * Route-determined register. Not a user preference.
 * Daylight = public reading; Dusk = the logged-in product, /app, and live-data insets.
 */

export type Register = "daylight" | "dusk";

const DUSK_PREFIXES = [
  "/app",
  "/dashboard",
  "/today",
  "/journal",
  "/flies/boxes",
  "/my-boxes",
  "/my-flies",
  "/account",
  "/feed",
  "/messages",
  "/admin",
  "/favorites",
  "/notifications",
] as const;

export function registerForPath(pathname: string): Register {
  const p = pathname.split("?")[0] || "/";
  if (p === "/rivers/mine" || p.startsWith("/rivers/mine/")) return "dusk";
  for (const prefix of DUSK_PREFIXES) {
    if (p === prefix || p.startsWith(`${prefix}/`)) return "dusk";
  }
  return "daylight";
}

/** Inline bootstrap — runs before paint so the first frame is the right register. */
export const REGISTER_BOOTSTRAP = `(function(){try{var p=location.pathname;var dusk=/^\\/(app|dashboard|today|journal|account|feed|messages|admin|favorites|notifications|my-boxes|my-flies)(\\/|$)/.test(p)||/^\\/flies\\/boxes(\\/|$)/.test(p)||p==="/rivers/mine"||p.indexOf("/rivers/mine/")===0;document.documentElement.setAttribute("data-register",dusk?"dusk":"daylight");}catch(e){document.documentElement.setAttribute("data-register","daylight");}})();`;
