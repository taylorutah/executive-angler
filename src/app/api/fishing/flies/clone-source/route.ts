/**
 * Clone-source reader — returns a canonical fly shaped as a
 * FlyPatternFormInitial-compatible payload so /journal/flies/new can pre-fill
 * its form. Used by the "Clone" button on /flies/[slug].
 *
 * The clone is intentionally independent of the source: no parent_canonical_id,
 * no fork linkage. The source image URL is returned separately so the client
 * can pass it back as `clone_image_from_url` on submit (server-side copy).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFlyById } from "@/lib/db/fly-model";
import type { MaterialSlot } from "@/types/flies";
import type { RecipeRole } from "@/types/materials";

const VALID_ROLES = new Set<RecipeRole>([
  "hook", "bead", "thread", "tail", "body", "ribbing",
  "wing", "hackle", "head", "tag", "hotspot", "eye",
  "collar", "thorax", "abdomen", "shellback", "legs",
  "antennae", "post",
]);

function slotToRole(slot: string): RecipeRole | null {
  const s = slot.toLowerCase().trim();
  if (s === "rib") return "ribbing";
  if (VALID_ROLES.has(s as RecipeRole)) return s as RecipeRole;
  return null;
}

interface CloneRecipeStep {
  id: string;
  role: RecipeRole;
  material: null;
  materialName: string;
  colorChoice: string;
  sizeChoice: string;
  quantity: string;
  weightChoice: string;
  materialTypeChoice: string;
  finishChoice: string;
  brandChoice: string;
  notes: string;
  isOptional: boolean;
}

function materialSlotsToRecipeSteps(slots: MaterialSlot[] | null | undefined): CloneRecipeStep[] {
  if (!slots || slots.length === 0) return [];
  const out: CloneRecipeStep[] = [];
  slots.forEach((slot, idx) => {
    const role = slotToRole(String(slot.slot ?? ""));
    if (!role) return;
    out.push({
      id: `clone-${idx}-${Date.now()}`,
      role,
      material: null,
      materialName: slot.material ?? "",
      colorChoice: "",
      sizeChoice: "",
      quantity: "",
      weightChoice: "",
      materialTypeChoice: "",
      finishChoice: "",
      brandChoice: slot.brand ?? "",
      notes: slot.description ?? "",
      isOptional: slot.is_optional ?? false,
    });
  });
  return out;
}

// Canonical categories are lowercase short codes (`dry`, `wet`); the form's
// TYPE select uses the human-readable label (`Dry Fly`, `Wet Fly`). Map so
// the select pre-populates.
const CATEGORY_TO_FORM_TYPE: Record<string, string> = {
  nymph: "Nymph",
  dry: "Dry Fly",
  streamer: "Streamer",
  wet: "Wet Fly",
  emerger: "Emerger",
  midge: "Midge",
  terrestrial: "Terrestrial",
  egg: "Egg",
  other: "Other",
};

function categoryToFormType(category: string | null | undefined): string {
  if (!category) return "";
  const key = category.toLowerCase().trim();
  return CATEGORY_TO_FORM_TYPE[key] ?? "";
}

function materialsListToText(slots: MaterialSlot[] | null | undefined): string {
  if (!slots || slots.length === 0) return "";
  return slots
    .map((s) => {
      const slotLabel = String(s.slot ?? "material");
      const detail = [s.material, s.brand].filter(Boolean).join(" · ");
      return detail ? `${slotLabel}: ${detail}` : null;
    })
    .filter(Boolean)
    .join("\n");
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const canonicalId = req.nextUrl.searchParams.get("canonicalId");
  if (!canonicalId) {
    return NextResponse.json({ error: "Missing canonicalId" }, { status: 400 });
  }

  const fly = await getFlyById(canonicalId);
  if (!fly) {
    return NextResponse.json({ error: "Canonical fly not found" }, { status: 404 });
  }

  // Only approved canonicals are cloneable — don't expose pending/rejected/private
  // patterns through this endpoint.
  if (fly.status !== "approved") {
    return NextResponse.json({ error: "Fly not available for cloning" }, { status: 403 });
  }

  return NextResponse.json({
    sourceName: fly.name,
    sourceSlug: fly.slug,
    initial: {
      name: `${fly.name} (My Version)`,
      type: categoryToFormType(fly.category),
      description: fly.description ?? "",
      video_url: fly.video_url ?? "",
      materials: materialsListToText(fly.materials_list),
      imageUrl: fly.hero_image_url ?? null,
      recipeSteps: materialSlotsToRecipeSteps(fly.materials_list),
    },
    sourceImageUrl: fly.hero_image_url ?? null,
  });
}
