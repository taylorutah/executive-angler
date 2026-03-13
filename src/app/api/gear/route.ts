import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { GearType } from "@/types/gear";

const GEAR_TYPES: GearType[] = ['rod', 'reel', 'line', 'leader', 'tippet', 'net', 'waders', 'other'];

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

// GET /api/gear — returns all active gear grouped by type
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("gear_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to fetch gear items:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by type
    const grouped: Record<string, typeof data> = {};
    for (const type of GEAR_TYPES) {
      grouped[type] = [];
    }
    for (const item of data ?? []) {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    }

    return NextResponse.json(grouped);
  } catch (err) {
    console.error("Gear GET error:", err);
    return NextResponse.json({ error: "Failed to fetch gear items" }, { status: 500 });
  }
}

// POST /api/gear — create a new gear item
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, name, maker, model, specs, is_default, notes } = body;

    if (!type || !name) {
      return NextResponse.json({ error: "type and name are required" }, { status: 400 });
    }

    if (!GEAR_TYPES.includes(type as GearType)) {
      return NextResponse.json({ error: `Invalid gear type: ${type}` }, { status: 400 });
    }

    // If setting as default, clear existing default for this type
    if (is_default) {
      const { error: clearError } = await supabase
        .from("gear_items")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("type", type)
        .eq("is_default", true);

      if (clearError) {
        console.error("Failed to clear existing default:", clearError);
      }
    }

    const { data, error } = await supabase
      .from("gear_items")
      .insert({
        user_id: user.id,
        type,
        name,
        maker: maker ?? null,
        model: model ?? null,
        specs: specs ?? {},
        is_default: is_default ?? false,
        notes: notes ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create gear item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Gear POST error:", err);
    return NextResponse.json({ error: "Failed to create gear item" }, { status: 500 });
  }
}

// PUT /api/gear?id=xxx — update a gear item
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json();
    const { name, specs, is_default, is_active, notes, maker, model } = body;

    // If setting as default, fetch the item's type first, then clear existing default
    if (is_default) {
      const { data: existing, error: fetchError } = await supabase
        .from("gear_items")
        .select("type")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError) {
        console.error("Failed to fetch gear item type:", fetchError);
      } else if (existing) {
        const { error: clearError } = await supabase
          .from("gear_items")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .eq("type", existing.type)
          .eq("is_default", true)
          .neq("id", id);

        if (clearError) {
          console.error("Failed to clear existing default:", clearError);
        }
      }
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (specs !== undefined) updates.specs = specs;
    if (is_default !== undefined) updates.is_default = is_default;
    if (is_active !== undefined) updates.is_active = is_active;
    if (notes !== undefined) updates.notes = notes;
    if (maker !== undefined) updates.maker = maker;
    if (model !== undefined) updates.model = model;

    const { data, error } = await supabase
      .from("gear_items")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update gear item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Gear PUT error:", err);
    return NextResponse.json({ error: "Failed to update gear item" }, { status: 500 });
  }
}

// DELETE /api/gear?id=xxx — soft delete
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabase
      .from("gear_items")
      .update({ is_active: false, is_default: false })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete gear item:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gear DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete gear item" }, { status: 500 });
  }
}
