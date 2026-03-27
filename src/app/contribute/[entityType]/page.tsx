import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SubmissionForm from "./SubmissionForm";

const VALID_TYPES = ["river", "fly_shop", "guide", "lodge", "destination", "species", "fly_pattern"];
const TYPE_LABELS: Record<string, string> = {
  river: "River or Stream",
  fly_shop: "Fly Shop",
  guide: "Fishing Guide",
  lodge: "Lodge or Resort",
  destination: "Destination",
  species: "Species",
  fly_pattern: "Fly Pattern",
};

export async function generateMetadata({ params }: { params: Promise<{ entityType: string }> }): Promise<Metadata> {
  const { entityType } = await params;
  const label = TYPE_LABELS[entityType] || "Entity";
  return {
    title: `Add ${label} — Contribute — Executive Angler`,
    description: `Submit a new ${label.toLowerCase()} to Executive Angler.`,
  };
}

export default async function SubmissionPage({
  params,
  searchParams,
}: {
  params: Promise<{ entityType: string }>;
  searchParams: Promise<{ from_fly_box?: string }>;
}) {
  const { entityType } = await params;
  if (!VALID_TYPES.includes(entityType)) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/contribute/${entityType}`);

  // If coming from fly box, prefill with existing fly pattern data
  let prefillData: Record<string, string> | undefined;
  const { from_fly_box } = await searchParams;

  if (entityType === "fly_pattern" && from_fly_box) {
    const { data: flyPattern } = await supabase
      .from("fly_patterns")
      .select("*")
      .eq("id", from_fly_box)
      .eq("user_id", user.id)
      .single();

    if (flyPattern) {
      const parseField = (val: unknown): string => {
        if (!val) return "";
        if (Array.isArray(val)) return val.filter(Boolean).join(", ");
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (trimmed.startsWith("[")) {
            try {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed)) return parsed.filter(Boolean).join(", ");
            } catch { /* fall through */ }
          }
          return trimmed;
        }
        return String(val);
      };

      prefillData = {
        name: flyPattern.name || "",
        category: (flyPattern.type || "").toLowerCase(),
        description: flyPattern.description || "",
        materials_list: flyPattern.materials || "",
        sizes: parseField(flyPattern.size),
        colors: flyPattern.fly_color || "",
        bead_options: flyPattern.bead_color ? `${flyPattern.bead_color}${flyPattern.bead_size ? ` ${flyPattern.bead_size}` : ""}` : "",
        hook_styles: flyPattern.hook || "",
        video_url: flyPattern.video_url || "",
        imitates: parseField(flyPattern.imitates),
        effective_species: parseField(flyPattern.effective_species),
        source_fly_pattern_id: flyPattern.id,
        _prefill_hero_image: flyPattern.image_url || "",
      };

      // Remove empty values
      for (const key of Object.keys(prefillData)) {
        if (!prefillData[key]) delete prefillData[key];
      }
    }
  }

  return (
    <SubmissionForm
      entityType={entityType}
      entityLabel={TYPE_LABELS[entityType]}
      userId={user.id}
      prefillData={prefillData}
    />
  );
}
