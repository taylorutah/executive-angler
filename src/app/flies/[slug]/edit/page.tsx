/**
 * /flies/[slug]/edit — unified fly edit page.
 *
 * Permission gate (server-side):
 *   - owner of a private/pending fly  → mode="edit"
 *   - admin on an approved canonical  → mode="canonical-edit"
 *   - anyone else                     → redirect to /flies/[slug]
 *
 * Replaces the legacy split between /journal/flies/[id]/edit (owner) and
 * /admin/flies/[slug]/edit (admin) — both were artefacts of the pre-reset
 * canonical/personal table split. Post-2026-05-15 every fly lives in
 * `flies` and the edit form is the same UI; only the permission branch and
 * the resulting PATCH semantics differ.
 */
import { notFound, redirect } from "next/navigation";
import { getFlyBySlug } from "@/lib/db/fly-model";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { materialSlotsToRecipeSteps } from "@/lib/flies/recipe-conversion";
import { canonicalCategoryToFormType } from "@/lib/flies/fly-type-map";
import FlyEditClient from "./FlyEditClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}

function sanitizeReturnTo(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return fallback;
}

export default async function EditFlyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { from } = await searchParams;
  const fly = await getFlyBySlug(slug);
  if (!fly) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/flies/${fly.slug}/edit`)}`);

  const isOwner = fly.submitted_by_user_id === user.id;
  const isPrivateOwn =
    isOwner && (fly.status === "private" || fly.status === "pending");
  const isApprovedCanonical = fly.status === "approved";
  const viewerIsAdmin = isAdmin(user.email);

  // Resolve mode + reject visitors with no edit rights.
  let mode: "edit" | "canonical-edit";
  if (isPrivateOwn) {
    mode = "edit";
  } else if (viewerIsAdmin && isApprovedCanonical) {
    mode = "canonical-edit";
  } else {
    redirect(`/flies/${fly.slug}`);
  }

  const recipeSteps = materialSlotsToRecipeSteps(fly.materials_list ?? []);
  const returnTo = sanitizeReturnTo(from, `/flies/${fly.slug}`);

  return (
    <FlyEditClient
      flyId={fly.id}
      slug={fly.slug}
      mode={mode}
      returnTo={returnTo}
      initial={{
        name: fly.name,
        type: canonicalCategoryToFormType(fly.category),
        description: fly.description ?? "",
        video_url: fly.video_url ?? "",
        imageUrl: fly.hero_image_url ?? null,
        recipeSteps,
      }}
    />
  );
}
