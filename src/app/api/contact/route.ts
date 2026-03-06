import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) return true; // gracefully skip if not configured

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: secretKey, response: token }),
  });

  const data = await res.json();
  // success=true and score >= 0.5 means likely human
  return data.success === true && (data.score ?? 1) >= 0.5;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, token } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token
    if (token) {
      const isHuman = await verifyRecaptcha(token);
      if (!isHuman) {
        return NextResponse.json(
          { error: "reCAPTCHA verification failed. Please try again." },
          { status: 400 }
        );
      }
    }

    // Try Resend first
    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: "Executive Angler <noreply@executiveangler.com>",
        to: "taylor.warnick@gmail.com",
        replyTo: email,
        subject: `Contact Form: ${subject}`,
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
                  <td style="padding: 8px 0; color: #334155;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94A3B8;">Email</td>
                  <td style="padding: 8px 0; color: #334155;"><a href="mailto:${email}" style="color: #1B4332;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #94A3B8;">Subject</td>
                  <td style="padding: 8px 0; color: #334155;">${subject}</td>
                </tr>
              </table>
              <div style="border-top: 1px solid #E2E8F0; padding-top: 16px;">
                <p style="color: #94A3B8; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.08em;">Message</p>
                <p style="color: #334155; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
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
      await fetch("https://formsubmit.co/ajax/taylor.warnick@gmail.com", {
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
