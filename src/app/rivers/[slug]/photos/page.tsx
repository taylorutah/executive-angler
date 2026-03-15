import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllRivers, getRiverBySlug } from "@/lib/db";
import RiverPhotosClient from "./RiverPhotosClient";
import { SITE_URL } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) return { title: "Photos Not Found" };
  return {
    title: `${river.name} Photos — Community Fishing Photos`,
    description: `Browse and submit community fishing photos from ${river.name}. See catches, scenery, and access points shared by anglers.`,
    alternates: { canonical: `${SITE_URL}/rivers/${slug}/photos` },
  };
}

export async function generateStaticParams() {
  const rivers = await getAllRivers();
  return rivers.map((r) => ({ slug: r.slug }));
}

export const revalidate = 300;

export default async function RiverPhotosPage({ params }: Props) {
  const { slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) notFound();

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Header */}
      <div className="bg-[#161B22] border-b border-[#21262D]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#484F58] mb-3">
            <Link href="/rivers" className="hover:text-[#E8923A] transition-colors">Rivers</Link>
            <span>/</span>
            <Link href={`/rivers/${slug}`} className="hover:text-[#E8923A] transition-colors">{river.name}</Link>
            <span>/</span>
            <span className="text-[#8B949E]">Photos</span>
          </nav>
          <h1 className="font-heading text-3xl font-bold text-[#F0F6FC]">
            {river.name} — Community Photos
          </h1>
          <p className="mt-2 text-[#8B949E]">
            Photos submitted by anglers and catches logged in the app.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <RiverPhotosClient
          riverId={river.id}
          riverSlug={slug}
          riverName={river.name}
        />
      </div>
    </div>
  );
}
