import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Executive Angler — questions about fly fishing destinations, lodge recommendations, guide bookings, or partnership inquiries.",
  openGraph: {
    title: "Contact Us | Executive Angler",
    description:
      "Get in touch with Executive Angler — questions about fly fishing destinations, lodge recommendations, guide bookings, or partnership inquiries.",
    images: ["/api/og?title=Contact%20Us&type=default"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
