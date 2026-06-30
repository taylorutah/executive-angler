/**
 * Pure body-builders for every branded transactional email.
 *
 * Keeping these in one place means:
 * - The signup callback and the account-delete route call the same
 *   functions (no drift).
 * - The /admin/email-preview page can render true production HTML with
 *   representative sample data.
 *
 * Each builder returns the arguments needed by sendBrandedEmail, minus
 * the recipient — callers supply `to` themselves.
 *
 * Executive Angler is fully free, so there are no payment/subscription
 * emails here — only account lifecycle (welcome, deletion).
 */

import {
  buildFeatureList,
  buildSectionLabel,
  DIVIDER_HTML,
} from "./templates";
import { SITE_URL } from "./client";
import { APP_STORE_URL } from "@/lib/constants";

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
        title: "Your own intelligence layer",
        body:
          "Personal insights, per-river scorecard, best-window calculator, and trophy wall &mdash; built from your own data, never crowdsourced. Free for every angler, no card required.",
      },
    ])}
    ${DIVIDER_HTML}
    <p style="margin:0 0 12px;font-size:13px;color:#4B5563;">
      <strong style="color:#111827;">On the go?</strong> We have a native iOS app that syncs everything. <a href="${APP_STORE_URL}" style="color:#D4751F;text-decoration:none;">Get it on the App Store &rarr;</a>
    </p>
    <p style="margin:0;font-size:13px;color:#6B7280;">
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
    replyTo: "hello@executiveangler.com",
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
    replyTo: "hello@executiveangler.com",
  };
}
