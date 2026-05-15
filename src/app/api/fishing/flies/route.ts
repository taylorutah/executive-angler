import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { checkSubmissionGate, logSubmission } from "@/lib/submission-gate";
import {
  mapTypeToCategory,
  promoteToCanonical,
} from "@/lib/flies/promote-canonical";

// Service role client for storage uploads (bypasses RLS) — lazy init to avoid build-time errors
let _serviceClient: ReturnType<typeof createServiceClient> | null = null;
function getServiceClient() {
  if (!_serviceClient) {
    _serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const singleId = req.nextUrl.searchParams.get("id");
    if (singleId) {
      const { data, error } = await supabase
        .from("fly_patterns")
        .select("*")
        .eq("id", singleId)
        .eq("user_id", user.id)
        .single();
      if (error) {
        console.error("Failed to fetch fly pattern:", error);
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      // Pull recipe ingredients + (optional) parent canonical + viewer
      // profile so the editor can hydrate the structured RecipeBuilder,
      // render a lineage card, and link back to the detail page.
      const [ingredientsRes, parentRes, profileRes] = await Promise.all([
        supabase
          .from("fly_recipe_ingredients")
          .select("*, material:tying_materials(*)")
          .eq("fly_pattern_id", singleId)
          .order("step_position", { ascending: true }),
        data?.parent_canonical_id
          ? supabase
              .from("canonical_flies")
              .select("id, slug, name")
              .eq("id", data.parent_canonical_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null } as const),
        supabase
          .from("profiles")
          .select("username")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      return NextResponse.json({
        ...data,
        recipe_ingredients: ingredientsRes.data ?? [],
        parent_canonical: parentRes.data ?? null,
        owner_username: (profileRes.data?.username as string | undefined) ?? null,
      });
    }

    const { data, error } = await supabase
      .from("fly_patterns")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) {
      console.error("Failed to fetch fly patterns:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also fetch canonical flies from the library catalog
    const includeCatalog = req.nextUrl.searchParams.get("include_catalog") === "true";
    if (includeCatalog) {
      const { data: catalog } = await supabase
        .from("canonical_flies")
        .select("id, name, category, sizes, hero_image_url")
        .order("name");

      return NextResponse.json({
        userFlies: data ?? [],
        catalogFlies: (catalog ?? []).map((f: Record<string, unknown>) => ({
          id: f.id,
          name: f.name,
          category: f.category,
          sizes: f.sizes,
          heroImageUrl: f.hero_image_url,
          isCanonical: true,
        })),
      });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Fly patterns GET error:", err);
    return NextResponse.json({ error: "Failed to fetch fly patterns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";

    // Personalization-fork path: clone canonical + the user's personalizations
    // into a fresh fly_patterns row owned by the user. Used by
    // PromoteToPatternPrompt when a user's overrides have grown beyond what
    // a simple personalization should hold.
    if (contentType.includes("application/json")) {
      const peek = (await req.clone().json()) as Record<string, unknown>;
      if (peek.source === "personalization" && peek.canonical_fly_id) {
        return forkPersonalizationToPattern(supabase, user.id, peek);
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
        turnstileToken: typeof body.turnstile_token === "string" ? body.turnstile_token : null,
        honeypot: typeof body.website === "string" ? (body.website as string) : null,
        request: req,
        isAdminSubmitter: adminSubmitter,
      });
      if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await getServiceClient().storage
          .from("fly-pattern-images")
          .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          return NextResponse.json(
            { error: `Image upload failed: ${uploadError.message}` },
            { status: 500 },
          );
        }
        const { data: { publicUrl } } = getServiceClient().storage
          .from("fly-pattern-images")
          .getPublicUrl(path);
        imageUrl = publicUrl;
      }
    } else {
      body = await req.json();
    }

    // Parse array fields
    const parseArr = (v: unknown) =>
      typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : v;

    const str = (v: unknown) => (v !== undefined && v !== null ? String(v) : undefined);

    const num = (v: unknown) => {
      if (v === undefined || v === null || v === "") return undefined;
      const n = typeof v === "number" ? v : parseFloat(String(v));
      return Number.isFinite(n) ? n : undefined;
    };

    // Post-Phase-C: inserts go to `flies` with status='private'. The user
    // can submit it for canonical review later. Variant-level fields
    // (size, bead, color) live on user_fly_configurations and are added
    // separately from the fly's detail page.
    const materialsText = str(body.materials);
    const baseDescription = str(body.description);
    const composedDescription =
      materialsText && baseDescription
        ? `${baseDescription}\n\nMaterials:\n${materialsText}`
        : (materialsText ? `Materials:\n${materialsText}` : baseDescription);

    // Generate a private namespaced slug so it doesn't collide with
    // approved canonicals.
    const baseSlug = (str(body.name) ?? "fly")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);
    const privateSlug = `${baseSlug || "fly"}-private-${user.id.slice(0, 8)}-${Date.now().toString(36)}`;

    const v3Row: Record<string, unknown> = {
      slug: privateSlug,
      name: str(body.name),
      category: str(body.type),
      description: composedDescription,
      video_url: str(body.video_url),
      status: "private",
      submitted_by_user_id: user.id,
      ...(imageUrl ? { hero_image_url: imageUrl } : {}),
    };
    Object.keys(v3Row).forEach((k) => v3Row[k] === undefined && delete v3Row[k]);

    const { data, error } = await supabase
      .from("flies")
      .insert(v3Row)
      .select()
      .single();

    if (error) {
      console.error("Failed to create fly pattern:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Suppress unused-warning for legacy helpers no longer used in the
    // post-Phase-C insert path.
    void num;
    void parseArr;

    // Save recipe ingredients if structured recipe was provided
    let recipeStepsJson: unknown = null;
    if (body.recipe_steps && data) {
      try {
        const steps = typeof body.recipe_steps === 'string'
          ? JSON.parse(body.recipe_steps as string)
          : body.recipe_steps;
        recipeStepsJson = steps;

        if (Array.isArray(steps) && steps.length > 0) {
          const ingredients = steps.map((s: Record<string, unknown>) => ({
            fly_pattern_id: data.id,
            material_id: s.material_id || null,
            material_name: s.material_name || null,
            step_position: s.step_position,
            role: s.role,
            color_choice: s.color_choice || null,
            size_choice: s.size_choice || null,
            quantity: s.quantity || null,
            notes: s.notes || null,
            is_optional: s.is_optional || false,
          }));

          const { error: ingredientError } = await supabase
            .from('fly_recipe_ingredients')
            .insert(ingredients);

          if (ingredientError) {
            console.error("Failed to save recipe ingredients:", ingredientError);
            return NextResponse.json({ error: "Failed to save recipe ingredients: " + ingredientError.message }, { status: 500 });
          }
        }
      } catch (parseErr) {
        console.error("Failed to parse recipe steps:", parseErr);
        return NextResponse.json({ error: "Invalid recipe_steps format" }, { status: 400 });
      }
    }

    // Post-Phase-C: library promotion goes through the dedicated
    // /api/fishing/flies/submit-to-library endpoint, not this create
    // endpoint. New flies always land as status='private'. The user
    // can submit to library separately from the fly detail page.
    void recipeStepsJson;
    const userIsAdmin = isAdmin(user.email);

    // Log the rate-limit row only after writes succeeded.
    if (!userIsAdmin) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
      const ipHash = ip
        ? Array.from(new Uint8Array(
            await crypto.subtle.digest(
              "SHA-256",
              new TextEncoder().encode(ip + (process.env.PHOTO_REVIEW_SECRET ?? ""))
            )
          ))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
            .slice(0, 32)
        : null;
      await logSubmission("fly_pattern", user.id, ipHash);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Fly patterns POST error:", err);
    return NextResponse.json({ error: "Failed to create fly pattern" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, unknown> = {};
    let imageUrl: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload in PATCH (e.g. replacing fly photo)
      const formData = await req.formData();
      const file = formData.get("image") as File | null;

      if (file && file.size > 0) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await getServiceClient().storage
          .from("fly-pattern-images")
          .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

        if (uploadError) {
          // Surface the failure — silently dropping image_url here was making
          // edits look successful while the photo never made it through.
          console.error("Image upload error:", uploadError);
          return NextResponse.json(
            { error: `Image upload failed: ${uploadError.message}` },
            { status: 500 },
          );
        }
        const { data: { publicUrl } } = getServiceClient().storage
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

    // Parse array fields — same logic as POST so DB columns get proper arrays
    const parseArr = (v: unknown) =>
      typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : v;

    const str = (v: unknown) => (v !== undefined ? String(v) : undefined);

    const num = (v: unknown) => {
      if (v === undefined || v === null || v === "") return undefined;
      const n = typeof v === "number" ? v : parseFloat(String(v));
      return Number.isFinite(n) ? n : undefined;
    };

    // v2 patch: only pattern-level fields. Variant-level fields (size, hook,
    // bead, body_color, etc.) go through the variant editor on the detail
    // page. Materials free-text is folded into description for storage.
    const materialsText = str(body.materials);
    const baseDescription = str(body.description);
    const composedDescription =
      materialsText && baseDescription
        ? `${baseDescription}\n\nMaterials:\n${materialsText}`
        : (materialsText ? `Materials:\n${materialsText}` : baseDescription);
    const updates: Record<string, unknown> = {
      name: str(body.name),
      category: str(body.type),
      description: composedDescription,
      video_url: str(body.video_url),
      ...(imageUrl ? { hero_image_url: imageUrl } : {}),
    };

    // Remove undefined values so we only update fields that were sent
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    // Silence unused warnings — these helpers were used by legacy variant-level
    // fields that the v2 model no longer accepts at the pattern level.
    void parseArr;
    void num;

    const { error } = await supabase
      .from("fly_patterns_v2")
      .update(updates)
      .eq("id", id)
      .eq("owner_user_id", user.id);

    if (error) {
      console.error("Failed to update fly pattern:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Replace recipe ingredients atomically when the client sent a fresh set.
    // Delete-then-insert is intentional — saves us a row-by-row diff and the
    // worst case is the ingredient table is briefly empty for this pattern.
    if (body.recipe_steps !== undefined) {
      try {
        const steps = typeof body.recipe_steps === "string"
          ? JSON.parse(body.recipe_steps as string)
          : body.recipe_steps;

        if (Array.isArray(steps)) {
          const { error: deleteError } = await supabase
            .from("fly_recipe_ingredients")
            .delete()
            .eq("fly_pattern_id", id);
          if (deleteError) {
            console.error("Failed to delete old recipe ingredients:", deleteError);
            return NextResponse.json({ error: "Failed to update recipe: " + deleteError.message }, { status: 500 });
          }

          if (steps.length > 0) {
            const ingredients = steps.map((s: Record<string, unknown>) => ({
              fly_pattern_id: id,
              material_id: s.material_id || null,
              material_name: s.material_name || null,
              step_position: s.step_position,
              role: s.role,
              color_choice: s.color_choice || null,
              size_choice: s.size_choice || null,
              quantity: s.quantity || null,
              notes: s.notes || null,
              is_optional: s.is_optional || false,
            }));
            const { error: insertError } = await supabase
              .from("fly_recipe_ingredients")
              .insert(ingredients);
            if (insertError) {
              console.error("Failed to reinsert recipe ingredients:", insertError);
              return NextResponse.json({ error: "Failed to save recipe ingredients: " + insertError.message }, { status: 500 });
            }
          }

          // Legacy `has_structured_recipe` flag has no v2 equivalent —
          // consumers should derive presence from fly_recipe_ingredients count.
        }
      } catch (parseErr) {
        console.error("Failed to parse recipe steps in PATCH:", parseErr);
        return NextResponse.json({ error: "Invalid recipe_steps format" }, { status: 400 });
      }
    }

    return NextResponse.json({ id });
  } catch (err) {
    console.error("Fly patterns PATCH error:", err);
    return NextResponse.json({ error: "Failed to update fly pattern" }, { status: 500 });
  }
}

// Map canonical category → fly_patterns.type label.
const CATEGORY_TO_TYPE: Record<string, string> = {
  dry: "Dry Fly",
  nymph: "Nymph",
  streamer: "Streamer",
  emerger: "Emerger",
  wet: "Wet Fly",
  terrestrial: "Terrestrial",
  egg: "Egg",
  midge: "Midge",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80) || "fly";
}

async function ensureUniquePatternSlug(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  baseSlug: string,
): Promise<string> {
  const base = baseSlug || "fly";
  for (let i = 1; i < 100; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    const { data } = await supabase
      .from("fly_patterns_v2")
      .select("id")
      .eq("owner_user_id", userId)
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now()}`;
}

function pickPersonal(
  personalizations: Record<string, Record<string, string | undefined> | undefined>,
  slot: string,
  key: string,
): string | undefined {
  const s = personalizations[slot];
  if (!s) return undefined;
  const v = s[key];
  return v && String(v).trim() !== "" ? String(v).trim() : undefined;
}

async function forkPersonalizationToPattern(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  body: Record<string, unknown>,
): Promise<NextResponse> {
  const canonicalId = String(body.canonical_fly_id || "");
  const personalizations = ((body.personalizations as Record<string, Record<string, string | undefined> | undefined>) || {});

  // Load canonical so we can copy its content into the new fly_pattern row.
  // Note: fork comes from either the legacy /flies/[slug] page (canonical_flies)
  // or the v2 detail page (fly_patterns_v2 — same id as canonical_flies after
  // the Phase 2 backfill). Either id resolves the same row.
  const { data: canonical, error: canonicalError } = await supabase
    .from("canonical_flies")
    .select(
      "id, name, slug, category, sizes, colors, materials_list, description, tagline, hero_image_url, video_url, imitates, effective_species, water_types",
    )
    .eq("id", canonicalId)
    .maybeSingle();

  if (canonicalError || !canonical) {
    return NextResponse.json({ error: "Canonical fly not found" }, { status: 404 });
  }

  // Pull the user's preferred image / sizes from their fly box, if present.
  const { data: flyBox } = await supabase
    .from("user_fly_box")
    .select("custom_image_url, custom_name, preferred_sizes, personal_notes")
    .eq("user_id", userId)
    .eq("canonical_fly_id", canonicalId)
    .maybeSingle();

  const baseName = (flyBox?.custom_name as string | undefined) || `${canonical.name} — Yours`;
  const slug = await ensureUniquePatternSlug(
    supabase,
    userId,
    slugify(baseName),
  );

  // Flatten canonical materials into the legacy `materials` text column so
  // existing pattern UIs can render. Override individual fields from
  // personalizations where available.
  const materialsText = Array.isArray(canonical.materials_list)
    ? (canonical.materials_list as { material: string; description?: string }[])
        .map((m) => `${m.material}: ${m.description || ""}`)
        .join("\n")
    : "";

  const sizes = (flyBox?.preferred_sizes as string[] | null) || canonical.sizes || [];
  const beadSize =
    pickPersonal(personalizations, "bead", "size") ||
    pickPersonal(personalizations, "bead", "model") ||
    "";
  const beadColor = pickPersonal(personalizations, "bead", "color") || "";
  const hookText =
    [
      pickPersonal(personalizations, "hook", "brand"),
      pickPersonal(personalizations, "hook", "style"),
      pickPersonal(personalizations, "hook", "model"),
      pickPersonal(personalizations, "hook", "size"),
    ]
      .filter(Boolean)
      .join(" ") || "";
  const bodyColor = pickPersonal(personalizations, "body", "color") || "";
  const bodyMaterial =
    pickPersonal(personalizations, "body", "model") ||
    pickPersonal(personalizations, "body", "brand") ||
    "";
  const tailColor = pickPersonal(personalizations, "tail", "color") || "";

  // v2 fork: write directly to fly_patterns_v2. Personalisation snippets
  // (hookText, beadSize, beadColor, bodyColor, etc.) become a single
  // fly_variants row on the new pattern so the detail page shows them.
  // Materials get folded into description for storage (v2 stores structured
  // materials in fly_recipe_ingredients).
  const composedDescription = [
    canonical.description || "",
    materialsText ? `Materials:\n${materialsText}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const v2Row: Record<string, unknown> = {
    owner_user_id: userId,
    name: baseName,
    slug,
    category: canonical.category,
    description: composedDescription || null,
    hero_image_url:
      (flyBox?.custom_image_url as string | undefined) || canonical.hero_image_url || null,
    video_url: canonical.video_url || null,
    visibility: "private",
    contributed_by_user_id: userId,
  };
  Object.keys(v2Row).forEach((k) => {
    const v = v2Row[k];
    if (v === undefined || v === "") delete v2Row[k];
  });

  const { data, error } = await supabase
    .from("fly_patterns_v2")
    .insert(v2Row)
    .select("id, slug, name")
    .single();

  if (error) {
    console.error("[forkPersonalizationToPattern] Insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Seed variants on the new pattern. If we have personalisation hints
  // (size/bead/colors), create one variant per size carrying those.
  // Otherwise copy the canonical's curated variants via the mirror helper
  // so the user lands on a populated Configurations table.
  const sizeList = Array.isArray(sizes) ? sizes.filter(Boolean) : [];
  const beadMm = /^[0-9]+(\.[0-9]+)?$/.test(beadSize.trim()) ? Number(beadSize.trim()) : null;
  const hasPersonalisationHints =
    sizeList.length > 0 || beadColor || bodyColor || hookText;

  if (hasPersonalisationHints) {
    const variantRows = (sizeList.length > 0 ? sizeList : ["Standard"]).map(
      (size: string, idx: number) => ({
        pattern_id: data.id,
        created_by_user_id: userId,
        size,
        hook_style: hookText || null,
        bead_weight_mm: beadMm,
        bead_color: beadColor || null,
        body_color: bodyColor || null,
        sort_order: idx,
      }),
    );
    await supabase.from("fly_variants").insert(variantRows);
  } else {
    await mirrorPersonalPatternToV2({
      supabase,
      userId,
      personalPatternId: data.id as string,
      name: baseName,
      type: canonical.category as string | undefined,
      description: composedDescription || undefined,
      imageUrl: (v2Row.hero_image_url as string | undefined) ?? undefined,
      videoUrl: (v2Row.video_url as string | undefined) ?? undefined,
      parentCanonicalId: canonical.id as string,
      copyCuratedVariants: true,
    });
  }
  void bodyMaterial;
  void tailColor;
  void CATEGORY_TO_TYPE;

  return NextResponse.json({ pattern_id: data.id, slug: data.slug, name: data.name }, { status: 201 });
}

/**
 * Insert a fly_patterns_v2 mirror row for a newly created personal
 * fly_patterns row (preserves id so v1 and v2 stay aligned). Optionally
 * copies curated variants (created_by_user_id IS NULL) from the parent
 * canonical's pattern, so a fork starts with the same sizes/specs the
 * canonical exposed. Idempotent via on-conflict.
 */
async function mirrorPersonalPatternToV2(opts: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  userId: string;
  personalPatternId: string;
  name: string;
  type?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  parentCanonicalId?: string | null;
  copyCuratedVariants?: boolean;
}): Promise<void> {
  const {
    supabase,
    userId,
    personalPatternId,
    name,
    type,
    description,
    imageUrl,
    videoUrl,
    parentCanonicalId,
    copyCuratedVariants,
  } = opts;

  const category = type ? mapTypeToV2Category(type) : null;
  // Post-flatten v2 schema doesn't have forked_from_pattern_id; the fork
  // lineage isn't carried over (per flatten-fly-architecture refactor).
  const v2Row: Record<string, unknown> = {
    id: personalPatternId,
    name,
    category,
    owner_user_id: userId,
    visibility: "private",
    description: description ?? null,
    hero_image_url: imageUrl ?? null,
    video_url: videoUrl ?? null,
    contributed_by_user_id: userId,
  };
  void parentCanonicalId; // referenced only for curated-variant copy below
  Object.keys(v2Row).forEach((k) => v2Row[k] === undefined && delete v2Row[k]);

  // Use the service client — fly_patterns_v2 has RLS that limits inserts to
  // owner_user_id = auth.uid(); using service role here keeps the bridge
  // reliable regardless of the request's RLS context. Cast through `never`
  // because the service client's generated types are untyped here.
  const svc = getServiceClient();
  const { error: v2Err } = await svc
    .from("fly_patterns_v2")
    .upsert(v2Row as never, { onConflict: "id" });
  if (v2Err) {
    console.error("[mirrorPersonalPatternToV2] v2 upsert", v2Err);
    return;
  }

  if (!copyCuratedVariants || !parentCanonicalId) return;

  const { data: curatedVariants, error: curErr } = await svc
    .from("fly_variants")
    .select(
      "size, hook_style, hook_brand, bead_material, bead_weight_mm, bead_color, body_color, rib_color, tail_color, wing_color, thorax_color, collar_color, materials_override, sort_order, display_name, notes",
    )
    .eq("pattern_id", parentCanonicalId)
    .is("created_by_user_id", null)
    .is("deleted_at", null)
    .order("sort_order");
  if (curErr) {
    console.error("[mirrorPersonalPatternToV2] read curated variants", curErr);
    return;
  }
  if (!curatedVariants || curatedVariants.length === 0) return;

  // Skip if the personal pattern already has variants (idempotent re-fork).
  const { count: existingCount } = await svc
    .from("fly_variants")
    .select("id", { count: "exact", head: true })
    .eq("pattern_id", personalPatternId);
  if ((existingCount ?? 0) > 0) return;

  const cloneRows = (curatedVariants as Record<string, unknown>[]).map((v) => ({
    pattern_id: personalPatternId,
    created_by_user_id: userId,
    size: v.size,
    hook_style: v.hook_style,
    hook_brand: v.hook_brand,
    bead_material: v.bead_material,
    bead_weight_mm: v.bead_weight_mm,
    bead_color: v.bead_color,
    body_color: v.body_color,
    rib_color: v.rib_color,
    tail_color: v.tail_color,
    wing_color: v.wing_color,
    thorax_color: v.thorax_color,
    collar_color: v.collar_color,
    materials_override: v.materials_override ?? {},
    sort_order: v.sort_order ?? 0,
    display_name: v.display_name,
    notes: v.notes,
  }));
  const { error: cloneErr } = await svc
    .from("fly_variants")
    .insert(cloneRows as never);
  if (cloneErr) {
    console.error("[mirrorPersonalPatternToV2] clone variants", cloneErr);
  }
}

// fly_patterns.type is the human label ("Nymph", "Dry Fly"); fly_patterns_v2.category
// is the lowercase token ("nymph", "dry"). Map between them so the v2 mirror
// row matches the variant-axes resolver and admin UI expectations.
const TYPE_LABEL_TO_V2_CATEGORY: Record<string, string> = {
  "Nymph": "nymph",
  "Dry Fly": "dry",
  "Streamer": "streamer",
  "Emerger": "emerger",
  "Wet Fly": "wet",
  "Terrestrial": "terrestrial",
  "Egg": "egg",
  "Midge": "midge",
};
function mapTypeToV2Category(type: string): string | null {
  return TYPE_LABEL_TO_V2_CATEGORY[type] ?? type.toLowerCase() ?? null;
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // `?destroy_catches=true` removes catches that reference this fly before
    // deleting the pattern. Without this flag (default), catches are
    // preserved by setting fly_pattern_id = null and keeping the fly_name
    // text snapshot so journal records read "Pheasant Tail" forever even
    // though the recipe is gone.
    const destroyCatches =
      req.nextUrl.searchParams.get("destroy_catches") === "true";

    if (destroyCatches) {
      // Scope deletion to catches the caller owns. RLS should enforce this
      // too but defense in depth doesn't hurt.
      const { error: catchDelErr } = await supabase
        .from("catches")
        .delete()
        .eq("user_id", user.id)
        .eq("fly_pattern_id", id);
      if (catchDelErr) {
        console.error("Failed to delete catches:", catchDelErr);
        return NextResponse.json(
          { error: `Failed to delete catches: ${catchDelErr.message}` },
          { status: 500 },
        );
      }
    } else {
      // Default: keep the catches, null the FK so the row delete doesn't
      // violate (the FK has no ON DELETE clause).
      const { error: unlinkError } = await supabase
        .from("catches")
        .update({ fly_pattern_id: null })
        .eq("fly_pattern_id", id);
      if (unlinkError) {
        console.error("Failed to unlink catches:", unlinkError);
      }
    }

    const { error } = await supabase
      .from("fly_patterns_v2")
      .delete()
      .eq("id", id)
      .eq("owner_user_id", user.id);

    if (error) {
      console.error("Failed to delete fly pattern:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Fly patterns DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete fly pattern" }, { status: 500 });
  }
}
