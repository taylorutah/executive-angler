import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "For Guides — Claim Your Directory Profile",
  description: `If you're a licensed fly fishing guide, claim your ${SITE_NAME} directory profile so clients can find you. Every feature of the app is free for everyone — guides included.`,
};

const SECTION_H2 =
  "font-display text-2xl font-semibold text-[var(--text-1)] mt-12";

export default function ForGuidesPage() {
  return (
    <div className="py-14 sm:py-24">
      <div className="mx-auto max-w-[var(--prose)] px-4 sm:px-6">
        <p className="ea-overline">
          For Professional Guides
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-[var(--text-1)] sm:text-5xl">
          Claim your guide profile.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--text-2)]">
          {SITE_NAME} is free for everyone &mdash; every feature, no payment, no
          tiers. If you guide water we cover, claim your directory profile so
          clients can find you.
        </p>

        <div className="mt-8 space-y-6 text-[var(--text-2)]">
          <h2 className={SECTION_H2}>
            Why we do this
          </h2>
          <p>
            Guides are the soul of this sport. You put more people onto their first
            rainbow, their first tailwater brown, their first steelhead than any
            marketing channel ever will. We&apos;d rather have guides using the app,
            recommending it to clients, and telling us what&apos;s broken &mdash; so
            the whole thing is free, for you and for everyone.
          </p>

          <h2 className={SECTION_H2}>
            What you get
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Everything in the app: Personal Insights Dashboard, Per-River Scorecard, Best Window Calculator, Trophy Wall+, year-over-year, streak stats, gear stats &mdash; all built from your own data, never crowdsourced.</li>
            <li>A claimed directory profile at <code className="text-[var(--text-1)]">{`/guides/your-name`}</code> with your bio, specialties, rivers you guide, rates, and contact info.</li>
            <li>Early access to new features before public launch.</li>
          </ul>

          <h2 className={SECTION_H2}>
            How to claim
          </h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Create a free account at{" "}
              <Link href="/signup" className="text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent-hover)]">
                /signup
              </Link>
              .
            </li>
            <li>
              Submit your claim through our{" "}
              <Link
                href="/contact?subject=Guide%20Profile%20Claim"
                className="text-[var(--accent)] underline underline-offset-4 hover:text-[var(--accent-hover)]"
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

          <div className="ea-card mt-12">
            <p className="font-display text-lg font-semibold text-[var(--text-1)]">
              Ready to claim your profile?
            </p>
            <p className="mt-2 text-[var(--text-2)]">
              One short message. We handle the rest.
            </p>
            <Link
              href="/contact?subject=Guide%20Profile%20Claim"
              className="ea-btn ea-btn-primary ea-btn-lg mt-4"
            >
              Submit your claim
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
