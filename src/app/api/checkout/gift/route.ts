import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/checkout/gift
 *
 * Creates a Stripe Checkout session for a Gift Pro purchase. One-time payment,
 * not a recurring subscription — the recipient gets 1 year of Pro when they
 * redeem. Metadata carries recipient email + optional message so the webhook
 * can provision the gift_redemptions row + send the recipient email.
 *
 * Body: { recipientEmail: string; recipientMessage?: string; purchaserName?: string }
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_GIFT_ANNUAL  — one-time $19.99 price created in Stripe for gifts
 *   NEXT_PUBLIC_SITE_URL
 */

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.executiveangler.com";
    const siteUrl = origin.startsWith("http") ? origin : `https://${origin}`;

    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const recipientEmail =
      typeof body?.recipientEmail === "string" ? body.recipientEmail.trim().toLowerCase() : "";
    const recipientMessage =
      typeof body?.recipientMessage === "string"
        ? body.recipientMessage.trim().slice(0, 500)
        : "";
    const purchaserName =
      typeof body?.purchaserName === "string" ? body.purchaserName.trim().slice(0, 80) : "";

    if (!recipientEmail || !EMAIL_RE.test(recipientEmail)) {
      return NextResponse.json({ error: "Valid recipient email required" }, { status: 400 });
    }
    if (recipientEmail === (user.email ?? "").toLowerCase()) {
      return NextResponse.json(
        { error: "You can't gift Pro to your own email." },
        { status: 400 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_GIFT_ANNUAL;
    if (!priceId) {
      return NextResponse.json(
        { error: "Gift price not configured. STRIPE_PRICE_GIFT_ANNUAL missing." },
        { status: 500 }
      );
    }

    // Find or create the purchaser's Stripe customer so repeat gifts re-use it.
    let customerId: string | undefined;
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, display_name")
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

    const resolvedPurchaserName = purchaserName || profile?.display_name || "";

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/gift/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/gift?checkout=canceled`,
      metadata: {
        gift: "true",
        purchaser_user_id: user.id,
        purchaser_email: user.email ?? "",
        purchaser_display_name: resolvedPurchaserName,
        recipient_email: recipientEmail,
        recipient_message: recipientMessage,
      },
      payment_intent_data: {
        metadata: {
          gift: "true",
          purchaser_user_id: user.id,
          recipient_email: recipientEmail,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Gift checkout error:", err?.message, err?.type, err?.statusCode);
    return NextResponse.json(
      { error: err?.message || "Gift checkout failed" },
      { status: 500 }
    );
  }
}
