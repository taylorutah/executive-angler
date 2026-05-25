import { createClient } from "@/lib/supabase/server";
import GiftPurchaseClient from "./GiftPurchaseClient";
import { isFoundersFreeWindow, FOUNDERS_FREE_END } from "@/lib/admin";

export const metadata = {
  title: "Gift Pro",
  description: "Gift a year of Executive Angler Pro to a fishing buddy.",
};

export const dynamic = "force-dynamic";

export default async function GiftPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let purchaserName: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    purchaserName = data?.display_name ?? null;
  }

  return (
    <GiftPurchaseClient
      isLoggedIn={!!user}
      purchaserName={purchaserName}
      foundersWindow={isFoundersFreeWindow()}
      foundersFreeEndIso={FOUNDERS_FREE_END.toISOString()}
    />
  );
}
