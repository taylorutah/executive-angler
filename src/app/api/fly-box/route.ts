import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { checkPremium } from "@/lib/admin";

// Service-role client for storage uploads (bypasses RLS). Lazy so the build
// doesn't fail when SUPABASE_SERVICE_ROLE_KEY is absent.
let _serviceClient: ReturnType<typeof createServiceClient> | null = null;
function getServiceClient() {
  if (!_serviceClient) {
    _serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _serviceClient;
}

// Multi-variant fly box (post-2026-05-07):
//
// Each row in user_fly_box is ONE variant the angler maintains — e.g. "Olive
// 18 with 2.0mm bead" — and an angler can have many rows per canonical fly.
// At most one row per (user, canonical_fly) is marked is_primary = true; that
// is the default-shown variant on the canonical page when no ?variant param
// is set.
//
// API conventions:
//   GET                                  — full box (all variants for all flies; for /my-flies)
//   GET ?canonical_fly_id=X              — variants of one canonical (chip strip)
//   POST                                 — always creates a new variant
//   PATCH ?id=<row-id>                   — id-based update (preferred)
//   PATCH (formdata, no id)              — image upload, targets primary variant for back-compat
//   DELETE ?id=<row-id>                  — drops one variant; auto-promotes next on primary loss

// GET — fetch user's fly box. Optional canonical_fly_id filters to one canonical's variants.
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const canonicalFlyId = searchParams.get("canonical_fly_id");

    let query = supabase
      .from("user_fly_box")
      .select(
        `
        *,
        canonical_fly:canonical_flies(id, slug, name, category, tagline, description, sizes, colors, bead_options, hook_styles, imitates, hero_image_url, icon_url, video_url, rank)
      `,
      )
      .eq("user_id", user.id);

    if (canonicalFlyId) {
      // Chip-strip mode: one canonical's variants, primary first then sort_order.
      query = query
        .eq("canonical_fly_id", canonicalFlyId)
        .order("is_primary", { ascending: false })
        .order("variant_sort_order", { ascending: true })
        .order("added_at", { ascending: true });
    } else {
      // /my-flies mode: full box ordered the way the user expects.
      query = query
        .order("is_favorite", { ascending: false })
        .order("times_used", { ascending: false });
    }

    const { data: boxEntries, error: boxError } = await query;

    if (boxError) {
      console.error("[fly-box GET] Error:", boxError);
      return NextResponse.json({ error: boxError.message }, { status: 500 });
    }

    return NextResponse.json(boxEntries ?? []);
  } catch (err) {
    console.error("[fly-box GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST — create a new variant. Always inserts (no upsert). If this is the
// first variant for (user, canonical_fly), auto-set is_primary = true.
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      canonical_fly_id,
      preferred_sizes,
      preferred_colors,
      personal_notes,
      personalizations,
      variant_label,
      custom_name,
      tie_next_status,
      tie_next_target_qty,
      tie_next_notes,
      tied_count,
    } = body;

    if (!canonical_fly_id) {
      return NextResponse.json(
        { error: "canonical_fly_id is required" },
        { status: 400 },
      );
    }

    // Auto-promote to primary when no other variant of this canonical exists.
    const { count: existingCount } = await supabase
      .from("user_fly_box")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("canonical_fly_id", canonical_fly_id);
    const isFirstVariant = (existingCount ?? 0) === 0;

    // Compute the next sort order so chips append at the end.
    let nextSortOrder = 0;
    if (!isFirstVariant) {
      const { data: maxRow } = await supabase
        .from("user_fly_box")
        .select("variant_sort_order")
        .eq("user_id", user.id)
        .eq("canonical_fly_id", canonical_fly_id)
        .order("variant_sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      nextSortOrder = ((maxRow?.variant_sort_order as number | null) ?? 0) + 1;
    }

    const insertRow: Record<string, unknown> = {
      user_id: user.id,
      canonical_fly_id,
      preferred_sizes: preferred_sizes ?? null,
      preferred_colors: preferred_colors ?? null,
      personal_notes: personal_notes ?? null,
      variant_label: variant_label ?? null,
      custom_name: custom_name ?? null,
      is_primary: isFirstVariant,
      variant_sort_order: nextSortOrder,
    };
    if (personalizations && typeof personalizations === "object") {
      insertRow.personalizations = personalizations;
    }
    if (tie_next_status !== undefined) insertRow.tie_next_status = tie_next_status;
    if (tie_next_target_qty !== undefined)
      insertRow.tie_next_target_qty = tie_next_target_qty;
    if (tie_next_notes !== undefined) insertRow.tie_next_notes = tie_next_notes;
    if (tied_count !== undefined) insertRow.tied_count = tied_count;

    const { data, error } = await supabase
      .from("user_fly_box")
      .insert(insertRow)
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
      { status: 500 },
    );
  }
}

