import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Supabase OAuth callback handler for Google and Apple Sign-In.
 * Handles two scenarios:
 * 1. PKCE flow: code is in query params → exchange it for a session
 * 2. Session already set: Supabase handled the token exchange (Apple form_post)
 *    and redirected here with session cookies already in place
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // If Supabase redirected with an error
  if (error) {
    console.error("[AUTH CALLBACK] Supabase returned error:", error, errorDescription);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  return handleCallback(code, next, origin);
}

/**
 * POST /auth/callback
 *
 * Apple Sign-In uses response_mode=form_post, so Apple POSTs the
 * authorization code to this endpoint instead of using a query param.
 */
export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const formData = await request.formData();
  const code = formData.get("code") as string | null;
  const next = "/dashboard";

  return handleCallback(code, next, origin);
}

async function handleCallback(
  code: string | null,
  next: string,
  origin: string
) {
  console.log("[AUTH CALLBACK]", { hasCode: !!code, next, origin });

  const supabase = await createClient();

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("[AUTH CALLBACK] exchangeCodeForSession:", {
      success: !error,
      error: error?.message,
      hasSession: !!data?.session,
      user: data?.session?.user?.email,
    });

    if (!error) {
      await ensureProfile(supabase);
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[AUTH CALLBACK] Code exchange failed:", error.message);
  }

  // Fallback: check if user is already authenticated
  // (Supabase may have set session cookies directly for Apple Sign-In)
  const { data: { user } } = await supabase.auth.getUser();
  console.log("[AUTH CALLBACK] Fallback getUser:", {
    hasUser: !!user,
    email: user?.email,
    provider: user?.app_metadata?.provider,
  });

  if (user) {
    await ensureProfile(supabase);
    return NextResponse.redirect(`${origin}${next}`);
  }

  console.error("[AUTH CALLBACK] No code and no session — auth failed");
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}

async function ensureProfile(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
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
