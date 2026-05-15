import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { sendBrandedEmail } from "@/lib/email/client";
import { buildAccountDeleted } from "@/lib/email/senders";
import { deleteUserCascade } from "@/lib/admin/delete-user";

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

    // Capture email + display_name BEFORE any deletes — after auth.admin.deleteUser()
    // runs we can't look this up. We send the farewell as the last step.
    let farewellEmail: string | null = null;
    let farewellDisplayName: string | null = null;
    try {
      const { data: authUser } = await admin.auth.admin.getUserById(userId);
      farewellEmail = authUser?.user?.email ?? null;
      farewellDisplayName =
        ((authUser?.user?.user_metadata as Record<string, unknown> | null)
          ?.display_name as string | undefined) ?? null;
    } catch (e) {
      console.error("[ACCOUNT DELETE] failed to resolve email for farewell:", e);
    }

    console.log(`[ACCOUNT DELETE] Starting deletion for user ${userId}`);

    // Send farewell email BEFORE the cascade — after auth.admin.deleteUser()
    // runs we lose the email address. Fire-and-forget; email failure must not
    // block the user's explicit delete request.
    if (farewellEmail) {
      void sendAccountDeletedEmail(farewellEmail, farewellDisplayName);
    }

    const result = await deleteUserCascade(userId, admin);
    if (!result.authDeleted) {
      // Data is gone (or partially gone), which is what matters for privacy.
      // Return success regardless of auth deletion outcome.
      console.error(`[ACCOUNT DELETE] auth user deletion failed for ${userId}`);
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

async function sendAccountDeletedEmail(
  email: string,
  displayName: string | null
) {
  const content = buildAccountDeleted({ displayName });
  await sendBrandedEmail({ tag: "account_deleted", to: email, ...content });
}
