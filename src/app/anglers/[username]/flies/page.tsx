import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Angler flies",
    robots: { index: false, follow: false },
  };
}

/**
 * Public per-angler fly indexes are retired with the parent profile route.
 * See docs/decisions/anglers-public-profiles.md.
 */
export default function AnglerFliesPage() {
  notFound();
}
