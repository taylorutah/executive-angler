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
      .select("*")
      .eq("id", singleId)
      .eq("user_id", user.id)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });

    // Fetch catches explicitly — auto-join catches(*) is unreliable without confirmed FK schema
    const { data: catches } = await supabase
      .from("catches")
      .select("*")
      .eq("session_id", singleId)
      .order("created_at", { ascending: true });

    return NextResponse.json({ ...data, catches: catches ?? [] });
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

const GEAR_ID_FIELDS = ['gear_rod_id', 'gear_reel_id', 'gear_line_id', 'gear_leader_id', 'gear_tippet_id'] as const;
const GEAR_SNAPSHOT_KEYS = ['rod', 'reel', 'line', 'leader', 'tippet'] as const;

async function buildGearSnapshot(
  supabase: Awaited<ReturnType<typeof createClient>>,
  body: Record<string, unknown>
): Promise<Record<string, { name: string; maker?: string; model?: string }>> {
  const snapshot: Record<string, { name: string; maker?: string; model?: string }> = {};
  const pairs: Array<{ field: string; key: string }> = GEAR_ID_FIELDS.map((f, i) => ({
    field: f,
    key: GEAR_SNAPSHOT_KEYS[i],
  }));

  const ids = pairs.map((p) => body[p.field]).filter(Boolean) as string[];
  if (!ids.length) return snapshot;

  const { data } = await supabase
    .from("gear_items")
    .select("id, name, maker, model")
    .in("id", ids);

  for (const { field, key } of pairs) {
    const id = body[field] as string | undefined;
    if (!id) continue;
    const item = data?.find((g) => g.id === id);
    if (item) {
      snapshot[key] = { name: item.name, maker: item.maker ?? undefined, model: item.model ?? undefined };
    }
  }

  return snapshot;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { catches, ...sessionData } = body;

  // Build gear snapshot before insert
  const gear_snapshot = await buildGearSnapshot(supabase, sessionData);

  const { data: session, error } = await supabase
    .from("fishing_sessions")
    .insert({ ...sessionData, user_id: user.id, gear_snapshot })
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

  // Rebuild gear_snapshot when gear IDs change (same as POST)
  const gear_snapshot = await buildGearSnapshot(supabase, sessionData);

  const { error } = await supabase
    .from("fishing_sessions")
    .update({ ...sessionData, gear_snapshot })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Replace catches — but first preserve photo URLs from existing rows so they
  // aren't wiped (the edit form doesn't include fish_image_url fields).
  const { data: existingCatches } = await supabase
    .from("catches")
    .select("id, fish_image_url, fish_location_image_url, fly_image_url")
    .eq("session_id", id);

  const photoUrlsById = new Map(
    (existingCatches || []).map((c) => [
      c.id as string,
      {
        fish_image_url: c.fish_image_url as string | null,
        fish_location_image_url: c.fish_location_image_url as string | null,
        fly_image_url: c.fly_image_url as string | null,
      },
    ])
  );

  await supabase.from("catches").delete().eq("session_id", id);
  if (catches?.length) {
    const catchRows = catches.map((c: Record<string, unknown>) => {
      const existing = c.id ? photoUrlsById.get(c.id as string) : null;
      return {
        ...c,
        session_id: id,
        user_id: user.id,
        // Restore photo URLs that the edit form doesn't carry
        fish_image_url: c.fish_image_url ?? existing?.fish_image_url ?? null,
        fish_location_image_url: c.fish_location_image_url ?? existing?.fish_location_image_url ?? null,
        fly_image_url: c.fly_image_url ?? existing?.fly_image_url ?? null,
      };
    });
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
