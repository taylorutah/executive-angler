import Link from "next/link";
import { CheckCircle2, Gift } from "lucide-react";

export const metadata = {
  title: "Gift sent — Executive Angler",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function GiftSuccessPage({ searchParams }: PageProps) {
  await searchParams; // consume — session_id is informational only.

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="rounded-2xl border border-[#21262D] bg-[#161B22] p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-[#2EA44F] mx-auto mb-4" />
          <h1 className="font-serif text-3xl text-[#F0F6FC] mb-3">Gift sent.</h1>
          <p className="text-sm text-[#A8B2BD] mb-6">
            Your recipient just got an email with a link to claim their year of
            Executive Angler Pro. They can redeem anytime &mdash; their Pro starts the
            moment they click claim.
          </p>

          <div className="rounded-lg border border-[#E8923A]/20 bg-[#E8923A]/5 p-4 mb-6 flex items-start gap-3 text-left">
            <Gift className="h-4 w-4 text-[#E8923A] shrink-0 mt-0.5" />
            <p className="text-xs text-[#A8B2BD]">
              Didn&apos;t arrive? Ask them to check spam, or forward your payment
              receipt &mdash; we can re-send the claim link manually from support.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="w-full rounded-lg bg-[#E8923A] py-3 text-[#0D1117] text-sm font-bold hover:bg-[#D4751F] transition-colors"
            >
              Back to dashboard
            </Link>
            <Link
              href="/gift"
              className="w-full rounded-lg border border-[#21262D] py-3 text-[#F0F6FC] text-sm font-medium hover:border-[#E8923A] transition-colors"
            >
              Send another gift
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
