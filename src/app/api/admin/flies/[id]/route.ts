/**
 * Admin: PATCH/DELETE a canonical fly.
 *
 * PATCH writes the recipe to BOTH stores so they can never drift:
 *   1. fly_recipe_ingredients (delete-then-insert by canonical_fly_id) — the
 *      structured source of truth read by Workbench, what-can-i-tie, and
 *      inventory matching.
 *   2. flies.materials_list (jsonb) — denormalized read-cache for the
 *      Library detail page (statically rendered, no joins).
 *
 * Both writes use the service-role client because RLS disallows writes to
 * canonical rows for non-submitter users. The conversion helpers in
 * src/lib/flies/recipe-conversion.ts are the single source of truth for
 * shape transforms.
 *
 * DELETE — soft-delete by setting status='rejected' (keeps the row + slug
 * redirect lineage intact). Not exposed in the editor UI.
 */
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import {
  recipeStepsToMaterialSlots,
  recipeStepsToIngredientInserts,
} from "@/lib/flies/recipe-conversion";
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

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const, user };
}

function str(v: unknown): string | undefined {
  return v !== undefined && v !== null ? String(v) : undefined;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

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
        const path = `canonical/${id}/${crypto.randomUUID()}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await service.storage
          .from("fly-pattern-images")
          .upload(path, arrayBuffer, { contentType: file.type, upsert: true });
        if (uploadError) {
          console.error("[admin/flies PATCH] image upload error:", uploadError);
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
    if (type !== undefined && type !== "") updates.category = type.toLowerCase();
    const description = str(body.description);
    if (description !== undefined) updates.description = description;
    const videoUrl = str(body.video_url);
    if (videoUrl !== undefined) updates.video_url = videoUrl || null;
    if (imageUrl) updates.hero_image_url = imageUrl;

    // Parse recipe steps. Prefer `recipe_steps_structured` (camelCase
    // RecipeStep[] — lossless for canonical edit). Fall back to snake_case
    // `recipe_steps` for legacy callers.
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
        console.error("[admin/flies PATCH] recipe_steps parse error:", parseErr);
        return NextResponse.json({ error: "Invalid recipe_steps format" }, { status: 400 });
      }
    }

    updates.updated_at = new Date().toISOString();

    // Step 1 — write fly_recipe_ingredients (Workbench source of truth).
    // Done BEFORE the flies row update so that if anything fails, the
    // updated_at hasn't been bumped yet (caller can retry safely).
    if (stepsForWrite !== null) {
      const { error: delErr } = await service
        .from("fly_recipe_ingredients")
        .delete()
        .eq("canonical_fly_id", id);
      if (delErr) {
        console.error("[admin/flies PATCH] ingredient delete error:", delErr);
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
          console.error("[admin/flies PATCH] ingredient insert error:", insErr);
          return NextResponse.json(
            { error: `Failed to save recipe ingredients: ${insErr.message}` },
            { status: 500 },
          );
        }
      }
    }

    // Step 2 — update flies row (denormalized materials_list cache + metadata).
    const { error } = await service
      .from("flies")
      .update(updates)
      .eq("id", id);
    if (error) {
      console.error("[admin/flies PATCH] update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id, ok: true });
  } catch (err) {
    console.error("[admin/flies PATCH] error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to update fly";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const service = getServiceClient();
  const { error } = await service
    .from("flies")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    console.error("[admin/flies DELETE] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ id, ok: true });
}
