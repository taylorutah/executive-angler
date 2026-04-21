import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";
import RedeemClient from "./RedeemClient";

export const metadata = {
  title: "Redeem Pro — Executive Angler",
  description: "Redeem your promo code for 30 days of Executive Angler Pro — no credit card required.",
};

// Do NOT cache this route statically; seat availability shifts with
// redemptions and isLoggedIn/isPremium is per-user.
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ code?: string }>;
};

export default async function RedeemPage({ searchParams }: PageProps) {
  const { code: codeParam } = await searchParams;
  const code = (codeParam || "REDDIT30").trim().toUpperCase();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isLoggedIn = !!user;
  const isPremium = user ? await checkPremium(supabase, user.id, user.email) : false;

  const { data: availability } = await supabase
    .from("promo_code_availability")
    .select("code, total, remaining, redeemed")
    .eq("code", code)
    .maybeSingle();

  return (
    <RedeemClient
      code={code}
      isLoggedIn={isLoggedIn}
      isPremium={isPremium}
      initialAvailability={
        availability
          ? {
              total: availability.total,
              remaining: availability.remaining,
              redeemed: availability.redeemed,
            }
          : null
      }
    />
  );
}
