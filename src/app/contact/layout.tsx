import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Executive Angler — Questions & Partnerships",
  description:
    "Get in touch with the Executive Angler team. Questions about destinations, guide bookings, lodge recommendations, or partnerships — we're here to help.",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact Executive Angler",
    description:
      "Get in touch with the Executive Angler team. Questions about destinations, guide bookings, or partnerships — we're here to help.",
    images: ["/api/og?title=Contact%20Us&type=default"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
