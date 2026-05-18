import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/track-login
 *
 * Captures the caller's IP-derived city/region/country from Vercel geo headers
 * and stamps it on profiles.last_login_*. Called by:
 *   - iOS app after sign-in / session restore (Bearer token auth)
 *   - Web middleware (cookie auth) — kept as a fallback path
 *
 * No raw IP is stored. Headers are absent in local dev, so the route is a
 * no-op there.
 */

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null;

    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const admin = getSupabaseAdmin();
      const { data: { user }, error } = await admin.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      userId = user.id;
    } else {
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
    }

    const country = req.headers.get("x-vercel-ip-country") || null;
    const region = req.headers.get("x-vercel-ip-country-region") || null;
    const cityRaw = req.headers.get("x-vercel-ip-city");
    const city = cityRaw ? decodeURIComponent(cityRaw) : null;

    if (!country && !region && !city) {
      return NextResponse.json({ ok: true, captured: false, reason: "no-geo-headers" });
    }

    const admin = getSupabaseAdmin();
    const { error: upsertError } = await admin
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

    if (upsertError) {
      console.error("[TRACK LOGIN] upsert failed:", upsertError);
      return NextResponse.json({ error: "Write failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, captured: true, city, region, country });
  } catch (err) {
    console.error("[TRACK LOGIN] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
