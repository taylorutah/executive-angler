import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { SITE_URL } from "@/lib/constants";
import MaterialsBrowserClient from "./MaterialsBrowserClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fly Tying Materials Database | Executive Angler",
  description:
    "Browse 500+ verified fly tying materials — hooks, beads, thread, dubbing, feathers, flash, and more. Search by name, brand, or category to find exactly what you need for your next pattern.",
  alternates: { canonical: `${SITE_URL}/flies/materials` },
  openGraph: {
    title: "Fly Tying Materials Database | Executive Angler",
    description:
      "Browse 500+ verified fly tying materials — hooks, beads, thread, dubbing, feathers, flash, and more.",
    images: [
      "/api/og?title=Fly%20Tying%20Materials&subtitle=500%2B%20Verified%20Materials&type=fly",
    ],
  },
};

interface CategoryCount {
  category: string;
  count: number;
}

export default async function MaterialsPage() {
  const supabase = await createClient();

  // Fetch initial materials (first 60 by popularity)
  const { data: materials } = await supabase
    .from("tying_materials")
    .select(
      "id, slug, name, brand, category, subcategory, sizes, colors, material_type, weight, finish, description, image_url, vendor_url, popularity"
    )
    .eq("is_verified", true)
    .order("popularity", { ascending: false })
    .limit(60);

  // Fetch category counts using a raw count per category
  // We'll get all verified materials' categories and count client-side
  const { data: allCategories } = await supabase
    .from("tying_materials")
    .select("category")
    .eq("is_verified", true);

  const categoryCounts: CategoryCount[] = [];
  if (allCategories) {
    const countMap: Record<string, number> = {};
    for (const row of allCategories) {
      const cat = row.category;
      if (cat) {
        countMap[cat] = (countMap[cat] || 0) + 1;
      }
    }
    for (const [category, count] of Object.entries(countMap)) {
      categoryCounts.push({ category, count });
    }
    categoryCounts.sort((a, b) => b.count - a.count);
  }

  const totalCount = allCategories?.length || 0;

  return (
    <main className="min-h-screen bg-[#0D1117]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Fly Library", href: "/flies" },
            { label: "Materials" },
          ]}
        />

        <div className="mt-6 mb-10">
          <h1 className="font-heading text-3xl font-bold text-[#F0F6FC] sm:text-4xl">
            Fly Tying Materials
          </h1>
          <p className="mt-2 text-lg text-[#A8B2BD]">
            Browse {totalCount > 0 ? `${totalCount}+` : ""} verified materials
            from top brands. Search, filter by category, and build your
            inventory.
          </p>
        </div>

        <MaterialsBrowserClient
          initialMaterials={materials || []}
          categoryCounts={categoryCounts}
          totalCount={totalCount}
        />
      </div>
    </main>
  );
}
