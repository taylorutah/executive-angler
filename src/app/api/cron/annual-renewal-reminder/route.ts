import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { sendBrandedEmail } from "@/lib/email/client";
import { buildAnnualRenewalReminder } from "@/lib/email/senders";

/**
 * GET /api/cron/annual-renewal-reminder
 *
 * Daily sweep: emails Stripe annual subscribers ~30 days before their card is
 * charged again. Intentionally a trust mechanic — every dark-pattern SaaS skips
 * this; doing it is a permanent brand asset.
 *
 * Window: current_period_end between (now + 29.5d) and (now + 30.5d). With a
 * daily cron, each annual sub falls in the window exactly once.
 *
 * Only fires for source='stripe', plan='annual', status in active/trialing.
 * Apple/Google renewal notices come from their respective stores.
 *
 * Secured by CRON_SECRET header — Vercel auto-injects on cron calls.
 * Registered in vercel.json with schedule "0 10 * * *" (daily 10:00 UTC).
 */

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
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
    const windowStart = new Date(now + 29.5 * 24 * 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(now + 30.5 * 24 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await supabase
      .from("subscriptions")
      .select("user_id, external_id, current_period_end")
      .eq("source", "stripe")
      .eq("plan", "annual")
      .in("status", ["active", "trialing"])
      .gte("current_period_end", windowStart)
      .lte("current_period_end", windowEnd);

    if (error) {
      console.error("[cron/annual-renewal-reminder]", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.executiveangler.com";
    let sent = 0;
    let skipped = 0;

    for (const row of rows ?? []) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(
          row.user_id,
        );
        const email = authUser?.user?.email;
        if (!email || !row.external_id) {
          skipped += 1;
          continue;
        }
        const displayName =
          ((authUser?.user?.user_metadata as Record<string, unknown> | null)
            ?.display_name as string | undefined) ?? null;

        let portalUrl = `${siteUrl}/account#subscription`;
        let amountLabel: string | undefined;

        try {
          const stripe = getStripe();
          const subscription = await stripe.subscriptions.retrieve(
            row.external_id,
          );
          const customerId = subscription.customer as string;
          if (customerId) {
            const portal = await stripe.billingPortal.sessions.create({
              customer: customerId,
              return_url: `${siteUrl}/account#subscription`,
            });
            portalUrl = portal.url;
          }
          const amount = subscription.items.data[0]?.price?.unit_amount;
          if (amount != null) {
            amountLabel = `$${(amount / 100).toFixed(2)}`;
          }
        } catch (err) {
          console.error(
            "[cron/annual-renewal-reminder] stripe lookup failed:",
            err,
          );
        }

        const content = buildAnnualRenewalReminder({
          displayName,
          renewalIso: row.current_period_end,
          amountLabel,
          portalUrl,
        });
        const result = await sendBrandedEmail({
          tag: "annual_renewal_reminder",
          to: email,
          ...content,
        });
        if (result.sent) sent += 1;
        else skipped += 1;
      } catch (err) {
        console.error("[cron/annual-renewal-reminder] row error:", err);
        skipped += 1;
      }
    }

    console.log(
      `[cron/annual-renewal-reminder] scanned=${rows?.length ?? 0} sent=${sent} skipped=${skipped}`,
    );
    return NextResponse.json({
      scanned: rows?.length ?? 0,
      sent,
      skipped,
      at: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[cron/annual-renewal-reminder] unexpected:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
