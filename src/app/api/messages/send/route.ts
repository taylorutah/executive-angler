import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * POST /api/messages/send
 *
 * Sends a DM message on behalf of the authenticated user.
 * Uses the service-role client to bypass RLS for the insert,
 * but validates that the user is a participant of the thread.
 *
 * Body: { threadId: string, body: string }
 */

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    let userId: string | null = null;

    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const admin = getSupabaseAdmin();
      const {
        data: { user },
        error,
      } = await admin.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
    } else {
      const supabase = await createServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
    }

    const { threadId, body: messageBody } = (await req.json()) as {
      threadId: string;
      body: string;
    };

    if (!threadId || !messageBody?.trim()) {
      return NextResponse.json(
        { error: "threadId and body are required" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Verify user is a participant of the thread
    const { data: thread, error: threadErr } = await admin
      .from("dm_threads")
      .select("id, participant_a, participant_b")
      .eq("id", threadId)
      .single();

    if (threadErr || !thread) {
      return NextResponse.json(
        { error: "Thread not found" },
        { status: 404 }
      );
    }

    if (
      thread.participant_a !== userId &&
      thread.participant_b !== userId
    ) {
      return NextResponse.json(
        { error: "Not a participant of this thread" },
        { status: 403 }
      );
    }

    // Insert the message
    const { data: message, error: insertErr } = await admin
      .from("dm_messages")
      .insert({
        thread_id: threadId,
        sender_id: userId,
        body: messageBody.trim(),
      })
      .select("id, thread_id, sender_id, body, read_at, created_at, deleted_at")
      .single();

    if (insertErr) {
      console.error("[MESSAGE SEND ERROR]", insertErr);
      return NextResponse.json(
        { error: `Failed to send message: ${insertErr.message}` },
        { status: 500 }
      );
    }

    // Update thread last_message_at
    await admin
      .from("dm_threads")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", threadId);

    return NextResponse.json({ sent: true, message });
  } catch (err) {
    console.error("[MESSAGE SEND ERROR]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
