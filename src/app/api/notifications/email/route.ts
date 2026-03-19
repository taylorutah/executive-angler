import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabaseAdmin;
}

const NOTIFICATION_COLUMN_MAP: Record<string, string> = {
  follow: "email_notify_follows",
  comment: "email_notify_comments",
  like: "email_notify_likes",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, recipientId, actorId, sessionId } = body as {
      type: "follow" | "comment" | "like";
      recipientId: string;
      actorId: string;
      sessionId?: string;
    };

    if (!type || !recipientId || !actorId) {
      return NextResponse.json(
        { sent: false, reason: "Missing required fields: type, recipientId, actorId" },
        { status: 400 }
      );
    }

    const column = NOTIFICATION_COLUMN_MAP[type];
    if (!column) {
      return NextResponse.json(
        { sent: false, reason: `Unknown notification type: ${type}` },
        { status: 400 }
      );
    }

    // Fetch recipient profile to check notification preference
    const supabaseAdmin = getSupabaseAdmin();
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("user_id, display_name, email_notify_follows, email_notify_comments, email_notify_likes")
      .eq("user_id", recipientId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { sent: false, reason: "Recipient profile not found" },
        { status: 404 }
      );
    }

    const prefMap = {
      follow: profile.email_notify_follows,
      comment: profile.email_notify_comments,
      like: profile.email_notify_likes,
    } as Record<string, boolean | null>;

    const isEnabled = prefMap[type] ?? true;

    if (!isEnabled) {
      return NextResponse.json({
        sent: false,
        reason: `User has ${type} email notifications disabled`,
      });
    }

    // Fetch actor display name for the notification
    const { data: actor } = await supabaseAdmin
      .from("profiles")
      .select("display_name, username")
      .eq("user_id", actorId)
      .single();

    const actorName = actor?.display_name || actor?.username || "Someone";

    // TODO: Replace with actual email sending (Resend, SendGrid, etc.)
    console.log(
      `[EMAIL NOTIFICATION] type=${type} to=${recipientId} (${profile.display_name}) from=${actorName}` +
        (sessionId ? ` session=${sessionId}` : "")
    );

    return NextResponse.json({
      sent: true,
      reason: `${type} notification queued for ${profile.display_name}`,
    });
  } catch (err) {
    console.error("[EMAIL NOTIFICATION ERROR]", err);
    return NextResponse.json(
      { sent: false, reason: "Internal server error" },
      { status: 500 }
    );
  }
}
