import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { publishSubmission } from "@/lib/submissions/publish";

/**
 * GET /api/submissions/[id] — Fetch a single submission
 * PATCH /api/submissions/[id] — Update (user edits or admin actions)
 * DELETE /api/submissions/[id] — Delete a draft
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("community_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only owner or admin can see non-published submissions
  if (data.status !== "published" && data.user_id !== user.id && !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch status history
  const { data: history } = await supabase
    .from("submission_status_history")
    .select("*")
    .eq("submission_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ submission: data, history: history || [] });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action, ...updates } = body;

  // Fetch current submission
  const { data: current } = await supabase
    .from("community_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Admin actions
  if (action && isAdmin(user.email)) {
    return handleAdminAction(supabase, user, current, action, updates);
  }

  // User actions — can only edit own submissions in draft/needs_info/rejected status
  if (current.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const editableStatuses = ["draft", "needs_info", "rejected"];
  if (!editableStatuses.includes(current.status)) {
    return NextResponse.json({ error: "Cannot edit submission in current status" }, { status: 400 });
  }

  // Apply user updates
  const allowedFields = [
    "name", "description", "short_description",
    "latitude", "longitude", "state", "region", "country",
    "address", "website", "phone", "email",
    "entity_data", "hero_image_url", "additional_images",
  ];

  const updateData: Record<string, unknown> = {};
  allowedFields.forEach(f => { if (updates[f] !== undefined) updateData[f] = updates[f]; });

  // If user is resubmitting after rejection or needs_info
  if (updates.submit) {
    updateData.status = "submitted";
    updateData.submitted_at = new Date().toISOString();
    updateData.version = (current.version || 1) + 1;
  }

  const { error } = await supabase
    .from("community_submissions")
    .update(updateData)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log status change if resubmitting
  if (updates.submit) {
    await supabase.from("submission_status_history").insert({
      submission_id: id,
      old_status: current.status,
      new_status: "submitted",
      changed_by: user.id,
      changed_by_email: user.email,
      notes: "Resubmitted after revision",
    });

    // Notify admin
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Executive Angler <noreply@executiveangler.com>",
            to: [process.env.ADMIN_EMAIL || "taylor@executiveangler.com"],
            subject: `Resubmission: ${current.name} (${current.entity_type})`,
            html: `<p>${user.email} resubmitted their ${current.entity_type}: <strong>${current.name}</strong></p>
                   <p><a href="https://www.executiveangler.com/admin/submissions/${id}">Review →</a></p>`,
          }),
        });
      }
    } catch { /* ignore */ }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: current } = await supabase
    .from("community_submissions")
    .select("user_id, status")
    .eq("id", id)
    .single();

  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (current.user_id !== user.id && !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (current.status === "published") {
    return NextResponse.json({ error: "Cannot delete published submissions" }, { status: 400 });
  }

  await supabase.from("community_submissions").delete().eq("id", id);
  return NextResponse.json({ success: true });
}

// MARK: - Admin Actions

