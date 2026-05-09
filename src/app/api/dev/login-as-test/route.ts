/**
 * DEV-ONLY auth bypass for the Phase 1 fly-form QA flow.
 *
 * - GUARDED by NODE_ENV !== "production". Returns 404 in prod regardless of
 *   any other check.
 * - GUARDED by `x-dev-secret` header matching SUPABASE_SERVICE_ROLE_KEY.
 *   The service role key never leaves the server, and the client must
 *   proxy through this route.
 *
 * Sets the @supabase/ssr session cookie for the test@executiveangler.com
 * user so we can drive the UI flows during QA without depending on the
 * production Cloudflare Turnstile gate or the publishable-key handshake.
 */
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const secret = req.headers.get("x-dev-secret");
  if (!secret || secret !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Use service-role for auth.signInWithPassword — the new "publishable
    // anon" key on this project rejects calls from localhost during dev.
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: "test@executiveangler.com",
    password: "TestEA2026!",
  });

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message ?? "no session" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, user: data.user.id });
}
