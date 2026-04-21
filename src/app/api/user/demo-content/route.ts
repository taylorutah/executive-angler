import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * /api/user/demo-content
 *
 * Owner: the authenticated user (RLS enforces scope via `user_id = auth.uid()`).
 *
 * GET    → { hasDemoContent: boolean, sessionCount: number, catchCount: number }
 *          Cheap count-only probe so the Account UI can conditionally render
 *          the "Clear demo content" button.
 *
 * DELETE → { cleared: boolean, sessionsDeleted: number, catchesDeleted: number }
 *          Wipes this user's demo rows only. Safety rails:
 *            - Scoped to auth.uid() (RLS + explicit .eq)
 *            - Predicate is is_demo = true — real sessions are never touched
 *            - Catches are removed first to avoid FK orphan issues if any row
 *              is_demo=false (defensive — the onboarding seeder always marks
 *              both sessions and catches, but this keeps the operation safe
 *              if an admin ever backfills differently).
 *
 * Demo rows are seeded by /api/onboarding/seed-demo on first login
 * (3 sessions + associated catches, all marked is_demo=true, privacy=private).
 */

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [sessionsResult, catchesResult] = await Promise.all([
    supabase
      .from("fishing_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_demo", true),
    supabase
      .from("catches")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_demo", true),
  ]);

  if (sessionsResult.error || catchesResult.error) {
    console.error(
      "[demo-content GET]",
      sessionsResult.error?.message ?? catchesResult.error?.message
    );
    return NextResponse.json(
      { error: "Could not check demo content" },
      { status: 500 }
    );
  }

  const sessionCount = sessionsResult.count ?? 0;
  const catchCount = catchesResult.count ?? 0;

  return NextResponse.json({
    hasDemoContent: sessionCount > 0 || catchCount > 0,
    sessionCount,
    catchCount,
  });
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete catches first (they FK to sessions). Both queries are hard-scoped
  // to this user AND is_demo=true — there is no path by which this touches
  // real data even if a caller somehow bypassed auth.
  const { count: catchesDeleted, error: catchErr } = await supabase
    .from("catches")
    .delete({ count: "exact" })
    .eq("user_id", user.id)
    .eq("is_demo", true);

  if (catchErr) {
    console.error("[demo-content DELETE] catches:", catchErr.message);
    return NextResponse.json(
      { error: "Failed to clear demo catches" },
      { status: 500 }
    );
  }

  const { count: sessionsDeleted, error: sessionErr } = await supabase
    .from("fishing_sessions")
    .delete({ count: "exact" })
    .eq("user_id", user.id)
    .eq("is_demo", true);

  if (sessionErr) {
    console.error("[demo-content DELETE] sessions:", sessionErr.message);
    return NextResponse.json(
      { error: "Failed to clear demo sessions" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    cleared: true,
    sessionsDeleted: sessionsDeleted ?? 0,
    catchesDeleted: catchesDeleted ?? 0,
  });
}
