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
  searchParams: Promise<{ from?: string }>;
}

export const dynamic = "force-dynamic";

/**
 * Only same-origin paths starting with "/" are honored as a return target —
 * blocks open-redirect attempts via crafted ?from= URLs.
 */
function sanitizeReturnTo(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return fallback;
}

export default async function EditCanonicalFlyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from } = await searchParams;
  const fly = await getFlyBySlug(slug);
  if (!fly) notFound();

  const recipeSteps = materialSlotsToRecipeSteps(fly.materials_list ?? []);
  const returnTo = sanitizeReturnTo(from, `/flies/${fly.slug}`);

  return (
    <EditCanonicalFlyClient
      flyId={fly.id}
      slug={fly.slug}
      returnTo={returnTo}
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
