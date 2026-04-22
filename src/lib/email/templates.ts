/**
 * Shared branded HTML email template.
 *
 * Matches the dark-card aesthetic used by /api/notifications/welcome:
 * #0D1117 bg, #161B22 card, #E8923A copper CTA, DM-style typography via
 * system-ui (most email clients don't honor custom webfonts).
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.executiveangler.com";

type BrandedEmailOptions = {
  heading: string;
  /** HTML allowed — paragraphs, lists, divider rows, etc. */
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  /** Inbox preview snippet (hidden, accessibility-friendly) */
  preheader?: string;
  /** Override the default "Manage preferences" footer row (e.g. for deletion emails) */
  footerNote?: string;
  /** Suppress the preferences link entirely (account-deletion case) */
  hideFooterPreferences?: boolean;
};

export function buildBrandedEmail(opts: BrandedEmailOptions): string {
  const {
    heading,
    body,
    ctaLabel,
    ctaUrl,
    preheader,
    footerNote,
    hideFooterPreferences,
  } = opts;

  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;color:transparent;height:0;width:0;font-size:1px;line-height:1px;">${preheader}</div>`
    : "";

  const ctaHtml =
    ctaLabel && ctaUrl
      ? `<a href="${ctaUrl}" style="display:inline-block;background-color:#E8923A;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;margin-top:8px;">${ctaLabel}</a>`
      : "";

  const footerPrefs = hideFooterPreferences
    ? ""
    : `<p style="margin:12px 0 0;font-size:11px;color:#6E7681;">
          <a href="${SITE_URL}/account#notifications" style="color:#6E7681;text-decoration:underline;">Manage email preferences</a>
          &nbsp;&middot;&nbsp;
          <a href="${SITE_URL}/privacy" style="color:#6E7681;text-decoration:underline;">Privacy Policy</a>
        </p>`;

  const footerNoteHtml = footerNote
    ? `<p style="margin:12px 0 0;font-size:11px;color:#6E7681;line-height:1.5;">${footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0D1117;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">
  ${preheaderHtml}
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D1117;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding:0 24px 32px;" align="center">
          <img src="${SITE_URL}/images/logo-email.png" alt="Executive Angler" width="240" style="display:block;margin:0 auto;" />
        </td></tr>
        <tr><td style="background-color:#161B22;border-radius:12px;border:1px solid #21262D;padding:32px 28px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#F0F6FC;line-height:1.3;">
            ${heading}
          </h1>
          <div style="font-size:15px;line-height:1.7;color:#A8B2BD;">
            ${body}
          </div>
          ${ctaHtml}
        </td></tr>
        <tr><td style="padding:24px 24px 0;text-align:center;">
          ${footerNoteHtml}
          ${footerPrefs}
          <p style="margin:12px 0 0;font-size:11px;color:#6E7681;">
            &copy; ${new Date().getFullYear()} Executive Angler
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Numbered feature list — matches welcome email's "What you can do" block. */
export function buildFeatureList(
  items: Array<{ title: string; body: string }>
): string {
  const rows = items
    .map(
      (item, i) => `
    <tr>
      <td style="padding:8px 0;vertical-align:top;width:32px;">
        <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#E8923A;color:#ffffff;font-size:13px;font-weight:700;line-height:24px;text-align:center;">${i + 1}</span>
      </td>
      <td style="padding:8px 0 8px 12px;font-size:14px;color:#C9D1D9;line-height:1.5;">
        <strong style="color:#F0F6FC;">${item.title}</strong> &mdash; ${item.body}
      </td>
    </tr>`
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">${rows}</table>`;
}

/** Small section label (used above feature lists). */
export function buildSectionLabel(text: string): string {
  return `<p style="margin:8px 0 4px;font-size:13px;font-weight:600;color:#E8923A;text-transform:uppercase;letter-spacing:0.1em;">${text}</p>`;
}

/** Subtle horizontal divider line. */
export const DIVIDER_HTML = `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="border-top:1px solid #21262D;"></td></tr></table>`;
