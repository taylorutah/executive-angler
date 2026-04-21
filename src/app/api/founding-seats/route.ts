import { NextResponse } from "next/server";
import { createStaticClient } from "@/lib/supabase/static";

/**
 * GET /api/founding-seats
 *
 * Public endpoint. Returns only aggregate counts — no PII, no user list.
 * Backed by the `founding_seats_remaining` view, which has GRANT SELECT to
 * anon + authenticated.
 *
 * Uses the static (cookie-free) Supabase client so Next can cache the route
 * with ISR — there's no user context needed to count public seats.
 *
 * Response: { total: 50, sold: number, remaining: number }
 *
 * Caching: 30-second revalidate is plenty — this shifts at most 50 times in
 * the product's lifetime and the pricing page doesn't need second-accurate
 * numbers. Keeps the DB hit off the hot path for page views.
 */

export const revalidate = 30;

export async function GET() {
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("founding_seats_remaining")
      .select("total_seats, remaining_seats, sold_seats")
      .single();

    if (error) {
      console.error("[founding-seats]", error.message);
      // Fail open: assume full capacity so the UI doesn't falsely claim sold-out
      return NextResponse.json({ total: 50, sold: 0, remaining: 50 });
    }

    return NextResponse.json({
      total: data?.total_seats ?? 50,
      sold: data?.sold_seats ?? 0,
      remaining: data?.remaining_seats ?? 50,
    });
  } catch (err) {
    console.error("[founding-seats] unexpected:", err);
    return NextResponse.json({ total: 50, sold: 0, remaining: 50 });
  }
}
