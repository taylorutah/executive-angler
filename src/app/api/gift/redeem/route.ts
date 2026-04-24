import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/gift/redeem
 *
 * Redeems a Gift Pro token for the authenticated user by calling the
 * SECURITY DEFINER redeem_gift_token RPC. The RPC writes a subscriptions row
 * with source='gift' (status='active', plan='gift_annual') which fires the
 * existing update_premium_from_subscriptions trigger to flip profiles.is_premium.
 *
 * Body: { token: string }
 *
 * Response: { status: 'ok' | 'invalid_token' | 'already_redeemed' | 'own_gift',
 *             premiumUntil: ISO timestamp | null }
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase.rpc("redeem_gift_token", {
      p_user_id: user.id,
      p_token: token,
    });

    if (error) {
      console.error("[api/gift/redeem] RPC failed:", error.message);
      return NextResponse.json({ error: "Redemption failed" }, { status: 500 });
    }

    const row = Array.isArray(data) ? data[0] : data;
    const status = (row?.status as string) ?? "invalid_token";
    const premiumUntil = (row?.premium_until as string | null) ?? null;

    return NextResponse.json({ status, premiumUntil });
  } catch (err: any) {
    console.error("[api/gift/redeem] error:", err?.message);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
