import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

/* ── Singletons ── */

let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

/* ── Constants ── */

const FROM_EMAIL = "Executive Angler <noreply@executiveangler.com>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://executiveangler.com";

const NOTIFICATION_COLUMN_MAP: Record<string, string> = {
  follow: "email_notify_follows",
  comment: "email_notify_comments",
  like: "email_notify_likes",
};

/* ── Email Templates ── */

function buildEmailHtml({
  heading,
  body,
  ctaLabel,
  ctaUrl,
}: {
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
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
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#F0F6FC;line-height:1.3;">
            ${heading}
          </h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#A8B2BD;">
            ${body}
          </p>
          ${ctaLabel && ctaUrl ? `
          <a href="${ctaUrl}" style="display:inline-block;background-color:#E8923A;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:10px 24px;border-radius:8px;">
            ${ctaLabel}
          </a>` : ""}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 24px 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:#6E7681;line-height:1.5;">
            You received this because of your notification settings.
            <a href="${SITE_URL}/account#notifications" style="color:#6E7681;text-decoration:underline;">Manage preferences</a>
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

function getNotificationContent(
  type: string,
  actorName: string,
  sessionId?: string
): { subject: string; heading: string; body: string; ctaLabel?: string; ctaUrl?: string } {
  switch (type) {
    case "follow":
      return {
        subject: `${actorName} started following you`,
        heading: "New Follower",
        body: `<strong style="color:#F0F6FC;">${actorName}</strong> is now following you on Executive Angler. Check out their profile and recent sessions.`,
        ctaLabel: "View Profile",
        ctaUrl: `${SITE_URL}/feed`,
      };
    case "comment":
      return {
        subject: `${actorName} commented on your session`,
        heading: "New Comment",
        body: `<strong style="color:#F0F6FC;">${actorName}</strong> left a comment on your fishing session.`,
        ctaLabel: "View Comment",
        ctaUrl: sessionId ? `${SITE_URL}/feed` : `${SITE_URL}/feed`,
      };
    case "like":
      return {
        subject: `${actorName} gave kudos on your session`,
        heading: "New Kudos",
        body: `<strong style="color:#F0F6FC;">${actorName}</strong> gave kudos on your fishing session. Nice work on the water!`,
        ctaLabel: "View Session",
        ctaUrl: sessionId ? `${SITE_URL}/feed` : `${SITE_URL}/feed`,
      };
    default:
      return {
        subject: "New notification from Executive Angler",
        heading: "New Activity",
        body: `You have new activity on Executive Angler.`,
        ctaLabel: "Open App",
        ctaUrl: SITE_URL,
      };
  }
}

/* ── Route Handler ── */

export async function POST(req: NextRequest) {
  try {
    // Auth: require webhook secret OR authenticated user
    const authHeader = req.headers.get("x-webhook-secret");
    const webhookSecret = process.env.WEBHOOK_SECRET || process.env.PHOTO_REVIEW_SECRET;
    const isWebhook = authHeader && webhookSecret && authHeader === webhookSecret;

    if (!isWebhook) {
      // Fallback: check if request is from an authenticated Supabase user
      const { createClient: createServerClient } = await import("@/lib/supabase/server");
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ sent: false, reason: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const { type, recipientId, actorId, sessionId } = body as {
      type: "follow" | "comment" | "like";
      recipientId: string;
      actorId: string;
      sessionId?: string;
    };

    if (!type || !recipientId || !actorId) {
      return NextResponse.json(
        { sent: false, reason: "Missing required fields: type, recipientId, actorId" },
        { status: 400 }
      );
    }

    const column = NOTIFICATION_COLUMN_MAP[type];
    if (!column) {
      return NextResponse.json(
        { sent: false, reason: `Unknown notification type: ${type}` },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch recipient profile + email
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("user_id, display_name, email_notify_follows, email_notify_comments, email_notify_likes")
      .eq("user_id", recipientId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { sent: false, reason: "Recipient profile not found" },
        { status: 404 }
      );
    }

    // Check notification preference
    const prefMap = {
      follow: profile.email_notify_follows,
      comment: profile.email_notify_comments,
      like: profile.email_notify_likes,
    } as Record<string, boolean | null>;

    const isEnabled = prefMap[type] ?? true;

    if (!isEnabled) {
      return NextResponse.json({
        sent: false,
        reason: `User has ${type} email notifications disabled`,
      });
    }

    // Get recipient email from auth.users
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(recipientId);
    const recipientEmail = authUser?.user?.email;

    if (!recipientEmail) {
      return NextResponse.json(
        { sent: false, reason: "Recipient has no email address" },
        { status: 404 }
      );
    }

    // Fetch actor display name
    const { data: actor } = await supabaseAdmin
      .from("profiles")
      .select("display_name, username")
      .eq("user_id", actorId)
      .single();

    const actorName = actor?.display_name || actor?.username || "Someone";

    // Build and send email via Resend
    const content = getNotificationContent(type, actorName, sessionId);
    const html = buildEmailHtml(content);

    const resend = getResend();
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: content.subject,
      html,
    });

    if (emailError) {
      console.error("[EMAIL SEND ERROR]", emailError);
      return NextResponse.json(
        { sent: false, reason: `Email send failed: ${emailError.message}` },
        { status: 502 }
      );
    }

    console.log(
      `[EMAIL SENT] type=${type} to=${recipientEmail} (${profile.display_name}) from=${actorName} resendId=${emailResult?.id}`
    );

    // Also send push notification (fire-and-forget — don't block email response)
    const pushTitle = content.subject;
    const pushBody = type === "follow"
      ? `${actorName} started following you`
      : type === "comment"
      ? `${actorName} commented on your session`
      : `${actorName} gave kudos on your session`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://executiveangler.com";
    fetch(`${siteUrl}/api/notifications/push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WEBHOOK_SECRET
          ? { "x-webhook-secret": process.env.WEBHOOK_SECRET }
          : {}),
      },
      body: JSON.stringify({
        recipientId,
        title: pushTitle,
        body: pushBody,
        data: { type, actorId, sessionId },
      }),
    }).catch((err) => console.error("[PUSH FIRE-AND-FORGET ERROR]", err));

    return NextResponse.json({
      sent: true,
      reason: `${type} notification sent to ${profile.display_name}`,
      emailId: emailResult?.id,
    });
  } catch (err) {
    console.error("[EMAIL NOTIFICATION ERROR]", err);
    return NextResponse.json(
      { sent: false, reason: "Internal server error" },
      { status: 500 }
    );
  }
}
