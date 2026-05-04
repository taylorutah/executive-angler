import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — fetch user's fly box (canonical refs + custom flies)
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get user fly box entries with canonical fly data
    const { data: boxEntries, error: boxError } = await supabase
      .from("user_fly_box")
      .select(
        `
        *,
        canonical_fly:canonical_flies(id, slug, name, category, tagline, description, sizes, colors, bead_options, hook_styles, imitates, hero_image_url, icon_url, video_url, rank)
      `
      )
      .eq("user_id", user.id)
      .order("is_favorite", { ascending: false })
      .order("times_used", { ascending: false });

    if (boxError) {
      console.error("[fly-box GET] Error:", boxError);
      return NextResponse.json({ error: boxError.message }, { status: 500 });
    }

    return NextResponse.json(boxEntries ?? []);
  } catch (err) {
    console.error("[fly-box GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST — add a canonical fly to user's fly box
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { canonical_fly_id, preferred_sizes, personal_notes, personalizations } = body;

    if (!canonical_fly_id) {
      return NextResponse.json(
        { error: "canonical_fly_id is required" },
        { status: 400 }
      );
    }

    const upsertRow: Record<string, unknown> = {
      user_id: user.id,
      canonical_fly_id,
      preferred_sizes: preferred_sizes || null,
      personal_notes: personal_notes || null,
    };
    if (personalizations && typeof personalizations === "object") {
      upsertRow.personalizations = personalizations;
    }

    const { data, error } = await supabase
      .from("user_fly_box")
      .upsert(upsertRow, { onConflict: "user_id,canonical_fly_id" })
      .select()
      .single();

    if (error) {
      console.error("[fly-box POST] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[fly-box POST]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH — update personalizations / preferred_sizes / notes on an existing
// fly box entry. Identified by canonical_fly_id (per-user uniqueness via the
// user_id, canonical_fly_id composite). Used by the PersonalizeSheet drawer.
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { canonical_fly_id, personalizations, preferred_sizes, personal_notes } = body;
    if (!canonical_fly_id) {
      return NextResponse.json({ error: "canonical_fly_id is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (personalizations !== undefined) updates.personalizations = personalizations;
    if (preferred_sizes !== undefined) updates.preferred_sizes = preferred_sizes;
    if (personal_notes !== undefined) updates.personal_notes = personal_notes;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("user_fly_box")
      .update(updates)
      .eq("user_id", user.id)
      .eq("canonical_fly_id", canonical_fly_id)
      .select()
      .single();

    if (error) {
      console.error("[fly-box PATCH] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[fly-box PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE — remove a fly from user's box
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_fly_box")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[fly-box DELETE] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[fly-box DELETE]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
