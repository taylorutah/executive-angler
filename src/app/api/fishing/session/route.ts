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

    const resp = NextResponse.json({ ...data, catches: catches ?? [] });
    resp.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return resp;
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
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

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

const stripNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? null : n;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { catches, ...sessionData } = body;

  // Sanitize numeric fields with unit suffixes
  if ("water_temp_f" in sessionData) sessionData.water_temp_f = stripNum(sessionData.water_temp_f);

  // Build gear snapshot before insert
  const gear_snapshot = await buildGearSnapshot(supabase, sessionData);

  const { data: session, error } = await supabase
    .from("fishing_sessions")
    .insert({ ...sessionData, user_id: user.id, gear_snapshot })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (catches?.length) {
    const catchRows = catches.map((c: Record<string, unknown>) => {
      const row: Record<string, unknown> = {
        ...c,
        session_id: session.id,
        user_id: user.id,
        fly_pattern_id: c.fly_pattern_id && String(c.fly_pattern_id).trim() !== "" ? c.fly_pattern_id : null,
        length_inches: stripNum(c.length_inches) ?? null,
        quantities: c.quantities ? Number(c.quantities) || null : null,
      };
      // Remove undefined values
      return Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined));
    });
    const { error: catchError } = await supabase.from("catches").insert(catchRows);
    if (catchError) {
      console.error("[SESSION POST] Failed to insert catches:", catchError.message);
    }
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

  // Sanitize numeric fields with unit suffixes
  if ("water_temp_f" in sessionData) sessionData.water_temp_f = stripNum(sessionData.water_temp_f);

  // Only rebuild gear_snapshot when gear IDs are actually present in the payload.
  // A partial PATCH (e.g. notes-only) must NOT overwrite existing gear_snapshot with {}.
  const hasGearIds = GEAR_ID_FIELDS.some((f) => f in sessionData);
  const gear_snapshot = hasGearIds
    ? await buildGearSnapshot(supabase, sessionData)
    : undefined;

  const updatePayload = gear_snapshot !== undefined
    ? { ...sessionData, gear_snapshot }
    : { ...sessionData };

  const { error } = await supabase
    .from("fishing_sessions")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Only touch catches when the payload explicitly includes the catches key.
  // A partial PATCH (e.g. notes-only) must NOT touch existing catch rows.
  if (catches !== undefined) {
    // Fetch existing catches from DB
    const { data: existingCatches } = await supabase
      .from("catches")
      .select("*")
      .eq("session_id", id);

    const existingById = new Map(
      (existingCatches || []).map((c) => [c.id as string, c as Record<string, unknown>])
    );
    const existingIds = new Set((existingCatches || []).map((c) => c.id as string));

    if (catches?.length) {
      const toUpdate: Array<{ id: string; data: Record<string, unknown> }> = [];
      const toInsert: Record<string, unknown>[] = [];
      const incomingIds = new Set<string>();

      for (const c of catches as Record<string, unknown>[]) {
        const existing = c.id ? existingById.get(c.id as string) : null;

        // Build clean catch data
        const clean: Record<string, unknown> = {
          session_id: id,
          user_id: user.id,
          species: c.species || null,
          length_inches: stripNum(c.length_inches) ?? null,
          quantities: c.quantities ? Number(c.quantities) || 1 : existing?.quantities ?? 1,
          fly_pattern_id: c.fly_pattern_id && String(c.fly_pattern_id).trim() !== "" ? c.fly_pattern_id : null,
          fly_position: c.fly_position || null,
          fly_size: c.fly_size || null,
          bead_size: c.bead_size || null,
          time_caught: c.time_caught || null,
          notes: c.notes || null,
          // Preserve photos: use client value if explicitly provided (including null to clear),
          // otherwise fall back to existing DB value
          fish_image_url: c.fish_image_url !== undefined ? (c.fish_image_url || null) : (existing?.fish_image_url ?? null),
          fish_image_urls: c.fish_image_urls !== undefined ? (c.fish_image_urls || null) : (existing?.fish_image_urls ?? null),
          fish_location_image_url: c.fish_location_image_url !== undefined ? (c.fish_location_image_url || null) : (existing?.fish_location_image_url ?? null),
          fly_image_url: c.fly_image_url !== undefined ? (c.fly_image_url || null) : (existing?.fly_image_url ?? null),
        };

        if (c.id && existingIds.has(c.id as string)) {
          // Existing catch — UPDATE
          toUpdate.push({ id: c.id as string, data: clean });
          incomingIds.add(c.id as string);
        } else {
          // New catch — INSERT (no id, let DB generate UUID)
          toInsert.push(clean);
        }
      }

      // Delete catches the user removed (exist in DB but not in incoming payload)
      const toDelete = [...existingIds].filter((eid) => !incomingIds.has(eid));
      if (toDelete.length > 0) {
        const { error: deleteError } = await supabase.from("catches").delete().in("id", toDelete);
        if (deleteError) {
          console.error("[SESSION PATCH] Failed to delete removed catches:", deleteError.message);
          return NextResponse.json({ error: "Failed to delete removed catches: " + deleteError.message }, { status: 500 });
        }
      }

      // Update existing catches — use upsert instead of individual updates for reliability
      // Upsert handles both RLS edge cases and ensures data persists
      if (toUpdate.length > 0) {
        const upsertRows = toUpdate.map((row) => ({ id: row.id, ...row.data }));
        const { error: upsertError } = await supabase.from("catches").upsert(upsertRows, { onConflict: "id" });
        if (upsertError) {
          console.error("[SESSION PATCH] Failed to upsert catches:", upsertError.message);
          return NextResponse.json({ error: "Failed to update catches: " + upsertError.message }, { status: 500 });
        }
      }

      // Insert new catches
      if (toInsert.length > 0) {
        const { error: insertError } = await supabase.from("catches").insert(toInsert);
        if (insertError) {
          console.error("[SESSION PATCH] Failed to insert new catches:", insertError.message);
          return NextResponse.json({ error: "Failed to insert new catches: " + insertError.message }, { status: 500 });
        }
      }
    } else {
      // Empty catches array — user deleted all fish
      await supabase.from("catches").delete().eq("session_id", id);
    }
  }

  // Re-fetch catches so the client gets DB-assigned IDs for any newly added catches
  const { data: updatedCatches } = await supabase
    .from("catches")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ id, catches: updatedCatches ?? [] });
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Verify ownership before deleting anything
    const { data: owned } = await supabase
      .from("fishing_sessions")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { error: catchError } = await supabase.from("catches").delete().eq("session_id", id);
    if (catchError) {
      console.error("Failed to delete catches:", catchError);
    }

    const { error } = await supabase
      .from("fishing_sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete session:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Session DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
