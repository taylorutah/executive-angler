import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin";
import { deleteUserCascade } from "@/lib/admin/delete-user";

function getAdminSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/admin/users/[userId] — Fetch full user detail
 * PATCH /api/admin/users/[userId] — Update user (grant Pro, ban, edit profile)
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Profile — use service role to read any user's profile
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Sessions
  const { data: sessions } = await admin
    .from("fishing_sessions")
    .select("id, date, river_name, total_fish, weather, water_temp_f, location, section, created_at, is_private")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(50);

  // Catches
  const { data: catches } = await admin
    .from("catches")
    .select("id, session_id, species, length_inches, fly_pattern_id, created_at")
    .eq("user_id", userId);

  // Fly patterns (v2 — owned patterns). Alias hero_image_url → image_url
  // so the response shape stays backward-compatible for the admin UI.
  const { data: fliesV2 } = await admin
    .from("fly_patterns_v2")
    .select("id, name, hero_image_url, created_at")
    .eq("owner_user_id", userId);
  const flies = (fliesV2 ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    image_url: f.hero_image_url,
    created_at: f.created_at,
  }));

  // Follow counts
  const { count: followers } = await admin
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("following_id", userId)
    .eq("status", "accepted");

  const { count: following } = await admin
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("follower_id", userId)
    .eq("status", "accepted");

  // Audit log for this user (table may not exist yet)
  let auditLog: unknown[] = [];
  try {
    const { data } = await admin
      .from("admin_audit_log")
      .select("*")
      .eq("target_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    auditLog = data || [];
  } catch {
    // Table doesn't exist yet — that's fine
  }

  return NextResponse.json({
    profile,
    sessions: sessions || [],
    catches: catches || [],
    flies: flies || [],
    followers: followers || 0,
    following: following || 0,
    auditLog,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const body = await request.json();
  const { action, ...data } = body;

  // Log every admin action (service role bypasses RLS on audit table)
  const logAction = async (actionType: string, details: Record<string, unknown>) => {
    await admin.from("admin_audit_log").insert({
      admin_user_id: user.id,
      admin_email: user.email,
      action: actionType,
      target_user_id: userId,
      details,
    });
  };

  switch (action) {
    case "grant_pro": {
      const { error } = await admin
        .from("profiles")
        .update({ is_premium: true, premium_granted_by: user.email, premium_granted_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logAction("grant_pro", { reason: data.reason || "Admin grant" });
      return NextResponse.json({ success: true, message: "Pro access granted" });
    }

    case "revoke_pro": {
      const { error } = await admin
        .from("profiles")
        .update({ is_premium: false, premium_granted_by: null, premium_granted_at: null })
        .eq("user_id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logAction("revoke_pro", { reason: data.reason || "Admin revoke" });
      return NextResponse.json({ success: true, message: "Pro access revoked" });
    }

    case "ban": {
      const { error } = await admin
        .from("profiles")
        .update({
          is_banned: true,
          ban_reason: data.reason || "Violation of terms",
          banned_at: new Date().toISOString(),
          banned_by: user.email,
        })
        .eq("user_id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logAction("ban_user", { reason: data.reason });
      return NextResponse.json({ success: true, message: "User banned" });
    }

    case "unban": {
      const { error } = await admin
        .from("profiles")
        .update({ is_banned: false, ban_reason: null, banned_at: null, banned_by: null })
        .eq("user_id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logAction("unban_user", {});
      return NextResponse.json({ success: true, message: "User unbanned" });
    }

    case "update_profile": {
      const allowedFields = ["display_name", "username", "bio"];
      const updates: Record<string, string> = {};
      allowedFields.forEach(f => { if (data[f] !== undefined) updates[f] = data[f]; });
      if (Object.keys(updates).length > 0) {
        const { error } = await admin.from("profiles").update(updates).eq("user_id", userId);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await logAction("update_profile", updates);
      }
      return NextResponse.json({ success: true, message: "Profile updated" });
    }

    case "add_note": {
      const { error } = await admin.from("admin_user_notes").insert({
        user_id: userId,
        admin_email: user.email,
        note: data.note,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logAction("add_note", { note: data.note });
      return NextResponse.json({ success: true, message: "Note added" });
    }

    case "kill_session": {
      const { error } = await admin
        .from("fishing_sessions")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", data.sessionId)
        .eq("user_id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await logAction("kill_session", { sessionId: data.sessionId });
      return NextResponse.json({ success: true, message: "Session ended" });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  if (userId === user.id) {
    return NextResponse.json(
      { error: "Use /api/account/delete to delete your own account" },
      { status: 400 }
    );
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Capture email + username before the cascade for the audit trail —
  // after auth.users is gone we can't look this up.
  let targetEmail: string | null = null;
  let targetUsername: string | null = null;
  try {
    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    targetEmail = authUser?.user?.email ?? null;
  } catch {}
  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("username, display_name")
      .eq("user_id", userId)
      .single();
    targetUsername = profile?.username ?? profile?.display_name ?? null;
  } catch {}

  const result = await deleteUserCascade(userId, admin);

  await admin.from("admin_audit_log").insert({
    admin_user_id: user.id,
    admin_email: user.email,
    action: "delete_user",
    target_user_id: userId,
    details: {
      target_email: targetEmail,
      target_username: targetUsername,
      auth_deleted: result.authDeleted,
      errors: result.errors,
    },
  });

  if (!result.authDeleted) {
    return NextResponse.json(
      {
        error: "Auth user deletion failed — data may be partially removed",
        errors: result.errors,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `User ${targetUsername || userId.slice(0, 8)} deleted`,
    errors: result.errors,
  });
}
