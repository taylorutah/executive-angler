import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events to sync subscription status to the
 * `subscriptions` table. A Postgres trigger on that table automatically
 * updates `profiles.is_premium`, so iOS/Android pick it up on next
 * entitlement check.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Branch on mode. A single `checkout.session.completed` event covers
        // both subscription checkouts (web Pro plan) and one-time payments
        // (Founding Member).
        if (session.mode === "subscription" && session.subscription && session.metadata?.user_id) {
          const subscription = await getStripe().subscriptions.retrieve(
            session.subscription as string
          );
          await upsertSubscription(supabase, session.metadata.user_id, subscription);
        } else if (
          session.mode === "payment" &&
          session.metadata?.founding_member === "true" &&
          session.metadata?.user_id
        ) {
          await handleFoundingPayment(supabase, session);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceSub = (invoice as any).subscription;
        if (invoiceSub) {
          const subscription = await getStripe().subscriptions.retrieve(
            typeof invoiceSub === "string" ? invoiceSub : invoiceSub.id
          );
          const userId = subscription.metadata?.user_id;
          if (userId) {
            await upsertSubscription(supabase, userId, subscription);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        if (userId) {
          await upsertSubscription(supabase, userId, subscription);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        if (userId) {
          await expireSubscription(supabase, userId, subscription.id);
        }
        break;
      }

      default:
        // Unhandled event type — log but don't error
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`Error processing Stripe event ${event.type}:`, err.message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ──

function mapStripeStatus(status: string): string {
  switch (status) {
    case "active": return "active";
    case "trialing": return "trialing";
    case "past_due": return "past_due";
    case "canceled": return "canceled";
    case "unpaid": return "expired";
    default: return "expired";
  }
}

function mapStripePlan(subscription: Stripe.Subscription): string {
  const item = subscription.items.data[0];
  if (!item) return "monthly";
  const interval = item.price?.recurring?.interval;
  return interval === "year" ? "annual" : "monthly";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertSubscription(
  supabase: any,
  userId: string,
  subscription: Stripe.Subscription
) {
  const periodEnd = subscription.items.data[0]?.current_period_end
    ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        source: "stripe",
        external_id: subscription.id,
        plan: mapStripePlan(subscription),
        status: mapStripeStatus(subscription.status),
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,source" }
    );

  if (error) {
    console.error("Failed to upsert subscription:", error.message);
    throw error;
  }

  console.log(`Subscription synced: user=${userId} status=${subscription.status}`);
}

/**
 * Founding Member one-time payment handler.
 *
 * Called from `checkout.session.completed` when mode=payment and metadata
 * flags founding_member=true. Delegates seat assignment to the
 * `claim_founding_seat` DB function, which atomically picks the next
 * available seat (1..50) under an EXCLUSIVE lock. If all 50 are taken, the
 * function returns NULL — we refund the charge and log. The RPC is also
 * idempotent on session_id, so Stripe retries are safe.
 */
async function handleFoundingPayment(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error("[founding webhook] session missing user_id metadata:", session.id);
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const amountCents = session.amount_total ?? 0;

  // Atomic seat claim
  const { data: seatNumber, error: claimError } = await supabase.rpc(
    "claim_founding_seat",
    {
      p_user_id: userId,
      p_session_id: session.id,
      p_payment_intent_id: paymentIntentId,
      p_amount_cents: amountCents,
    }
  );

  if (claimError) {
    console.error(
      `[founding webhook] claim_founding_seat RPC failed for session ${session.id}:`,
      claimError.message
    );
    throw claimError;
  }

  if (seatNumber == null) {
    // Race: 50 seats filled between checkout start and webhook. Refund.
    console.warn(
      `[founding webhook] SOLD OUT race — refunding user=${userId} session=${session.id}`
    );
    if (paymentIntentId) {
      try {
        await getStripe().refunds.create({
          payment_intent: paymentIntentId,
          reason: "requested_by_customer",
          metadata: { reason: "founding_sold_out", user_id: userId },
        });
        console.log(`[founding webhook] refunded pi=${paymentIntentId}`);
      } catch (refundErr) {
        console.error(
          `[founding webhook] REFUND FAILED for pi=${paymentIntentId} — MANUAL ACTION REQUIRED:`,
          refundErr
        );
      }
    }
    return;
  }

  console.log(
    `[founding webhook] Seat #${seatNumber} assigned to user=${userId} session=${session.id}`
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function expireSubscription(
  supabase: any,
  userId: string,
  stripeSubId: string
) {
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "expired",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("source", "stripe")
    .eq("external_id", stripeSubId);

  if (error) {
    console.error("Failed to expire subscription:", error.message);
    throw error;
  }

  console.log(`Subscription expired: user=${userId} sub=${stripeSubId}`);
}
