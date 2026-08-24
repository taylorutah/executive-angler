import { createStaticClient } from "@/lib/supabase/static";

export type ImageGapKind = "null" | "unsplash";

export type ImageGap = {
  entity: string;
  id: string;
  slug: string;
  name: string;
  column: string;
  url: string;
  kind: ImageGapKind;
};

const SOURCES: {
  entity: string;
  table: string;
  nameCol: string;
  column: string;
}[] = [
  { entity: "destinations", table: "destinations", nameCol: "name", column: "hero_image_url" },
  { entity: "guides", table: "guides", nameCol: "name", column: "photo_url" },
  { entity: "fly_shops", table: "fly_shops", nameCol: "name", column: "hero_image_url" },
  { entity: "canonical_flies", table: "canonical_flies", nameCol: "name", column: "hero_image_url" },
  { entity: "rivers", table: "rivers", nameCol: "name", column: "hero_image_url" },
  { entity: "articles", table: "articles", nameCol: "title", column: "hero_image_url" },
  { entity: "lodges", table: "lodges", nameCol: "name", column: "hero_image_url" },
  { entity: "species", table: "species", nameCol: "common_name", column: "image_url" },
];

function isUnsplash(url: string): boolean {
  try {
    return new URL(url).hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}

export async function listImageGaps(): Promise<ImageGap[]> {
  const sb = createStaticClient();
  const gaps: ImageGap[] = [];

  for (const src of SOURCES) {
    const { data, error } = await sb
      .from(src.table)
      .select(`id, slug, ${src.nameCol}, ${src.column}`);
    if (error) throw new Error(`${src.table}: ${error.message}`);

    const records = (data as unknown as Record<string, unknown>[] | null) ?? [];
    for (const rec of records) {
      const columnVal = rec[src.column];
      const raw = typeof columnVal === "string" ? columnVal.trim() : "";
      const name = String(rec[src.nameCol] ?? "");
      const id = String(rec.id ?? "");
      const slug = String(rec.slug ?? "");
      if (!raw) {
        gaps.push({
          entity: src.entity,
          id,
          slug,
          name,
          column: src.column,
          url: "",
          kind: "null",
        });
        continue;
      }
      const url = raw;
      if (isUnsplash(url)) {
        gaps.push({
          entity: src.entity,
          id,
          slug,
          name,
          column: src.column,
          url,
          kind: "unsplash",
        });
      }
    }
  }

  return gaps;
}
