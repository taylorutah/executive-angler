import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { escapeHtml } from "@/lib/html-escape";
import { allowRequest, clientKey, tooManyRequests } from "@/lib/api/rate-limit";

const NAME_MAX = 120;
const EMAIL_MAX = 254;
const SUBJECT_MAX = 80;
const MESSAGE_MAX = 8_000;
const BODY_MAX_BYTES = 20_000;
const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 10 * 60_000;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return true; // gracefully skip if not configured

  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (ip) body.set("remoteip", ip);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );

  const data = await res.json();
  return data.success === true;
}

function asField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  try {
    if (!allowRequest(clientKey(request, "contact"), CONTACT_LIMIT, CONTACT_WINDOW_MS)) {
      return tooManyRequests();
    }

    const rawLen = Number(request.headers.get("content-length") ?? 0);
    if (rawLen > BODY_MAX_BYTES) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    const body = await request.json();
    const name = asField(body.name);
    const email = asField(body.email);
    const subject = asField(body.subject);
    const message = asField(body.message);
    const token = asField(body.token);
    const honeypot = asField(body.website);

    // Bots that fill the hidden field get a fake success — no email sent.
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (
      name.length > NAME_MAX ||
      email.length > EMAIL_MAX ||
      subject.length > SUBJECT_MAX ||
      message.length > MESSAGE_MAX
    ) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    // Optional leftover token: verify when present. Contact does not paint
    // Turnstile, so most submissions have no token.
    if (process.env.TURNSTILE_SECRET_KEY && token) {
      const ip =
        request.headers.get("cf-connecting-ip") ??
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        null;
      const isHuman = await verifyTurnstile(token, ip);
      if (!isHuman) {
        return NextResponse.json(
          { error: "Verification failed. Please try again." },
          { status: 400 }
        );
      }
    }

    // Try Resend first
    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: "Executive Angler <noreply@executiveangler.com>",
        to: "hello@executiveangler.com",
        replyTo: email,
        subject: `Contact Form: ${escapeHtml(subject)}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1B4332; padding: 24px; text-align: center;">
              <h1 style="color: #FEFCE8; font-size: 24px; margin: 0;">Executive Angler</h1>
              <p style="color: #94A3B8; font-size: 14px; margin: 8px 0 0;">New Contact Form Message</p>
            </div>
            <div style="padding: 24px; background: #ffffff; border: 1px solid #E2E8F0;">
              <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 8px 0; color: #94A3B8; width: 100px;">From</td>
                  <td style="padding: 8px 0; color: #334155;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94A3B8;">Email</td>
                  <td style="padding: 8px 0; color: #334155;"><a href="mailto:${escapeHtml(email)}" style="color: #1B4332;">${escapeHtml(email)}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94A3B8;">Subject</td>
                  <td style="padding: 8px 0; color: #334155;">${escapeHtml(subject)}</td>
                </tr>
              </table>
              <div style="border-top: 1px solid #E2E8F0; padding-top: 16px;">
                <p style="color: #94A3B8; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.08em;">Message</p>
                <p style="color: #334155; line-height: 1.6; margin: 0; white-space: pre-wrap;">${escapeHtml(message)}
              </div>
            </div>
            <div style="padding: 12px 24px; background: #F8FAFC; text-align: center; border: 1px solid #E2E8F0; border-top: none;">
              <p style="color: #94A3B8; font-size: 12px; margin: 0;">Sent via executiveangler.com/contact</p>
            </div>
          </div>
        `,
      });
    } else {
      // Fallback to FormSubmit.co
      const data = new FormData();
      data.append("name", name);
      data.append("email", email);
      data.append("subject", subject);
      data.append("message", message);
      data.append("_captcha", "false");
      await fetch("https://formsubmit.co/ajax/hello@executiveangler.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
