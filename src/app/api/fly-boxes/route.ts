import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FlyBoxTier, FlyBoxV2 } from "@/lib/db/fly-v2";

const ALLOWED_TIERS: readonly FlyBoxTier[] = ["kill", "support", "archive", "custom"];

function isTier(v: unknown): v is FlyBoxTier {
  return typeof v === "string" && (ALLOWED_TIERS as readonly string[]).includes(v);
}

function coerceCapacity(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.floor(n));
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data, error } = await supabase
      .from("fly_boxes")
      .select("*")
      .eq("user_id", user.id)
      .order("tier")
      .order("sort_order")
      .order("created_at");
    if (error) {
      console.error("[fly-boxes GET]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ boxes: (data ?? []) as FlyBoxV2[] });
  } catch (err) {
    console.error("[fly-boxes GET]", err);
    return NextResponse.json({ error: "Failed to load boxes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    const tier: FlyBoxTier = isTier(body.tier) ? body.tier : "custom";
    const description = typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;
    const total_capacity = coerceCapacity(body.total_capacity);

    const { data, error } = await supabase
      .from("fly_boxes")
      .insert({
        user_id: user.id,
        name,
        tier,
        description,
        total_capacity,
      })
      .select("*")
      .single();
    if (error) {
      console.error("[fly-boxes POST]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ box: data as FlyBoxV2 });
  } catch (err) {
    console.error("[fly-boxes POST]", err);
    return NextResponse.json({ error: "Failed to create box" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id." }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));

    const patch: Record<string, unknown> = {};
    if (typeof body.name === "string") {
      const trimmed = body.name.trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
      }
      patch.name = trimmed;
    }
    if (body.tier !== undefined) {
      if (!isTier(body.tier)) {
        return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
      }
      patch.tier = body.tier;
    }
    if (body.description !== undefined) {
      patch.description = typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;
    }
    if (body.total_capacity !== undefined) {
      patch.total_capacity = coerceCapacity(body.total_capacity);
    }

    // Handle is_default flip: clear existing default first to avoid
    // the partial unique index (fly_boxes_one_default_per_user).
    if (body.is_default === true) {
      const { error: clearErr } = await supabase
        .from("fly_boxes")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("is_default", true)
        .neq("id", id);
      if (clearErr) {
        console.error("[fly-boxes PATCH clear-default]", clearErr);
        return NextResponse.json({ error: clearErr.message }, { status: 500 });
      }
      patch.is_default = true;
    } else if (body.is_default === false) {
      patch.is_default = false;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("fly_boxes")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      console.error("[fly-boxes PATCH]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ box: data as FlyBoxV2 });
  } catch (err) {
    console.error("[fly-boxes PATCH]", err);
    return NextResponse.json({ error: "Failed to update box" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id." }, { status: 400 });
    }

    const { data: existing, error: fetchErr } = await supabase
      .from("fly_boxes")
      .select("id, is_default")
      .eq("id", id)
      .maybeSingle();
    if (fetchErr) {
      console.error("[fly-boxes DELETE fetch]", fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: "Box not found." }, { status: 404 });
    }
    if (existing.is_default) {
      return NextResponse.json(
        { error: "Set another box as default before deleting this one." },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("fly_boxes").delete().eq("id", id);
    if (error) {
      console.error("[fly-boxes DELETE]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[fly-boxes DELETE]", err);
    return NextResponse.json({ error: "Failed to delete box" }, { status: 500 });
  }
}
