import { Metadata } from "next";
import Link from "next/link";
import { ENTITY_CONFIGS } from "@/lib/admin/entity-config";
import {
  MapPin,
  Waves,
  Fish,
  Building,
  User,
  ShoppingBag,
  FileText,
  ChevronRight,
} from "lucide-react";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Content Management — Admin | Executive Angler",
  description: "Manage all content entities.",
};

const ENTITY_ICONS: Record<string, ReactNode> = {
  destinations: <MapPin className="h-6 w-6" />,
  rivers: <Waves className="h-6 w-6" />,
  species: <Fish className="h-6 w-6" />,
  lodges: <Building className="h-6 w-6" />,
  guides: <User className="h-6 w-6" />,
  "fly-shops": <ShoppingBag className="h-6 w-6" />,
  articles: <FileText className="h-6 w-6" />,
};

export default function AdminContentPage() {
  const entries = Object.entries(ENTITY_CONFIGS);

  return (
    <div className="min-h-screen text-[#F0F6FC]">
      <header className="border-b border-[#21262D] px-6 py-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Content Management
        </h1>
        <p className="mt-1 text-sm text-[#A8B2BD]">
          Select an entity type to manage its records.
        </p>
      </header>

      <div className="px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
          {entries.map(([slug, config]) => (
            <Link
              key={slug}
              href={`/admin/content/${slug}`}
              className="group flex items-center gap-4 rounded-xl border border-[#21262D] bg-[#161B22] p-5 hover:border-[#E8923A] transition-colors"
            >
              <div className="shrink-0 text-[#6E7681] group-hover:text-[#E8923A] transition-colors">
                {ENTITY_ICONS[slug] ?? <FileText className="h-6 w-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#F0F6FC] group-hover:text-[#E8923A] transition-colors">
                  {config.label}
                </p>
                <p className="text-xs text-[#6E7681] mt-0.5">
                  Table: {config.table}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#6E7681] group-hover:text-[#E8923A] transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
