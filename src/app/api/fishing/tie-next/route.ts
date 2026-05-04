import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET — Fetch user's "Tie Next" queue (fly box entries + personal patterns marked is_tie_next)
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [boxResult, patternResult] = await Promise.all([
      supabase
        .from("user_fly_box")
        .select(`
          id,
          canonical_fly_id,
          is_tie_next,
          tie_next_order,
          personal_notes,
          canonical_fly:canonical_flies(id, slug, name, category, hero_image_url, sizes)
        `)
        .eq("user_id", user.id)
        .eq("is_tie_next", true)
        .order("tie_next_order", { ascending: true, nullsFirst: false }),
      supabase
        .from("fly_patterns")
        .select("id, name, type, image_url, size, is_tie_next")
        .eq("user_id", user.id)
        .eq("is_tie_next", true),
    ]);

    if (boxResult.error) {
      console.error("[tie-next GET] box error:", boxResult.error);
      return NextResponse.json({ error: boxResult.error.message }, { status: 500 });
    }
    if (patternResult.error) {
      console.error("[tie-next GET] pattern error:", patternResult.error);
      return NextResponse.json({ error: patternResult.error.message }, { status: 500 });
    }

    return NextResponse.json({
      libraryQueue: boxResult.data ?? [],
      personalQueue: patternResult.data ?? [],
    });
  } catch (err) {
    console.error("[tie-next GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST — Add a fly to the "Tie Next" queue
 * Body: { flyBoxId?: string, flyPatternId?: string, canonicalFlyId?: string, notes?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { flyBoxId, flyPatternId, canonicalFlyId, notes } = body;

    // Add canonical fly to tie-next queue (upsert into fly box)
    if (canonicalFlyId) {
      const updateFields: Record<string, unknown> = {
        is_tie_next: true,
        tie_next_status: "wanted",
      };
      if (notes) updateFields.personal_notes = notes;

      const { data, error } = await supabase
        .from("user_fly_box")
        .upsert(
          { user_id: user.id, canonical_fly_id: canonicalFlyId, ...updateFields },
          { onConflict: "user_id,canonical_fly_id" }
        )
        .select("id")
        .single();

      if (error) {
        console.error("[tie-next POST] upsert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, flyBoxId: data?.id, is_tie_next: true });
    }

    // Toggle existing fly box entry
    if (flyBoxId) {
      const updateFields: Record<string, unknown> = {
        is_tie_next: true,
        tie_next_status: "wanted",
      };
      if (notes) updateFields.personal_notes = notes;

      const { error } = await supabase
        .from("user_fly_box")
        .update(updateFields)
        .eq("id", flyBoxId)
        .eq("user_id", user.id);

      if (error) {
        console.error("[tie-next POST] box update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, flyBoxId, is_tie_next: true });
    }

    // Toggle personal fly pattern
    if (flyPatternId) {
      const { error } = await supabase
        .from("fly_patterns")
        .update({ is_tie_next: true, tie_next_status: "wanted" })
        .eq("id", flyPatternId)
        .eq("user_id", user.id);

      if (error) {
        console.error("[tie-next POST] pattern update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, flyPatternId, is_tie_next: true });
    }

    return NextResponse.json(
      { error: "One of flyBoxId, canonicalFlyId, or flyPatternId is required" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[tie-next POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH — Update tie-next entry. Supports both legacy `completed` toggle and
 * the new `status` state machine ("none" | "wanted" | "at_vise" | "done").
 *
 * Body: { flyBoxId?, flyPatternId?, status?, completed?, order?, notes?, targetQty? }
 *
 * When `status` is provided, it's written to `tie_next_status` and the legacy
 * `is_tie_next` boolean is kept in sync for backward compat.
 */
const VALID_STATUSES = new Set(["none", "wanted", "at_vise", "done"]);

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { flyBoxId, flyPatternId, completed, order, notes, status, targetQty } = body;

    if (status !== undefined && !VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${[...VALID_STATUSES].join(", ")}` },
        { status: 400 }
      );
    }

    if (flyBoxId) {
      const updates: Record<string, unknown> = {};
      if (typeof status === "string") {
        updates.tie_next_status = status;
        updates.is_tie_next = status === "wanted" || status === "at_vise";
      } else if (typeof completed === "boolean") {
        updates.is_tie_next = !completed;
        updates.tie_next_status = completed ? "done" : "wanted";
      }
      if (typeof order === "number") updates.tie_next_order = order;
      if (notes !== undefined) updates.tie_next_notes = notes;
      if (typeof targetQty === "number") updates.tie_next_target_qty = targetQty;

      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No update fields provided" }, { status: 400 });
      }

      const { error } = await supabase
        .from("user_fly_box")
        .update(updates)
        .eq("id", flyBoxId)
        .eq("user_id", user.id);

      if (error) {
        console.error("[tie-next PATCH] box error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, flyBoxId, ...updates });
    }

    if (flyPatternId) {
      const updates: Record<string, unknown> = {};
      if (typeof status === "string") {
        updates.tie_next_status = status;
        updates.is_tie_next = status === "wanted" || status === "at_vise";
      } else if (typeof completed === "boolean") {
        updates.is_tie_next = !completed;
        updates.tie_next_status = completed ? "done" : "wanted";
      }
      if (notes !== undefined) updates.tie_next_notes = notes;
      if (typeof targetQty === "number") updates.tie_next_target_qty = targetQty;

      if (Object.keys(updates).length === 0) {
        return NextResponse.json({ error: "No update fields provided" }, { status: 400 });
      }

      const { error } = await supabase
        .from("fly_patterns")
        .update(updates)
        .eq("id", flyPatternId)
        .eq("user_id", user.id);

      if (error) {
        console.error("[tie-next PATCH] pattern error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, flyPatternId, ...updates });
    }

    return NextResponse.json(
      { error: "One of flyBoxId or flyPatternId is required" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[tie-next PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE — Remove a fly from the tie-next queue
 * Query: ?flyBoxId=xxx or ?flyPatternId=xxx
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const flyBoxId = req.nextUrl.searchParams.get("flyBoxId");
    const flyPatternId = req.nextUrl.searchParams.get("flyPatternId");

    if (flyBoxId) {
      const { error } = await supabase
        .from("user_fly_box")
        .update({ is_tie_next: false, tie_next_order: null, tie_next_status: "none" })
        .eq("id", flyBoxId)
        .eq("user_id", user.id);

      if (error) {
        console.error("[tie-next DELETE] box error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (flyPatternId) {
      const { error } = await supabase
        .from("fly_patterns")
        .update({ is_tie_next: false, tie_next_status: "none" })
        .eq("id", flyPatternId)
        .eq("user_id", user.id);

      if (error) {
        console.error("[tie-next DELETE] pattern error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "flyBoxId or flyPatternId query param is required" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[tie-next DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
