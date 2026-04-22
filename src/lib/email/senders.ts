/**
 * Pure body-builders for every branded transactional email.
 *
 * Keeping these in one place means:
 * - The Stripe webhook, promo route, account-delete route, and cron all
 *   call the same function (no drift).
 * - The /admin/email-preview page can render true production HTML with
 *   representative sample data.
 *
 * Each builder returns the arguments needed by sendBrandedEmail, minus
 * the recipient — callers supply `to` themselves.
 */

import {
  buildFeatureList,
  buildSectionLabel,
  DIVIDER_HTML,
} from "./templates";
import { SITE_URL } from "./client";

export type BrandedEmailContent = {
  subject: string;
  heading: string;
  preheader: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
  hideFooterPreferences?: boolean;
  replyTo?: string;
};

const formatDate = (iso: string | number | null | undefined): string => {
  if (iso == null) return "";
  const d =
    typeof iso === "number" ? new Date(iso * 1000) : new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/* ─────────────────── Pro Welcome (Stripe sub) ─────────────────── */

export function buildProWelcome(args: {
  displayName?: string | null;
  planLabel: "Monthly" | "Annual";
  priceLabel?: string; // e.g. "$4.99/month"
  nextBillIso?: string | number | null;
}): BrandedEmailContent {
  const { displayName, planLabel, priceLabel, nextBillIso } = args;
  const nextBill = formatDate(nextBillIso);
  const greeting = displayName ? `You're in, ${displayName}.` : "You're in.";

  const body = `
    <p style="margin:0 0 20px;">
      Thanks for upgrading to Pro. Your data just got a lot more useful.
    </p>
    ${buildSectionLabel("What's unlocked")}
    ${buildFeatureList([
      {
        title: "Catch overlays on live flow charts",
        body:
          "Every fish you've landed, plotted against USGS streamflow at the moment of the catch.",
      },
      {
        title: "Unlimited fly patterns + PDF export",
        body:
          "Build as many recipes as you want. Export a clean PDF for any pattern &mdash; print at the vise.",
      },
      {
        title: "Trophy wall &amp; personal bests",
        body:
          "Your biggest fish by species and river, with the photo gallery to prove it.",
      },
      {
        title: "Full CSV export",
        body:
          "Every session, every catch, every variable. Your data is yours.",
      },
    ])}
    ${DIVIDER_HTML}
    <p style="margin:0 0 8px;font-size:13px;color:#6E7681;">
      <strong style="color:#A8B2BD;">Plan:</strong> ${planLabel}${
        priceLabel ? ` &middot; ${priceLabel}` : ""
      }${nextBill ? ` &middot; next bill ${nextBill}` : ""}
    </p>
  `;

  return {
    subject: "You're in. Welcome to Pro.",
    heading: `${greeting} Welcome to Pro.`,
    preheader: "Catch overlays, unlimited fly recipes, and full exports are unlocked.",
    body,
    ctaLabel: "Manage subscription",
    ctaUrl: `${SITE_URL}/account#subscription`,
  };
}

/* ───────────────────── Payment Failed ───────────────────── */

export function buildPaymentFailed(args: {
  displayName?: string | null;
  amountLabel?: string; // e.g. "$4.99"
  nextAttemptIso?: string | number | null;
  portalUrl: string;
}): BrandedEmailContent {
  const { displayName, amountLabel, nextAttemptIso, portalUrl } = args;
  const nextAttempt = formatDate(nextAttemptIso);
  const greeting = displayName ? `Hi ${displayName},` : "Hi there,";

  const body = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">
      We couldn't process your renewal${
        amountLabel
          ? ` of <strong style=\"color:#F0F6FC;\">${amountLabel}</strong>`
          : ""
      } for Executive Angler Pro. Your card was declined or has expired.
    </p>
    <p style="margin:0 0 16px;">
      No action is critical yet &mdash; Stripe will automatically retry${
        nextAttempt
          ? ` on <strong style=\"color:#F0F6FC;\">${nextAttempt}</strong>`
          : " over the next few days"
      }. But updating your payment method now keeps Pro active without interruption.
    </p>
  `;

  return {
    subject: "Your payment didn't go through",
    heading: "Payment issue",
    preheader: "Update your card to keep Pro active.",
    body,
    ctaLabel: "Update payment method",
    ctaUrl: portalUrl,
  };
}

/* ─────────────────── Subscription Canceled ─────────────────── */

export function buildSubscriptionCanceled(args: {
  displayName?: string | null;
  endedOnIso?: string | number | null;
}): BrandedEmailContent {
  const { displayName, endedOnIso } = args;
  const endedOn = formatDate(endedOnIso);
  const greeting = displayName ? `Hi ${displayName},` : "Hi there,";

  const body = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">
      Your Executive Angler Pro subscription ended${
        endedOn
          ? ` on <strong style=\"color:#F0F6FC;\">${endedOn}</strong>`
          : ""
      }. Your account has reverted to the Free tier.
    </p>
    <p style="margin:0 0 16px;">
      <strong style="color:#F0F6FC;">Your data is safe.</strong> Every session, catch, photo, and fly recipe is still there. Only Pro features (catch overlays, unlimited patterns, PDF &amp; CSV export) are paused.
    </p>
    <p style="margin:0 0 8px;">
      If this wasn't intentional, one click restores everything.
    </p>
  `;

  return {
    subject: "Your Pro subscription has ended",
    heading: "Sorry to see you go",
    preheader: "Your data is safe. Resubscribe any time to re-unlock Pro.",
    body,
    ctaLabel: "Resubscribe",
    ctaUrl: `${SITE_URL}/pricing`,
    footerNote: `Got feedback? Reply to this email &mdash; we read every one.`,
  };
}

/* ─────────────────── Founding Confirmation ─────────────────── */

export function buildFoundingConfirmation(args: {
  displayName?: string | null;
  seatNumber: number;
}): BrandedEmailContent {
  const { displayName, seatNumber } = args;
  const greeting = displayName ? `Welcome, ${displayName}.` : "Welcome.";

  const body = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">
      You're one of only <strong style="color:#F0F6FC;">50 Founding Members</strong> &mdash; and your seat is <strong style="color:#E8923A;">#${seatNumber}</strong>.
    </p>
    <p style="margin:0 0 20px;">
      This is lifetime Pro. No renewals, no rate hikes, no expiration. Ever.
    </p>
    ${buildSectionLabel("What lifetime gets you")}
    ${buildFeatureList([
      {
        title: "Every Pro feature &mdash; forever",
        body:
          "Catch overlays on flow charts, unlimited fly patterns, trophy wall, PDF recipe export, CSV data export.",
      },
      {
        title: "Every future Pro feature",
        body:
          "Anything we build and ship behind the Pro tier is included at no extra cost &mdash; for as long as Executive Angler exists.",
      },
      {
        title: "No renewals, ever",
        body:
          "You paid once. You're done. No surprise bills, no price changes, no lapses.",
      },
      {
        title: "A permanent seat at the table",
        body:
          "The 50 seats sell out and never return. You helped build this. We won't forget it.",
      },
    ])}
  `;

  return {
    subject: `You're Founding Member #${seatNumber}`,
    heading: `Seat #${seatNumber} is yours.`,
    preheader: `Lifetime Pro confirmed. 1 of 50 seats, forever.`,
    body,
    ctaLabel: "Open your account",
    ctaUrl: `${SITE_URL}/account?founding=success#subscription`,
  };
}

