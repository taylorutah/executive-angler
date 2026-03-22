import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

/**
 * PATCH /api/admin/users — Admin user actions (grant/revoke pro, ban/unban)
 * POST /api/admin/users — Add internal note
 */

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { user_id, action, reason } = await request.json();
  if (!user_id || !action) {
    return NextResponse.json({ error: "user_id and action required" }, { status: 400 });
  }

  switch (action) {
    case "grant_premium": {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: true,
          premium_granted_by: user.email,
          premium_granted_at: new Date().toISOString(),
        })
        .eq("user_id", user_id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await logAudit(supabase, user, "grant_premium", user_id);
      return NextResponse.json({ message: "Pro access granted" });
    }

    case "revoke_premium": {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_premium: false,
          premium_granted_by: null,
          premium_granted_at: null,
        })
        .eq("user_id", user_id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await logAudit(supabase, user, "revoke_premium", user_id);
      return NextResponse.json({ message: "Pro access revoked" });
    }

    case "ban": {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: true,
          ban_reason: reason || "Violation of terms",
          banned_at: new Date().toISOString(),
          banned_by: user.email,
        })
        .eq("user_id", user_id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await logAudit(supabase, user, "ban", user_id, { reason });
      return NextResponse.json({ message: "User banned" });
    }

    case "unban": {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: false,
          ban_reason: null,
          banned_at: null,
          banned_by: null,
        })
        .eq("user_id", user_id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await logAudit(supabase, user, "unban", user_id);
      return NextResponse.json({ message: "User unbanned" });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { user_id, note } = await request.json();
  if (!user_id || !note) {
    return NextResponse.json({ error: "user_id and note required" }, { status: 400 });
  }

  const { error } = await supabase.from("admin_user_notes").insert({
    user_id,
    admin_email: user.email,
    note,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logAudit(supabase, user, "add_note", user_id, { note });
  return NextResponse.json({ success: true });
}

async function logAudit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  admin: { id: string; email?: string },
  action: string,
  targetUserId: string,
  details?: Record<string, unknown>
) {
  try {
    await supabase.from("admin_audit_log").insert({
      admin_user_id: admin.id,
      admin_email: admin.email || "",
      action,
      target_user_id: targetUserId,
      details: details || {},
    });
  } catch {
    console.error("[Admin] Failed to log audit:", action);
  }
}
