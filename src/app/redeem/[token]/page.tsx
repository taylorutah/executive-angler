import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import GiftRedeemClient from "./GiftRedeemClient";

export const metadata = {
  title: "Claim your Gift — Executive Angler Pro",
  description: "Redeem your gift for a year of Executive Angler Pro.",
};

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ token: string }>;
};

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function RedeemGiftPage({ params }: PageProps) {
  const { token } = await params;

  const admin = getSupabaseAdmin();
  const { data: gift } = await admin
    .from("gift_redemptions")
    .select(
      "token, purchaser_display_name, purchaser_email, recipient_message, redeemed_at, created_at"
    )
    .eq("token", token)
    .maybeSingle();

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <GiftRedeemClient
      token={token}
      gift={
        gift
          ? {
              purchaserDisplayName: gift.purchaser_display_name,
              purchaserEmail: gift.purchaser_email,
              recipientMessage: gift.recipient_message,
              redeemedAt: gift.redeemed_at,
              createdAt: gift.created_at,
            }
          : null
      }
      isLoggedIn={!!user}
    />
  );
}
