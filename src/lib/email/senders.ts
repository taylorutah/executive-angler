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

/* ─────────────────── Signup Welcome ─────────────────── */

export function buildWelcome(args: {
  displayName?: string | null;
}): BrandedEmailContent {
  const { displayName } = args;
  const greeting = displayName
    ? `Welcome aboard, ${displayName}.`
    : "Welcome aboard.";

  const body = `
    <p style="margin:0 0 16px;">
      Your Executive Angler account is live. This is the place your fishing actually compounds &mdash; every session, every fish, every fly you tie, stacked up in one journal that gets smarter the more you use it.
    </p>
    <p style="margin:0 0 20px;">
      Here's the fastest path to getting something useful out of it today.
    </p>
    ${buildSectionLabel("Start here")}
    ${buildFeatureList([
      {
        title: "Log your next session",
        body:
          "Weather, water, flies, fish landed. Two minutes on the drive home beats a notebook that never gets opened.",
      },
      {
        title: "Build your fly box",
        body:
          "Catalog the patterns you actually fish. Browse 120+ canonical recipes or build your own from 1,100+ tying materials.",
      },
      {
        title: "Explore rivers you fish",
        body:
          "Live USGS flow, hatch charts, access points, and regs for 138 rivers across the West &mdash; plus community photos from anglers who've been there.",
      },
      {
        title: "Unlock Pro when you're ready",
        body:
          "Personal insights, per-river Awards, leaderboards, best-window calculator, and trophy wall &mdash; $2.99/month or $19.99/year.",
      },
    ])}
    ${DIVIDER_HTML}
    <p style="margin:0 0 12px;font-size:13px;color:#A8B2BD;">
      <strong style="color:#F0F6FC;">On the go?</strong> We have a native iOS app that syncs everything. <a href="https://apps.apple.com/us/app/executive-angler/id6760311036" style="color:#E8923A;text-decoration:none;">Get it on the App Store &rarr;</a>
    </p>
    <p style="margin:0;font-size:13px;color:#6E7681;">
      Questions, bugs, feature ideas? Just reply to this email &mdash; a real human reads every one.
    </p>
  `;

  return {
    subject: "Welcome to Executive Angler",
    heading: greeting,
    preheader: "Log sessions, tie flies, read rivers — your fishing, compounded.",
    body,
    ctaLabel: "Open your journal",
    ctaUrl: `${SITE_URL}/journal`,
    replyTo: "taylor.warnick@gmail.com",
  };
}

/* ─────────────────── Pro Welcome (Stripe sub) ─────────────────── */

export function buildProWelcome(args: {
  displayName?: string | null;
  planLabel: "Monthly" | "Annual";
  priceLabel?: string; // e.g. "$2.99/month"
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
        title: "Insights Dashboard",
        body:
          "Fly effectiveness, time-of-day, weather correlations, best rivers &mdash; all pulled from your sessions.",
      },
      {
        title: "Awards & River Leaderboards",
        body:
          "Per-river progression (Regular &rarr; Master Angler) and where you rank on your home water.",
      },
      {
        title: "Best Window Calculator",
        body:
          "Your personal catch history overlaid on live USGS flow. Know when to drop everything and go.",
      },
      {
        title: "Trophy Wall+ and Year-over-Year",
        body:
          "Biggest by species, per river, top sessions. Last April vs. this April at a glance.",
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
    preheader: "Insights, Awards, leaderboards, and the Best Window Calculator are unlocked.",
    body,
    ctaLabel: "Manage subscription",
    ctaUrl: `${SITE_URL}/account#subscription`,
  };
}

/* ───────────────────── Payment Failed ───────────────────── */

