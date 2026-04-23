import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Moderation: block / unblock a user.
 *
 *   POST   /api/moderation/block  { targetId }  → create a block edge
 *   DELETE /api/moderation/block?targetId=...   → remove a block edge
 *
 * Canonical storage is `user_blocks(blocker_id, blocked_id)` — a trigger
 * on insert wipes any follow edges in both directions so the two sides
 * drop out of each other's lists immediately.
 *
 * Legacy iOS writes may also land in `follows(status='blocked')` — we
 * defensively clean those up on block creation and on unblock so the app
 * layer isn't responsible for juggling two tables.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const targetId = (body.targetId as string | undefined) || "";
  if (!targetId || !UUID_RE.test(targetId)) {
    return NextResponse.json({ error: "Invalid target id" }, { status: 400 });
  }
  if (targetId === user.id) {
    return NextResponse.json(
      { error: "You cannot block yourself" },
      { status: 400 }
    );
  }

  // Upsert-style insert — if a block already exists, treat as idempotent
  // success (the client flow doesn't need to distinguish).
  const { error: blockErr } = await supabase.from("user_blocks").insert({
    blocker_id: user.id,
    blocked_id: targetId,
  });

  if (blockErr && !/duplicate|unique/i.test(blockErr.message)) {
    console.error("[moderation/block] insert failed:", blockErr);
    return NextResponse.json({ error: blockErr.message }, { status: 500 });
  }

  // Belt-and-braces follow cleanup. The DB trigger does this on fresh
  // inserts, but we also sweep on idempotent re-blocks so legacy
  // follows.status='blocked' rows from old clients don't linger.
  await supabase
    .from("follows")
    .delete()
    .or(
      `and(follower_id.eq.${user.id},following_id.eq.${targetId}),` +
        `and(follower_id.eq.${targetId},following_id.eq.${user.id})`
    );

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("targetId") || "";
  if (!targetId || !UUID_RE.test(targetId)) {
    return NextResponse.json({ error: "Invalid target id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetId);

  if (error) {
    console.error("[moderation/block] delete failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
