/**
 * /api/fishing/flies
 *
 * Legacy URL kept alive for iOS and a handful of web callers (workspace
 * clone, session edit, new-pattern create). All handlers operate on the
 * post-2026-05-15 `flies` table — the old `fly_patterns` / `fly_patterns_v2`
 * paths were dropped in commits b192bf9 / 9c05828.
 *
 *   GET    — single (?id=) or list user's flies (optional ?include_catalog=true)
 *   POST   — create a new private fly, optionally cloning from a canonical
 *            (cloned_from_canonical_id) or forking via personalizations
 *   PATCH  — update an editable fly (owner of private/pending OR admin)
 *   DELETE — soft-archive a fly (?destroy_catches=true to also hard-delete
 *            catches that point at it; default nulls catches.fly_pattern_id)
 *
 * Variant-level fields (bead, body color, hook size, …) used to live on
 * `fly_patterns` columns; post-flatten they live on
 * `user_fly_configurations.slot_overrides`. These handlers don't read or
 * write those columns — iOS already migrated off them in Phase A.
 */
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { checkSubmissionGate, logSubmission } from "@/lib/submission-gate";
import {
  recipeStepsToMaterialSlots,
  recipeStepsToIngredientInserts,
} from "@/lib/flies/recipe-conversion";
import { formTypeToCanonicalCategory } from "@/lib/flies/fly-type-map";
import type { RecipeStep } from "@/components/flies/RecipeBuilder";

// Service role client (bypasses RLS) — lazy init. Typed `any` because the
// Supabase generic insert types collapse to `never` without a schema type.
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

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}

/**
 * Copy an existing Supabase Storage image into the user's fly-pattern-images
 * namespace. Used by the Clone flow so the new fly gets its own image copy
 * rather than referencing the source URL (which could be deleted later).
 *
 * SSRF guard: the source URL MUST be from our own Supabase project's public
 * storage prefix. Anything else returns undefined and the fly saves imageless.
 */
async function copyClonedImage(
  userId: string,
  sourceUrl: string,
): Promise<string | undefined> {
  try {
    const rawProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!rawProjectUrl) {
      console.error("[copyClonedImage] NEXT_PUBLIC_SUPABASE_URL not set");
      return undefined;
    }
    const projectUrl = rawProjectUrl.replace(/\/+$/, "");
    const storagePrefix = `${projectUrl}/storage/v1/object/public/`;
    if (!sourceUrl.startsWith(storagePrefix)) {
      console.error("[copyClonedImage] SSRF check failed", {
        storagePrefix,
        sourceUrlHead: sourceUrl.slice(0, 80),
      });
      return undefined;
    }

    const rest = sourceUrl.slice(storagePrefix.length);
    const slashIdx = rest.indexOf("/");
    if (slashIdx <= 0) {
      console.error("[copyClonedImage] malformed source path", { rest });
      return undefined;
    }
    const sourceBucket = rest.slice(0, slashIdx);
    const rawPath = rest.slice(slashIdx + 1);
    let sourcePath: string;
    try {
      sourcePath = decodeURIComponent(rawPath);
    } catch {
      sourcePath = rawPath;
    }

    const svc = getServiceClient();
    const { data: blob, error: downloadError } = await svc.storage
      .from(sourceBucket)
      .download(sourcePath);
    if (downloadError || !blob) {
      console.error("[copyClonedImage] download failed", {
        bucket: sourceBucket,
        path: sourcePath,
        downloadError,
      });
      return undefined;
    }

    const ext = sourcePath.split(".").pop() || "jpg";
    const destPath = `${userId}/${crypto.randomUUID()}.${ext}`;
    const arrayBuffer = await blob.arrayBuffer();
    const { error: uploadError } = await svc.storage
      .from("fly-pattern-images")
      .upload(destPath, arrayBuffer, {
        contentType: blob.type || "image/jpeg",
        upsert: true,
      });
    if (uploadError) {
      console.error("[copyClonedImage] upload failed", { destPath, uploadError });
      return undefined;
    }
    const {
      data: { publicUrl },
    } = svc.storage.from("fly-pattern-images").getPublicUrl(destPath);
    return publicUrl;
  } catch (e) {
    console.error("[copyClonedImage] unexpected error:", e);
    return undefined;
  }
}

