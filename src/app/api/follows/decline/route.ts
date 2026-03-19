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

  // Delete the follow request
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", user.id)
    .eq("status", "pending");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark the notification as read
  await supabase
    .from("notifications")
    .update({ read: true, read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .eq("actor_id", followerId)
    .eq("type", "follow_request");

  return NextResponse.json({ success: true, status: "declined" });
}
