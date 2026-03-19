import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { followerId } = (await req.json()) as { followerId: string };

  if (!followerId) {
    return NextResponse.json(
      { error: "followerId is required" },
      { status: 400 }
    );
  }

  // Update the follow record from pending to accepted
  const { error: updateError } = await supabase
    .from("follows")
    .update({ status: "accepted" })
    .eq("follower_id", followerId)
    .eq("following_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Create a notification for the requester that their follow was accepted
  await supabase.from("notifications").insert({
    recipient_id: followerId,
    actor_id: user.id,
    type: "follow_accepted",
    message: null,
  });

  // Trigger email notification (fire and forget)
  try {
    const origin =
      req.headers.get("origin") ||
      req.headers.get("x-forwarded-host") ||
      "http://localhost:3000";
    const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;
    fetch(`${baseUrl}/api/notifications/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "follow",
        recipientId: followerId,
        actorId: user.id,
      }),
    }).catch(() => {});
  } catch {
    // ignore email failures
  }

  return NextResponse.json({ success: true, status: "accepted" });
}
