import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const LOGIN_STAMP_COOKIE = "ea-login-stamp";

async function captureLoginLocation(
  request: NextRequest,
  response: NextResponse,
  supabase: SupabaseClient,
  userId: string,
  lastSignInAt: string | null | undefined
) {
  try {
    if (!lastSignInAt) return;
    const stamped = request.cookies.get(LOGIN_STAMP_COOKIE)?.value;
    if (stamped === lastSignInAt) return;

    const country = request.headers.get("x-vercel-ip-country") || null;
    const region = request.headers.get("x-vercel-ip-country-region") || null;
    const cityRaw = request.headers.get("x-vercel-ip-city");
    const city = cityRaw ? decodeURIComponent(cityRaw) : null;

    // Local/dev requests have no Vercel headers — skip the write but still
    // stamp the cookie so we don't retry on every request.
    let wrote = false;
    if (country || region || city) {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            last_login_at: new Date().toISOString(),
            last_login_country: country,
            last_login_region: region,
            last_login_city: city,
          },
          { onConflict: "user_id" }
        );
      if (!error) wrote = true;
    }

    // Only stamp the cookie if we either successfully wrote location OR we're
    // in an env without geo headers (local dev). Failed writes leave the cookie
    // unset so the next request retries.
    if (wrote || (!country && !region && !city)) {
      const cookieOptions: CookieOptions = {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      };
      response.cookies.set(LOGIN_STAMP_COOKIE, lastSignInAt, cookieOptions);
    }
  } catch (err) {
    console.warn("[LOGIN LOCATION] capture failed:", err);
  }
}

const PROTECTED_PATHS = ["/favorites", "/account", "/journal", "/dashboard", "/today", "/notifications", "/messages", "/admin", "/flybox"];

// Exact private routes that must not prefix-match public slugs
// (e.g. /rivers/mine must not catch /rivers/minnesota).
const PROTECTED_EXACT = ["/rivers/mine"];

// Paths that require a verified email. Excludes /account (so users can manage
// their email + resend confirmation) and /admin (admin gating is handled
// inside the admin layout itself).
const EMAIL_VERIFIED_REQUIRED = ["/journal", "/dashboard", "/today", "/favorites", "/notifications", "/messages", "/flies", "/feed", "/flybox"];
const EMAIL_VERIFIED_EXACT = ["/rivers/mine"];

function pathMatches(pathname: string, prefixes: string[], exact: string[]) {
  return (
    prefixes.some((path) => pathname.startsWith(path)) ||
    exact.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  );
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.includes("-auth-token") || c.name.startsWith("sb-"));

  if (!hasAuthCookie) {
    const isProtectedPath = pathMatches(pathname, PROTECTED_PATHS, PROTECTED_EXACT);
    if (isProtectedPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // Anonymous public traffic: do not touch cookies, so CDN/ISR can cache.
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await captureLoginLocation(request, supabaseResponse, supabase, user.id, user.last_sign_in_at);
  }

  // Redirect unauthenticated users from protected paths
  const isProtectedPath = pathMatches(pathname, PROTECTED_PATHS, PROTECTED_EXACT);

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated but email not verified — block content surfaces until they
  // click the confirmation link. OAuth providers (Google/Apple) populate
  // email_confirmed_at automatically, so this only catches email/password
  // signups that skipped confirmation.
  if (user && !user.email_confirmed_at && pathname !== "/verify-email") {
    const needsVerify = pathMatches(pathname, EMAIL_VERIFIED_REQUIRED, EMAIL_VERIFIED_EXACT);
    if (needsVerify) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-email";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  // `/` stays public and byte-identical. The logo targets the logged-in
  // home; a signed-in angler is allowed to read the front page.
  return supabaseResponse;
}
