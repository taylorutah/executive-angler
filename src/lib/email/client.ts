import { Resend } from "resend";
import { buildBrandedEmail } from "./templates";
import { SITE_URL as CANONICAL_SITE_URL } from "@/lib/constants";

/**
 * Shared Resend client + branded-email sender.
 *
 * getResend() is lazy and returns null when RESEND_API_KEY is missing —
 * callers inside webhooks/cron must not 500 just because email is offline.
 */

export const FROM_EMAIL = "Executive Angler <noreply@executiveangler.com>";
export const SITE_URL = CANONICAL_SITE_URL;

let _resend: Resend | null = null;
let _resendChecked = false;

export function getResend(): Resend | null {
  if (!_resendChecked) {
    _resendChecked = true;
    const key = process.env.RESEND_API_KEY;
    if (key) _resend = new Resend(key);
  }
  return _resend;
}

type SendBrandedEmailArgs = {
  /** Tag for logs (e.g. "pro_welcome", "payment_failed"). */
  tag: string;
  to: string;
  subject: string;
  heading: string;
  /** HTML allowed. */
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  preheader?: string;
  footerNote?: string;
  hideFooterPreferences?: boolean;
  /** Optional override for from address. */
  from?: string;
  replyTo?: string;
};

export type SendBrandedEmailResult = {
  sent: boolean;
  id?: string;
  reason?: string;
};

/**
 * Build + send a branded email. Never throws — all failures are logged and
 * returned as `{ sent: false, reason }` so callers in webhooks/cron can
 * stay resilient.
 */
export async function sendBrandedEmail(
  args: SendBrandedEmailArgs
): Promise<SendBrandedEmailResult> {
  const {
    tag,
    to,
    subject,
    heading,
    body,
    ctaLabel,
    ctaUrl,
    preheader,
    footerNote,
    hideFooterPreferences,
    from,
    replyTo,
  } = args;

  const resend = getResend();
  if (!resend) {
    console.log(`[EMAIL SKIP ${tag}] RESEND_API_KEY not set`);
    return { sent: false, reason: "resend_not_configured" };
  }

  if (!to) {
    console.warn(`[EMAIL SKIP ${tag}] missing recipient`);
    return { sent: false, reason: "missing_recipient" };
  }

  const html = buildBrandedEmail({
    heading,
    body,
    ctaLabel,
    ctaUrl,
    preheader,
    footerNote,
    hideFooterPreferences,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: from ?? FROM_EMAIL,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error(`[EMAIL ERROR ${tag}] to=${to}`, error);
      return { sent: false, reason: error.message };
    }
    console.log(`[EMAIL SENT ${tag}] to=${to} resendId=${data?.id}`);
    return { sent: true, id: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error(`[EMAIL EXCEPTION ${tag}] to=${to}:`, msg);
    return { sent: false, reason: msg };
  }
}
