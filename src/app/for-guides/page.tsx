import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pro is Free for Guides",
  description: `If you're a licensed fly fishing guide, ${SITE_NAME} Pro is free for you &mdash; forever. Claim your directory profile and get access to personal insights, per-river scorecard, and the Best Window Calculator at no cost.`,
};

export default function ForGuidesPage() {
  return (
    <div className="pt-8 pb-20 bg-[#0D1117] min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="font-mono text-[#E8923A] text-xs uppercase tracking-[0.2em]">
            For Professional Guides
          </span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#F0F6FC] mb-4">
          Pro is free for guides.
        </h1>
        <p className="text-lg text-[#A8B2BD] mb-10 leading-relaxed">
          If you&apos;re a licensed fly fishing guide working water we cover, {SITE_NAME} Pro is
          yours at no cost &mdash; for as long as you keep guiding.
        </p>

        <div className="prose prose-lg max-w-none text-[#F0F6FC] space-y-6">
          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Why we do this
          </h2>
          <p>
            Guides are the soul of this sport. You put more people onto their first
            rainbow, their first tailwater brown, their first steelhead than any
            marketing channel ever will. We&apos;d rather have guides using Pro,
            recommending the app to clients, and telling us what&apos;s broken &mdash; than
            charging you $2.99 a month.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            What you get
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Everything in Pro: Personal Insights Dashboard, Per-River Scorecard, Best Window Calculator, Trophy Wall+, year-over-year, streak stats, gear stats &mdash; all built from your own data, never crowdsourced.</li>
            <li>A claimed directory profile at <code className="text-[#E8923A]">{`/guides/your-name`}</code> with your bio, specialties, rivers you guide, rates, and contact info.</li>
            <li>A subtle <em>Pro</em> badge on your profile &mdash; clients can see you&apos;re serious about your craft.</li>
            <li>Early access to new features before public launch.</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            How to claim
          </h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Create a free account at{" "}
              <Link href="/signup" className="text-[#E8923A] hover:underline">
                /signup
              </Link>{" "}
              using the email you want Pro tied to.
            </li>
            <li>
              Submit your claim through our{" "}
              <Link
                href="/contact?subject=Guide%20Pro%20Claim"
                className="text-[#E8923A] hover:underline"
              >
                Contact page
              </Link>{" "}
              &mdash; choose <em>&ldquo;Guide Pro Claim&rdquo;</em> as the subject and include:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Your name and the email on your account</li>
                <li>Your guide license / outfitter number (state + number is fine)</li>
                <li>Primary water(s) you guide</li>
                <li>A link to your current guide page or outfitter, if any</li>
              </ul>
            </li>
            <li>
              We verify (usually within a day) and flip your account to Pro. If
              you&apos;re not already in our directory, we&apos;ll create your profile and send
              you the link to review and edit.
            </li>
          </ol>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Fine print
          </h2>
          <p>
            The comp runs as long as you&apos;re actively guiding. If you change
            careers or let your license lapse, your account drops to a normal free
            account &mdash; you keep all your data, just without the Pro features. We
            don&apos;t audit retroactively; if you tell us you&apos;ve retired, we&apos;ll
            note it and part as friends.
          </p>
          <p>
            This offer is capped at <strong className="text-[#F0F6FC]">one comp per guide</strong>,
            not per outfitter &mdash; though if you run a shop and want your full staff on
            Pro,{" "}
            <Link
              href="/contact?subject=Guide%20Pro%20Claim"
              className="text-[#E8923A] hover:underline"
            >
              reach out
            </Link>{" "}
            and we&apos;ll sort it out.
          </p>

          <div className="rounded-xl border border-[#E8923A]/30 bg-[#E8923A]/5 p-6 mt-10">
            <p className="font-heading text-lg text-[#F0F6FC] mb-2">
              Already have an account and want to claim?
            </p>
            <p className="text-[#A8B2BD] mb-4">
              One short message. We handle the rest.
            </p>
            <Link
              href="/contact?subject=Guide%20Pro%20Claim"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E8923A] text-[#0D1117] font-bold hover:bg-[#D4751F] transition-colors"
            >
              Submit your claim
            </Link>
          </div>

          <div className="pt-8">
            <Link href="/pricing" className="text-[#E8923A] hover:underline">
              &larr; Back to Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
