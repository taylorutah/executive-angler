import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const singleId = req.nextUrl.searchParams.get("id");
  if (singleId) {
    const { data, error } = await supabase
      .from("fishing_sessions")
      .select("*, catches(*)")
      .eq("id", singleId)
      .eq("user_id", user.id)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  const autocomplete = req.nextUrl.searchParams.get("autocomplete");

  if (autocomplete === "rivers") {
    const { data } = await supabase
      .from("fishing_sessions")
      .select("river_name")
      .eq("user_id", user.id)
      .not("river_name", "is", null);
    const unique = [...new Set(data?.map((r) => r.river_name).filter(Boolean))].sort();
    return NextResponse.json(unique);
  }

  if (autocomplete === "locations") {
    const { data } = await supabase
      .from("fishing_sessions")
      .select("location")
      .eq("user_id", user.id)
      .not("location", "is", null);
    const unique = [...new Set(data?.map((r) => r.location).filter(Boolean))].sort();
    return NextResponse.json(unique);
  }

  const { data, error } = await supabase
    .from("fishing_sessions")
    .select("*, catches(*)")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { catches, ...sessionData } = body;

  const { data: session, error } = await supabase
    .from("fishing_sessions")
    .insert({ ...sessionData, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (catches?.length) {
    const catchRows = catches.map((c: Record<string, unknown>) => ({
      ...c,
      session_id: session.id,
      user_id: user.id,
    }));
    await supabase.from("catches").insert(catchRows);
  }

  return NextResponse.json({ id: session.id });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json();
  const { catches, ...sessionData } = body;

  const { error } = await supabase
    .from("fishing_sessions")
    .update(sessionData)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Replace catches
  await supabase.from("catches").delete().eq("session_id", id);
  if (catches?.length) {
    const catchRows = catches.map((c: Record<string, unknown>) => ({
      ...c,
      session_id: id,
      user_id: user.id,
    }));
    await supabase.from("catches").insert(catchRows);
  }

  return NextResponse.json({ id });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await supabase.from("catches").delete().eq("session_id", id);
  const { error } = await supabase
    .from("fishing_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
