import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "For Guides — Claim Your Directory Profile",
  description: `If you're a licensed fly fishing guide, claim your ${SITE_NAME} directory profile so clients can find you. Every feature of the app is free for everyone — guides included.`,
};

export default function ForGuidesPage() {
  return (
    <div className="pt-8 pb-20 bg-[var(--surface-page)] min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="font-mono text-[var(--action)] text-xs uppercase tracking-[0.2em]">
            For Professional Guides
          </span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4">
          Claim your guide profile.
        </h1>
        <p className="text-lg text-[var(--text-body)] mb-10 leading-relaxed">
          {SITE_NAME} is free for everyone &mdash; every feature, no payment, no
          tiers. If you guide water we cover, claim your directory profile so
          clients can find you.
        </p>

        <div className="prose prose-lg max-w-none text-[var(--text-primary)] space-y-6">
          <h2 className="font-heading text-2xl font-bold text-[var(--action)] mt-10">
            Why we do this
          </h2>
          <p>
            Guides are the soul of this sport. You put more people onto their first
            rainbow, their first tailwater brown, their first steelhead than any
            marketing channel ever will. We&apos;d rather have guides using the app,
            recommending it to clients, and telling us what&apos;s broken &mdash; so
            the whole thing is free, for you and for everyone.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[var(--action)] mt-10">
            What you get
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Everything in the app: Personal Insights Dashboard, Per-River Scorecard, Best Window Calculator, Trophy Wall+, year-over-year, streak stats, gear stats &mdash; all built from your own data, never crowdsourced.</li>
            <li>A claimed directory profile at <code className="text-[var(--action)]">{`/guides/your-name`}</code> with your bio, specialties, rivers you guide, rates, and contact info.</li>
            <li>Early access to new features before public launch.</li>
          </ul>

          <h2 className="font-heading text-2xl font-bold text-[var(--action)] mt-10">
            How to claim
          </h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Create a free account at{" "}
              <Link href="/signup" className="text-[var(--action)] hover:underline">
                /signup
              </Link>
              .
            </li>
            <li>
              Submit your claim through our{" "}
              <Link
                href="/contact?subject=Guide%20Profile%20Claim"
                className="text-[var(--action)] hover:underline"
              >
                Contact page
              </Link>{" "}
              &mdash; choose <em>&ldquo;Guide Profile Claim&rdquo;</em> as the subject and include:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Your name and the email on your account</li>
                <li>Your guide license / outfitter number (state + number is fine)</li>
                <li>Primary water(s) you guide</li>
                <li>A link to your current guide page or outfitter, if any</li>
              </ul>
            </li>
            <li>
              We verify (usually within a day) and set up your profile. If
              you&apos;re not already in our directory, we&apos;ll create your profile and send
              you the link to review and edit.
            </li>
          </ol>

          <div className="rounded-xl border border-[var(--action)]/30 bg-[var(--action)]/5 p-6 mt-10">
            <p className="font-heading text-lg text-[var(--text-primary)] mb-2">
              Ready to claim your profile?
            </p>
            <p className="text-[var(--text-body)] mb-4">
              One short message. We handle the rest.
            </p>
            <Link
              href="/contact?subject=Guide%20Profile%20Claim"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--action)] text-[var(--surface-page)] font-bold hover:bg-[#D4751F] transition-colors"
            >
              Submit your claim
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