function str(v: unknown): string | undefined {
  return v !== undefined && v !== null ? String(v) : undefined;
}

/**
 * Map a `flies` row into the legacy response shape iOS and the older web
 * surfaces expect. Variant-level columns (bead_*, body_color, …) are
 * intentionally omitted — they don't exist on the flattened model. Pattern-
 * level columns (name/type/description/image/video) and the structured
 * `recipe_ingredients` array carry everything callers actually need.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFlyRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.category,
    category: row.category,
    description: row.description ?? null,
    video_url: row.video_url ?? null,
    image_url: row.hero_image_url ?? null,
    hero_image_url: row.hero_image_url ?? null,
    materials_list: row.materials_list ?? null,
    option_envelope: row.option_envelope ?? null,
    status: row.status,
    submitted_by_user_id: row.submitted_by_user_id,
    parent_canonical_id: null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const singleId = req.nextUrl.searchParams.get("id");
    if (singleId) {
      // RLS gates which rows the caller can see; we filter soft-deletes too.
      const { data, error } = await supabase
        .from("flies")
        .select("*")
        .eq("id", singleId)
        .is("deleted_at", null)
        .maybeSingle();
      if (error) {
        console.error("[fishing/flies GET single]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const [ingredientsRes, profileRes] = await Promise.all([
        supabase
          .from("fly_recipe_ingredients")
          .select("*, material:tying_materials(*)")
          .eq("canonical_fly_id", singleId)
          .order("step_position", { ascending: true }),
        supabase
          .from("profiles")
          .select("username")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      return NextResponse.json({
        ...mapFlyRow(data),
        recipe_ingredients: ingredientsRes.data ?? [],
        parent_canonical: null,
        owner_username:
          (profileRes.data?.username as string | undefined) ?? null,
      });
    }

    // List: every fly the user owns (private/pending/approved by them).
    const { data: ownRows, error: ownErr } = await supabase
      .from("flies")
      .select("*")
      .eq("submitted_by_user_id", user.id)
      .is("deleted_at", null)
      .order("name");
    if (ownErr) {
      console.error("[fishing/flies GET list]", ownErr);
      return NextResponse.json({ error: ownErr.message }, { status: 500 });
    }
    const userFlies = (ownRows ?? []).map(mapFlyRow);

    const includeCatalog =
      req.nextUrl.searchParams.get("include_catalog") === "true";
    if (includeCatalog) {
      const { data: catalogRows } = await supabase
        .from("flies")
        .select("id, name, category, hero_image_url, option_envelope")
        .eq("status", "approved")
        .is("deleted_at", null)
        .order("name");
      const catalogFlies = (catalogRows ?? []).map(
        (f: Record<string, unknown>) => ({
          id: f.id,
          name: f.name,
          category: f.category,
          // The legacy `sizes` array iOS / session-edit expects came from
          // option_envelope.size_choices on the canonical row. Surface
          // both shapes so callers can read whichever they know about.
          sizes:
            (f.option_envelope as { size_choices?: string[] } | null)
              ?.size_choices ?? [],
          heroImageUrl: f.hero_image_url,
          isCanonical: true,
        }),
      );
      return NextResponse.json({ userFlies, catalogFlies });
    }

    return NextResponse.json(userFlies);
  } catch (err) {
    console.error("[fishing/flies GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch fly patterns" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";

    // Personalization-fork path: clone a canonical into a new private fly
    // owned by the user. Used by the "Tie your own version" / PromoteToPattern
    // flow on canonical detail pages.
    if (contentType.includes("application/json")) {
      const peek = (await req.clone().json()) as Record<string, unknown>;
      if (peek.source === "personalization" && peek.canonical_fly_id) {
        return forkCanonicalIntoPrivate(supabase, user.id, peek);
      }
    }

    let body: Record<string, unknown> = {};
    let imageUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;

      for (const [key, value] of formData.entries()) {
        if (key !== "image") body[key] = value;
      }

      // Submission gate runs BEFORE the file upload so we don't burn storage
      // on rejected requests (turnstile failure, rate limit, etc.).
      const adminSubmitter = isAdmin(user.email);
      const gate = await checkSubmissionGate({
        type: "fly_pattern",
        user,
        turnstileToken:
          typeof body.turnstile_token === "string" ? body.turnstile_token : null,
        honeypot: typeof body.website === "string" ? (body.website as string) : null,
        request: req,
        isAdminSubmitter: adminSubmitter,
      });
      if (!gate.ok)
        return NextResponse.json({ error: gate.error }, { status: gate.status });

      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await getServiceClient()
          .storage.from("fly-pattern-images")
          .upload(path, arrayBuffer, {
            contentType: file.type,
            upsert: true,
          });
        if (uploadError) {
          console.error("[flies POST] image upload error:", uploadError);
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
        imageUrl = publicUrl;
      }

      // Clone flow: if no fresh file but the client passed a Supabase Storage
      // URL to copy from, do that here. Strip so it can't leak downstream.
      const cloneFromUrl = body.clone_image_from_url;
      delete body.clone_image_from_url;
      if (
        !imageUrl &&
        typeof cloneFromUrl === "string" &&
        cloneFromUrl.length > 0
      ) {
        imageUrl = await copyClonedImage(user.id, cloneFromUrl);
      }
    } else {
      body = await req.json();
    }

    const materialsText = str(body.materials);
    const baseDescription = str(body.description);
    const composedDescription =
      materialsText && baseDescription
        ? `${baseDescription}\n\nMaterials:\n${materialsText}`
        : materialsText
          ? `Materials:\n${materialsText}`
          : baseDescription;

    // Private namespaced slug so it doesn't collide with approved canonicals.
    const baseSlug = (str(body.name) ?? "fly")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);
    const privateSlug = `${baseSlug || "fly"}-private-${user.id.slice(0, 8)}-${Date.now().toString(36)}`;

    // Clone passthrough: copy structural fields from a source canonical when
    // `cloned_from_canonical_id` is set. User-supplied name/type/notes still win.
    const cloneSourceId = str(body.cloned_from_canonical_id);
    delete body.cloned_from_canonical_id;
    let inheritedMaterials: unknown = undefined;
    let inheritedOptionEnvelope: unknown = undefined;
    let inheritedImitates: string[] | undefined = undefined;
    let inheritedWaterTypes: string[] | undefined = undefined;
    let inheritedVideoUrl: string | undefined = undefined;
    let inheritedCategory: string | undefined = undefined;
    if (cloneSourceId) {
      const { data: src } = await supabase
        .from("flies")
        .select(
          "category, materials_list, option_envelope, imitates, water_types, video_url, hero_image_url",
        )
        .eq("id", cloneSourceId)
        .eq("status", "approved")
        .maybeSingle();
      if (src) {
        inheritedMaterials = src.materials_list;
        inheritedOptionEnvelope = src.option_envelope;
        inheritedImitates = (src.imitates as string[] | null) ?? undefined;
        inheritedWaterTypes = (src.water_types as string[] | null) ?? undefined;
        inheritedVideoUrl = (src.video_url as string | null) ?? undefined;
        inheritedCategory = (src.category as string | null) ?? undefined;
        if (
          !imageUrl &&
          typeof src.hero_image_url === "string" &&
          src.hero_image_url.length > 0
        ) {
          const copied = await copyClonedImage(user.id, src.hero_image_url);
          if (copied) imageUrl = copied;
        }
      }
    }

    const newRow: Record<string, unknown> = {
      slug: privateSlug,
      name: str(body.name),
      category: str(body.type) ?? inheritedCategory,
      description: composedDescription,
      video_url: str(body.video_url) ?? inheritedVideoUrl,
      status: "private",
      submitted_by_user_id: user.id,
      ...(imageUrl ? { hero_image_url: imageUrl } : {}),
      ...(inheritedMaterials !== undefined
        ? { materials_list: inheritedMaterials }
        : {}),
      ...(inheritedOptionEnvelope !== undefined
        ? { option_envelope: inheritedOptionEnvelope }
        : {}),
      ...(inheritedImitates ? { imitates: inheritedImitates } : {}),
      ...(inheritedWaterTypes ? { water_types: inheritedWaterTypes } : {}),
    };
    Object.keys(newRow).forEach(
      (k) => newRow[k] === undefined && delete newRow[k],
    );

    const { data, error } = await supabase
      .from("flies")
      .insert(newRow)
      .select()
      .single();
    if (error) {
      console.error("[flies POST] insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Auto-create a minimal user_fly_configurations row so the new fly is
    // immediately visible in the Patterns hub (which joins through configs).
    // Non-fatal: if this fails, the fly is still saved and the user can
    // configure it manually from the detail page.
    if (data) {
      const { error: cfgError } = await supabase
        .from("user_fly_configurations")
        .insert({
          user_id: user.id,
          fly_id: data.id,
          tied_count: 0,
          bought_count: 0,
          target_count: 0,
          is_favorite: false,
          is_tie_next: false,
        });
      if (cfgError)
        console.error("[flies POST] auto-config insert failed:", cfgError);
    }

    // Save recipe ingredients if a structured recipe was provided. Writes use
    // `canonical_fly_id` — the column was named that way pre-flatten but now
    // just points at any flies.id. Use the service client because the table's
    // RLS limits writes to canonical owners; the gate above (POST = owner of
    // the row we just inserted) already authorised the write.
    if (body.recipe_steps && data) {
      try {
        const steps =
          typeof body.recipe_steps === "string"
            ? JSON.parse(body.recipe_steps as string)
            : body.recipe_steps;
        if (Array.isArray(steps) && steps.length > 0) {
          const inserts = recipeStepsToIngredientInserts(
            steps as RecipeStep[],
            data.id as string,
          );
          const { error: ingredientError } = await getServiceClient()
            .from("fly_recipe_ingredients")
            .insert(inserts);
          if (ingredientError) {
            console.error("[flies POST] ingredient insert:", ingredientError);
            return NextResponse.json(
              { error: `Failed to save recipe: ${ingredientError.message}` },
              { status: 500 },
            );
          }
          // Mirror into materials_list so detail page renders without join.
          const { error: mlErr } = await getServiceClient()
            .from("flies")
            .update({
              materials_list: recipeStepsToMaterialSlots(steps as RecipeStep[]),
            })
            .eq("id", data.id);
          if (mlErr)
            console.error("[flies POST] materials_list backfill:", mlErr);
        }
      } catch (parseErr) {
        console.error("[flies POST] recipe parse:", parseErr);
        return NextResponse.json(
          { error: "Invalid recipe_steps format" },
          { status: 400 },
        );
      }
    }

    const userIsAdmin = isAdmin(user.email);
    if (!userIsAdmin) {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
      const ipHash = ip
        ? Array.from(
            new Uint8Array(
              await crypto.subtle.digest(
                "SHA-256",
                new TextEncoder().encode(
                  ip + (process.env.PHOTO_REVIEW_SECRET ?? ""),
                ),
              ),
            ),
          )
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
            .slice(0, 32)
        : null;
      await logSubmission("fly_pattern", user.id, ipHash);
    }

    return NextResponse.json(mapFlyRow(data));
  } catch (err) {
    console.error("[flies POST]", err);
    return NextResponse.json(
      { error: "Failed to create fly pattern" },
      { status: 500 },
    );
  }
}

/**
 * Fork a canonical fly into a fresh private fly owned by the user. Drops
 * the personalizations payload onto the new row's description so nothing
 * the caller sent is lost, even though we don't (yet) re-render
 * personalizations as structured slot overrides.
 */