async function handleAdminAction(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  admin: { id: string; email?: string },
  submission: Record<string, unknown>,
  action: string,
  data: Record<string, unknown>
) {
  const id = submission.id as string;
  const oldStatus = submission.status as string;

  switch (action) {
    case "approve": {
      const slug = generateSlug(submission.name as string);
      const { error } = await supabase
        .from("community_submissions")
        .update({
          status: "approved",
          reviewer_id: admin.id,
          reviewed_at: new Date().toISOString(),
          slug,
          moderation_notes: data.notes || null,
        })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await logStatusChange(supabase, id, oldStatus, "approved", admin, "Approved by admin");
      await updateContributorStats(supabase, submission.user_id as string, "approve");
      await notifySubmitter(submission.user_id as string, submission.name as string, submission.entity_type as string, "approved", supabase);

      // Publish to the actual entity table
      const publishResult = await publishSubmission(submission);
      if (publishResult.error) {
        console.error("[Publish] Failed:", publishResult.error);
        return NextResponse.json({ success: true, slug, publishWarning: publishResult.error });
      }

      return NextResponse.json({ success: true, slug: publishResult.slug || slug });
    }

    case "reject": {
      const { error } = await supabase
        .from("community_submissions")
        .update({
          status: "rejected",
          reviewer_id: admin.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: data.reason || "Does not meet quality standards",
          moderation_notes: data.notes || null,
        })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await logStatusChange(supabase, id, oldStatus, "rejected", admin, data.reason as string);
      await updateContributorStats(supabase, submission.user_id as string, "reject");
      await notifySubmitter(submission.user_id as string, submission.name as string, submission.entity_type as string, "rejected", supabase, data.reason as string);

      return NextResponse.json({ success: true });
    }

    case "needs_info": {
      const { error } = await supabase
        .from("community_submissions")
        .update({
          status: "needs_info",
          reviewer_id: admin.id,
          admin_feedback: data.feedback || "Please provide more information",
        })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await logStatusChange(supabase, id, oldStatus, "needs_info", admin, data.feedback as string);
      await notifySubmitter(submission.user_id as string, submission.name as string, submission.entity_type as string, "needs_info", supabase, data.feedback as string);

      return NextResponse.json({ success: true });
    }

    case "start_review": {
      await supabase
        .from("community_submissions")
        .update({ status: "in_review", reviewer_id: admin.id })
        .eq("id", id);
      await logStatusChange(supabase, id, oldStatus, "in_review", admin, "Review started");
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function logStatusChange(
  supabase: unknown,
  submissionId: string,
  oldStatus: string,
  newStatus: string,
  admin: { id: string; email?: string },
  notes?: string
) {
  await (supabase as any).from("submission_status_history").insert({
    submission_id: submissionId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: admin.id,
    changed_by_email: admin.email,
    notes,
  });
}

async function updateContributorStats(supabase: unknown, userId: string, action: "approve" | "reject") {
  const { data: stats } = await (supabase as any)
    .from("contributor_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (stats) {
    const updates = action === "approve"
      ? { submissions_approved: (stats.submissions_approved || 0) + 1 }
      : { submissions_rejected: (stats.submissions_rejected || 0) + 1 };
    await (supabase as any).from("contributor_stats").update(updates).eq("user_id", userId);
  } else {
    const insert = {
      user_id: userId,
      submissions_total: 1,
      submissions_approved: action === "approve" ? 1 : 0,
      submissions_rejected: action === "reject" ? 1 : 0,
    };
    await (supabase as any).from("contributor_stats").insert(insert);
  }
}

async function notifySubmitter(
  userId: string,
  name: string,
  type: string,
  newStatus: string,
  supabase: unknown,
  detail?: string
) {
  // Get user email
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("display_name")
    .eq("user_id", userId)
    .single();

  // In-app notification (insert into notifications table if it exists)
  try {
    await (supabase as any).from("notifications").insert({
      user_id: userId,
      type: "submission_update",
      title: statusTitle(newStatus, name),
      body: statusBody(newStatus, name, type, detail),
      data: { entity_type: type, status: newStatus },
    });
  } catch { /* notifications table may not exist */ }

  // Email notification
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return;

    // Get email from auth.users (need service role for this — skip for now, use profile email if available)
  } catch { /* ignore */ }
}

function statusTitle(status: string, name: string): string {
  switch (status) {
    case "approved": return `${name} has been approved!`;
    case "rejected": return `${name} was not approved`;
    case "needs_info": return `More info needed for ${name}`;
    default: return `Update on ${name}`;
  }
}

function statusBody(status: string, name: string, type: string, detail?: string): string {
  switch (status) {
    case "approved": return `Your ${type} submission "${name}" has been approved and will be published on Executive Angler. Thank you for contributing!`;
    case "rejected": return `Your ${type} submission "${name}" was not approved. ${detail || "Please review the feedback and try again."}`;
    case "needs_info": return `We need more information about your ${type} submission "${name}". ${detail || "Please check the admin feedback."}`;
    default: return `Your ${type} submission "${name}" has been updated.`;
  }
}
