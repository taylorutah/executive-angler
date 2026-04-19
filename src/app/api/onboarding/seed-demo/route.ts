import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildDemoRows } from "@/lib/demo-sessions";

/**
 * POST /api/onboarding/seed-demo
 *
 * Seeds 3 sample fishing sessions + their catches for a newly signed-up user
 * so their journal isn't empty on first login.
 *
 * Idempotent: if the user already has ANY session (demo or real), this does
 * nothing. That protects against double-seeding and against clobbering an
 * existing user's real data if the endpoint ever gets called again.
 *
 * All seeded rows are marked is_demo=true and privacy='private', so they
 * never leak into cross-user aggregates (river stats, public feeds,
 * leaderboards, awards) — see src/lib/demo-sessions.ts for the contract.
 */
async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a server component — safe to ignore
          }
        },
      },
    }
  );
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Idempotency guard: if the user has any session already, bail cleanly.
  // We check with head=true to avoid pulling rows we don't need.
  const { count, error: countError } = await supabase
    .from("fishing_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    return NextResponse.json(
      { error: "Could not verify onboarding state" },
      { status: 500 }
    );
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json({ seeded: false, reason: "already_has_sessions" });
  }

  // Build rows and insert sessions first, then catches by session_id.
  const rows = buildDemoRows(user.id);

  const sessionInserts = rows.map((r) => r.session);
  const { data: insertedSessions, error: sessionError } = await supabase
    .from("fishing_sessions")
    .insert(sessionInserts)
    .select("id, date, title");

  if (sessionError || !insertedSessions || insertedSessions.length === 0) {
    console.error("[SEED DEMO] Session insert failed:", sessionError?.message);
    return NextResponse.json(
      { error: sessionError?.message ?? "Session insert failed" },
      { status: 500 }
    );
  }

  // Match inserted sessions back to their catches by title (titles are unique
  // within the demo set). Using title avoids order-assumption bugs if the DB
  // ever reorders the insert response.
  const catchInserts = insertedSessions.flatMap((sess) => {
    const source = rows.find((r) => r.session.title === sess.title);
    if (!source) return [];
    return source.catches.map((c) => ({ ...c, session_id: sess.id }));
  });

  if (catchInserts.length > 0) {
    const { error: catchError } = await supabase
      .from("catches")
      .insert(catchInserts);

    if (catchError) {
      console.error("[SEED DEMO] Catch insert failed:", catchError.message);
      // Don't fail the whole request — the sessions are still useful on their own.
      // But do surface it so we can tell from logs if this is systematically broken.
      return NextResponse.json({
        seeded: true,
        partial: true,
        sessions: insertedSessions.length,
        catchError: catchError.message,
      });
    }
  }

  return NextResponse.json({
    seeded: true,
    sessions: insertedSessions.length,
    catches: catchInserts.length,
  });
}
