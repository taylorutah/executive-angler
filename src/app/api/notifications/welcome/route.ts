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
          <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#8B949E;">
            You just joined the most dedicated community of fly anglers on the planet.
            Executive Angler helps you track every session, log every catch, and turn
            your time on the water into actionable insights.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#8B949E;">
            Here is what to do next:
          </p>

          <!-- Steps -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="padding:8px 0;vertical-align:top;width:32px;">
                <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#E8923A;color:#ffffff;font-size:13px;font-weight:700;line-height:24px;text-align:center;">1</span>
              </td>
              <td style="padding:8px 0 8px 12px;font-size:14px;color:#C9D1D9;line-height:1.5;">
                <strong style="color:#F0F6FC;">Download the iOS app</strong> and start your first fishing session with one tap.
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;vertical-align:top;width:32px;">
                <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#E8923A;color:#ffffff;font-size:13px;font-weight:700;line-height:24px;text-align:center;">2</span>
              </td>
              <td style="padding:8px 0 8px 12px;font-size:14px;color:#C9D1D9;line-height:1.5;">
                <strong style="color:#F0F6FC;">Explore destinations and rivers</strong> with our editorial guides and hatch charts.
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;vertical-align:top;width:32px;">
                <span style="display:inline-block;width:24px;height:24px;border-radius:50%;background-color:#E8923A;color:#ffffff;font-size:13px;font-weight:700;line-height:24px;text-align:center;">3</span>
              </td>
              <td style="padding:8px 0 8px 12px;font-size:14px;color:#C9D1D9;line-height:1.5;">
                <strong style="color:#F0F6FC;">Follow other anglers</strong> to see their sessions and learn from their patterns.
              </td>
            </tr>
          </table>

          <a href="${SITE_URL}/dashboard" style="display:inline-block;background-color:#E8923A;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:10px 24px;border-radius:8px;">
            Go to Your Dashboard
          </a>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 24px 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#484F58;line-height:1.5;">
            Tight lines,<br>
            <strong style="color:#8B949E;">The Executive Angler Team</strong>
          </p>
          <p style="margin:12px 0 0;font-size:11px;color:#484F58;">
            <a href="${SITE_URL}/account#notifications" style="color:#484F58;text-decoration:underline;">Manage email preferences</a>
            &nbsp;&middot;&nbsp;
            <a href="${SITE_URL}/privacy" style="color:#484F58;text-decoration:underline;">Privacy Policy</a>
          </p>
          <p style="margin:8px 0 0;font-size:11px;color:#484F58;">
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
