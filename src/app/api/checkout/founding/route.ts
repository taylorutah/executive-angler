import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/checkout/founding
 *
 * Creates a Stripe Checkout session for the $150 one-time Founding Member
 * purchase. Grants lifetime Pro access. Capped at 50 seats.
 *
 * Web-only — iOS/Android never hit this route. Keeping the sale on Stripe
 * (not Apple/Google IAP) avoids the 30% platform cut on a one-time SKU.
 *
 * Flow:
 *   1. Auth required.
 *   2. Reject if the user is already a founder.
 *   3. Cheap capacity check against `founding_seats_remaining` view — fails
 *      fast with a friendly UX error if sold out. This is advisory; the
 *      authoritative cap is enforced atomically in the webhook via
 *      `claim_founding_seat()`. If 50 users all start checkout with seat 50
 *      available, only one succeeds — the losers get refunded by the webhook.
 *   4. Find or create the Stripe customer (reuses the column the subscription
 *      checkout path already populates).
 *   5. Create a `mode: "payment"` Checkout session with `metadata.founding_member`
 *      so the webhook knows to call the seat allocator.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_FOUNDING    — one-time $150 USD price ID (created in Stripe dashboard)
 *   NEXT_PUBLIC_SITE_URL
 */

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

export async function POST(req: NextRequest) {
  try {
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.executiveangler.com";
    const siteUrl = origin.startsWith("http") ? origin : `https://${origin}`;

    // 1. Auth
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Already a founder?
    const { data: existingMember } = await supabase
      .from("founding_members")
      .select("seat_number")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existingMember) {
      return NextResponse.json(
        {
          error: "already_founder",
          message: `You're already a founding member (seat #${existingMember.seat_number}).`,
        },
        { status: 409 }
      );
    }

    // 3. Advisory capacity check (the webhook enforces the real cap)
    const { data: seatCount } = await supabase
      .from("founding_seats_remaining")
      .select("remaining_seats")
      .single();
    if (seatCount && seatCount.remaining_seats <= 0) {
      return NextResponse.json(
        { error: "sold_out", message: "All 50 founding seats have been claimed." },
        { status: 410 }
      );
    }

    // 4. Price must be configured
    const priceId = process.env.STRIPE_PRICE_FOUNDING;
    if (!priceId) {
      return NextResponse.json(
        { error: "Founding price not configured" },
        { status: 500 }
      );
    }

    // 5. Find or create the Stripe customer (same column the sub flow uses)
    let customerId: string | undefined;
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    // 6. One-time Checkout session
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/account?founding=success#subscription`,
      cancel_url: `${siteUrl}/pricing?checkout=canceled`,
      metadata: {
        user_id: user.id,
        // The webhook keys off this flag to route the session to the
        // founding-seat allocator instead of the subscriptions upsert.
        founding_member: "true",
      },
      payment_intent_data: {
        // Mirror metadata onto the PaymentIntent so a manual refund via the
        // Stripe dashboard still has the user_id for audit.
        metadata: {
          user_id: user.id,
          founding_member: "true",
        },
      },
      allow_promotion_codes: false, // no discounts on the founding SKU
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Checkout failed";
    console.error("Founding checkout error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
