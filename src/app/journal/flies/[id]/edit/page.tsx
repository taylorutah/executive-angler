"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Sparkles, Printer } from "lucide-react";
import VariantModal from "@/components/flies/VariantModal";
import VariantTree from "@/components/flies/VariantTree";
import FlyCardModal from "@/components/flies/FlyCardModal";
import HelpHint from "@/components/ui/HelpHint";
import CatchMigrationBanner from "@/components/flies/CatchMigrationBanner";
import FlyPatternForm, {
  type FlyPatternFormInitial,
} from "@/components/flies/FlyPatternForm";
import type { RecipeStep } from "@/components/flies/RecipeBuilder";
import {
  ingredientsToSteps,
  synthesizeStepsFromLegacy,
} from "@/lib/flies/legacy-recipe-adapter";

type FlySource = "tied" | "bought" | "gifted";

interface FlyResponse {
  id: string;
  name?: string;
  type?: string;
  size?: string | string[];
  hook?: string;
  bead_size?: string | string[];
  bead_color?: string | string[];
  bead_material?: string;
  bead_size_mm?: number | string | null;
  fly_color?: string | string[];
  body_color?: string;
  body_material?: string;
  tail_color?: string;
  thorax_color?: string;
  collar_color?: string;
  rib_material?: string;
  wing_material?: string;
  thread_color?: string;
  materials?: string;
  description?: string;
  video_url?: string;
  tags?: string | string[];
  source?: string;
  image_url?: string | null;
  parent_canonical_id?: string | null;
  parent_canonical?: { id: string; slug: string; name: string } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recipe_ingredients?: any[];
  error?: string;
}

function arrToString(val: unknown): string {
  if (!val) return "";
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.join(", ");
      } catch {
        /* fall through */
      }
    }
    return trimmed;
  }
  return String(val);
}

function normalizeSource(s: string | undefined): FlySource {
  if (s === "bought" || s === "gifted") return s;
  return "tied";
}

export default function EditFlyPatternPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initial, setInitial] = useState<FlyPatternFormInitial | null>(null);
  const [flyForCard, setFlyForCard] = useState<Record<string, unknown> | null>(
    null,
  );
  const [variantOpen, setVariantOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/fishing/flies?id=${id}`)
      .then((r) => r.json())
      .then((fly: FlyResponse) => {
        if (cancelled) return;
        if (fly.error) {
          setError(fly.error);
          setLoading(false);
          return;
        }

        // Hydrate recipe steps: prefer structured ingredients, fall back to
        // synthesized steps from legacy columns.
        let steps: RecipeStep[] = ingredientsToSteps(fly.recipe_ingredients);
        if (steps.length === 0) {
          steps = synthesizeStepsFromLegacy({
            hook: fly.hook,
            bead_material: fly.bead_material,
            bead_size: arrToString(fly.bead_size),
            bead_size_mm: fly.bead_size_mm,
            bead_color: fly.bead_color,
            body_color: fly.body_color,
            body_material: fly.body_material,
            tail_color: fly.tail_color,
            thorax_color: fly.thorax_color,
            collar_color: fly.collar_color,
            rib_material: fly.rib_material,
            wing_material: fly.wing_material,
            thread_color: fly.thread_color,
          });
        }

        const init: FlyPatternFormInitial = {
          name: fly.name ?? "",
          type: fly.type ?? "",
          size: arrToString(fly.size),
          source: normalizeSource(fly.source),
          tags: arrToString(fly.tags),
          description: fly.description ?? "",
          video_url: fly.video_url ?? "",
          materials: fly.materials ?? "",
          fly_color: arrToString(fly.fly_color),
          imageUrl: fly.image_url ?? null,
          recipeSteps: steps,
          parentCanonical: fly.parent_canonical ?? null,
        };

        setInitial(init);
        setFlyForCard({
          id: fly.id,
          name: fly.name ?? "",
          type: fly.type ?? "",
          size: arrToString(fly.size),
          hook: fly.hook,
          bead_size: arrToString(fly.bead_size),
          bead_color: arrToString(fly.bead_color),
          bead_material: fly.bead_material,
          fly_color: arrToString(fly.fly_color),
          body_color: fly.body_color,
          body_material: fly.body_material,
          tail_color: fly.tail_color,
          thorax_color: fly.thorax_color,
          collar_color: fly.collar_color,
          rib_material: fly.rib_material,
          wing_material: fly.wing_material,
          materials: fly.materials,
          description: fly.description,
          tags: arrToString(fly.tags),
          image_url: fly.image_url,
        });
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    try {
      const hasImage = formData.has("image");
      let res: Response;
      if (hasImage) {
        res = await fetch(`/api/fishing/flies?id=${id}`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        // No new image — use JSON for cleaner field handling
        const body: Record<string, unknown> = {};
        for (const [k, v] of formData.entries()) {
          if (k === "image") continue;
          body[k] = v;
        }
        res = await fetch(`/api/fishing/flies?id=${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }
      router.push("/my-flies?tab=box");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  async function handleDelete() {
    const res = await fetch(`/api/fishing/flies?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/my-flies?tab=box");
    } else {
      setError("Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#6E7681]">
          <div className="h-8 w-8 rounded-full border-2 border-[#21262D] border-t-[#E8923A] animate-spin" />
          <p className="text-sm">Loading fly pattern…</p>
        </div>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center text-[#A8B2BD]">
        <p>{error || "Pattern not found."}</p>
      </div>
    );
  }

  const topRight = (
    <>
      <button
        type="button"
        onClick={() => setCardOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-[#D4751F]/40 bg-[#D4751F]/10 px-2.5 py-1 text-xs font-medium text-[#D4751F] hover:bg-[#D4751F]/20 transition-colors"
        aria-label="Open recipe card"
      >
        <Printer className="h-3.5 w-3.5" />
        Card
      </button>
      <button
        type="button"
        onClick={() => setVariantOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-[#00B4D8]/40 bg-[#00B4D8]/10 px-2.5 py-1 text-xs font-medium text-[#00B4D8] hover:bg-[#00B4D8]/20 transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Variant
      </button>
      <HelpHint label="What's a variant?">
        <p className="text-[#F0F6FC] font-semibold">
          Fork this fly into a child pattern
        </p>
        <p>
          Change one or two specs (size, bead, color) and we&apos;ll auto-name it
          and link it back to this parent so you can track what works.
        </p>
        <p className="text-[#6E7681] text-xs">
          Use &quot;Spawn by axis&quot; to create a whole size or color run at
          once.
        </p>
      </HelpHint>
    </>
  );

  return (
    <>
      <FlyPatternForm
        mode="edit"
        initial={initial}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        busy={saving}
        error={error}
        cancelHref="/my-flies?tab=box"
        topRight={topRight}
        banner={
          initial.parentCanonical ? (
            <CatchMigrationBanner
              patternId={id}
              parentCanonicalName={initial.parentCanonical.name}
            />
          ) : null
        }
        extras={<VariantTree patternId={id} />}
      />

      {variantOpen && (
        <VariantModal
          open={variantOpen}
          onClose={() => setVariantOpen(false)}
          parent={{
            patternId: id,
            name: initial.name || "This pattern",
            heroImageUrl: initial.imageUrl ?? null,
          }}
        />
      )}

      {flyForCard && (
        <FlyCardModal
          open={cardOpen}
          onClose={() => setCardOpen(false)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fly={flyForCard as any}
          imageUrl={initial.imageUrl ?? null}
        />
      )}
    </>
  );
}
