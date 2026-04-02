import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/checkout
 *
 * Creates a Stripe Checkout session for the authenticated user.
 * Redirects the user to Stripe's hosted checkout page.
 *
 * Body: { plan: "monthly" | "annual" }
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_MONTHLY  — Stripe price ID for monthly plan
 *   STRIPE_PRICE_ANNUAL   — Stripe price ID for annual plan
 *   NEXT_PUBLIC_SITE_URL
 */

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://executiveangler.com";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user via Supabase session
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Parse plan
    const { plan } = await req.json();
    const priceId = plan === "annual"
      ? process.env.STRIPE_PRICE_ANNUAL
      : process.env.STRIPE_PRICE_MONTHLY;

    if (!priceId) {
      return NextResponse.json({ error: "Price not configured" }, { status: 500 });
    }

    // 3. Find or create Stripe customer
    let customerId: string | undefined;

    // Check if user already has a Stripe customer ID stored
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Create a new Stripe customer
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      // Store for future use
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    // 4. Create Checkout session
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${SITE_URL}/dashboard?checkout=success`,
      cancel_url: `${SITE_URL}/dashboard?checkout=canceled`,
      metadata: { user_id: user.id },
      subscription_data: {
        metadata: { user_id: user.id },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err.message, err.type, err.statusCode, JSON.stringify(err.raw || {}));
    return NextResponse.json({ error: err.message || "Checkout failed" }, { status: 500 });
  }
}
