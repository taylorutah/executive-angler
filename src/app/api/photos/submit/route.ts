import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function generateToken(photoId: string, action: string): string {
  const secret = process.env.PHOTO_REVIEW_SECRET;
  if (!secret) {
    throw new Error("PHOTO_REVIEW_SECRET environment variable is not set");
  }
  return crypto
    .createHmac("sha256", secret)
    .update(`${photoId}:${action}`)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      photoUrl,
      entityType,
      entityId,
      entityName,
      caption,
      cameraBody,
      lens,
      aperture,
      shutterSpeed,
      iso,
    } = body;

    // Validate required fields
    if (!photoUrl || !entityType || !entityId) {
      return NextResponse.json(
        { error: "Missing required fields: photoUrl, entityType, entityId" },
        { status: 400 }
      );
    }

    // Validate entity type
    const validTypes = [
      "destination",
      "river",
      "lodge",
      "guide",
      "fly-shop",
      "species",
    ];
    if (!validTypes.includes(entityType)) {
      return NextResponse.json(
        { error: "Invalid entity type" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Insert photo submission record using service role to bypass RLS
    const serviceClient = createServiceClient(supabaseUrl, supabaseServiceKey);
    const { data: submission, error: insertError } = await serviceClient
      .from("photo_submissions")
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        user_id: user.id,
        submitter_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonymous",
        submitter_email: user.email,
        photo_url: photoUrl,
        caption: caption || null,
        camera_body: cameraBody || null,
        lens: lens || null,
        aperture: aperture || null,
        shutter_speed: shutterSpeed || null,
        iso: iso || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      );
    }

    // Send admin notification email
    const adminEmail = process.env.ADMIN_EMAIL;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://executiveangler.com";

    if (adminEmail && process.env.RESEND_API_KEY) {
      const approveToken = generateToken(submission.id, "approve");
      const rejectToken = generateToken(submission.id, "reject");

      const approveUrl = `${siteUrl}/api/photos/review?id=${submission.id}&action=approve&token=${approveToken}`;
      const rejectUrl = `${siteUrl}/api/photos/review?id=${submission.id}&action=reject&token=${rejectToken}`;

      try {
        const resend = getResend();
        await resend?.emails.send({
          from: "Executive Angler <noreply@executiveangler.com>",
          to: adminEmail,
          subject: `New Photo Submission — ${entityName || entityType}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1B4332; padding: 24px; text-align: center;">
                <h1 style="color: #FEFCE8; font-size: 24px; margin: 0;">Executive Angler</h1>
                <p style="color: #94A3B8; font-size: 14px; margin: 8px 0 0;">New Photo Submission</p>
              </div>

              <div style="padding: 24px; background: #ffffff; border: 1px solid #E2E8F0;">
                <p style="color: #475569; font-size: 14px; margin: 0 0 16px;">
                  A new photo has been submitted for review.
                </p>

                <div style="text-align: center; margin: 16px 0;">
                  <img
                    src="${photoUrl}"
                    alt="Submitted photo"
                    style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 1px solid #E2E8F0;"
                  />
                </div>

                <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 16px 0;">
                  <tr>
                    <td style="padding: 8px 0; color: #94A3B8; width: 120px;">Submitter</td>
                    <td style="padding: 8px 0; color: #334155;">${user.user_metadata?.full_name || "N/A"} (${user.email})</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #94A3B8;">Entity</td>
                    <td style="padding: 8px 0; color: #334155;">${entityName || entityId} (${entityType})</td>
                  </tr>
                  ${caption ? `<tr><td style="padding: 8px 0; color: #94A3B8;">Caption</td><td style="padding: 8px 0; color: #334155;">${caption}</td></tr>` : ""}
                  ${cameraBody ? `<tr><td style="padding: 8px 0; color: #94A3B8;">Camera</td><td style="padding: 8px 0; color: #334155;">${cameraBody}</td></tr>` : ""}
                  ${lens ? `<tr><td style="padding: 8px 0; color: #94A3B8;">Lens</td><td style="padding: 8px 0; color: #334155;">${lens}</td></tr>` : ""}
                  ${aperture || shutterSpeed || iso ? `<tr><td style="padding: 8px 0; color: #94A3B8;">Settings</td><td style="padding: 8px 0; color: #334155;">${[aperture, shutterSpeed, iso ? `ISO ${iso}` : ""].filter(Boolean).join(" · ")}</td></tr>` : ""}
                </table>

                <div style="margin: 24px 0; text-align: center;">
                  <a href="${approveUrl}"
                     style="display: inline-block; padding: 12px 32px; background: #1B4332; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 12px;">
                    Approve
                  </a>
                  <a href="${rejectUrl}"
                     style="display: inline-block; padding: 12px 32px; background: #DC2626; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Reject
                  </a>
                </div>

                <p style="color: #94A3B8; font-size: 12px; text-align: center; margin: 16px 0 0;">
                  You can also manage photos from the
                  <a href="${siteUrl}/admin/photos" style="color: #1B4332;">admin dashboard</a>.
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        // Log but don't fail the submission if email fails
        console.error("Failed to send admin notification:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      id: submission.id,
    });
  } catch (err) {
    console.error("Photo submission error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
