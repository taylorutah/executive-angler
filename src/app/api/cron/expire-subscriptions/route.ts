import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/cron/expire-subscriptions
 *
 * Daily sweep. Flips any subscription whose current_period_end has passed
 * from status='active' to status='expired'. The UPDATE fires the existing
 * update_premium_from_subscriptions trigger, which recomputes
 * profiles.is_premium for the affected user.
 *
 * Why this matters:
 *   - Time-based expiry has no Postgres trigger. Without this sweep, a
 *     promo subscription with a past current_period_end would keep
 *     profiles.is_premium=true until some other write to the user's
 *     subscriptions fired the trigger.
 *   - checkPremium() in src/lib/admin.ts already guards against stale
 *     rows at read time, but direct DB consumers (and the profile flag
 *     itself) benefit from this sweep keeping state truthful.
 *
 * Secured by CRON_SECRET header — Vercel auto-injects this on cron calls.
 * Registered in vercel.json with schedule "0 3 * * *" (daily 03:00 UTC).
 */

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader =
      req.headers.get("authorization") || req.headers.get("x-cron-secret");
    if (authHeader !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = getSupabaseAdmin();
    const nowIso = new Date().toISOString();

    // UPDATE … RETURNING so we can log how many rows flipped.
    const { data, error } = await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("status", "active")
      .not("current_period_end", "is", null)
      .lt("current_period_end", nowIso)
      .select("id, user_id, source");

    if (error) {
      console.error("[cron/expire-subscriptions]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const expiredCount = data?.length ?? 0;
    console.log(
      `[cron/expire-subscriptions] expired ${expiredCount} rows at ${nowIso}`
    );
    return NextResponse.json({ expired: expiredCount, at: nowIso });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[cron/expire-subscriptions] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
