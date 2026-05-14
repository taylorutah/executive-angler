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
      // Personal favorited patterns. Aliases keep the legacy column names
      // (`type`, `image_url`) so callers don't need to change. Size is
      // per-variant on v2 — callers already tolerate null/undefined.
      supabase
        .from("fly_patterns_v2")
        .select("id, name, type:category, image_url:hero_image_url, is_favorite")
        .eq("owner_user_id", user.id)
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

    // Toggle by canonical_fly_id. After the multi-variant migration, there
    // can be 2+ rows per (user, canonical_fly), so the previous upsert with
    // onConflict on (user_id, canonical_fly_id) no longer works (the unique
    // constraint was dropped). Strategy:
    //   favorite=true   → if any rows exist, set is_favorite=true on all of
    //                     them. Otherwise insert one new row (primary).
    //   favorite=false  → set is_favorite=false on all matching rows.
    if (canonicalFlyId) {
      const { data: existingRows, error: queryErr } = await supabase
        .from("user_fly_box")
        .select("id")
        .eq("user_id", user.id)
        .eq("canonical_fly_id", canonicalFlyId);
      if (queryErr) {
        console.error("[fly-favorites POST] query error:", queryErr);
        return NextResponse.json({ error: queryErr.message }, { status: 500 });
      }

      if (favorite) {
        if (existingRows && existingRows.length > 0) {
          const { error } = await supabase
            .from("user_fly_box")
            .update({ is_favorite: true })
            .eq("user_id", user.id)
            .eq("canonical_fly_id", canonicalFlyId);
          if (error) {
            console.error("[fly-favorites POST] update error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
          return NextResponse.json({
            success: true,
            flyBoxId: existingRows[0].id,
            is_favorite: true,
          });
        }
        // No rows exist — insert a new primary entry. Also auto-add to default
        // box for consistency with /api/fly-box POST behavior.
        const { data: inserted, error: insErr } = await supabase
          .from("user_fly_box")
          .insert({
            user_id: user.id,
            canonical_fly_id: canonicalFlyId,
            is_favorite: true,
            is_primary: true,
          })
          .select("id")
          .single();
        if (insErr || !inserted) {
          console.error("[fly-favorites POST] insert error:", insErr);
          return NextResponse.json(
            { error: insErr?.message ?? "Insert failed" },
            { status: 500 },
          );
        }
        // Auto-membership in default box (best-effort).
        try {
          const { data: defaultBox } = await supabase
            .from("fly_boxes")
            .select("id")
            .eq("user_id", user.id)
            .eq("is_default", true)
            .maybeSingle();
          if (defaultBox?.id) {
            await supabase
              .from("fly_box_membership")
              .upsert(
                { box_id: defaultBox.id, user_fly_box_id: inserted.id },
                { onConflict: "box_id,user_fly_box_id" },
              );
          }
        } catch (membershipErr) {
          console.warn("[fly-favorites POST] membership warn:", membershipErr);
        }
        return NextResponse.json({
          success: true,
          flyBoxId: inserted.id,
          is_favorite: true,
        });
      } else {
        // Unfavorite — clear flag on all matching rows.
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

    // Toggle on a personal fly pattern (v2 write; legacy fly_patterns
    // becomes a view post-drop and can't accept writes).
    if (flyPatternId) {
      const { error } = await supabase
        .from("fly_patterns_v2")
        .update({ is_favorite: favorite })
        .eq("id", flyPatternId)
        .eq("owner_user_id", user.id);

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
