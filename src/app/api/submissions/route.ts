import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

/**
 * GET /api/submissions — List user's own submissions (or all for admin)
 * POST /api/submissions — Create a new submission
 */

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const admin = searchParams.get("admin") === "true" && isAdmin(user.email);

  let query = supabase
    .from("community_submissions")
    .select("id, entity_type, status, name, short_description, hero_image_url, source, created_at, submitted_at, updated_at, rejection_reason, admin_feedback")
    .order("updated_at", { ascending: false });

  if (!admin) {
    query = query.eq("user_id", user.id);
  }
  if (status) query = query.eq("status", status);
  if (type) query = query.eq("entity_type", type);

  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ submissions: data || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    entity_type, name, description, short_description,
    latitude, longitude, state, region, country,
    address, website, phone, email: contactEmail,
    entity_data, hero_image_url, additional_images,
    source, source_session_id, source_fly_pattern_id, submit,
  } = body;

  if (!entity_type || !name) {
    return NextResponse.json({ error: "entity_type and name are required" }, { status: 400 });
  }

  const status = submit ? "submitted" : "draft";

  const { data, error } = await supabase
    .from("community_submissions")
    .insert({
      user_id: user.id,
      entity_type,
      status,
      name,
      description,
      short_description,
      latitude,
      longitude,
      state,
      region,
      country: country || "US",
      address,
      website,
      phone,
      email: contactEmail,
      entity_data: {
        ...(entity_data || {}),
        ...(source_fly_pattern_id ? { source_fly_pattern_id } : {}),
      },
      hero_image_url,
      additional_images: additional_images || [],
      source: source || "manual",
      source_session_id,
      submitted_at: submit ? new Date().toISOString() : null,
    })
    .select("id, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log status change
  await supabase.from("submission_status_history").insert({
    submission_id: data.id,
    new_status: status,
    changed_by: user.id,
    changed_by_email: user.email,
    notes: submit ? "User submitted for review" : "Draft created",
  });

  // Initialize contributor stats if needed
  await supabase.from("contributor_stats").upsert(
    { user_id: user.id, submissions_total: 1 },
    { onConflict: "user_id" }
  );

  // If submitted, send notification email to admin
  if (submit) {
    await sendAdminNotification(name, entity_type, user.email || "unknown");
  }

  return NextResponse.json({ id: data.id, status: data.status });
}

async function sendAdminNotification(name: string, type: string, submitterEmail: string) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Executive Angler <noreply@executiveangler.com>",
        to: [process.env.ADMIN_EMAIL || "taylor@executiveangler.com"],
        subject: `New ${type} submission: ${name}`,
        html: `
          <h2>New Community Submission</h2>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Submitted by:</strong> ${submitterEmail}</p>
          <p><a href="https://www.executiveangler.com/admin/submissions">Review in Admin Panel →</a></p>
        `,
      }),
    });
  } catch (e) {
    console.error("[Submissions] Failed to send admin notification:", e);
  }
}
