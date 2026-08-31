/** Private paths. Copied onto every robots user-agent group so AI crawlers inherit them. */
export const ROBOTS_DISALLOW = [
  "/_next/",
  "/api/",
  "/admin/",
  "/account/",
  "/journal/",
  "/auth/",
  "/dashboard",
  "/feed",
  "/favorites/",
  "/flybox",
  "/rivers/mine",
  "/messages/",
  "/notifications",
  "/anglers/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/search",
] as const;

export const PRIVATE_ROBOTS = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
} as const;
