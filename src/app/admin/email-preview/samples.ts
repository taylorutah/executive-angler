import {
  buildWelcome,
  buildProWelcome,
  buildPaymentFailed,
  buildSubscriptionCanceled,
  buildFoundingConfirmation,
  buildPromoRedeemed,
  buildExpiringSoon,
  buildAnnualRenewalReminder,
  buildGiftReceived,
  buildAccountDeleted,
  type BrandedEmailContent,
} from "@/lib/email/senders";

export type EmailSample = {
  key: string;
  label: string;
  when: string;
  content: BrandedEmailContent;
};

const inTenDays = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
const inMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
const inYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

/**
 * All transactional email fixtures with sample data.
 * Shared between /admin/email-preview and the send-test route so the
 * preview and the actual test send always render identical HTML.
 */
export const EMAIL_SAMPLES: ReadonlyArray<EmailSample> = [
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
      priceLabel: "$19.99/year",
      nextBillIso: inYear,
    }),
  },
  {
    key: "payment_failed",
    label: "Payment Failed",
    when: "Fires on invoice.payment_failed — declined card or expired.",
    content: buildPaymentFailed({
      displayName: "Taylor",
      amountLabel: "$2.99",
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
    key: "annual_renewal_reminder",
    label: "Annual Renewal Reminder",
    when: "Daily cron, 30 days before annual renewal.",
    content: buildAnnualRenewalReminder({
      displayName: "Taylor",
      renewalIso: inMonth,
      amountLabel: "$19.99",
      portalUrl: "https://billing.stripe.com/p/session/live_xyz",
    }),
  },
  {
    key: "gift_received",
    label: "Gift Received",
    when: "Fires when a gift purchase completes for the recipient.",
    content: buildGiftReceived({
      purchaserDisplayName: "Alex",
      purchaserEmail: "alex@example.com",
      recipientMessage:
        "Saw you were getting into Euro nymphing — figured this might help.",
      redeemUrl: "https://www.executiveangler.com/gift/redeem?token=demo",
    }),
  },
  {
    key: "account_deleted",
    label: "Account Deletion Farewell",
    when: "Fires right before auth user is deleted.",
    content: buildAccountDeleted({ displayName: "Taylor" }),
  },
];
