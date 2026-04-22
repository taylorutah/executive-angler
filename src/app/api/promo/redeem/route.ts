import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendBrandedEmail } from "@/lib/email/client";
import { buildPromoRedeemed } from "@/lib/email/senders";

/**
 * POST /api/promo/redeem
 *
 * Auth-gated. Body: { code: string }.
 *
 * Calls the SECURITY DEFINER `redeem_promo_code` RPC, which atomically:
 *   - validates the code is active
 *   - blocks double-redemption
 *   - blocks already-Pro users (without burning a seat)
 *   - enforces the max_redemptions cap under an EXCLUSIVE table lock
 *   - writes a subscriptions row with source='promo' (fires premium trigger)
 *
 * Status → HTTP:
 *   ok                → 200
 *   invalid_code      → 404
 *   already_redeemed  → 409  (body includes the existing premium_until)
 *   already_premium   → 409
 *   sold_out          → 410
 */

type RpcRow = {
  status: "ok" | "invalid_code" | "already_redeemed" | "already_premium" | "sold_out";
  premium_until: string | null;
  remaining: number;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  let code: string;
  try {
    const body = await req.json();
    code = typeof body?.code === "string" ? body.code : "";
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const trimmed = code.trim();
  if (!trimmed || trimmed.length > 64) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("redeem_promo_code", {
    p_user_id: user.id,
    p_code: trimmed,
  });

  if (error) {
    console.error("[promo/redeem] RPC error:", error.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const row = Array.isArray(data) ? (data[0] as RpcRow | undefined) : (data as RpcRow | undefined);
  if (!row) {
    console.error("[promo/redeem] empty RPC response");
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  switch (row.status) {
    case "ok":
      // Fire-and-forget confirmation email
      if (user.email) {
        void sendPromoRedeemedEmail(
          user.email,
          (user.user_metadata as Record<string, unknown> | null)?.display_name as
            | string
            | undefined,
          row.premium_until,
          trimmed
        );
      }
      return NextResponse.json({
        success: true,
        premium_until: row.premium_until,
        remaining: row.remaining,
      });
    case "invalid_code":
      return NextResponse.json({ error: "invalid_code" }, { status: 404 });
    case "already_redeemed":
      return NextResponse.json(
        { error: "already_redeemed", premium_until: row.premium_until },
        { status: 409 }
      );
    case "already_premium":
      return NextResponse.json({ error: "already_premium" }, { status: 409 });
    case "sold_out":
      return NextResponse.json({ error: "sold_out" }, { status: 410 });
    default:
      console.error("[promo/redeem] unknown status:", row.status);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

async function sendPromoRedeemedEmail(
  email: string,
  displayName: string | undefined,
  premiumUntil: string | null,
  code: string
) {
  const content = buildPromoRedeemed({
    displayName,
    code,
    premiumUntilIso: premiumUntil,
  });
  await sendBrandedEmail({ tag: "promo_redeemed", to: email, ...content });
}
