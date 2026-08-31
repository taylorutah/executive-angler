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
  if (!river) notFound();
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
export const dynamicParams = false;

export default async function RiverPhotosPage({ params }: Props) {
  const { slug } = await params;
  const river = await getRiverBySlug(slug);
  if (!river) notFound();

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      {/* Header */}
      <div className="bg-[var(--paper)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-[var(--container)] px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[var(--text-3)] mb-3">
            <Link href="/rivers" className="hover:text-[var(--accent)] transition-colors">Rivers</Link>
            <span>/</span>
            <Link href={`/rivers/${slug}`} className="hover:text-[var(--accent)] transition-colors">{river.name}</Link>
            <span>/</span>
            <span className="text-[var(--text-2)]">Photos</span>
          </nav>
          <h1 className="text-[var(--text-1)]">
            {river.name} — Community Photos
          </h1>
          <p className="mt-2 max-w-[var(--prose)] text-lg leading-relaxed text-[var(--text-2)]">
            Photos submitted by anglers and catches logged in the app.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[var(--container)] px-4 py-8 sm:px-6 lg:px-8">
        <RiverPhotosClient
          riverId={river.id}
          riverSlug={slug}
          riverName={river.name}
        />
      </div>
    </div>
  );
}
