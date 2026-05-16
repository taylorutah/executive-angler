/**
 * Gear catalog — dense single-list view with inline "Add to Locker".
 *
 * Replaces the legacy multi-page browse (deep brand and product pages
 * collected SEO impressions but didn't drive product value). Now: pick a
 * category tab, scan a row, click "Add" — done. Manufacturer detail lives
 * on the brand's own site, one Google away.
 *
 * Deep paths (/gear/[brand], /gear/[brand]/[product], /gear/category/[slug])
 * 308-redirect to this page (with category query when applicable).
 */
import type { Metadata } from "next";
import Image from "next/image";
import { getAllGearProducts } from "@/lib/db/gear-products";
import { getAllGearBrands } from "@/lib/db/gear-brands";
import { createClient } from "@/lib/supabase/server";
import AddToLockerButton from "@/components/gear-v2/AddToLockerButton";
import GearCategoryTabs from "@/components/gear-v2/GearCategoryTabs";

export const metadata: Metadata = {
  title: "Gear",
  description: "Fly fishing gear catalog: rods, reels, waders, lines, leaders, tippet, packs. Add to your locker in one click.",
};

export const revalidate = 3600;

const CATEGORY_LABELS: Record<string, string> = {
  rod: "Rods",
  reel: "Reels",
  line: "Lines",
  leader: "Leaders",
  tippet: "Tippet",
  waders: "Waders",
  "wading-boots": "Boots",
  pack: "Packs",
  net: "Nets",
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

function specSummary(category: string, specs: Record<string, unknown>): string {
  if (!specs || typeof specs !== "object") return "";
  switch (category) {
    case "rod": {
      const len = specs.lengthFt as number | undefined;
      const wt = specs.lineWeight as number | undefined;
      const pcs = specs.pieces as number | undefined;
      return [len && `${len}'`, wt && `${wt}wt`, pcs && `${pcs}pc`].filter(Boolean).join(" · ");
    }
    case "reel": {
      const size = specs.size as string | undefined;
      const drag = specs.dragType as string | undefined;
      return [size, drag].filter(Boolean).join(" · ");
    }
    case "line": {
      const wt = specs.weight as number | undefined;
      const taper = specs.taper as string | undefined;
      const dens = specs.density as string | undefined;
      return [wt && `${wt}wt`, taper, dens].filter(Boolean).join(" · ");
    }
    case "waders":
    case "wading-boots": {
      const mat = specs.material as string | undefined;
      const ft = specs.footType as string | undefined;
      return [mat, ft].filter(Boolean).join(" · ");
    }
    default:
      return "";
  }
}

export default async function GearCatalogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const activeCategory = sp.category ?? "all";

  const [products, brands] = await Promise.all([
    getAllGearProducts(),
    getAllGearBrands(),
  ]);
  const brandById = new Map(brands.map((b) => [b.id, b]));

  // Which products are already in this user's locker?
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let inLockerIds = new Set<string>();
  if (user) {
    const { data: items } = await supabase
      .from("gear_items")
      .select("gear_product_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .not("gear_product_id", "is", null);
    inLockerIds = new Set(
      (items ?? [])
        .map((i: { gear_product_id: string | null }) => i.gear_product_id)
        .filter((v): v is string => !!v)
    );
  }

  // Tab counts
  const counts = new Map<string, number>();
  for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  const tabs = Object.keys(CATEGORY_LABELS)
    .filter((c) => (counts.get(c) ?? 0) > 0)
    .map((c) => ({ slug: c, label: CATEGORY_LABELS[c], count: counts.get(c) ?? 0 }));

  // Filter
  const visible = activeCategory === "all"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#0D1117] text-[#F0F6FC] pt-14">
      <header className="border-b border-[#21262D] bg-[#161B22]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="font-heading text-3xl text-[#F0F6FC] tracking-tight">
            Gear
          </h1>
          <p className="mt-1 text-sm text-[#A8B2BD]">
            {products.length} products · click <span className="text-[#F0F6FC]">Add</span> on any row to drop it into your{" "}
            <a href="/account/gear" className="text-[#0BA5C7] hover:text-[#E8923A]">locker</a>.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <GearCategoryTabs categories={tabs} />

        <div className="rounded-lg border border-[#21262D] bg-[#0D1117] overflow-hidden">
          {visible.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-[#6E7681]">
              No products in this category yet.
            </div>
          ) : (
            <div className="divide-y divide-[#21262D]">
              {/* Header row */}
              <div className="hidden sm:grid grid-cols-[40px_minmax(0,2fr)_minmax(0,1fr)_120px_80px_90px] items-center gap-3 bg-[#161B22] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6E7681]">
                <span></span>
                <span>Product</span>
                <span>Spec</span>
                <span>Category</span>
                <span className="text-right">MSRP</span>
                <span></span>
              </div>
              {visible.map((p) => {
                const brand = brandById.get(p.brandId);
                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-[40px_1fr] sm:grid-cols-[40px_minmax(0,2fr)_minmax(0,1fr)_120px_80px_90px] items-center gap-3 px-3 py-2 hover:bg-[#161B22] transition-colors"
                  >
                    <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded bg-[#161B22]">
                      {p.heroImageUrl ? (
                        <Image src={p.heroImageUrl} alt="" fill sizes="36px" className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#484F58] text-[10px]">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#F0F6FC] text-sm font-medium truncate">
                        {p.name}
                      </p>
                      <p className="text-[#6E7681] text-[11px] truncate">
                        {brand?.name ?? "—"}
                      </p>
                    </div>
                    <p className="hidden sm:block font-['IBM_Plex_Mono'] text-[#A8B2BD] text-[12px] truncate">
                      {specSummary(p.category, p.specs as Record<string, unknown>) || "—"}
                    </p>
                    <span className="hidden sm:inline-block rounded bg-[#1F2937] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#A8B2BD] w-fit">
                      {CATEGORY_LABELS[p.category] ?? p.category}
                    </span>
                    <p className="hidden sm:block font-['IBM_Plex_Mono'] text-[#A8B2BD] text-[12px] text-right">
                      {p.msrpUsd ? `$${p.msrpUsd}` : "—"}
                    </p>
                    <div className="col-start-2 sm:col-auto justify-self-start sm:justify-self-end">
                      <AddToLockerButton
                        productId={p.id}
                        initiallyInLocker={inLockerIds.has(p.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
