import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";
import FoundingClient from "./FoundingClient";
import type { Metadata } from "next";

/**
 * /founding — dedicated landing page for the Founding 50 drop.
 *
 * Separate from /pricing because the audience is different: /pricing is for
 * people deciding between plans; /founding is for a single decision, driven
 * in from social posts or DMs. Single CTA, single headline, no noise.
 *
 * OG image and Twitter image are automatically wired by Next via the
 * `opengraph-image.tsx` and `twitter-image.tsx` files in this directory.
 *
 * Revalidates every 60 seconds so the seat counter stays close to live
 * without hammering Supabase on every page view.
 */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Founding 50 — Lifetime Executive Angler Pro for $150",
  description:
    "One payment. Every Pro feature, forever. Live river conditions, AI insights, hatch reports, fly tying workbench, unlimited patterns. Only 50 spots — then it's gone.",
  openGraph: {
    title: "Founding 50 — Lifetime Executive Angler Pro for $150",
    description:
      "One payment. Every Pro feature, forever. Only 50 spots.",
    url: "https://www.executiveangler.com/founding",
    siteName: "Executive Angler",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Founding 50 — Lifetime Pro for $150",
    description:
      "One payment. Every Pro feature, forever. Only 50 spots.",
  },
  alternates: {
    canonical: "https://www.executiveangler.com/founding",
  },
};

export default async function FoundingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isPremium = user ? await checkPremium(supabase, user.id, user.email) : false;

  const { data: seats } = await supabase
    .from("founding_seats_remaining")
    .select("total_seats, remaining_seats, sold_seats")
    .single();

  let isFounder = false;
  let seatNumber: number | null = null;
  if (user) {
    const { data: member } = await supabase
      .from("founding_members")
      .select("seat_number")
      .eq("user_id", user.id)
      .maybeSingle();
    if (member) {
      isFounder = true;
      seatNumber = member.seat_number;
    }
  }

  return (
    <FoundingClient
      isLoggedIn={!!user}
      isPremium={isPremium}
      isFounder={isFounder}
      seatNumber={seatNumber}
      foundingSeats={{
        total: seats?.total_seats ?? 50,
        sold: seats?.sold_seats ?? 0,
        remaining: seats?.remaining_seats ?? 50,
      }}
    />
  );
}
