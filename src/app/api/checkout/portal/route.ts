import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/checkout/portal
 *
 * Creates a Stripe Billing Portal session so a web subscriber can
 * manage, cancel, or update their subscription.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   NEXT_PUBLIC_SITE_URL
 */

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://www.executiveangler.com";
    const siteUrl = origin.startsWith("http") ? origin : `https://${origin}`;

    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get Stripe customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Portal error:", err.message);
    return NextResponse.json({ error: "Portal creation failed" }, { status: 500 });
  }
}
