import { revalidatePath } from "next/cache";

const PATHS_BY_TABLE: Record<string, string[]> = {
  articles: ["/", "/articles", "/articles/archive", "/articles/[slug]"],
  rivers: ["/", "/rivers", "/rivers/[slug]"],
  destinations: ["/", "/destinations", "/destinations/[slug]"],
  species: ["/", "/species", "/species/[slug]"],
  lodges: ["/", "/lodges", "/lodges/all", "/lodges/[slug]"],
  guides: ["/", "/guides", "/guides/[slug]"],
  fly_shops: ["/", "/fly-shops", "/fly-shops/[slug]"],
  canonical_flies: ["/", "/flies", "/flies/[slug]"],
};

export function revalidateEntityPaths(table: string): void {
  try {
    const paths = PATHS_BY_TABLE[table] ?? [];
    for (const p of paths) {
      if (p.includes("[")) {
        revalidatePath(p, "page");
      } else {
        revalidatePath(p);
      }
    }
    revalidatePath("/sitemap.xml");
  } catch {
    // revalidation is best-effort; never block the write response
  }
}
