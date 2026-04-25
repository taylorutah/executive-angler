import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Refund Policy — 30-Day Money-Back Guarantee",
  description: `${SITE_NAME} Pro is backed by a 30-day money-back guarantee. Request a refund for any reason within 30 days of your purchase or renewal.`,
};

export default function RefundPolicyPage() {
  return (
    <div className="pt-8 pb-20 bg-[#0D1117] min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-4xl font-bold text-[#E8923A] mb-2">
          Refund Policy
        </h1>
        <p className="text-sm text-[#A8B2BD] mb-10">
          30-day money-back guarantee. No questions asked.
        </p>

        <div className="prose prose-lg max-w-none text-[#F0F6FC] space-y-6">
          <p>
            {SITE_NAME} Pro is backed by a <strong className="text-[#F0F6FC]">30-day money-back guarantee</strong>. If you&apos;re
            not happy with Pro for any reason within 30 days of your purchase or
            renewal, we&apos;ll refund you in full. No forms, no friction, no gotchas.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            How to request a refund
          </h2>
          <p>
            Visit our{" "}
            <Link
              href="/contact?subject=Pro%20Refund%20Request"
              className="text-[#E8923A] hover:underline"
            >
              Contact page
            </Link>{" "}
            and choose <em>&ldquo;Pro Refund Request&rdquo;</em> as the subject. Include
            the email address on your account in the message. A real human (Taylor)
            reads every message and will process your refund through Stripe, typically
            within one business day. You don&apos;t need to explain why.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            What happens to your data
          </h2>
          <p>
            Your journal, fly patterns, photos, and history stay untouched. A refund
            just pauses Pro features (insights, Awards, leaderboards, Best Window
            Calculator). Your free account remains fully yours forever, with
            unlimited sessions, unlimited flies, unlimited photos, and the full Fly
            Tying Workbench.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Apple and Google subscriptions
          </h2>
          <p>
            If you subscribed through the Apple App Store or Google Play, refunds are
            processed through Apple or Google directly &mdash; we don&apos;t have access to
            your payment details on those platforms. Use the links below:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-[#F0F6FC]">Apple:</strong>{" "}
              <a
                href="https://reportaproblem.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E8923A] hover:underline"
              >
                reportaproblem.apple.com
              </a>
            </li>
            <li>
              <strong className="text-[#F0F6FC]">Google Play:</strong>{" "}
              <a
                href="https://support.google.com/googleplay/answer/2479637"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E8923A] hover:underline"
              >
                support.google.com/googleplay
              </a>
            </li>
          </ul>
          <p>
            If you have trouble with an Apple or Google refund,{" "}
            <Link href="/contact" className="text-[#E8923A] hover:underline">
              reach out anyway
            </Link>{" "}
            &mdash; we&apos;ll help you through it.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Annual renewal reminders
          </h2>
          <p>
            If you&apos;re on an annual plan, we&apos;ll email you <strong className="text-[#F0F6FC]">30 days
            before</strong> your renewal as a courtesy reminder. Cancel anytime before the
            charge hits &mdash; no lock-in, no dark patterns.
          </p>

          <h2 className="font-heading text-2xl font-bold text-[#E8923A] mt-10">
            Questions
          </h2>
          <p>
            Anything unclear?{" "}
            <Link href="/contact" className="text-[#E8923A] hover:underline">
              Reach out through our Contact page
            </Link>
            .
          </p>

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
