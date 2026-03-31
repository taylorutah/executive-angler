import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PricingClient from "./PricingClient";

export const metadata = {
  title: "Pricing — Executive Angler Pro",
  description: "Unlock advanced analytics, AI insights, hatch reports, and more with Executive Angler Pro.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If logged in, check if already premium
  let isPremium = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("user_id", user.id)
      .single();
    isPremium = profile?.is_premium ?? false;
  }

  return <PricingClient isLoggedIn={!!user} isPremium={isPremium} />;
}
