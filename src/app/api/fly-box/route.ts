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

// PATCH — update personalizations / preferred_sizes / notes / image / name on
// an existing fly box entry. Identified by canonical_fly_id (per-user uniqueness
// via the user_id, canonical_fly_id composite). Used by the PersonalizeSheet
// drawer and the CustomFlyImageDropzone.
//
// Two transports:
//   - JSON body (default): updates personalizations / preferred_sizes / personal_notes / custom_name
//   - multipart/form-data: photo upload — sets custom_image_url after writing
//     the file to fly-pattern-images/{user_id}/canonical-{flyId}/{uuid}.{ext}.
//     Photo upload is Pro-only (server-side enforced).
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = request.headers.get("content-type") || "";
    const updates: Record<string, unknown> = {};
    let canonical_fly_id: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      // Pro gate — personal photo on canonical flies is a Pro feature.
      const isPro = await checkPremium(supabase, user.id, user.email);
      if (!isPro) {
        return NextResponse.json(
          { error: "Personal photos on canonical flies require Pro." },
          { status: 403 },
        );
      }

      const formData = await request.formData();
      canonical_fly_id = String(formData.get("canonical_fly_id") || "");
      if (!canonical_fly_id) {
        return NextResponse.json({ error: "canonical_fly_id is required" }, { status: 400 });
      }
      const file = formData.get("image") as File | null;
      if (!file || file.size === 0) {
        return NextResponse.json({ error: "image file is required" }, { status: 400 });
      }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/canonical-${canonical_fly_id}/${crypto.randomUUID()}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await getServiceClient().storage
        .from("fly-pattern-images")
        .upload(path, arrayBuffer, { contentType: file.type, upsert: true });
      if (uploadError) {
        console.error("[fly-box PATCH] image upload error:", uploadError);
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError.message}` },
          { status: 500 },
        );
      }
      const { data: { publicUrl } } = getServiceClient().storage
        .from("fly-pattern-images")
        .getPublicUrl(path);
      updates.custom_image_url = publicUrl;
    } else {
      const body = await request.json();
      canonical_fly_id = body.canonical_fly_id;
      if (!canonical_fly_id) {
        return NextResponse.json({ error: "canonical_fly_id is required" }, { status: 400 });
      }
      const {
        personalizations,
        preferred_sizes,
        personal_notes,
        custom_name,
        custom_image_url,
      } = body;
      if (personalizations !== undefined) updates.personalizations = personalizations;
      if (preferred_sizes !== undefined) updates.preferred_sizes = preferred_sizes;
      if (personal_notes !== undefined) updates.personal_notes = personal_notes;
      if (custom_name !== undefined) updates.custom_name = custom_name;
      // Allow clearing a personal photo via JSON null without re-checking Pro
      // (downgrade flow: lose the perk's edit privileges, but keep the right
      // to remove a photo you previously uploaded).
      if (custom_image_url === null) updates.custom_image_url = null;
    }

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
