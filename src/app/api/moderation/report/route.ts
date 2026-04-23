import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/moderation/report
 *
 * Files a report against a user / session / comment. Strava-style reason
 * categories feed the moderation queue — the free-form `reason_text` field
 * is optional colour that reviewers read alongside the category.
 *
 * Body:
 *   {
 *     contentType: 'user' | 'session' | 'comment',
 *     targetId:    string (UUID),
 *     reasonCategory: 'spam' | 'harassment' | 'inappropriate'
 *                   | 'impersonation' | 'off_topic' | 'other',
 *     reasonText?: string
 *   }
 *
 * Back-compat: legacy clients that still send `{ type, targetId, reason }`
 * are accepted — we map `type → content_type`, leave `reason_category` as
 * its table default of 'other', and stash the free text in `reason_text`.
 */

const ALLOWED_CONTENT_TYPES = new Set(["user", "session", "comment"]);
const ALLOWED_REASONS = new Set([
  "spam",
  "harassment",
  "inappropriate",
  "impersonation",
  "off_topic",
  "other",
]);

// Simple UUID check — keeps a malformed id from hitting Postgres with a
// cast error and leaking a 500 to the client.
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

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Accept both the new shape and the legacy shape used by older clients.
  const contentType =
    (payload.contentType as string | undefined) ||
    (payload.type as string | undefined) ||
    "";
  const targetId = (payload.targetId as string | undefined) || "";
  const reasonCategory =
    (payload.reasonCategory as string | undefined) || "other";
  const reasonText =
    (payload.reasonText as string | undefined) ??
    (payload.reason as string | undefined) ??
    null;

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json(
      { error: "Invalid content type" },
      { status: 400 }
    );
  }
  if (!targetId || !UUID_RE.test(targetId)) {
    return NextResponse.json({ error: "Invalid target id" }, { status: 400 });
  }
  if (!ALLOWED_REASONS.has(reasonCategory)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  // No self-reports on user targets — prevents accidental noise from buggy
  // clients or mischief.
  if (contentType === "user" && targetId === user.id) {
    return NextResponse.json(
      { error: "You cannot report yourself" },
      { status: 400 }
    );
  }

  // 24h dedup: if this reporter already filed against this target+type in
  // the last day, treat a second submission as a no-op success so the UI
  // stays idempotent.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from("content_reports")
    .select("id")
    .eq("reporter_id", user.id)
    .eq("content_type", contentType)
    .eq("target_id", targetId)
    .gte("created_at", since)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ success: true, deduplicated: true });
  }

  const { error } = await supabase.from("content_reports").insert({
    reporter_id: user.id,
    content_type: contentType,
    target_id: targetId,
    reason_category: reasonCategory,
    reason_text: reasonText,
    // `reason` is kept populated for legacy queries that still read it.
    reason: reasonText,
    status: "pending",
  });

  if (error) {
    console.error("[moderation/report] insert failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
