import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { brandedTitle } from "@/lib/seo";
import LodgesDeskPage from "./LodgesDeskPage";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: brandedTitle("Lodges — beds on water we keep"),
  description:
    "Beds on water we keep. Not a booking engine. We name the house. We do not take the reservation.",
  alternates: { canonical: `${SITE_URL}/lodges` },
};

export default function LodgesPage() {
  return <LodgesDeskPage />;
}
