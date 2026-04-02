import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * POST /api/notifications/welcome
 *
 * Called by a Supabase webhook (on auth.users INSERT) or manually
 * after signup to send a branded welcome email.
 *
 * Body: { email: string, displayName?: string }
 *
 * Requires: RESEND_API_KEY env var
 * Secured by: WEBHOOK_SECRET header check (optional, for Supabase webhooks)
 */

const FROM_EMAIL = "Executive Angler <noreply@executiveangler.com>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://executiveangler.com";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

function buildWelcomeHtml(displayName?: string) {
  const greeting = displayName ? `Welcome, ${displayName}` : "Welcome to Executive Angler";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0D1117;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D1117;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Logo -->
        <tr><td style="padding:0 24px 32px;">
          <img src="${SITE_URL}/logo-email.png" alt="Executive Angler" width="180" style="display:block;" />
        </td></tr>
        <!-- Card -->
        <tr><td style="background-color:#161B22;border-radius:12px;border:1px solid #21262D;padding:32px 28px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#F0F6FC;line-height:1.3;">
            ${greeting}
          </h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#A8B2BD;">
            Your fishing just got smarter. Executive Angler is the intelligence platform
            built for serious fly anglers &mdash; log every session, build fly recipes,
            track live river conditions, and let your data reveal what actually works.
          </p>

          <!-- Divider -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr><td style="border-top:1px solid #21262D;"></td></tr>
          </table>

          <p style="margin:0 0 20px;font-size:13px;font-weight:600;color:#E8923A;text-transform:uppercase;letter-spacing:0.1em;">
            What you can do right now
          </p>

          <!-- Features -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="padding:8px 0;vertical-align:top;width:32px;">
                <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#E8923A;color:#ffffff;font-size:13px;font-weight:700;line-height:24px;text-align:center;">1</span>
              </td>
              <td style="padding:8px 0 8px 12px;font-size:14px;color:#C9D1D9;line-height:1.5;">
                <strong style="color:#F0F6FC;">Log your first session</strong> &mdash; GPS, weather, water conditions, and catch details are captured automatically. Every outing builds your personal fishing intelligence.
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;vertical-align:top;width:32px;">
                <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#E8923A;color:#ffffff;font-size:13px;font-weight:700;line-height:24px;text-align:center;">2</span>
              </td>
              <td style="padding:8px 0 8px 12px;font-size:14px;color:#C9D1D9;line-height:1.5;">
                <strong style="color:#F0F6FC;">Browse the fly library</strong> &mdash; 120+ patterns with structured recipes, 500+ tying materials, and a workbench to build and organize your own.
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;vertical-align:top;width:32px;">
                <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#E8923A;color:#ffffff;font-size:13px;font-weight:700;line-height:24px;text-align:center;">3</span>
              </td>
              <td style="padding:8px 0 8px 12px;font-size:14px;color:#C9D1D9;line-height:1.5;">
                <strong style="color:#F0F6FC;">Explore 138 rivers</strong> &mdash; live USGS flow data, hatch charts, access points, and conditions reports from the community.
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;vertical-align:top;width:32px;">
                <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#E8923A;color:#ffffff;font-size:13px;font-weight:700;line-height:24px;text-align:center;">4</span>
              </td>
              <td style="padding:8px 0 8px 12px;font-size:14px;color:#C9D1D9;line-height:1.5;">
                <strong style="color:#F0F6FC;">Discover lodges, guides, and fly shops</strong> &mdash; curated directory with Google Reviews across 31 destinations.
              </td>
            </tr>
          </table>

          <a href="${SITE_URL}/journal" style="display:inline-block;background-color:#E8923A;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">
            Start Your Journal
          </a>

          <!-- Pro teaser -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
            <tr><td style="border-top:1px solid #21262D;"></td></tr>
          </table>
          <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#6E7681;">
            <strong style="color:#A8B2BD;">Unlock Pro</strong> for AI-powered journal insights,
            personal catch overlays on flow charts, unlimited fly patterns, PDF recipe export,
            and full data export.
            <a href="${SITE_URL}/pricing" style="color:#E8923A;text-decoration:none;font-weight:600;">See plans &rarr;</a>
          </p>

          <!-- Mobile apps teaser -->
          <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#6E7681;">
            <span style="color:#0BA5C7;">&#9679;</span>&nbsp;
            <strong style="color:#A8B2BD;">iOS &amp; Android apps coming soon</strong> &mdash;
            log sessions on the water, sync to your account, and pick up where you left off on the web.
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 24px 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#6E7681;line-height:1.5;">
            Tight lines,<br>
            <strong style="color:#A8B2BD;">The Executive Angler Team</strong>
          </p>
          <p style="margin:12px 0 0;font-size:11px;color:#6E7681;">
            <a href="${SITE_URL}/account#notifications" style="color:#6E7681;text-decoration:underline;">Manage email preferences</a>
            &nbsp;&middot;&nbsp;
            <a href="${SITE_URL}/privacy" style="color:#6E7681;text-decoration:underline;">Privacy Policy</a>
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:#6E7681;">
            &copy; ${new Date().getFullYear()} Executive Angler
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    // Optional webhook secret check for Supabase webhooks
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = req.headers.get("x-webhook-secret") || req.headers.get("authorization");
      if (authHeader !== webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
        return NextResponse.json({ sent: false, reason: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();

    // Support Supabase webhook format (record.email) or direct call (email)
    const email: string | undefined =
      body.email || body.record?.email;
    const displayName: string | undefined =
      body.displayName || body.record?.raw_user_meta_data?.display_name;

    if (!email) {
      return NextResponse.json(
        { sent: false, reason: "Missing email" },
        { status: 400 }
      );
    }

    const resend = getResend();
    const html = buildWelcomeHtml(displayName);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to Executive Angler",
      html,
    });

    if (error) {
      console.error("[WELCOME EMAIL ERROR]", error);
      return NextResponse.json(
        { sent: false, reason: `Email send failed: ${error.message}` },
        { status: 502 }
      );
    }

    console.log(`[WELCOME EMAIL SENT] to=${email} name=${displayName || "—"} resendId=${data?.id}`);

    return NextResponse.json({
      sent: true,
      emailId: data?.id,
    });
  } catch (err) {
    console.error("[WELCOME EMAIL ERROR]", err);
    return NextResponse.json(
      { sent: false, reason: "Internal server error" },
      { status: 500 }
    );
  }
}
