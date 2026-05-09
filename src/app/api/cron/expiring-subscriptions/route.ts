import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBrandedEmail } from "@/lib/email/client";
import { buildExpiringSoon } from "@/lib/email/senders";

/**
 * GET /api/cron/expiring-subscriptions
 *
 * Daily sweep that emails promo-redeemed users ~3 days before their Pro
 * access lapses, so they can upgrade to a paid plan without a gap.
 *
 * Only targets `source='promo'` subs — Stripe subs auto-renew (invoice.paid)
 * and Stripe handles its own dunning. Promo subs have a fixed end date and
 * silently flip to expired via /api/cron/expire-subscriptions — without this
 * warning, users get no heads-up.
 *
 * Window: subs with current_period_end between (now + 2d 12h) and (now + 3d 12h).
 * Combined with a once-daily cron, this guarantees each user receives exactly
 * one warning.
 *
 * Secured by CRON_SECRET header — Vercel auto-injects on cron calls.
 * Registered in vercel.json with schedule "0 9 * * *" (daily 09:00 UTC).
 */

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  const authHeader =
    req.headers.get("authorization") || req.headers.get("x-cron-secret");
  if (authHeader !== cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const now = Date.now();
    const windowStart = new Date(now + 2.5 * 24 * 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(now + 3.5 * 24 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await supabase
      .from("subscriptions")
      .select("user_id, current_period_end")
      .eq("status", "active")
      .eq("source", "promo")
      .gte("current_period_end", windowStart)
      .lte("current_period_end", windowEnd);

    if (error) {
      console.error("[cron/expiring-subscriptions]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let sent = 0;
    let skipped = 0;

    for (const row of rows ?? []) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(
          row.user_id
        );
        const email = authUser?.user?.email;
        if (!email) {
          skipped += 1;
          continue;
        }
        const displayName =
          ((authUser?.user?.user_metadata as Record<string, unknown> | null)
            ?.display_name as string | undefined) ?? null;

        const content = buildExpiringSoon({
          displayName,
          expiryIso: row.current_period_end,
        });
        const result = await sendBrandedEmail({
          tag: "expiring_soon",
          to: email,
          ...content,
        });
        if (result.sent) sent += 1;
        else skipped += 1;
      } catch (err) {
        console.error("[cron/expiring-subscriptions] row error:", err);
        skipped += 1;
      }
    }

    console.log(
      `[cron/expiring-subscriptions] scanned=${rows?.length ?? 0} sent=${sent} skipped=${skipped}`
    );
    return NextResponse.json({
      scanned: rows?.length ?? 0,
      sent,
      skipped,
      at: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[cron/expiring-subscriptions] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