async function forkCanonicalIntoPrivate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  body: Record<string, unknown>,
): Promise<NextResponse> {
  const canonicalId = String(body.canonical_fly_id || "");
  if (!canonicalId)
    return NextResponse.json(
      { error: "canonical_fly_id required" },
      { status: 400 },
    );

  const { data: canonical, error: cErr } = await supabase
    .from("flies")
    .select(
      "id, name, slug, category, materials_list, option_envelope, description, hero_image_url, video_url, imitates, water_types",
    )
    .eq("id", canonicalId)
    .eq("status", "approved")
    .maybeSingle();
  if (cErr || !canonical) {
    return NextResponse.json(
      { error: "Canonical fly not found" },
      { status: 404 },
    );
  }

  const baseName = `${canonical.name} — Yours`;
  const baseSlug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  const privateSlug = `${baseSlug || "fly"}-private-${userId.slice(0, 8)}-${Date.now().toString(36)}`;

  // Stash the personalizations payload at the end of the description so
  // anything the user already customised is visible on the new pattern. The
  // intended next step is to re-render these as slot overrides on a
  // user_fly_configurations row; until then this preserves the data.
  const personalizations = body.personalizations;
  const personalizationsNote =
    personalizations && Object.keys(personalizations as object).length > 0
      ? `\n\nPersonalizations:\n${JSON.stringify(personalizations, null, 2)}`
      : "";
  const composedDescription = `${canonical.description ?? ""}${personalizationsNote}`.trim();

  let imageUrl: string | undefined = undefined;
  if (
    typeof canonical.hero_image_url === "string" &&
    canonical.hero_image_url.length > 0
  ) {
    imageUrl = await copyClonedImage(userId, canonical.hero_image_url);
  }

  const insertRow: Record<string, unknown> = {
    slug: privateSlug,
    name: baseName,
    category: canonical.category,
    description: composedDescription || null,
    video_url: canonical.video_url ?? null,
    status: "private",
    submitted_by_user_id: userId,
    inspired_by_fly_id: canonical.id,
    ...(imageUrl ? { hero_image_url: imageUrl } : {}),
    ...(canonical.materials_list
      ? { materials_list: canonical.materials_list }
      : {}),
    ...(canonical.option_envelope
      ? { option_envelope: canonical.option_envelope }
      : {}),
    ...(canonical.imitates ? { imitates: canonical.imitates } : {}),
    ...(canonical.water_types ? { water_types: canonical.water_types } : {}),
  };
  Object.keys(insertRow).forEach(
    (k) => insertRow[k] === undefined && delete insertRow[k],
  );

  const { data, error } = await supabase
    .from("flies")
    .insert(insertRow)
    .select("id, slug, name")
    .single();
  if (error) {
    console.error("[forkCanonicalIntoPrivate] insert:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-config row so the new fly appears in the workspace immediately.
  await supabase.from("user_fly_configurations").insert({
    user_id: userId,
    fly_id: data.id,
    tied_count: 0,
    bought_count: 0,
    target_count: 0,
    is_favorite: false,
    is_tie_next: false,
  });

  return NextResponse.json(
    { pattern_id: data.id, slug: data.slug, name: data.name },
    { status: 201 },
  );
}

export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const service = getServiceClient();
    const viewerIsAdmin = isAdmin(user.email);
    const readClient = viewerIsAdmin ? service : supabase;
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
    const ownerEdit = isOwner && isPrivate;
    const adminEdit = viewerIsAdmin && fly.status === "approved";
    if (!ownerEdit && !adminEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, unknown> = {};
    let imageUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;

      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = ownerEdit
          ? `${user.id}/${crypto.randomUUID()}.${ext}`
          : `canonical/${id}/${crypto.randomUUID()}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await service.storage
          .from("fly-pattern-images")
          .upload(path, arrayBuffer, {
            contentType: file.type,
            upsert: true,
          });
        if (uploadError) {
          console.error("[flies PATCH] image upload:", uploadError);
          return NextResponse.json(
            { error: `Image upload failed: ${uploadError.message}` },
            { status: 500 },
          );
        }
        const {
          data: { publicUrl },
        } = service.storage.from("fly-pattern-images").getPublicUrl(path);
        imageUrl = publicUrl;
      }

      for (const [key, value] of formData.entries()) {
        if (key !== "image") body[key] = value;
      }
    } else {
      body = await req.json();
    }

    // Pattern-level updates only. Variant-level columns no longer exist on the
    // flies table — those moved to user_fly_configurations.slot_overrides in
    // the May-14 cutover, and iOS Phase A migrated off them.
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

    // Parse recipe steps. Prefer structured shape (camelCase RecipeStep[])
    // which round-trips losslessly; fall back to snake_case for legacy.
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
        console.error("[flies PATCH] recipe parse:", parseErr);
        return NextResponse.json(
          { error: "Invalid recipe_steps format" },
          { status: 400 },
        );
      }
    }

    updates.updated_at = new Date().toISOString();

    // 1. Rewrite fly_recipe_ingredients (Workbench source of truth) first.
    //    Use service client because table RLS is canonical-owner-scoped.
    if (stepsForWrite !== null) {
      const { error: delErr } = await service
        .from("fly_recipe_ingredients")
        .delete()
        .eq("canonical_fly_id", id);
      if (delErr) {
        console.error("[flies PATCH] ingredient delete:", delErr);
        return NextResponse.json(
          { error: `Failed to clear recipe: ${delErr.message}` },
          { status: 500 },
        );
      }
      if (stepsForWrite.length > 0) {
        const inserts = recipeStepsToIngredientInserts(stepsForWrite, id);
        const { error: insErr } = await service
          .from("fly_recipe_ingredients")
          .insert(inserts);
        if (insErr) {
          console.error("[flies PATCH] ingredient insert:", insErr);
          return NextResponse.json(
            { error: `Failed to save recipe: ${insErr.message}` },
            { status: 500 },
          );
        }
      }
    }

    // 2. Update flies row. Owner edits go via cookies client so RLS
    //    `flies_update_own_private` enforces owner+status; admin edits on
    //    approved canonicals use service. .select() so a 0-row update
    //    surfaces as a real error rather than a misleading 200.
    const writeClient = ownerEdit ? supabase : service;
    const { data: updated, error: updateErr } = await writeClient
      .from("flies")
      .update(updates)
      .eq("id", id)
      .select("id");
    if (updateErr) {
      console.error("[flies PATCH] update:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
    if (!updated || updated.length === 0) {
      console.warn("[flies PATCH] 0 rows updated — RLS denied?", {
        id,
        ownerEdit,
        adminEdit,
        status: fly.status,
      });
      return NextResponse.json(
        { error: "Update blocked by permissions" },
        { status: 403 },
      );
    }

    return NextResponse.json({ id, ok: true });
  } catch (err) {
    console.error("[flies PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update fly pattern" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const service = getServiceClient();
    const viewerIsAdmin = isAdmin(user.email);

    // Load to choose client + verify permission.
    const readClient = viewerIsAdmin ? service : supabase;
    const { data: fly, error: loadErr } = await readClient
      .from("flies")
      .select("id, status, submitted_by_user_id, deleted_at")
      .eq("id", id)
      .maybeSingle();
    if (loadErr) {
      console.error("[flies DELETE load]", loadErr);
      return NextResponse.json({ error: loadErr.message }, { status: 500 });
    }
    if (!fly) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isOwner = fly.submitted_by_user_id === user.id;
    const isPrivate = fly.status === "private" || fly.status === "pending";
    if (!viewerIsAdmin && !(isOwner && isPrivate)) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // `?destroy_catches=true` hard-deletes the user's catches that reference
    // this fly. Default behavior nulls fly_pattern_id so the catches survive
    // as named-only journal entries.
    const destroyCatches =
      req.nextUrl.searchParams.get("destroy_catches") === "true";

    if (destroyCatches) {
      const { error: catchDelErr } = await supabase
        .from("catches")
        .delete()
        .eq("user_id", user.id)
        .eq("fly_pattern_id", id);
      if (catchDelErr) {
        console.error("[flies DELETE] catch delete:", catchDelErr);
        return NextResponse.json(
          { error: `Failed to delete catches: ${catchDelErr.message}` },
          { status: 500 },
        );
      }
    } else {
      const { error: unlinkErr } = await supabase
        .from("catches")
        .update({ fly_pattern_id: null })
        .eq("fly_pattern_id", id);
      if (unlinkErr) console.error("[flies DELETE] unlink catches:", unlinkErr);
    }

    // Soft-delete the fly row (sets deleted_at). Owner private/pending goes
    // via cookies client so flies_update_own_private RLS enforces it; admins
    // use service for approved canonicals.
    const writeClient =
      viewerIsAdmin && fly.status === "approved" ? service : supabase;
    const { data: updated, error: updateErr } = await writeClient
      .from("flies")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select("id");
    if (updateErr) {
      console.error("[flies DELETE] soft-delete:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: "Delete blocked by permissions" },
        { status: 403 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[flies DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete fly pattern" },
      { status: 500 },
    );
  }
}
