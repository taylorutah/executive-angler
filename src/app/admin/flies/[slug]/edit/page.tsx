/**
 * Admin: edit a canonical fly with the structured FlyPatternForm UI.
 * Auth-gate is enforced by /admin/layout.tsx (redirects non-admins).
 */
import { notFound } from "next/navigation";
import { getFlyBySlug } from "@/lib/db/fly-model";
import { materialSlotsToRecipeSteps } from "@/lib/flies/recipe-conversion";
import EditCanonicalFlyClient from "./EditCanonicalFlyClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditCanonicalFlyPage({ params }: Props) {
  const { slug } = await params;
  const fly = await getFlyBySlug(slug);
  if (!fly) notFound();

  const recipeSteps = materialSlotsToRecipeSteps(fly.materials_list ?? []);

  return (
    <EditCanonicalFlyClient
      flyId={fly.id}
      slug={fly.slug}
      initial={{
        name: fly.name,
        type: fly.category ?? "",
        description: fly.description ?? "",
        video_url: fly.video_url ?? "",
        imageUrl: fly.hero_image_url ?? null,
        recipeSteps,
      }}
    />
  );
}
