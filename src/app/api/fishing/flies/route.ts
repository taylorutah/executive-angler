import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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
      return NextResponse.json(data);
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

      for (const [key, value] of formData.entries()) {
        if (key !== "image") body[key] = value;
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

    const row: Record<string, unknown> = {
      user_id: user.id,
      name: str(body.name),
      type: str(body.type),
      size: str(body.size),
      hook: str(body.hook),
      bead_size: str(body.bead_size),
      bead_color: parseArr(body.bead_color),
      bead_material: str(body.bead_material),
      bead_size_mm: num(body.bead_size_mm),
      fly_color: parseArr(body.fly_color),
      body_color: str(body.body_color),
      body_material: str(body.body_material),
      tail_color: str(body.tail_color),
      thorax_color: str(body.thorax_color),
      collar_color: str(body.collar_color),
      rib_material: str(body.rib_material),
      wing_material: str(body.wing_material),
      materials: str(body.materials),
      description: str(body.description),
      video_url: str(body.video_url),
      tags: parseArr(body.tags),
      source: str(body.source) || 'tied',
      has_structured_recipe: body.has_structured_recipe === 'true',
      ...(imageUrl ? { image_url: imageUrl } : {}),
    };

    // Remove undefined values so Supabase uses column defaults
    Object.keys(row).forEach((k) => row[k] === undefined && delete row[k]);

    const { data, error } = await supabase
      .from("fly_patterns")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("Failed to create fly pattern:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Save recipe ingredients if structured recipe was provided
    if (body.recipe_steps && data) {
      try {
        const steps = typeof body.recipe_steps === 'string'
          ? JSON.parse(body.recipe_steps as string)
          : body.recipe_steps;

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
          }
        }
      } catch (parseErr) {
        console.error("Failed to parse recipe steps:", parseErr);
      }
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

    const updates: Record<string, unknown> = {
      name: str(body.name),
      type: str(body.type),
      size: str(body.size),
      hook: str(body.hook),
      bead_size: str(body.bead_size),
      bead_color: parseArr(body.bead_color),
      bead_material: str(body.bead_material),
      bead_size_mm: num(body.bead_size_mm),
      fly_color: parseArr(body.fly_color),
      body_color: str(body.body_color),
      body_material: str(body.body_material),
      tail_color: str(body.tail_color),
      thorax_color: str(body.thorax_color),
      collar_color: str(body.collar_color),
      rib_material: str(body.rib_material),
      wing_material: str(body.wing_material),
      materials: str(body.materials),
      description: str(body.description),
      video_url: str(body.video_url),
      tags: parseArr(body.tags),
      ...(imageUrl ? { image_url: imageUrl } : {}),
    };

    // Remove undefined values so we only update fields that were sent
    Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

    const { error } = await supabase
      .from("fly_patterns")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to update fly pattern:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
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
      .from("fly_patterns")
      .select("id")
      .eq("user_id", userId)
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
  const threadColor = pickPersonal(personalizations, "thread", "color") || "";
  const bodyColor = pickPersonal(personalizations, "body", "color") || "";
  const bodyMaterial =
    pickPersonal(personalizations, "body", "model") ||
    pickPersonal(personalizations, "body", "brand") ||
    "";
  const tailColor = pickPersonal(personalizations, "tail", "color") || "";

  const row: Record<string, unknown> = {
    user_id: userId,
    name: baseName,
    slug,
    type: CATEGORY_TO_TYPE[canonical.category as string] || canonical.category,
    size: Array.isArray(sizes) && sizes.length ? sizes.join(", ") : "",
    hook: hookText,
    bead_size: beadSize,
    bead_color: beadColor ? [beadColor] : null,
    thread_color: threadColor || null,
    body_color: bodyColor,
    body_material: bodyMaterial,
    tail_color: tailColor,
    materials: materialsText,
    description: canonical.description || "",
    image_url: (flyBox?.custom_image_url as string | undefined) || canonical.hero_image_url || null,
    video_url: canonical.video_url || null,
    parent_canonical_id: canonical.id,
    visibility: "private",
    source: "tied",
    notes: (flyBox?.personal_notes as string | undefined) || null,
  };

  Object.keys(row).forEach((k) => {
    const v = row[k];
    if (v === undefined || v === "") delete row[k];
  });

  const { data, error } = await supabase
    .from("fly_patterns")
    .insert(row)
    .select("id, slug, name")
    .single();

  if (error) {
    console.error("[forkPersonalizationToPattern] Insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pattern_id: data.id, slug: data.slug, name: data.name }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Unlink any catches that reference this fly before deleting
    const { error: unlinkError } = await supabase
      .from("catches")
      .update({ fly_pattern_id: null })
      .eq("fly_pattern_id", id);

    if (unlinkError) {
      console.error("Failed to unlink catches:", unlinkError);
    }

    const { error } = await supabase
      .from("fly_patterns")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

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
