import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendBrandedEmail } from "@/lib/email/client";
import { buildWelcome } from "@/lib/email/senders";
import { POST_LOGIN_PATH, safeInternalPath } from "@/lib/auth-paths";

/**
 * GET /auth/callback
 *
 * Supabase OAuth callback handler for Google and Apple Sign-In.
 * After Supabase processes the provider's response, it redirects
 * here with a `code` query param for PKCE exchange.
 */
// Prevents open-redirect: only allow same-origin path redirects.

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next")) ?? POST_LOGIN_PATH;
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

  return handleCallback(code, POST_LOGIN_PATH, origin, "POST");
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

  // Select welcome_email_sent_at defensively — if the migration hasn't been
  // applied yet the column won't exist. We fall back to a plain select so a
  // missing column doesn't break OAuth / email-confirm flows.
  let profile:
    | { user_id: string; display_name?: string | null; welcome_email_sent_at?: string | null }
    | null = null;
  {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, display_name, welcome_email_sent_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error && /welcome_email_sent_at/.test(error.message)) {
      const fallback = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      profile = fallback.data;
    } else {
      profile = data;
    }
  }

  const isNewProfile = !profile;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.display_name ||
    user.user_metadata?.name ||
    profile?.display_name ||
    user.email?.split("@")[0] ||
    "Angler";

  if (isNewProfile) {
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

  // Welcome email: send once per user, on first callback visit (email/password
  // or OAuth). Gate via welcome_email_sent_at (migration 20260422). Until the
  // column is applied we fall back to "created within last 10 minutes + no
  // existing sessions" so we don't spam returning users.
  const createdAt = user.created_at ? Date.parse(user.created_at) : 0;
  const isFresh = createdAt && Date.now() - createdAt < 10 * 60 * 1000;
  await maybeSendWelcomeEmail(supabase, {
    userId: user.id,
    email: user.email,
    displayName,
    alreadySent: !!profile?.welcome_email_sent_at,
    columnMissingFallback: !!isFresh,
  });
}

async function maybeSendWelcomeEmail(
  supabase: Awaited<ReturnType<typeof createClient>>,
  args: {
    userId: string;
    email: string | undefined;
    displayName: string;
    alreadySent: boolean;
    columnMissingFallback: boolean;
  }
) {
  if (!args.email) return;
  if (args.alreadySent) return;
  try {
    // Probe: does the column exist? Cheap count query scoped to this user.
    // When the migration hasn't been applied, this errors with "column does
    // not exist" — in that case we fall back to the "user was just created"
    // check the caller provided, so returning users don't get spammed.
    const probe = await supabase
      .from("profiles")
      .select("welcome_email_sent_at", { head: true, count: "exact" })
      .eq("user_id", args.userId);
    if (probe.error && /welcome_email_sent_at/.test(probe.error.message)) {
      if (!args.columnMissingFallback) return;
    }
    const content = buildWelcome({ displayName: args.displayName });
    const result = await sendBrandedEmail({
      tag: "welcome",
      to: args.email,
      subject: content.subject,
      heading: content.heading,
      body: content.body,
      preheader: content.preheader,
      ctaLabel: content.ctaLabel,
      ctaUrl: content.ctaUrl,
      replyTo: content.replyTo,
    });
    if (!result.sent) {
      console.warn("[WELCOME EMAIL] not sent:", result.reason);
      return;
    }
    const { error: stampError } = await supabase
      .from("profiles")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("user_id", args.userId);
    if (stampError && !/welcome_email_sent_at/.test(stampError.message)) {
      console.warn("[WELCOME EMAIL] stamp failed:", stampError.message);
    }
  } catch (err) {
    console.warn("[WELCOME EMAIL] exception:", err);
  }
}

