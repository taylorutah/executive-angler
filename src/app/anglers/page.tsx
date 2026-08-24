import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Anglers",
  robots: { index: false, follow: false },
};

/**
 * Public angler directory is retired permanently.
 * See docs/decisions/anglers-public-profiles.md.
 */
export default function AnglersPage() {
  notFound();
}
