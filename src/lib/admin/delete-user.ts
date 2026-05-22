import type { SupabaseClient } from "@supabase/supabase-js";

export interface DeleteUserResult {
  ok: boolean;
  errors: string[];
  authDeleted: boolean;
}

/**
 * Cascade-delete a user and every piece of data they own.
 *
 * Used by both:
 *   - /api/account/delete   (user-initiated self-delete; required by App Store)
 *   - /api/admin/users/[userId] DELETE  (admin removal)
 *
 * Strategy: delete children explicitly before parents. Many tables already
 * have ON DELETE CASCADE to auth.users, but some (storage objects, messages
 * with `or` clauses, deletion_requests) need manual cleanup, and explicit
 * ordering protects against any FK gaps.
 *
 * Per-table failures are logged but NON-fatal — partial cleanup is better
 * than aborting halfway. The final `auth.admin.deleteUser()` call is the
 * only hard step; if it fails the caller gets `authDeleted: false`.
 */
export async function deleteUserCascade(
  userId: string,
  admin: SupabaseClient
): Promise<DeleteUserResult> {
  const errors: string[] = [];
  const log = (where: string, err: { message?: string } | null) => {
    if (err?.message) {
      const msg = `${where}: ${err.message}`;
      console.error(`[DELETE USER ${userId}] ${msg}`);
      errors.push(msg);
    }
  };

  // 1. Catches (depend on fishing_sessions)
  {
    const { error } = await admin.from("catches").delete().eq("user_id", userId);
    log("catches", error);
  }

  // 2. Fishing sessions
  {
    const { error } = await admin.from("fishing_sessions").delete().eq("user_id", userId);
    log("fishing_sessions", error);
  }

  // 3. Fly patterns v2 (cascades to fly_variants / in_box / stock)
  {
    const { error } = await admin.from("flies").delete().eq("owner_user_id", userId);
    log("fly_patterns_v2", error);
  }

  // 4. Gear items
  {
    const { error } = await admin.from("gear_items").delete().eq("user_id", userId);
    log("gear_items", error);
  }

  // 5. Follows (both directions)
  {
    const { error } = await admin.from("follows").delete().eq("follower_id", userId);
    log("follows.follower", error);
  }
  {
    const { error } = await admin.from("follows").delete().eq("following_id", userId);
    log("follows.following", error);
  }

  // 6. Session likes / kudos
  {
    const { error } = await admin.from("session_likes").delete().eq("user_id", userId);
    log("session_likes", error);
  }

  // 7. Session comments
  {
    const { error } = await admin.from("session_comments").delete().eq("user_id", userId);
    log("session_comments", error);
  }

  // 8. Messages (sent or received)
  {
    const { error } = await admin
      .from("messages")
      .delete()
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
    log("messages", error);
  }

  // 9. Message reactions
  {
    const { error } = await admin.from("message_reactions").delete().eq("user_id", userId);
    log("message_reactions", error);
  }

  // 10. User awards
  {
    const { error } = await admin.from("user_awards").delete().eq("user_id", userId);
    log("user_awards", error);
  }

  // 11. Device tokens (push notifications)
  {
    const { error } = await admin.from("device_tokens").delete().eq("user_id", userId);
    log("device_tokens", error);
  }

  // 12. User favorites
  {
    const { error } = await admin.from("user_favorites").delete().eq("user_id", userId);
    log("user_favorites", error);
  }

  // 13. Account deletion requests (clean up the request itself, if any)
  {
    const { error } = await admin
      .from("account_deletion_requests")
      .delete()
      .eq("user_id", userId);
    log("account_deletion_requests", error);
  }

  // 14. Storage objects — avatars, catch photos, session photos
  for (const bucket of ["avatars", "catch-photos", "session-photos"] as const) {
    try {
      const { data: files } = await admin.storage.from(bucket).list(userId);
      if (files?.length) {
        const { error } = await admin.storage
          .from(bucket)
          .remove(files.map((f) => `${userId}/${f.name}`));
        if (error) log(`storage.${bucket}`, error);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[DELETE USER ${userId}] storage.${bucket}:`, msg);
      errors.push(`storage.${bucket}: ${msg}`);
    }
  }

  // 15. Profile (just before auth user)
  {
    const { error } = await admin.from("profiles").delete().eq("user_id", userId);
    log("profiles", error);
  }

  // 16. The auth user itself — final hard step
  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) {
    log("auth.users", authError);
    return { ok: false, errors, authDeleted: false };
  }

  return { ok: true, errors, authDeleted: true };
}
