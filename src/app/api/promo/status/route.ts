import { NextRequest, NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/static";

/**
 * GET /api/promo/status?code=REDDIT30
 *
 * Public endpoint. Reads the `promo_code_availability` view (aggregate-only,
 * no PII). Fails open to full capacity so the UI never falsely claims sold out.
 *
 * Cached with 30s ISR — the /redeem page polls this while idle, and second-
 * accurate counts aren't needed.
 */

export const revalidate = 30;

const FALLBACK = { total: 0, redeemed: 0, remaining: 0 } as const;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }

  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("promo_code_availability")
      .select("code, total, remaining, redeemed")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      console.error("[promo/status]", error.message);
      return NextResponse.json({ code, ...FALLBACK });
    }

    if (!data) {
      // Code not found or not currently active — report zero availability
      return NextResponse.json({ code, ...FALLBACK });
    }

    return NextResponse.json({
      code: data.code,
      total: data.total,
      redeemed: data.redeemed,
      remaining: data.remaining,
    });
  } catch (err) {
    console.error("[promo/status] unexpected:", err);
    return NextResponse.json({ code, ...FALLBACK });
  }
}
