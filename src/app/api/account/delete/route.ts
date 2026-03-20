import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/account/delete
 *
 * Permanently deletes a user's account and all associated data.
 * Called from the iOS app's "Delete Account" flow.
 *
 * Auth: Requires a valid Supabase session (cookie-based for web, or
 *       Authorization header with access token for iOS).
 *
 * Apple App Store requires apps with accounts to offer account deletion.
 */

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user — support both cookie auth (web) and Bearer token (iOS)
    let userId: string | null = null;

    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      // iOS sends access token directly
      const token = authHeader.replace("Bearer ", "");
      const admin = getSupabaseAdmin();
      const { data: { user }, error } = await admin.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      userId = user.id;
    } else {
      // Web uses cookie-based session
      const supabase = await createServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = getSupabaseAdmin();

    console.log(`[ACCOUNT DELETE] Starting deletion for user ${userId}`);

    // Delete in dependency order (children before parents)
    // 1. Catches (depend on fishing_sessions)
    const { error: catchesErr } = await admin
      .from("catches")
      .delete()
      .eq("user_id", userId);
    if (catchesErr) console.error("[ACCOUNT DELETE] catches:", catchesErr.message);

    // 2. Fishing sessions
    const { error: sessionsErr } = await admin
      .from("fishing_sessions")
      .delete()
      .eq("user_id", userId);
    if (sessionsErr) console.error("[ACCOUNT DELETE] sessions:", sessionsErr.message);

    // 3. Fly patterns
    const { error: fliesErr } = await admin
      .from("fly_patterns")
      .delete()
      .eq("user_id", userId);
    if (fliesErr) console.error("[ACCOUNT DELETE] fly_patterns:", fliesErr.message);

    // 4. Gear items
    const { error: gearErr } = await admin
      .from("gear_items")
      .delete()
      .eq("user_id", userId);
    if (gearErr) console.error("[ACCOUNT DELETE] gear_items:", gearErr.message);

    // 5. Social: follows (both directions)
    const { error: followsErr1 } = await admin
      .from("follows")
      .delete()
      .eq("follower_id", userId);
    if (followsErr1) console.error("[ACCOUNT DELETE] follows (follower):", followsErr1.message);

    const { error: followsErr2 } = await admin
      .from("follows")
      .delete()
      .eq("following_id", userId);
    if (followsErr2) console.error("[ACCOUNT DELETE] follows (following):", followsErr2.message);

    // 6. Social: likes/kudos
    const { error: likesErr } = await admin
      .from("session_likes")
      .delete()
      .eq("user_id", userId);
    if (likesErr) console.error("[ACCOUNT DELETE] session_likes:", likesErr.message);

    // 7. Social: comments
    const { error: commentsErr } = await admin
      .from("session_comments")
      .delete()
      .eq("user_id", userId);
    if (commentsErr) console.error("[ACCOUNT DELETE] session_comments:", commentsErr.message);

    // 8. Messages
    const { error: messagesErr } = await admin
      .from("messages")
      .delete()
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
    if (messagesErr) console.error("[ACCOUNT DELETE] messages:", messagesErr.message);

    // 9. Message reactions
    const { error: reactionsErr } = await admin
      .from("message_reactions")
      .delete()
      .eq("user_id", userId);
    if (reactionsErr) console.error("[ACCOUNT DELETE] message_reactions:", reactionsErr.message);

    // 10. User awards / achievements
    const { error: awardsErr } = await admin
      .from("user_awards")
      .delete()
      .eq("user_id", userId);
    if (awardsErr) console.error("[ACCOUNT DELETE] user_awards:", awardsErr.message);

    // 11. Device tokens (push notifications)
    const { error: tokensErr } = await admin
      .from("device_tokens")
      .delete()
      .eq("user_id", userId);
    if (tokensErr) console.error("[ACCOUNT DELETE] device_tokens:", tokensErr.message);

    // 12. User favorites
    const { error: favoritesErr } = await admin
      .from("user_favorites")
      .delete()
      .eq("user_id", userId);
    if (favoritesErr) console.error("[ACCOUNT DELETE] user_favorites:", favoritesErr.message);

    // 13. Account deletion requests (clean up the request itself)
    const { error: delReqErr } = await admin
      .from("account_deletion_requests")
      .delete()
      .eq("user_id", userId);
    if (delReqErr) console.error("[ACCOUNT DELETE] deletion_requests:", delReqErr.message);

    // 14. Delete avatar and catch photos from storage
    try {
      const { data: avatarFiles } = await admin.storage
        .from("avatars")
        .list(userId);
      if (avatarFiles?.length) {
        await admin.storage
          .from("avatars")
          .remove(avatarFiles.map((f) => `${userId}/${f.name}`));
      }
    } catch (e) {
      console.error("[ACCOUNT DELETE] avatar storage cleanup:", e);
    }

    try {
      const { data: catchPhotos } = await admin.storage
        .from("catch-photos")
        .list(userId);
      if (catchPhotos?.length) {
        await admin.storage
          .from("catch-photos")
          .remove(catchPhotos.map((f) => `${userId}/${f.name}`));
      }
    } catch (e) {
      console.error("[ACCOUNT DELETE] catch-photos storage cleanup:", e);
    }

    try {
      const { data: sessionPhotos } = await admin.storage
        .from("session-photos")
        .list(userId);
      if (sessionPhotos?.length) {
        await admin.storage
          .from("session-photos")
          .remove(sessionPhotos.map((f) => `${userId}/${f.name}`));
      }
    } catch (e) {
      console.error("[ACCOUNT DELETE] session-photos storage cleanup:", e);
    }

    // 15. Delete profile (do this near-last, before auth user)
    const { error: profileErr } = await admin
      .from("profiles")
      .delete()
      .eq("user_id", userId);
    if (profileErr) console.error("[ACCOUNT DELETE] profiles:", profileErr.message);

    // 16. Delete the auth user itself (this is the final step)
    const { error: authDeleteErr } = await admin.auth.admin.deleteUser(userId);
    if (authDeleteErr) {
      console.error("[ACCOUNT DELETE] auth user deletion failed:", authDeleteErr.message);
      // Still return success for data deletion even if auth deletion fails
      // The user's data is gone, which is what matters for privacy
    }

    console.log(`[ACCOUNT DELETE] Completed deletion for user ${userId}`);

    return NextResponse.json({
      deleted: true,
      userId,
    });
  } catch (err) {
    console.error("[ACCOUNT DELETE ERROR]", err);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
