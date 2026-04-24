import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/gift/[token]
 *
 * Returns public-safe metadata for a gift token so the /redeem/[token] page
 * can render the purchaser's name, message, and redemption state without
 * requiring login. Uses service role because gift_redemptions RLS restricts
 * reads to purchaser/redeemer and the recipient may not yet be logged in.
 */

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("gift_redemptions")
    .select(
      "token, purchaser_display_name, purchaser_email, recipient_email, recipient_message, redeemed_at, created_at"
    )
    .eq("token", token)
    .maybeSingle();

  if (error) {
    console.error("[api/gift/token] lookup error:", error.message);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "invalid_token" }, { status: 404 });
  }

  return NextResponse.json({
    purchaserDisplayName: data.purchaser_display_name,
    purchaserEmail: data.purchaser_email,
    recipientEmail: data.recipient_email,
    recipientMessage: data.recipient_message,
    redeemedAt: data.redeemed_at,
    createdAt: data.created_at,
    status: data.redeemed_at ? "redeemed" : "pending",
  });
}
