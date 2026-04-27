import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildBrandedEmail } from "@/lib/email/templates";
import { buildWelcome } from "@/lib/email/senders";

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

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
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
    const content = buildWelcome({ displayName });
    const html = buildBrandedEmail(content);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: content.subject,
      html,
      ...(content.replyTo ? { replyTo: content.replyTo } : {}),
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