// PATCH — id-based update. Two transports:
//   - JSON body with `id`: updates fields on that variant
//   - multipart/form-data: image upload. Targets `id` if present, else falls
//     back to canonical_fly_id + primary variant. Pro-gated.
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = request.headers.get("content-type") || "";
    const updates: Record<string, unknown> = {};
    let targetId: string | undefined;
    let fallbackCanonicalFlyId: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const isPro = await checkPremium(supabase, user.id, user.email);
      if (!isPro) {
        return NextResponse.json(
          { error: "Personal photos on canonical flies require Pro." },
          { status: 403 },
        );
      }

      const formData = await request.formData();
      const idField = String(formData.get("id") || "");
      const canonicalField = String(formData.get("canonical_fly_id") || "");
      if (idField) targetId = idField;
      else if (canonicalField) fallbackCanonicalFlyId = canonicalField;
      else
        return NextResponse.json(
          { error: "id or canonical_fly_id is required" },
          { status: 400 },
        );

      const file = formData.get("image") as File | null;
      if (!file || file.size === 0) {
        return NextResponse.json(
          { error: "image file is required" },
          { status: 400 },
        );
      }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const folder = targetId
        ? `variant-${targetId}`
        : `canonical-${fallbackCanonicalFlyId}`;
      const path = `${user.id}/${folder}/${crypto.randomUUID()}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await getServiceClient()
        .storage.from("fly-pattern-images")
        .upload(path, arrayBuffer, {
          contentType: file.type,
          upsert: true,
        });
      if (uploadError) {
        console.error("[fly-box PATCH] image upload error:", uploadError);
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError.message}` },
          { status: 500 },
        );
      }
      const {
        data: { publicUrl },
      } = getServiceClient()
        .storage.from("fly-pattern-images")
        .getPublicUrl(path);
      updates.custom_image_url = publicUrl;
    } else {
      const body = await request.json();
      const url = new URL(request.url);
      targetId = url.searchParams.get("id") ?? body.id;
      if (!targetId) {
        // Back-compat: PATCH by canonical_fly_id targets the primary variant.
        fallbackCanonicalFlyId = body.canonical_fly_id;
      }
      if (!targetId && !fallbackCanonicalFlyId) {
        return NextResponse.json(
          { error: "id or canonical_fly_id is required" },
          { status: 400 },
        );
      }
      const {
        personalizations,
        preferred_sizes,
        preferred_colors,
        personal_notes,
        custom_name,
        custom_image_url,
        variant_label,
        is_primary,
        tie_next_status,
        tie_next_target_qty,
        tie_next_notes,
        tied_count,
      } = body;
      if (personalizations !== undefined) updates.personalizations = personalizations;
      if (preferred_sizes !== undefined) updates.preferred_sizes = preferred_sizes;
      if (preferred_colors !== undefined) updates.preferred_colors = preferred_colors;
      if (personal_notes !== undefined) updates.personal_notes = personal_notes;
      if (custom_name !== undefined) updates.custom_name = custom_name;
      if (variant_label !== undefined) updates.variant_label = variant_label;
      if (custom_image_url === null) updates.custom_image_url = null;
      if (tie_next_status !== undefined) updates.tie_next_status = tie_next_status;
      if (tie_next_target_qty !== undefined)
        updates.tie_next_target_qty = tie_next_target_qty;
      if (tie_next_notes !== undefined) updates.tie_next_notes = tie_next_notes;
      if (tied_count !== undefined) updates.tied_count = tied_count;
      // is_primary is handled separately (must demote prior primary).
      if (is_primary === true) {
        // Resolve target row first to find canonical_fly_id for demotion scope.
        const targetRow = await resolveTargetRow(
          supabase,
          user.id,
          targetId,
          fallbackCanonicalFlyId,
        );
        if (!targetRow)
          return NextResponse.json(
            { error: "Variant not found" },
            { status: 404 },
          );
        await demoteOtherPrimaries(
          supabase,
          user.id,
          targetRow.canonical_fly_id,
          targetRow.fly_pattern_id,
          targetRow.id,
        );
        updates.is_primary = true;
        targetId = targetRow.id;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    let updateQuery = supabase
      .from("user_fly_box")
      .update(updates)
      .eq("user_id", user.id);
    if (targetId) {
      updateQuery = updateQuery.eq("id", targetId);
    } else if (fallbackCanonicalFlyId) {
      // Target the primary variant for back-compat (PersonalizeSheet edit
      // path that still passes canonical_fly_id).
      updateQuery = updateQuery
        .eq("canonical_fly_id", fallbackCanonicalFlyId)
        .eq("is_primary", true);
    }

    const { data, error } = await updateQuery.select().single();

    if (error) {
      console.error("[fly-box PATCH] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("[fly-box PATCH]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE — remove one variant by id. If it was primary and other variants
// exist for the same canonical, promote the next-by-sort_order to primary.
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
    if (!id)
      return NextResponse.json({ error: "id is required" }, { status: 400 });

    // Fetch the row so we know whether to promote a successor.
    const { data: row } = await supabase
      .from("user_fly_box")
      .select("id, canonical_fly_id, fly_pattern_id, is_primary")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!row)
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });

    const wasPrimary = !!row.is_primary;

    const { error } = await supabase
      .from("user_fly_box")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[fly-box DELETE] Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (wasPrimary) {
      // Find the next variant to promote (oldest, then earliest sort).
      const successorScope = row.canonical_fly_id
        ? { col: "canonical_fly_id" as const, value: row.canonical_fly_id as string }
        : row.fly_pattern_id
        ? { col: "fly_pattern_id" as const, value: row.fly_pattern_id as string }
        : null;
      if (successorScope) {
        const { data: next } = await supabase
          .from("user_fly_box")
          .select("id")
          .eq("user_id", user.id)
          .eq(successorScope.col, successorScope.value)
          .order("variant_sort_order", { ascending: true })
          .order("added_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (next?.id) {
          await supabase
            .from("user_fly_box")
            .update({ is_primary: true })
            .eq("id", next.id)
            .eq("user_id", user.id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[fly-box DELETE]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ── helpers ──────────────────────────────────────────────────────────────

async function resolveTargetRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  id: string | undefined,
  canonicalFlyId: string | undefined,
): Promise<{
  id: string;
  canonical_fly_id: string | null;
  fly_pattern_id: string | null;
} | null> {
  if (id) {
    const { data } = await supabase
      .from("user_fly_box")
      .select("id, canonical_fly_id, fly_pattern_id")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    return (data as { id: string; canonical_fly_id: string | null; fly_pattern_id: string | null } | null) ?? null;
  }
  if (canonicalFlyId) {
    const { data } = await supabase
      .from("user_fly_box")
      .select("id, canonical_fly_id, fly_pattern_id")
      .eq("canonical_fly_id", canonicalFlyId)
      .eq("user_id", userId)
      .eq("is_primary", true)
      .maybeSingle();
    return (data as { id: string; canonical_fly_id: string | null; fly_pattern_id: string | null } | null) ?? null;
  }
  return null;
}

async function demoteOtherPrimaries(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  canonicalFlyId: string | null,
  flyPatternId: string | null,
  exceptId: string,
) {
  if (canonicalFlyId) {
    await supabase
      .from("user_fly_box")
      .update({ is_primary: false })
      .eq("user_id", userId)
      .eq("canonical_fly_id", canonicalFlyId)
      .eq("is_primary", true)
      .neq("id", exceptId);
  } else if (flyPatternId) {
    await supabase
      .from("user_fly_box")
      .update({ is_primary: false })
      .eq("user_id", userId)
      .eq("fly_pattern_id", flyPatternId)
      .eq("is_primary", true)
      .neq("id", exceptId);
  }
}
