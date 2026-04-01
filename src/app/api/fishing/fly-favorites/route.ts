import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET — Fetch user's favorited flies (both canonical fly box entries and personal patterns)
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
          is_favorite,
          canonical_fly:canonical_flies(id, slug, name, category, hero_image_url, sizes)
        `)
        .eq("user_id", user.id)
        .eq("is_favorite", true),
      supabase
        .from("fly_patterns")
        .select("id, name, type, image_url, size, is_favorite")
        .eq("user_id", user.id)
        .eq("is_favorite", true),
    ]);

    if (boxResult.error) {
      console.error("[fly-favorites GET] box error:", boxResult.error);
      return NextResponse.json({ error: boxResult.error.message }, { status: 500 });
    }
    if (patternResult.error) {
      console.error("[fly-favorites GET] pattern error:", patternResult.error);
      return NextResponse.json({ error: patternResult.error.message }, { status: 500 });
    }

    return NextResponse.json({
      libraryFavorites: boxResult.data ?? [],
      personalFavorites: patternResult.data ?? [],
    });
  } catch (err) {
    console.error("[fly-favorites GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST — Toggle favorite on a fly box entry or personal pattern
 * Body: { flyBoxId?: string, flyPatternId?: string, favorite: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { flyBoxId, flyPatternId, canonicalFlyId, favorite } = body;

    if (typeof favorite !== "boolean") {
      return NextResponse.json({ error: "favorite (boolean) is required" }, { status: 400 });
    }

    // Toggle on a canonical fly (user_fly_box entry)
    if (flyBoxId) {
      const { error } = await supabase
        .from("user_fly_box")
        .update({ is_favorite: favorite })
        .eq("id", flyBoxId)
        .eq("user_id", user.id);

      if (error) {
        console.error("[fly-favorites POST] box update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, flyBoxId, is_favorite: favorite });
    }

    // Toggle by canonical_fly_id (finds or creates the fly box entry)
    if (canonicalFlyId) {
      if (favorite) {
        // Upsert into fly box with is_favorite = true
        const { data, error } = await supabase
          .from("user_fly_box")
          .upsert(
            { user_id: user.id, canonical_fly_id: canonicalFlyId, is_favorite: true },
            { onConflict: "user_id,canonical_fly_id" }
          )
          .select("id")
          .single();

        if (error) {
          console.error("[fly-favorites POST] upsert error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, flyBoxId: data?.id, is_favorite: true });
      } else {
        // Set is_favorite = false
        const { error } = await supabase
          .from("user_fly_box")
          .update({ is_favorite: false })
          .eq("user_id", user.id)
          .eq("canonical_fly_id", canonicalFlyId);

        if (error) {
          console.error("[fly-favorites POST] unfavorite error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, is_favorite: false });
      }
    }

    // Toggle on a personal fly pattern
    if (flyPatternId) {
      const { error } = await supabase
        .from("fly_patterns")
        .update({ is_favorite: favorite })
        .eq("id", flyPatternId)
        .eq("user_id", user.id);

      if (error) {
        console.error("[fly-favorites POST] pattern update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, flyPatternId, is_favorite: favorite });
    }

    return NextResponse.json(
      { error: "One of flyBoxId, canonicalFlyId, or flyPatternId is required" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[fly-favorites POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
