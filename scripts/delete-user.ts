/**
 * Delete one or more users entirely from Supabase — auth row + all linked
 * rows in app tables. Pass emails as CLI args.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/delete-user.ts <email> [email2 ...]
 *
 * Idempotent: missing rows in any table are silently skipped. Tables we don't
 * know about are not touched — if a new user-scoped table is added later,
 * extend the LINKED_TABLES list below.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qlasxtfbodyxbcuchvxz.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY env var required");
  process.exit(1);
}

// Tables that have a user_id column referencing auth.users(id).
// Order is irrelevant — Postgres handles FKs, and we're explicit-deleting
// to be safe even if a CASCADE is missing.
const LINKED_TABLES_USER_ID = [
  "profiles",
  "angler_profiles",
  "user_profiles",
  "user_favorites",
  "fishing_sessions",
  "catches",
  "reviews",
  "photo_submissions",
  "user_fly_box",
  "fly_pattern_submissions",
  "session_kudos",
  "session_comments",
  "follows",
  "direct_messages",
  "notification_preferences",
] as const;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(email: string): Promise<string | null> {
  // listUsers paginates; for our use case we walk pages until we find a match
  // or run out. Safe at our user count.
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match.id;
    if (data.users.length < perPage) return null;
    page++;
  }
}

async function deleteFromTable(table: string, userId: string): Promise<number> {
  const { error, count } = await supabase
    .from(table)
    .delete({ count: "exact" })
    .eq("user_id", userId);
  if (error) {
    // 42P01 = relation does not exist; 42703 = column does not exist
    if (error.code === "42P01" || error.code === "42703") return 0;
    console.warn(`  [warn] ${table}: ${error.message}`);
    return 0;
  }
  return count ?? 0;
}

async function deleteUser(email: string) {
  console.log(`\n=== ${email} ===`);
  const userId = await findUserIdByEmail(email);
  if (!userId) {
    console.log("  not found in auth.users — nothing to do");
    return;
  }
  console.log(`  user_id: ${userId}`);

  // Wipe related rows first to avoid FK-violation surprises if a CASCADE is
  // missing somewhere.
  for (const table of LINKED_TABLES_USER_ID) {
    const n = await deleteFromTable(table, userId);
    if (n > 0) console.log(`  - ${table}: ${n} row(s) deleted`);
  }

  // Finally drop the auth row.
  const { error: authErr } = await supabase.auth.admin.deleteUser(userId);
  if (authErr) {
    console.error(`  [error] auth.deleteUser: ${authErr.message}`);
    return;
  }
  console.log("  ✓ auth.users row deleted");
}

async function main() {
  const emails = process.argv.slice(2);
  if (emails.length === 0) {
    console.error("usage: tsx scripts/delete-user.ts <email> [email2 ...]");
    process.exit(1);
  }
  for (const email of emails) {
    await deleteUser(email);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("fatal:", err);
  process.exit(1);
});
