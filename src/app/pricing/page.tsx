import { createClient } from "@/lib/supabase/server";
import PricingClient from "./PricingClient";
import { checkPremium } from "@/lib/admin";

export const metadata = {
  title: "Pricing — Executive Angler Pro",
  description:
    "See the patterns in your fishing. Pro is $2.99/mo or $19.99/yr — insights, awards, leaderboards, and more. 30-day money-back guarantee.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isPremium = user ? await checkPremium(supabase, user.id, user.email) : false;

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
      subscriptionSource={subscriptionSource}
      subscriptionExpiresAt={subscriptionExpiresAt}
    />
  );
}
