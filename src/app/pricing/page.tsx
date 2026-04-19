import { createClient } from "@/lib/supabase/server";
import PricingClient from "./PricingClient";
import { checkPremium } from "@/lib/admin";

export const metadata = {
  title: "Pricing — Executive Angler Pro",
  description: "Unlock advanced analytics, AI insights, hatch reports, and more with Executive Angler Pro.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Full 3-tier premium check covers permanent-pro emails and active
  // subscriptions, not just profiles.is_premium.
  const isPremium = user ? await checkPremium(supabase, user.id, user.email) : false;

  return <PricingClient isLoggedIn={!!user} isPremium={isPremium} />;
}
