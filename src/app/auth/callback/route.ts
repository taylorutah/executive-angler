import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Supabase OAuth callback handler for Google and Apple Sign-In.
 * After Supabase processes the provider's response, it redirects
 * here with a `code` query param for PKCE exchange.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // If Supabase redirected with an error
  if (error) {
    console.error("[AUTH CALLBACK GET] Error from provider:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  return handleCallback(code, next, origin, "GET");
}

/**
 * POST /auth/callback
 *
 * Apple Sign-In uses response_mode=form_post, so Apple POSTs
 * the authorization code + id_token here. Supabase should handle
 * this at its own /auth/v1/callback, but if our URL is configured
 * as the redirect, we need to extract the code and exchange it.
 */
export async function POST(request: Request) {
  const { origin } = new URL(request.url);

  let code: string | null = null;
  let idToken: string | null = null;

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    code = formData.get("code") as string | null;
    idToken = formData.get("id_token") as string | null;

    console.log("[AUTH CALLBACK POST] form_post received:", {
      hasCode: !!code,
      hasIdToken: !!idToken,
      fields: Array.from(formData.keys()),
    });
  } else if (contentType.includes("application/json")) {
    const body = await request.json();
    code = body.code || null;
    idToken = body.id_token || null;

    console.log("[AUTH CALLBACK POST] JSON received:", {
      hasCode: !!code,
      hasIdToken: !!idToken,
    });
  } else {
    console.error("[AUTH CALLBACK POST] Unexpected content-type:", contentType);
  }

  return handleCallback(code, "/dashboard", origin, "POST");
}

async function handleCallback(
  code: string | null,
  next: string,
  origin: string,
  method: string
) {
  console.log(`[AUTH CALLBACK ${method}]`, { hasCode: !!code, next, origin });

  const supabase = await createClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log(`[AUTH CALLBACK ${method}] exchangeCodeForSession:`, {
      success: !error,
      error: error?.message,
      hasSession: !!data?.session,
      user: data?.session?.user?.email,
      provider: data?.session?.user?.app_metadata?.provider,
    });

    if (!error && data?.session) {
      await ensureProfile(supabase);
      return NextResponse.redirect(`${origin}${next}`);
    }

    if (error) {
      console.error(`[AUTH CALLBACK ${method}] Code exchange failed:`, error.message);
      // Don't return yet — fall through to session check
    }
  }

  // Fallback: check if user is already authenticated
  // (Supabase may have set session cookies during the OAuth flow)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  console.log(`[AUTH CALLBACK ${method}] Fallback getUser:`, {
    hasUser: !!user,
    email: user?.email,
    provider: user?.app_metadata?.provider,
  });

  if (user) {
    await ensureProfile(supabase);
    return NextResponse.redirect(`${origin}${next}`);
  }

  console.error(
    `[AUTH CALLBACK ${method}] Auth failed — no code exchanged and no session found`
  );
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.display_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Angler";

    await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        display_name: displayName,
        email_notify_follows: true,
        email_notify_comments: true,
        email_notify_likes: true,
      },
      { onConflict: "user_id" }
    );
  }
}
