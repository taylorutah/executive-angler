"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Login, house, and notebook surfaces keep a clean masthead. The ticker is gazette chrome. */
const HIDE = [
  /^\/login/,
  /^\/signup/,
  /^\/journal/,
  /^\/today/,
  /^\/styleguide/,
  /^\/account/,
];

export default function TickerGate({ ticker }: { ticker: ReactNode }) {
  const pathname = usePathname() ?? "";
  if (HIDE.some((re) => re.test(pathname))) return null;
  return ticker;
}