/* ─────────────────── Promo Redeemed ─────────────────── */

export function buildPromoRedeemed(args: {
  displayName?: string | null;
  code: string;
  premiumUntilIso?: string | null;
}): BrandedEmailContent {
  const { displayName, code, premiumUntilIso } = args;
  const expiryLabel = formatDate(premiumUntilIso);
  const greeting = displayName ? `Nice one, ${displayName}.` : "Nice one.";

  const body = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 20px;">
      Code <strong style="color:#F0F6FC;">${code.toUpperCase()}</strong> is applied. Pro is active${
        expiryLabel
          ? ` until <strong style=\"color:#E8923A;\">${expiryLabel}</strong>`
          : ""
      }.
    </p>
    ${buildSectionLabel("Use every minute of it")}
    ${buildFeatureList([
      {
        title: "Overlay your catches on live flow",
        body:
          "See exactly which USGS flow levels produced fish for you &mdash; on any river you've fished.",
      },
      {
        title: "Build unlimited fly recipes",
        body:
          "Structured patterns, materials autocomplete, PDF export. Print from the vise.",
      },
      {
        title: "Stack your trophy wall",
        body:
          "Personal bests by species and river, with the photo gallery to prove it.",
      },
      {
        title: "Export your whole journal",
        body:
          "Full CSV of every session, catch, and condition. Your data, on your terms.",
      },
    ])}
  `;

  return {
    subject: "Promo code redeemed — Pro unlocked",
    heading: "Pro unlocked.",
    preheader: expiryLabel
      ? `Your Pro access runs through ${expiryLabel}.`
      : "Your Pro access is active.",
    body,
    ctaLabel: "Open your journal",
    ctaUrl: `${SITE_URL}/journal`,
  };
}

/* ─────────────────── Expiring Soon (promo) ─────────────────── */

export function buildExpiringSoon(args: {
  displayName?: string | null;
  expiryIso: string;
}): BrandedEmailContent {
  const { displayName, expiryIso } = args;
  const expiryLabel = formatDate(expiryIso);
  const greeting = displayName ? `Hi ${displayName},` : "Hi there,";

  const body = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">
      Your promotional Pro access is wrapping up. Pro features will lock on <strong style="color:#E8923A;">${expiryLabel}</strong> unless you upgrade to a paid plan.
    </p>
    <p style="margin:0 0 16px;">
      <strong style="color:#F0F6FC;">Your journal stays safe either way.</strong> Every session, catch, fly, and photo remains exactly where it is. Only Pro-only features (catch overlays, unlimited patterns, PDF &amp; CSV export) will pause.
    </p>
    <p style="margin:0;">
      Three more days of Pro at the price of a good leader: $4.99/month or $29.99/year.
    </p>
  `;

  return {
    subject: "Your Pro access ends in 3 days",
    heading: "Your promo is wrapping up.",
    preheader: `Pro features lock on ${expiryLabel} unless you upgrade.`,
    body,
    ctaLabel: "Keep Pro going",
    ctaUrl: `${SITE_URL}/pricing`,
  };
}

/* ─────────────────── Account Deleted ─────────────────── */

export function buildAccountDeleted(args: {
  displayName?: string | null;
}): BrandedEmailContent {
  const { displayName } = args;
  const greeting = displayName ? `Hi ${displayName},` : "Hi there,";

  const body = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">
      Your Executive Angler account has been permanently deleted. Every fishing session, catch, fly pattern, photo, and piece of profile data tied to your account has been removed from our systems.
    </p>
    <p style="margin:0 0 16px;">
      Any active subscription has been stopped. You won't be charged again.
    </p>
    <p style="margin:0 0 16px;">
      If this wasn't you &mdash; or you change your mind later &mdash; reply to this email and we'll help. We won't be able to recover your data, but we'd love to know what we could have done differently.
    </p>
    <p style="margin:0;">
      Thanks for giving us a shot. Good luck out there.
    </p>
  `;

  return {
    subject: "Your Executive Angler account has been deleted",
    heading: "Your account is deleted.",
    preheader: "All of your data has been permanently removed.",
    body,
    hideFooterPreferences: true,
    footerNote:
      "Didn't mean to delete? Reply to this email &mdash; we read every one.",
    replyTo: "taylor.warnick@gmail.com",
  };
}
