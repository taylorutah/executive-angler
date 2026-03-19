import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("notifications")
    .select(
      `
      id, recipient_id, actor_id, type, session_id, message, read, created_at,
      actor_profile:profiles!notifications_actor_id_profiles_fkey(
        display_name, username, avatar_url
      )
    `,
      { count: "exact" }
    )
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const notifications = (data || []).map((n) => ({
    ...n,
    actor_profile: Array.isArray(n.actor_profile)
      ? n.actor_profile[0] ?? null
      : n.actor_profile ?? null,
  }));

  return NextResponse.json({
    notifications,
    total: count ?? 0,
    page,
    limit,
  });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, markAll } = body as { id?: string; markAll?: boolean };

  if (markAll) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("recipient_id", user.id)
      .eq("read", false);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, markedAll: true });
  }

  if (id) {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("recipient_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, id });
  }

  return NextResponse.json(
    { error: "Provide id or markAll: true" },
    { status: 400 }
  );
}
