import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

/**
 * POST /api/admin/setup
 *
 * One-time setup endpoint to add admin columns and tables.
 * Uses individual REST operations since we can't run raw SQL via PostgREST.
 * Only callable by admins.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const results: string[] = [];

  // Test if is_premium column exists by trying to select it
  const { error: testError } = await supabase
    .from("profiles")
    .select("is_premium")
    .limit(1);

  if (testError?.message?.includes("does not exist")) {
    results.push("⚠️ Admin columns (is_premium, is_banned, etc.) need to be added via Supabase SQL Editor");
    results.push("Run the SQL from: supabase/migrations/admin-schema.sql");
  } else {
    results.push("✅ profiles.is_premium column exists");

    // Set admin accounts as premium
    const { error: premiumError } = await supabase
      .from("profiles")
      .update({ is_premium: true })
      .in("user_id", [user.id]);

    if (premiumError) {
      results.push(`⚠️ Failed to set premium: ${premiumError.message}`);
    } else {
      results.push(`✅ Set ${user.email} as premium`);
    }
  }

  // Test if admin_audit_log table exists
  const { error: auditTest } = await supabase
    .from("admin_audit_log")
    .select("id")
    .limit(1);

  if (auditTest?.message?.includes("does not exist") || auditTest?.code === "42P01") {
    results.push("⚠️ admin_audit_log table needs to be created via SQL Editor");
  } else {
    results.push("✅ admin_audit_log table exists");
  }

  // Test admin_user_notes
  const { error: notesTest } = await supabase
    .from("admin_user_notes")
    .select("id")
    .limit(1);

  if (notesTest?.message?.includes("does not exist") || notesTest?.code === "42P01") {
    results.push("⚠️ admin_user_notes table needs to be created via SQL Editor");
  } else {
    results.push("✅ admin_user_notes table exists");
  }

  return NextResponse.json({ results });
}
