/**
 * Gear catalog — FIND list on cream paper.
 * Deep paths still 308 here.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import DeskMast from "@/components/desk/DeskMast";
import HomeGutter from "@/components/home/HomeGutter";
import { getAllGearProducts } from "@/lib/db/gear-products";
import { getAllGearBrands } from "@/lib/db/gear-brands";
import { createClient } from "@/lib/supabase/server";
import AddToLockerButton from "@/components/gear-v2/AddToLockerButton";
import GearCategoryTabs from "@/components/gear-v2/GearCategoryTabs";

export const metadata: Metadata = {
  title: "Gear",
  description: "Rods, reels, waders, lines. Add a piece to your locker. Not a cart.",
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

  const [products, brands] = await Promise.all([getAllGearProducts(), getAllGearBrands()]);
  const brandById = new Map(brands.map((b) => [b.id, b]));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
        .filter((v): v is string => !!v),
    );
  }

  const counts = new Map<string, number>();
  for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  const tabs = Object.keys(CATEGORY_LABELS)
    .filter((c) => (counts.get(c) ?? 0) > 0)
    .map((c) => ({ slug: c, label: CATEGORY_LABELS[c], count: counts.get(c) ?? 0 }));

  const visible =
    activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-[var(--paper)]">
      <DeskMast
        kicker="FIND"
        title="Gear"
        lede="Rods, reels, waders, lines. Add a piece to your locker. Not a cart."
        titleSize="word"
        ledeFace="ui"
      />

      <section className="bg-[var(--paper)] pb-16">
        <HomeGutter>
          <Suspense>
            <GearCategoryTabs categories={tabs} />
          </Suspense>

          <p className="mb-2 font-ui text-[12px] text-[var(--text-meta)] lg:hidden">
            Swipe to see spec and Add.
          </p>
          <div
            className="desk-table-wrap border border-[var(--border-rule)] bg-[var(--vellum)]"
            tabIndex={0}
            role="region"
            aria-label="Gear catalog"
          >
            {visible.length === 0 ? (
              <p className="px-4 py-12 font-ui text-[15px] text-[var(--graphite)]">
                Nothing in this drawer yet.
              </p>
            ) : (
              <table className="desk-table text-[13px] leading-[1.35]">
                <thead>
                  <tr className="border-b border-[var(--border-rule)] bg-[var(--vellum)]">
                    <th className="px-3 py-2 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--slate)]">
                      Product
                    </th>
                    <th className="px-3 py-2 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--slate)]">
                      Spec
                    </th>
                    <th className="px-3 py-2 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--slate)]">
                      Drawer
                    </th>
                    <th className="px-3 py-2 text-right font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--slate)]">
                      Add
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((p, i) => {
                    const brand = brandById.get(p.brandId);
                    const zebra =
                      i % 2 === 0 ? "bg-[var(--paper)]" : "bg-[var(--vellum)]";
                    return (
                      <tr key={p.id} className={`${zebra} h-10`}>
                        <td className="px-3">
                          <p className="font-ui text-[14px] text-[var(--ink)]">{p.name}</p>
                          <p className="font-ui text-[11px] text-[var(--slate)]">
                            {brand?.name ?? "—"}
                          </p>
                        </td>
                        <td className="px-3 font-mono text-[12px] text-[var(--graphite)]">
                          {specSummary(p.category, p.specs as Record<string, unknown>) || "—"}
                        </td>
                        <td className="px-3 font-ui text-[12px] text-[var(--graphite)]">
                          {CATEGORY_LABELS[p.category] ?? p.category}
                        </td>
                        <td className="px-3 text-right">
                          <AddToLockerButton
                            productId={p.id}
                            initiallyInLocker={inLockerIds.has(p.id)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </HomeGutter>
      </section>
    </div>
  );
}
