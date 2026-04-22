import { createClient } from "@/lib/supabase/server";
import PricingClient from "./PricingClient";
import { checkPremium } from "@/lib/admin";

export const metadata = {
  title: "Pricing — Executive Angler Pro",
  description: "Unlock advanced analytics, AI insights, hatch reports, and more with Executive Angler Pro.",
};

// Revalidate the seat counter at most once per minute. Founding seats are a
// long-tail 50-total scarcity signal; we don't need it real-time.
export const revalidate = 60;

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Full 3-tier premium check covers permanent-pro emails and active
  // subscriptions, not just profiles.is_premium.
  const isPremium = user ? await checkPremium(supabase, user.id, user.email) : false;

  // Founding-seat availability — public aggregate view, no PII.
  const { data: seats } = await supabase
    .from("founding_seats_remaining")
    .select("total_seats, remaining_seats, sold_seats")
    .single();

  // Is the current user already a founder? (Shows a "You're a founder" state.)
  let isFounder = false;
  if (user) {
    const { data: member } = await supabase
      .from("founding_members")
      .select("seat_number")
      .eq("user_id", user.id)
      .maybeSingle();
    isFounder = !!member;
  }

  // Active subscription source + expiry — promo users need a distinct
  // upgrade path (their access ends on a hard date; they aren't renewable
  // via the Stripe portal because they have no customer there).
  let subscriptionSource: "apple" | "google" | "stripe" | "promo" | null = null;
  let subscriptionExpiresAt: string | null = null;
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("source, current_period_end")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sub) {
      subscriptionSource = sub.source as typeof subscriptionSource;
      subscriptionExpiresAt = sub.current_period_end;
    }
  }

  return (
    <PricingClient
      isLoggedIn={!!user}
      isPremium={isPremium}
      isFounder={isFounder}
      subscriptionSource={subscriptionSource}
      subscriptionExpiresAt={subscriptionExpiresAt}
      foundingSeats={{
        total: seats?.total_seats ?? 50,
        sold: seats?.sold_seats ?? 0,
        remaining: seats?.remaining_seats ?? 50,
      }}
    />
  );
}
