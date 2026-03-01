import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import crypto from "crypto";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function verifyToken(
  photoId: string,
  action: string,
  token: string
): boolean {
  const secret =
    process.env.PHOTO_REVIEW_SECRET ||
    "executive-angler-photo-review-secret";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${photoId}:${action}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

function htmlPage(title: string, message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — Executive Angler</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      background: #FEFCE8;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: white;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 48px;
      max-width: 480px;
      text-align: center;
    }
    .icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 32px;
    }
    .icon.success { background: #DCFCE7; }
    .icon.error { background: #FEE2E2; }
    h1 {
      font-size: 24px;
      color: #0F2B1F;
      margin-bottom: 12px;
    }
    p {
      color: #475569;
      font-size: 16px;
      line-height: 1.6;
    }
    .link {
      display: inline-block;
      margin-top: 24px;
      padding: 12px 24px;
      background: #1B4332;
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 14px;
    }
    .link:hover { background: #2D6A4F; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon ${success ? "success" : "error"}">
      ${success ? "&#10003;" : "&#10007;"}
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/admin/photos" class="link">Go to Admin Dashboard</a>
  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const action = searchParams.get("action");
    const token = searchParams.get("token");

    // Validate params
    if (!id || !action || !token) {
      return new NextResponse(
        htmlPage(
          "Invalid Request",
          "Missing required parameters. Please use the link from your email.",
          false
        ),
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return new NextResponse(
        htmlPage(
          "Invalid Action",
          "The action must be 'approve' or 'reject'.",
          false
        ),
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    // Verify HMAC token
    try {
      const valid = verifyToken(id, action, token);
      if (!valid) {
        return new NextResponse(
          htmlPage(
            "Invalid Token",
            "The verification token is invalid or has expired. Please use the admin dashboard instead.",
            false
          ),
          { status: 403, headers: { "Content-Type": "text/html" } }
        );
      }
    } catch {
      return new NextResponse(
        htmlPage(
          "Invalid Token",
          "The verification token is invalid. Please use the admin dashboard instead.",
          false
        ),
        { status: 403, headers: { "Content-Type": "text/html" } }
      );
    }

    // Update the photo submission
    const supabase = await createClient();
    const newStatus = action === "approve" ? "approved" : "rejected";

    const updateData: Record<string, string> = {
      status: newStatus,
    };
    if (action === "approve") {
      updateData.approved_at = new Date().toISOString();
    }

    const { data: submission, error: updateError } = await supabase
      .from("photo_submissions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return new NextResponse(
        htmlPage(
          "Update Failed",
          "Could not update the photo submission. It may have already been reviewed or deleted.",
          false
        ),
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }

    // If approved, send thank-you email to submitter
    if (
      action === "approve" &&
      submission.submitter_email &&
      process.env.RESEND_API_KEY
    ) {
      const resend = getResend();
      try {
        await resend?.emails.send({
          from: "Executive Angler <noreply@executiveangler.com>",
          to: submission.submitter_email,
          subject: "Your photo has been approved!",
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1B4332; padding: 24px; text-align: center;">
                <h1 style="color: #FEFCE8; font-size: 24px; margin: 0;">Executive Angler</h1>
              </div>
              <div style="padding: 24px; background: #ffffff; border: 1px solid #E2E8F0;">
                <p style="color: #334155; font-size: 16px; line-height: 1.6;">
                  Hi ${submission.submitter_name || "there"},
                </p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-top: 12px;">
                  Great news! Your photo submission has been approved and is now live on Executive Angler.
                  Thank you for sharing your fishing moment with our community.
                </p>
                ${submission.photo_url ? `
                <div style="text-align: center; margin: 20px 0;">
                  <img src="${submission.photo_url}" alt="Your approved photo" style="max-width: 100%; max-height: 300px; border-radius: 8px;" />
                </div>
                ` : ""}
                <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 16px;">
                  Tight lines,<br/>
                  The Executive Angler Team
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send thank-you email:", emailError);
      }
    }

    // Return HTML response
    if (action === "approve") {
      return new NextResponse(
        htmlPage(
          "Photo Approved!",
          "The photo has been approved and is now visible on the site. A thank-you email has been sent to the photographer.",
          true
        ),
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    } else {
      return new NextResponse(
        htmlPage(
          "Photo Rejected",
          "The photo submission has been rejected. It will not be displayed on the site.",
          true
        ),
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    }
  } catch (err) {
    console.error("Photo review error:", err);
    return new NextResponse(
      htmlPage(
        "Error",
        "An unexpected error occurred. Please try again or use the admin dashboard.",
        false
      ),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
