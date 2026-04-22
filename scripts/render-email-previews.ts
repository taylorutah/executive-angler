#!/usr/bin/env tsx
/**
 * Renders every branded transactional email to /tmp/executive-angler-email-previews.html
 * for quick visual review without signing into the admin.
 *
 * Usage: npx tsx scripts/render-email-previews.ts
 */
import { writeFileSync } from "node:fs";
import { buildBrandedEmail } from "../src/lib/email/templates";
import {
  buildProWelcome,
  buildPaymentFailed,
  buildSubscriptionCanceled,
  buildFoundingConfirmation,
  buildPromoRedeemed,
  buildExpiringSoon,
  buildAccountDeleted,
  type BrandedEmailContent,
} from "../src/lib/email/senders";

type Preview = {
  key: string;
  label: string;
  when: string;
  content: BrandedEmailContent;
};

const inTenDays = new Date(
  Date.now() + 10 * 24 * 60 * 60 * 1000
).toISOString();
const inThreeDays = new Date(
  Date.now() + 3 * 24 * 60 * 60 * 1000
).toISOString();
const inMonth = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000
).toISOString();
const inYear = new Date(
  Date.now() + 365 * 24 * 60 * 60 * 1000
).toISOString();

const PREVIEWS: Preview[] = [
  {
    key: "pro_welcome",
    label: "Pro Welcome",
    when: "Fires when a Stripe subscription checkout completes.",
    content: buildProWelcome({
      displayName: "Taylor",
      planLabel: "Annual",
      priceLabel: "$29.99/year",
      nextBillIso: inYear,
    }),
  },
  {
    key: "payment_failed",
    label: "Payment Failed",
    when: "Fires on invoice.payment_failed — declined or expired card.",
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
    when: "Daily cron, 3 days before a promo sub expires.",
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

const escapeAttr = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const sections = PREVIEWS.map((p) => {
  const html = buildBrandedEmail(p.content);
  return `
    <section id="${p.key}" class="preview-section">
      <div class="preview-header">
        <div>
          <h2>${p.label}</h2>
          <p class="when">${p.when}</p>
        </div>
        <code class="key">${p.key}</code>
      </div>
      <div class="meta">
        <div><span class="label">Subject:</span> <span class="val">${p.content.subject}</span></div>
        <div><span class="label">Preheader:</span> <span class="val muted">${p.content.preheader ?? ""}</span></div>
      </div>
      <iframe srcdoc="${escapeAttr(html)}" title="${p.label}"></iframe>
    </section>
  `;
}).join("\n");

const nav = PREVIEWS.map(
  (p) =>
    `<button type="button" data-target="${p.key}">${p.label}</button>`
).join("");

const navScript = `
  <script>
    document.querySelectorAll('nav button[data-target]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = document.getElementById(btn.dataset.target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  </script>
`;

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Executive Angler — Email Previews</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #0D1117; color: #F0F6FC; font-family: system-ui, -apple-system, sans-serif; padding: 40px 24px; }
    .container { max-width: 960px; margin: 0 auto; }
    h1 { font-size: 24px; margin: 0 0 6px; }
    .lead { color: #A8B2BD; font-size: 13px; max-width: 640px; margin: 0 0 24px; line-height: 1.6; }
    nav { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 40px; }
    nav button { font-size: 12px; padding: 6px 12px; border-radius: 6px; border: 1px solid #21262D; background: #161B22; color: #A8B2BD; cursor: pointer; font: inherit; }
    nav button:hover { color: #F0F6FC; border-color: rgba(232,146,58,0.4); }
    .preview-section { margin-bottom: 56px; scroll-margin-top: 20px; }
    .preview-header { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-bottom: 10px; }
    .preview-header h2 { font-size: 18px; margin: 0; }
    .when { color: #6E7681; font-size: 12px; margin: 2px 0 0; }
    .key { color: #A8B2BD; font-size: 11px; background: #161B22; padding: 3px 7px; border-radius: 4px; border: 1px solid #21262D; }
    .meta { background: #161B22; border: 1px solid #21262D; border-radius: 8px; padding: 10px 14px; font-size: 12px; display: flex; gap: 24px; margin-bottom: 12px; flex-wrap: wrap; }
    .meta .label { color: #6E7681; }
    .meta .val { color: #F0F6FC; font-weight: 500; }
    .meta .muted { color: #A8B2BD; font-style: italic; font-weight: 400; }
    iframe { width: 100%; height: 720px; border: 1px solid #21262D; border-radius: 8px; background: #0D1117; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Email Preview</h1>
    <p class="lead">Every transactional email rendered with sample data. This is the exact HTML sent by Resend in production. Generated ${new Date().toLocaleString()}.</p>
    <nav>${nav}</nav>
    ${sections}
  </div>
  ${navScript}
</body>
</html>`;

const outPath = "/tmp/executive-angler-email-previews.html";
writeFileSync(outPath, page, "utf8");
console.log(`Wrote ${outPath}`);
