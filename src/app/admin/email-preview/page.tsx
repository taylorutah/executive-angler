import { buildBrandedEmail } from "@/lib/email/templates";
import {
  buildWelcome,
  buildProWelcome,
  buildPaymentFailed,
  buildSubscriptionCanceled,
  buildFoundingConfirmation,
  buildPromoRedeemed,
  buildExpiringSoon,
  buildAccountDeleted,
  type BrandedEmailContent,
} from "@/lib/email/senders";
import PreviewNav from "./PreviewNav";

export const dynamic = "force-dynamic";

type Preview = {
  key: string;
  label: string;
  when: string;
  content: BrandedEmailContent;
};

const inTenDays = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
const inThreeDays = new Date(
  Date.now() + 3 * 24 * 60 * 60 * 1000
).toISOString();
const inMonth = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000
).toISOString();

const PREVIEWS: Preview[] = [
  {
    key: "welcome",
    label: "Signup Welcome",
    when: "Fires on first authenticated callback (email confirm or OAuth signup).",
    content: buildWelcome({ displayName: "Taylor" }),
  },
  {
    key: "pro_welcome",
    label: "Pro Welcome",
    when: "Fires when a Stripe subscription checkout completes.",
    content: buildProWelcome({
      displayName: "Taylor",
      planLabel: "Annual",
      priceLabel: "$29.99/year",
      nextBillIso: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
    }),
  },
  {
    key: "payment_failed",
    label: "Payment Failed",
    when: "Fires on invoice.payment_failed — declined card or expired.",
    content: buildPaymentFailed({
      displayName: "Taylor",
      amountLabel: "$4.99",
      nextAttemptIso: inThreeDays,
      portalUrl: "https://billing.stripe.com/p/session/live_xyz",
    }),
  },
  {
    key: "subscription_canceled",
    label: "Subscription Canceled",
    when: "Fires on customer.subscription.deleted.",
    content: buildSubscriptionCanceled({
      displayName: "Taylor",
      endedOnIso: new Date().toISOString(),
    }),
  },
  {
    key: "founding_confirmation",
    label: "Founding Member Confirmation",
    when: "Fires after a seat is atomically claimed.",
    content: buildFoundingConfirmation({
      displayName: "Taylor",
      seatNumber: 17,
    }),
  },
  {
    key: "promo_redeemed",
    label: "Promo Code Redeemed",
    when: "Fires after /api/promo/redeem returns ok.",
    content: buildPromoRedeemed({
      displayName: "Taylor",
      code: "LAUNCH30",
      premiumUntilIso: inMonth,
    }),
  },
  {
    key: "expiring_soon",
    label: "Promo Expiring Soon",
    when: "Fires from daily cron 3 days before a promo sub expires.",
    content: buildExpiringSoon({
      displayName: "Taylor",
      expiryIso: inTenDays,
    }),
  },
  {
    key: "account_deleted",
    label: "Account Deletion Farewell",
    when: "Fires right before auth user is deleted.",
    content: buildAccountDeleted({ displayName: "Taylor" }),
  },
];

export default function EmailPreviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 text-[#F0F6FC]">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Email Preview</h1>
        <p className="text-sm text-[#A8B2BD] leading-relaxed max-w-2xl">
          Every transactional email rendered with sample data. These are the
          exact templates that go out in production — any edits you make to{" "}
          <code className="text-[#E8923A]">src/lib/email/senders.ts</code> or{" "}
          <code className="text-[#E8923A]">src/lib/email/templates.ts</code>{" "}
          show up here.
        </p>
      </header>

      <PreviewNav items={PREVIEWS.map((p) => ({ key: p.key, label: p.label }))} />

      <div className="space-y-12">
        {PREVIEWS.map((p) => {
          const html = buildBrandedEmail(p.content);
          return (
            <section
              key={p.key}
              id={p.key}
              className="scroll-mt-8"
            >
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#F0F6FC]">
                    {p.label}
                  </h2>
                  <p className="text-xs text-[#6E7681] mt-0.5">{p.when}</p>
                </div>
                <div className="text-xs text-[#6E7681] shrink-0">
                  <code className="text-[#A8B2BD]">{p.key}</code>
                </div>
              </div>
              <div className="mb-3 rounded-lg border border-[#21262D] bg-[#161B22] px-4 py-3 text-sm">
                <div className="flex gap-6 text-xs">
                  <div>
                    <span className="text-[#6E7681]">Subject:&nbsp;</span>
                    <span className="text-[#F0F6FC] font-medium">
                      {p.content.subject}
                    </span>
                  </div>
                  {p.content.preheader && (
                    <div className="truncate">
                      <span className="text-[#6E7681]">Preheader:&nbsp;</span>
                      <span className="text-[#A8B2BD] italic">
                        {p.content.preheader}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <iframe
                title={p.label}
                srcDoc={html}
                className="w-full rounded-lg border border-[#21262D] bg-[#0D1117]"
                style={{ height: "720px" }}
              />
            </section>
          );
        })}
      </div>
    </div>
  );
}
