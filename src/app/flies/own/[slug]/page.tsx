/**
 * Owner peek for private/pending flies. Middleware rewrites
 * /flies/*-private-* here when a session cookie is present.
 * Force-dynamic so cookies() can run. Public approved slugs redirect out.
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getFlyBySlug } from "@/lib/db/fly-model";
import { SITE_URL } from "@/lib/constants";
import { flyHeroSrc } from "@/lib/flies/hosted-hero";
import { getFishingNowRivers } from "@/lib/flies/fishing-now";
import { linkRecipeMaterials } from "@/lib/flies/link-materials";
import FlyDetailBody from "@/components/fly-detail/FlyDetailBody";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fly = await getFlyBySlug(slug);
  if (!fly) return { title: "Fly Pattern" };
  const title = `${fly.name} — ${fly.category ?? "Fly Pattern"}`;
  const description =
    fly.description?.slice(0, 160) ?? `${fly.name}: tying recipe, options, fishing notes.`;
  const hero = flyHeroSrc(fly);
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/flies/${fly.slug}`,
      images: hero ? [{ url: hero, alt: fly.name }] : undefined,
    },
  };
}

export default async function OwnerFlyDetail({ params }: Props) {
  const { slug } = await params;
  const fly = await getFlyBySlug(slug);
  if (!fly) notFound();
  if (fly.status === "approved") {
    redirect(`/flies/${fly.slug}`);
  }

  const materials = Array.isArray(fly.materials_list) ? fly.materials_list : [];
  const [linkedMaterials, fishingNow] = await Promise.all([
    linkRecipeMaterials(materials),
    getFishingNowRivers(fly.name),
  ]);

  return (
    <FlyDetailBody
      fly={fly}
      linkedMaterials={linkedMaterials}
      fishingNow={fishingNow}
    />
  );
}
