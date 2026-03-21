import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

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

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Sessions
  const { data: sessions } = await supabase
    .from("fishing_sessions")
    .select("id, date, river_name, total_fish, weather, water_temp_f, location, section, created_at, is_private")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(50);

  // Catches
  const { data: catches } = await supabase
    .from("catches")
    .select("id, session_id, species, length_inches, fly_pattern_id, created_at")
    .eq("user_id", userId);

  // Fly patterns
  const { data: flies } = await supabase
    .from("fly_patterns")
    .select("id, name, image_url, created_at")
    .eq("user_id", userId);

  // Follow counts
  const { count: followers } = await supabase
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("following_id", userId)
    .eq("status", "accepted");

  const { count: following } = await supabase
    .from("follows")
    .select("id", { count: "exact", head: true })
    .eq("follower_id", userId)
    .eq("status", "accepted");

  // Audit log for this user (table may not exist yet)
  let auditLog: unknown[] = [];
  try {
    const { data } = await supabase
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

  const body = await request.json();
  const { action, ...data } = body;

  // Log every admin action
  const logAction = async (actionType: string, details: Record<string, unknown>) => {
    await supabase.from("admin_audit_log").insert({
      admin_user_id: user.id,
      admin_email: user.email,
      action: actionType,
      target_user_id: userId,
      details,
    });
  };

  switch (action) {
    case "grant_pro": {
      await supabase
        .from("profiles")
        .update({ is_premium: true, premium_granted_by: user.email, premium_granted_at: new Date().toISOString() })
        .eq("user_id", userId);
      await logAction("grant_pro", { reason: data.reason || "Admin grant" });
      return NextResponse.json({ success: true, message: "Pro access granted" });
    }

    case "revoke_pro": {
      await supabase
        .from("profiles")
        .update({ is_premium: false, premium_granted_by: null, premium_granted_at: null })
        .eq("user_id", userId);
      await logAction("revoke_pro", { reason: data.reason || "Admin revoke" });
      return NextResponse.json({ success: true, message: "Pro access revoked" });
    }

    case "ban": {
      await supabase
        .from("profiles")
        .update({
          is_banned: true,
          ban_reason: data.reason || "Violation of terms",
          banned_at: new Date().toISOString(),
          banned_by: user.email,
        })
        .eq("user_id", userId);
      await logAction("ban_user", { reason: data.reason });
      return NextResponse.json({ success: true, message: "User banned" });
    }

    case "unban": {
      await supabase
        .from("profiles")
        .update({ is_banned: false, ban_reason: null, banned_at: null, banned_by: null })
        .eq("user_id", userId);
      await logAction("unban_user", {});
      return NextResponse.json({ success: true, message: "User unbanned" });
    }

    case "update_profile": {
      const allowedFields = ["display_name", "username", "bio"];
      const updates: Record<string, string> = {};
      allowedFields.forEach(f => { if (data[f] !== undefined) updates[f] = data[f]; });
      if (Object.keys(updates).length > 0) {
        await supabase.from("profiles").update(updates).eq("user_id", userId);
        await logAction("update_profile", updates);
      }
      return NextResponse.json({ success: true, message: "Profile updated" });
    }

    case "add_note": {
      await supabase.from("admin_user_notes").insert({
        user_id: userId,
        admin_email: user.email,
        note: data.note,
      });
      await logAction("add_note", { note: data.note });
      return NextResponse.json({ success: true, message: "Note added" });
    }

    case "kill_session": {
      await supabase
        .from("fishing_sessions")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", data.sessionId)
        .eq("user_id", userId);
      await logAction("kill_session", { sessionId: data.sessionId });
      return NextResponse.json({ success: true, message: "Session ended" });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
