import type { Metadata } from "next";
import { PRIVATE_ROBOTS } from "@/lib/robots-disallow";

export const metadata: Metadata = {
  robots: PRIVATE_ROBOTS,
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
