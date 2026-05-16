/**
 * Admin: PATCH/DELETE a canonical fly.
 *
 * PATCH — accepts the same multipart/JSON shape as /api/fishing/flies. Maps
 * RecipeBuilder recipe_steps → materials_list (MaterialSlot[]) and writes
 * back to the `flies` table. Uses the service-role client because RLS
 * disallows writes to canonical rows for non-submitter users.
 *
 * DELETE — soft-delete by setting status='rejected' (keeps the row + slug
 * redirect lineage intact). Not exposed in the editor UI yet, but available
 * for future use.
 */
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { recipeStepsToMaterialSlots } from "@/lib/flies/recipe-conversion";
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

    // recipe_steps_structured (full camelCase RecipeStep[]) → materials_list.
    // Prefer the structured payload; the legacy `recipe_steps` field uses
    // snake_case keys that don't match recipeStepsToMaterialSlots' input
    // shape, so converting it directly produced empty material strings.
    const rawSteps =
      body.recipe_steps_structured !== undefined
        ? body.recipe_steps_structured
        : body.recipe_steps;
    if (rawSteps !== undefined) {
      try {
        const steps: RecipeStep[] =
          typeof rawSteps === "string"
            ? JSON.parse(rawSteps as string)
            : (rawSteps as RecipeStep[]);
        if (Array.isArray(steps)) {
          updates.materials_list = recipeStepsToMaterialSlots(steps);
        }
      } catch (parseErr) {
        console.error("[admin/flies PATCH] recipe_steps parse error:", parseErr);
        return NextResponse.json({ error: "Invalid recipe_steps format" }, { status: 400 });
      }
    }

    updates.updated_at = new Date().toISOString();

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