export function buildPaymentFailed(args: {
  displayName?: string | null;
  amountLabel?: string; // e.g. "$2.99"
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
      <strong style="color:#F0F6FC;">Your journal stays safe either way.</strong> Every session, catch, fly, and photo remains exactly where it is. Only Pro-only features (Insights Dashboard, Awards, River Leaderboards, Best Window Calculator) will pause.
    </p>
    <p style="margin:0;">
      Three more days of Pro for less than a coffee: $2.99/month or $19.99/year.
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

/* ─────────── Annual Renewal Reminder (30 days out) ─────────── */

export function buildAnnualRenewalReminder(args: {
  displayName?: string | null;
  renewalIso: string;
  amountLabel?: string; // e.g. "$19.99"
  portalUrl: string;
}): BrandedEmailContent {
  const { displayName, renewalIso, amountLabel, portalUrl } = args;
  const renewalLabel = formatDate(renewalIso);
  const greeting = displayName ? `Hi ${displayName},` : "Hi there,";

  const body = `
    <p style="margin:0 0 16px;">${greeting}</p>
    <p style="margin:0 0 16px;">
      A courtesy heads-up: your Executive Angler Pro annual plan renews on <strong style="color:#F0F6FC;">${renewalLabel}</strong>${
        amountLabel ? ` for <strong style="color:#F0F6FC;">${amountLabel}</strong>` : ""
      }. No action needed if you want to continue &mdash; we'll charge the card on file.
    </p>
    <p style="margin:0 0 16px;">
      If you&apos;d rather cancel or switch to monthly, you can do it in under a minute
      through the billing portal. Your journal, flies, and photos stay with you
      either way.
    </p>
    <p style="margin:0 0 16px;font-size:13px;color:#6E7681;">
      We send this reminder 30 days before every annual renewal because getting
      auto-billed with no warning feels lousy, and we&apos;re not going to be that app.
    </p>
    <p style="margin:0;font-size:13px;color:#A8B2BD;">
      Manage your subscription: <a href="${portalUrl}" style="color:#E8923A;text-decoration:none;">${portalUrl}</a>
    </p>
  `;

  return {
    subject: "Your Pro annual plan renews in 30 days",
    heading: "Renewal coming up in 30 days.",
    preheader: `Your annual Pro renews on ${renewalLabel}. Cancel or switch anytime before then.`,
    body,
    ctaLabel: "Manage subscription",
    ctaUrl: portalUrl,
  };
}

/* ─────────────────── Gift Received ─────────────────── */

export function buildGiftReceived(args: {
  purchaserDisplayName?: string | null;
  purchaserEmail?: string | null;
  recipientMessage?: string | null;
  redeemUrl: string;
}): BrandedEmailContent {
  const { purchaserDisplayName, purchaserEmail, recipientMessage, redeemUrl } = args;
  const fromLabel =
    purchaserDisplayName ||
    (purchaserEmail ? purchaserEmail.split("@")[0] : "A fellow angler");

  const messageBlock = recipientMessage
    ? `
      <div style="margin:0 0 20px;padding:16px;border-left:3px solid #E8923A;background:#0D1117;border-radius:4px;">
        <p style="margin:0;font-size:14px;color:#A8B2BD;font-style:italic;">&ldquo;${recipientMessage
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}&rdquo;</p>
        <p style="margin:8px 0 0;font-size:12px;color:#6E7681;">&mdash; ${fromLabel}</p>
      </div>
    `
    : "";

  const body = `
    <p style="margin:0 0 16px;">
      <strong style="color:#F0F6FC;">${fromLabel}</strong> just gifted you a year of Executive Angler Pro.
    </p>
    ${messageBlock}
    ${buildSectionLabel("What you get with Pro")}
    ${buildFeatureList([
      {
        title: "Insights Dashboard",
        body:
          "Your best flies, times, weather, rivers, and species &mdash; computed from every session you log.",
      },
      {
        title: "Awards &amp; Badges",
        body:
          "Per-river progression: Regular &rarr; Veteran &rarr; Legend &rarr; Centurion &rarr; Master Angler.",
      },
      {
        title: "Best Window Calculator",
        body:
          "Your catch history overlaid on live USGS flow &mdash; know when to fish.",
      },
      {
        title: "Trophy Wall+",
        body:
          "Biggest per species, per river, top 5 sessions, most-species day.",
      },
    ])}
    <p style="margin:20px 0 0;font-size:13px;color:#6E7681;">
      Click the button to claim your gift. You&apos;ll need an Executive Angler
      account &mdash; free to sign up, and your gift adds a full year of Pro on top.
    </p>
  `;

  return {
    subject: `${fromLabel} gifted you Executive Angler Pro`,
    heading: "You've been gifted Pro.",
    preheader: `A full year of Executive Angler Pro from ${fromLabel}. Claim your gift.`,
    body,
    ctaLabel: "Claim your gift",
    ctaUrl: redeemUrl,
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
