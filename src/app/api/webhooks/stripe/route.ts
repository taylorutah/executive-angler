import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

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
        if (session.mode === "subscription" && session.subscription && session.metadata?.user_id) {
          const subscription = await getStripe().subscriptions.retrieve(
            session.subscription as string
          );
          await upsertSubscription(supabase, session.metadata.user_id, subscription);
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
