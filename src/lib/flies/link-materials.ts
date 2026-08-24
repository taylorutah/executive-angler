/**
 * Resolve recipe slot strings against the tying_materials catalog.
 * Conservative matching — a miss stays plain text. Never invent a material.
 */
import { createStaticClient } from "@/lib/supabase/static";
import type { MaterialSlot } from "@/types/flies";

export type CatalogMaterial = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string | null;
};

export type LinkedMaterialSlot = MaterialSlot & {
  href: string | null;
  catalogName: string | null;
};

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function matchCatalogMaterial(
  query: string,
  rows: CatalogMaterial[],
  materialId?: string | null,
): CatalogMaterial | null {
  if (materialId) {
    const byId = rows.find((r) => r.id === materialId);
    if (byId) return byId;
  }

  const n = norm(query);
  if (n.length < 3) return null;

  const exact = rows.find((r) => norm(r.name) === n);
  if (exact) return exact;

  const withBrand = rows.find((r) => norm(`${r.brand ?? ""} ${r.name}`) === n);
  if (withBrand) return withBrand;

  const contained = rows.filter((r) => {
    const rn = norm(r.name);
    return rn.length >= 5 && n.includes(rn);
  });
  if (contained.length === 1) return contained[0];
  return null;
}

export function materialsHref(q: string): string {
  return `/flies/materials?q=${encodeURIComponent(q)}`;
}

export async function linkRecipeMaterials(
  slots: MaterialSlot[],
): Promise<LinkedMaterialSlot[]> {
  if (!slots.length) return [];
  try {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("tying_materials")
      .select("id, slug, name, brand, category")
      .eq("is_verified", true);
    if (error || !data) {
      if (error) console.error("[linkRecipeMaterials]", error);
      return slots.map((s) => ({
        ...s,
        href: s.material ? materialsHref(s.material) : "/flies/materials",
        catalogName: null,
      }));
    }
    const rows = data as CatalogMaterial[];
    return slots.map((s) => {
      const extraId = (s as MaterialSlot & { material_id?: string }).material_id;
      const hit =
        matchCatalogMaterial(s.material ?? "", rows, extraId)
        ?? matchCatalogMaterial([s.brand, s.material].filter(Boolean).join(" "), rows, extraId);
      const q = hit?.name || s.material || "";
      return {
        ...s,
        href: q ? materialsHref(q) : "/flies/materials",
        catalogName: hit?.name ?? null,
      };
    });
  } catch (err) {
    console.error("[linkRecipeMaterials]", err);
    return slots.map((s) => ({
      ...s,
      href: s.material ? materialsHref(s.material) : "/flies/materials",
      catalogName: null,
    }));
  }
}
