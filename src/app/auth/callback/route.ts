import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Supabase OAuth callback handler for Google and Apple Sign-In.
 * Exchanges the authorization code for a session, ensures the user
 * has a profile row, then redirects to the intended destination.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

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

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("[AUTH CALLBACK] exchangeCodeForSession:", {
      success: !error,
      error: error?.message,
      hasSession: !!data?.session,
      user: data?.session?.user?.email,
    });

    if (!error) {
      // Ensure the user has a profile row (OAuth users may not have one yet)
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .eq("user_id", user.id)
          .maybeSingle();

        // Auto-create profile for new OAuth users
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

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[AUTH CALLBACK] Code exchange failed:", error.message, error);
  } else {
    console.error("[AUTH CALLBACK] No code provided in callback");
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
