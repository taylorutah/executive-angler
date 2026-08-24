import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Angler",
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

/**
 * Public angler profiles are retired permanently.
 * See docs/decisions/anglers-public-profiles.md.
 *
 * Previously leaked: stats.fish, per-session total_fish, river_name,
 * session dates, home_location. Route returns 404 for everyone.
 */
export default function AnglerProfilePage() {
  notFound();
}
