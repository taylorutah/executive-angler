/**
 * PATCH /api/flies/[id] — unified fly edit endpoint.
 *
 * Permission gate (mirrors /flies/[slug]/edit page):
 *   - owner of a private/pending fly  → cookies client (RLS policy
 *     `flies_update_own_private` enforces owner + status)
 *   - admin on an approved canonical  → service-role client (no
 *     user-scoped UPDATE policy applies)
 *   - anyone else                     → 403
 *
 * Writes both stores atomically so they can't drift:
 *   1. fly_recipe_ingredients (delete-then-insert by canonical_fly_id) —
 *      structured source of truth read by Workbench, what-can-i-tie, and
 *      inventory matching. Column is named canonical_fly_id for legacy
 *      reasons; it now points at any flies.id regardless of status.
 *   2. flies.materials_list (jsonb) — denormalized read-cache that the
 *      Library detail page renders directly (no joins).
 *
 * The structured field uses the service client even for owner writes — RLS
 * on fly_recipe_ingredients only allows the canonical owner, but a private
 * fly's owner-edit is logically equivalent and the row was authorised at
 * the gate above.
 */
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import {
  recipeStepsToMaterialSlots,
  recipeStepsToIngredientInserts,
} from "@/lib/flies/recipe-conversion";
import { formTypeToCanonicalCategory } from "@/lib/flies/fly-type-map";
import type { RecipeStep } from "@/components/flies/RecipeBuilder";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _serviceClient: any = null;
function getServiceClient() {
  if (!_serviceClient) {
    _serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _serviceClient;
}

function str(v: unknown): string | undefined {
  return v !== undefined && v !== null ? String(v) : undefined;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load row to decide permission branch + which client to write with.
  // The user can SELECT private/pending rows they own via RLS; admins read
  // everything via service for safety on approved canonicals.
  const viewerIsAdmin = isAdmin(user.email);
  const readClient = viewerIsAdmin ? getServiceClient() : supabase;
  const { data: fly, error: loadErr } = await readClient
    .from("flies")
    .select("id, status, submitted_by_user_id, deleted_at")
    .eq("id", id)
    .maybeSingle();
  if (loadErr) {
    console.error("[flies PATCH load]", loadErr);
    return NextResponse.json({ error: loadErr.message }, { status: 500 });
  }
  if (!fly || fly.deleted_at) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = fly.submitted_by_user_id === user.id;
  const isPrivate = fly.status === "private" || fly.status === "pending";
  const isApprovedCanonical = fly.status === "approved";
  const ownerEdit = isOwner && isPrivate;
  const adminEdit = viewerIsAdmin && isApprovedCanonical;
  if (!ownerEdit && !adminEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, unknown> = {};
    let imageUrl: string | undefined;
    const service = getServiceClient();

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;

      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        // Owner edits store under user/<uid>/<uuid>; canonical edits keep the
        // legacy `canonical/<flyId>/` prefix so existing audit tooling still
        // groups them correctly.
        const path = ownerEdit
          ? `${user.id}/${crypto.randomUUID()}.${ext}`
          : `canonical/${id}/${crypto.randomUUID()}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await service.storage
          .from("fly-pattern-images")
          .upload(path, arrayBuffer, { contentType: file.type, upsert: true });
        if (uploadError) {
          console.error("[flies PATCH] image upload error:", uploadError);
          return NextResponse.json(
            { error: `Image upload failed: ${uploadError.message}` },
            { status: 500 },
          );
        }
        const { data: { publicUrl } } = service.storage
          .from("fly-pattern-images")
          .getPublicUrl(path);
        imageUrl = publicUrl;
      }

      for (const [key, value] of formData.entries()) {
        if (key !== "image") body[key] = value;
      }
    } else {
      body = await req.json();
    }

    // Build column updates for the flies row.
    const updates: Record<string, unknown> = {};
    const name = str(body.name);
    if (name !== undefined) updates.name = name;
    const type = str(body.type);
    if (type !== undefined && type !== "") {
      updates.category = formTypeToCanonicalCategory(type);
    }
    const description = str(body.description);
    if (description !== undefined) updates.description = description;
    const videoUrl = str(body.video_url);
    if (videoUrl !== undefined) updates.video_url = videoUrl || null;
    if (imageUrl) updates.hero_image_url = imageUrl;

    // Parse recipe steps. Prefer `recipe_steps_structured` (camelCase
    // RecipeStep[] — lossless). Fall back to snake_case `recipe_steps`
    // for legacy callers.
    const rawSteps =
      body.recipe_steps_structured !== undefined
        ? body.recipe_steps_structured
        : body.recipe_steps;

    let stepsForWrite: RecipeStep[] | null = null;
    if (rawSteps !== undefined) {
      try {
        const parsed =
          typeof rawSteps === "string"
            ? JSON.parse(rawSteps as string)
            : rawSteps;
        if (!Array.isArray(parsed)) {
          return NextResponse.json(
            { error: "recipe_steps must be an array" },
            { status: 400 },
          );
        }
        stepsForWrite = parsed as RecipeStep[];
        updates.materials_list = recipeStepsToMaterialSlots(stepsForWrite);
      } catch (parseErr) {
        console.error("[flies PATCH] recipe_steps parse error:", parseErr);
        return NextResponse.json({ error: "Invalid recipe_steps format" }, { status: 400 });
      }
    }

    updates.updated_at = new Date().toISOString();

    // Step 1 — write fly_recipe_ingredients (Workbench source of truth).
    // Done BEFORE the flies row update so a failure leaves updated_at
    // untouched and the caller can retry safely. RLS on this table only
    // permits canonical owner writes, so we always use the service client
    // here — the permission gate at the top already authorised this edit.
    if (stepsForWrite !== null) {
      const { error: delErr } = await service
        .from("fly_recipe_ingredients")
        .delete()
        .eq("canonical_fly_id", id);
      if (delErr) {
        console.error("[flies PATCH] ingredient delete error:", delErr);
        return NextResponse.json(
          { error: `Failed to clear existing recipe: ${delErr.message}` },
          { status: 500 },
        );
      }
      if (stepsForWrite.length > 0) {
        const inserts = recipeStepsToIngredientInserts(stepsForWrite, id);
        const { error: insErr } = await service
          .from("fly_recipe_ingredients")
          .insert(inserts);
        if (insErr) {
          console.error("[flies PATCH] ingredient insert error:", insErr);
          return NextResponse.json(
            { error: `Failed to save recipe ingredients: ${insErr.message}` },
            { status: 500 },
          );
        }
      }
    }

    // Step 2 — update flies row. Owner edits go through the cookies client
    // so the flies_update_own_private RLS policy enforces owner + status;
    // admin edits on approved canonicals use the service client because no
    // user-scoped UPDATE policy permits them. `.select()` so a zero-row
    // update (RLS denied, race) surfaces as a real error.
    const writeClient = ownerEdit ? supabase : service;
    const { data: updated, error: updateErr } = await writeClient
      .from("flies")
      .update(updates)
      .eq("id", id)
      .select("id");
    if (updateErr) {
      console.error("[flies PATCH] update error:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
    if (!updated || updated.length === 0) {
      console.warn(
        "[flies PATCH] 0 rows updated — RLS denied?",
        { id, ownerEdit, adminEdit, status: fly.status },
      );
      return NextResponse.json(
        { error: "Update blocked by permissions" },
        { status: 403 },
      );
    }

    return NextResponse.json({ id, ok: true });
  } catch (err) {
    console.error("[flies PATCH] error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to update fly";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
