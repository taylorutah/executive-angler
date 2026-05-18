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

const PROTECTED_PATHS = ["/favorites", "/account", "/journal", "/dashboard", "/notifications", "/messages", "/admin"];

export async function updateSession(request: NextRequest) {
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

  const pathname = request.nextUrl.pathname;

  // Redirect unauthenticated users from protected paths
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in users land on their dashboard instead of the marketing home
  if (user && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
